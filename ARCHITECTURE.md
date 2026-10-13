# password-vault · 架构导览

> 2026-10-12 根据本地目录、已有文档和构建清单建立的工程文档入口；本轮未运行项目业务验收或完整安全审计。

- Project ID：`password-vault`
- GitHub：[longyuanai/password-vault](https://github.com/longyuanai/password-vault)
- Obsidian：Vault `龙渊` 内的 `03_Projects/password-vault/password-vault - Git关联.md`（记录原理、实验、漏洞分析与复盘）。

## 已核实的工程入口

```text
password-vault/
├── app.js
├── app.json
├── app.wxss
├── client/
├── images/
├── LICENSE
├── package.json
├── pages/
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── project.config.json
├── server/
├── sitemap.json
├── tests/
├── utils/
```

## 构建与技术栈依据

- [package.json](package.json)：package `fullstack-app`；依赖项包含 。

## 边界与待补充

- 组件职责、数据流、数据模型与部署边界以现行技术规范为准。
- [ ] 在真实代码反馈后补充仍缺少的数据流或设计取舍；当前不把拟议能力标为已实现。

## 现行依据

- [README.md](README.md)
