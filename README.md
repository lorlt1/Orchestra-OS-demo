# Orchestra OS demo

Orchestra OS demo 是一个纯前端的 Skill / MCP / 项目协作工作台，用来管理项目画像、AGENTS.md 生成、模型配置和工作区偏好。

## 主要功能

- 仪表盘总览
- 项目管理与 AGENTS.md 生成
- Skill 库管理
- MCP 库管理
- 分类管理与导入复核
- AI 工作区问答
- 模型拉取与切换
- 导出前检查与最终产物预览
- 工作区设置、备份与本地存储管理

## 技术特点

- 纯前端静态页面
- 数据保存在浏览器 `localStorage`
- 支持 OpenAI-compatible 模型配置
- 支持 GitHub 导入 Skill / MCP 候选
- 支持项目级 AGENTS.md 草稿生成与导出

## 启动方式

直接打开 `index.html` 即可。

也可以用本地静态服务查看：

```bash
python -m http.server 4173
```

然后访问 `http://127.0.0.1:4173/`

## 项目结构

- `index.html` 入口页面
- `src/app.js` 主逻辑
- `src/styles.css` 页面样式
- `src/skill-md-cache.js` 内置 Skill 文档缓存

## 说明

这个 demo 适合演示：

- 团队 Skill / MCP 资产管理
- AGENTS.md 生成流程
- 模型配置与工作区协作
- 本地优先的 AI 管理面板

