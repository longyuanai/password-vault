# 密码保险库 (Password Vault)

一个安全的本地密码管理工具，包含 Web 端和微信小程序端，所有密码使用 AES-256-GCM 加密存储。

## 功能特性

- **主密码保护** - bcrypt 哈希，PBKDF2 密钥派生（600,000 次迭代）
- **AES-256-GCM 加密** - 所有密码在服务端加密存储
- **密码条目管理** - 增删改查，支持分类和搜索
- **密码生成器** - 可自定义长度、字符类型的随机密码生成
- **健康检查** - 检测弱密码、重复密码和长期未更新的密码
- **自动锁定** - 超时后自动锁定，需重新输入主密码
- **导入/导出** - 支持 JSON 格式数据备份

## 技术栈

| 模块 | 技术 |
|------|------|
| 后端 | Express + better-sqlite3 |
| Web 前端 | Vue 3 + Element Plus + Pinia |
| 小程序端 | 微信原生小程序 |
| 加密 | Node.js crypto (AES-256-GCM, PBKDF2, bcrypt) |

## 项目结构

```
├── server/          # Express 后端
│   ├── src/
│   │   ├── config/       # 配置
│   │   ├── middlewares/  # 中间件（认证、错误处理、校验）
│   │   ├── routes/       # API 路由
│   │   ├── services/     # 业务逻辑（认证、条目、工具）
│   │   └── utils/        # 工具（加密、密码强度）
│   └── data/             # SQLite 数据库（自动创建）
├── client/          # Vue 3 Web 前端
│   └── src/
│       ├── components/   # 通用组件
│       ├── views/        # 页面视图
│       ├── stores/       # Pinia 状态管理
│       ├── router/       # 路由配置
│       └── api/          # API 请求封装
├── pages/           # 微信小程序页面
├── utils/           # 小程序工具函数
└── images/          # 小程序图标资源
```

## 快速开始

### 环境要求

- Node.js >= 20.19
- pnpm

### 安装与运行

```bash
# 安装依赖
pnpm install

# 复制环境配置
cp server/.env.example server/.env

# 启动开发服务（同时启动前后端）
pnpm dev
```

启动后：
- 后端 API：http://localhost:5000
- Web 前端：http://localhost:3000

### 微信小程序

1. 在 `project.config.json` 中填入你的小程序 AppID
2. 确保后端服务已启动
3. 在 `utils/request.js` 中配置后端地址
4. 使用微信开发者工具打开项目根目录

## API 概览

| 接口 | 说明 |
|------|------|
| `POST /api/auth/setup` | 初始化主密码 |
| `POST /api/auth/unlock` | 解锁保险库 |
| `POST /api/auth/lock` | 锁定保险库 |
| `GET /api/entries` | 获取密码条目列表 |
| `POST /api/entries` | 创建密码条目 |
| `PUT /api/entries/:id` | 更新密码条目 |
| `DELETE /api/entries/:id` | 删除密码条目 |
| `GET /api/entries/health` | 密码健康检查 |
| `POST /api/tools/generate-password` | 生成随机密码 |

## 安全说明

- 所有密码使用 AES-256-GCM 加密，密钥通过 PBKDF2 从主密码派生
- 主密码使用 bcrypt 哈希存储，不可逆
- 数据库文件仅存储在本地，不上传云端
- 会话超时自动锁定（默认 30 分钟）
- 开源不影响安全性（Kerckhoffs 原则）

## 许可证

[MIT](LICENSE)
