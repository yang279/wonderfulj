# iconAgent 接口文档

## 1. 图标解析接口（/resolve）

递归遍历上传的 JSON 文件，查找所有 `semantic=icon` 的节点，用 AI 分析 `label` 描述提取图标关键词和样式属性，通过关键词精确匹配图标，匹配到的 SVG 经过属性修改后写入 `iconSvg` 字段。

**URL:** `POST /resolve`

**请求方式:** 文件上传（multipart/form-data）

**参数:**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | JSON 文件，内容为需要解析的结构化数据 |

**JSON 文件要求:**

- 必须是合法的 JSON 对象或数组
- 需要解析的图标节点须包含 `semantic: "icon"` 和 `label` 字段
- `label` 可包含图标名称描述，也可包含大小、颜色、线条风格等属性信息
- 支持任意层级嵌套，服务会递归遍历所有对象和数组

**处理流程:**

1. AI 分析 `label`，提取 `{name, size, color, borderSize, styled}` 结构化对象
2. 用 `name` 在图标库中进行精确匹配查找（先精确匹配 name，再模糊包含匹配）
3. 匹配到的 SVG + 属性参数调用 `modifySvg()` 函数修改
4. 将修改后的 SVG 字符串写入 `iconSvg` 字段

**请求示例:**

```bash
curl -X POST http://localhost:3103/resolve -F "file=@example.json"
```

**输入 JSON 示例:**

```json
{
  "page": {
    "title": "测试页面",
    "sections": [
      {
        "name": "功能区",
        "items": [
          { "semantic": "icon", "label": "下载图标 24×24 细线" },
          { "semantic": "icon", "label": "红色搜索图标 32px 填充" },
          { "semantic": "icon", "label": "箭头" }
        ]
      }
    ]
  }
}
```

**AI 解析结果示例:**

| label | name | size | color | borderSize | styled |
|------|------|------|-------|-----------|--------|
| 下载图标 24×24 细线 | 下载 | 24 | | 细 | border |
| 红色搜索图标 32px 填充 | 搜索 | 32 | 红色 | | filled |
| 箭头 | 箭头 | | | | |
| download | 下载 | | | | |

**成功响应:**

```json
{
  "content": {
    "page": {
      "title": "测试页面",
      "sections": [
        {
          "name": "功能区",
          "items": [
            { "semantic": "icon", "label": "下载图标 24×24 细线", "iconSvg": "<svg ...>...</svg>" },
            { "semantic": "icon", "label": "红色搜索图标 32px 填充", "iconSvg": "<svg ...>...</svg>" },
            { "semantic": "icon", "label": "箭头", "iconSvg": "<svg ...>...</svg>" }
          ]
        }
      ]
    }
  },
  "errorCode": 200,
  "errorMessage": "",
  "success": true
}
```

**失败响应:**

```json
{
  "content": null,
  "errorCode": 500,
  "errorMessage": "错误描述",
  "success": false
}
```

---

## 2. 图标查询接口（/icon）

传入一段描述文字，AI 分析提取图标名称和样式属性，精确匹配图标后返回修改后的 SVG 字符串。

**URL:** `POST /icon`

**请求方式:** multipart/form-data

**参数:**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| prompt | String | 是 | 描述文字，可包含图标名称、大小、颜色、线条风格等信息，支持中文和英文 |

**处理流程:**

1. AI 分析 `prompt`，提取 `{name, size, color, borderSize, styled}` 结构化对象
2. 用 `name` 在图标库中精确匹配查找
3. 匹配到的 SVG + 属性参数调用 `modifySvg()` 函数修改
4. 返回修改后的 SVG 字符串

**请求示例:**

```bash
curl -X POST http://localhost:3103/icon -F "prompt=下载图标 24×24 细线"
```

**成功响应:**

```json
{
  "content": {
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" ...>...</svg>"
  },
  "errorCode": 200,
  "errorMessage": "",
  "success": true
}
```

**未匹配到图标时:**

```json
{
  "content": null,
  "errorCode": 404,
  "errorMessage": "未找到匹配图标: \"xxx\"",
  "success": false
}
```

---

## 3. 健康检查接口（/health）

**URL:** `GET /health`

**请求示例:**

```bash
curl http://localhost:3103/health
```

**响应:**

```json
{
  "content": { "status": "ok", "icons": 1003 },
  "errorCode": 200,
  "errorMessage": "",
  "success": true
}
```

---

## 4. 通用响应格式

所有接口统一返回以下结构：

| 字段 | 类型 | 说明 |
|------|------|------|
| content | Any/null | 成功时为结果数据，失败时为 null |
| errorCode | Number | 200 表示成功，400/404/500 表示错误 |
| errorMessage | String | 错误信息，成功时为空字符串 |
| success | Boolean | true 表示成功，false 表示失败 |

---

## 5. 错误码

| errorCode | 说明 |
|-----------|------|
| 200 | 成功 |
| 400 | 参数错误（缺少文件/参数、JSON 格式错误等） |
| 404 | 未找到匹配图标 |
| 500 | 服务内部错误 |

---

## 6. AI 属性解析格式

AI 会从 label/prompt 中提取以下结构化对象：

| 字段 | 说明 |
|------|------|
| name | 图标名称关键词（中文，2-4字），用于图标匹配。英文自动翻译成中文 |
| size | 图标大小数字，如 "24"、"16"，无法识别则为空字符串 |
| color | 颜色信息，如 "红色"、"#ff0000"，无法识别则为空字符串 |
| borderSize | 线条粗细，如 "粗"、"细"、"2"，无法识别则为空字符串 |
| styled | 线条风格："border"（线性/描边）或 "filled"（面性/填充），无法识别则为空字符串 |

---

## 7. 图标匹配规则

采用关键词精确匹配，匹配顺序：

1. **精确匹配**：`name` 与图标 id 或 name 完全一致
2. **包含匹配**：图标的 name 包含关键词，或关键词包含图标的 name，取最接近的

无需向量搜索、无 embedding 模型依赖，启动即用，匹配速度微秒级。

---

## 8. SVG 修改函数（modifySvg）

位于 `iconFunction/index.js`，用于根据属性修改 SVG 字符串。

**函数签名:** `modifySvg(svg, size, color, borderSize, styled)`

**参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| svg | String | 原始 SVG 字符串 |
| size | String | 图标大小 |
| color | String | 图标颜色 |
| borderSize | String | 线条粗细 |
| styled | String | 线条风格（border/filled） |

**当前实现:** 空函数，原样返回传入的 SVG。待替换为真实修改函数。

---

## 9. 启动与部署

```bash
# 安装依赖
npm install

# 启动服务
npm start
```

**环境变量（.env）:**

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 3103 | 服务端口 |
| DEEPSEEK_API_KEY | - | DeepSeek API Key，用于 AI 属性解析 |

**依赖组件:**

| 组件 | 说明 |
|------|------|
| openai（DeepSeek） | AI 属性解析（deepseek-chat） |
| express + multer | Web 服务与文件上传 |