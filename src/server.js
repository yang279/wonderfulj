require('dotenv').config();
const fs = require('fs');
const express = require('express');
const path = require('path');
const multer = require('multer');
const { pipeline, env } = require('@huggingface/transformers');
const VectorStore = require('./vectorStore');

if (process.env.HF_ENDPOINT) {
  env.remoteHost = process.env.HF_ENDPOINT;
}

const app = express();

const UPLOAD_DIR = path.resolve(__dirname, '../uploads');
const ICONS_PATH = path.resolve(__dirname, '../iconJson/icons.json');
const INDEX_PATH = path.resolve(__dirname, '../iconJson/index.bin');
const MODEL = 'Xenova/multilingual-e5-small';
const SVG_DIR = path.resolve(__dirname, '../icons');

const upload = multer({ dest: UPLOAD_DIR });

let iconsData;
let iconMap;
let vectorStore;
let embedder;

async function init() {
  console.log('加载嵌入模型...');
  embedder = await pipeline('feature-extraction', MODEL);

  iconsData = JSON.parse(fs.readFileSync(ICONS_PATH, 'utf-8'));
  iconMap = new Map(iconsData.map(i => [i.id, i]));

  vectorStore = new VectorStore(INDEX_PATH).load();
  console.log(`已加载 ${iconsData.length} 个图标，HNSW 索引就绪`);

  for (const dir of [SVG_DIR, UPLOAD_DIR]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  app.use('/icons', express.static(SVG_DIR));
}

function traverseAndResolve(obj, results) {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      traverseAndResolve(item, results);
    }
  } else if (obj && typeof obj === 'object') {
    if (obj.semantic === 'icon' && obj.label) {
      results.push(obj);
    }
    for (const key of Object.keys(obj)) {
      traverseAndResolve(obj[key], results);
    }
  }
}

async function resolveIcon(iconObj) {
  const keyword = iconObj.label;
  const output = await embedder(keyword, { pooling: 'mean', normalize: true });
  const queryVec = Array.from(output.data);
  const candidates = vectorStore.search(queryVec, 1);
  const best = candidates[0];
  const icon = iconMap.get(best.id);
  const filePath = path.join(SVG_DIR, `${icon.id}.svg`);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, icon.svg);
  }

  iconObj.iconPath = `/icons/${icon.id}.svg`;
}

function successResponse(content) {
  return { content, errorCode: 200, errorMessage: '', success: true };
}

function errorResponse(errorCode, errorMessage) {
  return { content: null, errorCode, errorMessage, success: false };
}

app.post('/resolve', upload.single('file'), async (req, res) => {
  const tmpPath = req.file?.path;
  try {
    let data;
    if (req.file) {
      const raw = fs.readFileSync(tmpPath, 'utf-8');
      data = JSON.parse(raw);
    } else {
      return res.json(errorResponse(400, '请上传 JSON 文件（field: file）'));
    }

    if (!data || typeof data !== 'object') {
      return res.json(errorResponse(400, 'JSON 内容必须为对象或数组'));
    }

    const iconNodes = [];
    traverseAndResolve(data, iconNodes);

    for (const node of iconNodes) {
      await resolveIcon(node);
    }

    res.json(successResponse(data));
  } catch (err) {
    console.error('处理失败:', err.message);
    res.json(errorResponse(500, err.message));
  } finally {
    if (tmpPath) {
      fs.unlink(tmpPath, () => {});
    }
  }
});

app.post('/search', upload.none(), async (req, res) => {
  try {
    const keyword = req.body.keyword;
    if (!keyword) {
      return res.json(errorResponse(400, '缺少 keyword 参数'));
    }

    const output = await embedder(keyword, { pooling: 'mean', normalize: true });
    const queryVec = Array.from(output.data);
    const candidates = vectorStore.search(queryVec, 5);
    const best = candidates[0];
    const icon = iconMap.get(best.id);

    res.json(successResponse({
      match: { id: icon.id, name: icon.name, description: icon.description, svg: icon.svg, score: best.score },
      candidates: candidates.slice(1, 5).map(c => {
        const ci = iconMap.get(c.id);
        return { id: c.id, name: ci.name, description: ci.description, score: c.score };
      }),
    }));
  } catch (err) {
    console.error('搜索失败:', err.message);
    res.json(errorResponse(500, err.message));
  }
});

app.get('/health', (req, res) => {
  res.json(successResponse({ status: 'ok', icons: iconsData.length }));
});

const PORT = process.env.PORT || 3000;

init().then(() => {
  app.listen(PORT, () => {
    console.log(`iconAgent 服务已启动: http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('初始化失败:', err);
  process.exit(1);
});