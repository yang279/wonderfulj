require('dotenv').config();
const express = require('express');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const z = require('zod');
const { findIcon } = require('./matcher');
const modifySvg = require('../iconFunction');

const server = new McpServer({
  name: 'icon-mcp',
  version: '1.0.0',
});

server.tool(
  'icon_search',
  '根据关键词搜索图标并返回SVG字符串。直接用传入的文字匹配图标库，支持精确匹配和模糊匹配。',
  {
    keyword: z.string().describe('图标关键词，用于直接匹配图标库。例如："下载"、"箭头"、"搜索"'),
  },
  async ({ keyword }) => {
    try {
      const icon = findIcon(keyword);

      if (!icon) {
        return {
          content: [
            { type: 'text', text: `未找到匹配图标: "${keyword}"` },
          ],
          isError: true,
        };
      }

      const finalSvg = modifySvg(icon.svg);

      return {
        content: [
          { type: 'text', text: finalSvg },
        ],
      };
    } catch (err) {
      return {
        content: [
          { type: 'text', text: `图标查询失败: ${err.message}` },
        ],
        isError: true,
      };
    }
  }
);

const app = express();
app.use(express.json());

const transports = {};

app.get('/sse', (req, res) => {
  const transport = new SSEServerTransport('/messages', res);
  transports[transport.sessionId] = transport;
  server.connect(transport);
});

app.post('/messages', (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports[sessionId];
  if (transport) {
    transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).json({ error: 'No session found' });
  }
});

const PORT = process.env.PORT || 3104;
app.listen(PORT, () => {
  console.log(`iconMcp SSE 服务已启动: http://localhost:${PORT}/sse`);
});