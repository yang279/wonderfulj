const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
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

const transport = new StdioServerTransport();
server.connect(transport).catch(err => {
  console.error('MCP 服务启动失败:', err);
  process.exit(1);
});