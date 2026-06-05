require('dotenv').config();
const fs = require('fs');
const express = require('express');
const path = require('path');
const { pipeline, env } = require('@huggingface/transformers');
const VectorStore = require('./vectorStore');

if (process.env.HF_ENDPOINT) {
  env.remoteHost = process.env.HF_ENDPOINT;
}

const app = express();
app.use(express.json());

const ICONS_PATH = path.resolve(__dirname, '../iconJson/icons.json');
const INDEX_PATH = path.resolve(__dirname, '../iconJson/index.bin');
const MODEL = 'Xenova/multilingual-e5-small';

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
}

app.post('/search', async (req, res) => {
  try {
    const { keyword } = req.body;
    if (!keyword) {
      return res.status(400).json({ error: '缺少 keyword 参数' });
    }

    const output = await embedder(keyword, { pooling: 'mean', normalize: true });
    const queryVec = Array.from(output.data);

    const candidates = vectorStore.search(queryVec, 5);

    const best = candidates[0];
    const icon = iconMap.get(best.id);

    res.json({
      match: {
        id: icon.id,
        name: icon.name,
        description: icon.description,
        svg: icon.svg,
        score: best.score,
      },
      candidates: candidates.slice(1, 5).map(c => {
        const ci = iconMap.get(c.id);
        return {
          id: c.id,
          name: ci.name,
          description: ci.description,
          score: c.score,
        };
      }),
    });
  } catch (err) {
    console.error('搜索失败:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', icons: iconsData.length });
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