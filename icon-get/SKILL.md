---
name: icon-get
description: 获取图标SVG。当用户需要图标、icon、SVG图标、寻找图标、根据描述获取图标时使用此skill。支持单个和批量获取。通过iconMcp服务的REST接口查询配置、颜色和SVG。
---

# icon-get skill

根据图标描述或关键词获取SVG图标，支持单个和批量。

## 工作流程

获取图标分3步，必须按顺序执行：

1. **获取配置** → 调用 `/getConfig` 了解可选的 style、domain、size
2. **获取颜色** → 调用 `/getColorList` 选定 style 后查看可用颜色，从中选一个 color 值
3. **获取SVG** → 调用 `/getSvg` 传入 keyword、size、style、color 得到 SVG 字符串

批量获取时，步骤1和2只需执行一次，步骤3对每个keyword分别调用。

## 使用脚本

运行脚本调用接口，base URL 从环境变量 `ICON_API_URL` 读取（默认 `http://localhost:3104`）。

### 获取配置

```bash
node scripts/get-icon.js config
```

返回 styles、domains、sizes 的枚举值列表。

### 获取颜色列表

```bash
node scripts/get-icon.js colors --style <风格> [--domain <领域>]
```

- `style` 必传，从 config 返回的 styles 中选一个
- `domain` 可选，不传则搜索所有领域

返回颜色 key-value 对，如 `{"red": "#E53935", "white": "#FFFFFF"}`。选一个 value 作为后续的 color 参数。

### 获取单个SVG

```bash
node scripts/get-icon.js svg --keyword <关键词> --size <尺寸> --style <风格> --color <色值>
```

- `keyword`：图标名称或描述关键词
- `size`：从 config 的 sizes 中选一个（"12"、"24"、"48"）
- `style`：从 config 的 styles 中选一个
- `color`：从 colors 返回的 value 中选一个，如 "#E53935"

返回 SVG 字符串。**重要：SVG 中的 `icon-plus-name` 自定义属性是关键标识信息，绝对不要删除或修改它。**

### 批量获取SVG

```bash
node scripts/get-icon.js svg --keyword <关键词1>,<关键词2>,<关键词3> --size <尺寸> --style <风格> --color <色值>
```

多个 keyword 用逗号分隔，返回 SVG 数组。

## 典型用法示例

```
# 1. 先看有什么可选配置
node scripts/get-icon.js config

# 2. 选好 style 后看颜色
node scripts/get-icon.js colors --style 线性

# 3. 用选好的参数获取图标
node scripts/get-icon.js svg --keyword 返回 --size 24 --style 线性 --color "#E53935"

# 批量获取多个图标
node scripts/get-icon.js svg --keyword 返回,下载,搜索 --size 24 --style 线性 --color "#E53935"
```

## agent决策指引

- 用户给出图标描述时，从描述中推断 keyword（取核心2-4字关键词）
- size 通常选 "24"，除非用户明确指定了大小
- style 根据用户描述推断："细线/描边"→"线性"，"填充/实心"→"面性"，未指定默认"线性"
- color 从 `/getColorList` 返回中选取，不传则默认取第一个值
- 批量场景（用户说"帮我找几个图标"或给出多个描述）时用逗号分隔 keyword
