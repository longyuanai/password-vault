# password-vault · ARCHITECTURE

核实日期：2026-10-15。依据本地README、构建清单和实际入口；本文件不把文档计划当成运行时验收。

## 目标与范围

维护本地密码管理的Web/小程序入口，按现有实现验收主密码、加密存储和锁定边界。

GitHub：[longyuanai/password-vault](https://github.com/longyuanai/password-vault)。知识笔记：Vault内 `03_Projects/password-vault/password-vault - Git关联.md`。

## 组件与代码入口

| 实际路径 | 责任边界 |
| --- | --- |
| [server](server) | 服务端 |
| [client](client) | 客户端 |
| [pages](pages) | 页面 |
| [tests](tests) | 测试 |

## 数据与控制流

以下链路对应README/规范描述；实现覆盖以代码入口和适用验证为准。

```mermaid
flowchart LR
    N0["客户端操作"]
    N1["服务端身份/主密码校验"]
    N2["加密存储"]
    N3["受限返回"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
```

## 构建与依赖依据

- [package.json](package.json)：清单已存在，具体工具脚本见原文。

## 验证边界

使用虚构密码验证加解密、错误主密码和锁定；README声明服务端加密，不将其描述为端到端加密。

## 现行依据

- [README.md](README.md)
