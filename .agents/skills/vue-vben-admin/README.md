# Vue Vben Admin AI Skill

<div align="center">

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.5+-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Claude](https://img.shields.io/badge/Claude-Compatible-7C3AED?logo=claude)](https://claude.ai/)
[![Gitee](https://img.shields.io/badge/Gitee-Open%20Source-C71D23?logo=gitee)](https://gitee.com/)

**为 AI 编程助手打造的 Vue Vben Admin 知识库技能**

[English](README_EN.md) | 简体中文

</div>

---

## 🛠️ 项目生成说明

本项目是一个**AI 生成项目**，主要依赖以下开源工具和服务构建：

| 工具/服务 | 用途 |
|-----------|------|
| [Skill Seekers](https://github.com/yusufkaraaslan/Skill_Seekers) | 开源 AI 技能生成框架，用于抓取文档、分析代码、生成技能文件 |
| [Claude Sonnet 4.6](https://www.anthropic.com/) | Anthropic 的 AI 模型，用于文档增强和知识整理 |
| [OpenClaw](https://github.com/openclaw/openclaw) | AI 助手框架，用于项目整理、Git 操作和仓库发布 |

### 生成流程

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Vue Vben Admin │     │  Skill Seekers  │     │  Claude Sonnet  │
│  官方文档 + 源码 │ ──▶ │  文档抓取分析   │ ──▶ │   AI 增强      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  Gitee/GitHub   │ ◀── │    OpenClaw     │
                        │    仓库发布     │     │  整理 & 发布    │
                        └─────────────────┘     └─────────────────┘
```

### 生成细节

1. **文档抓取**：使用 Skill Seekers 抓取 Vue Vben Admin 官方文档（92 页）
2. **代码分析**：分析 GitHub 源码（437 个 Vue/TypeScript 文件）
3. **AI 增强**：使用 Claude Sonnet 4.6 增强技能文档，添加代码示例和最佳实践
4. **项目整理**：通过 OpenClaw 整理项目结构，生成 README、LICENSE 等文件
5. **仓库发布**：使用 OpenClaw 执行 Git 操作，推送到 Gitee/GitHub

---

## 📖 项目简介

本项目是一个**AI 技能知识库**，专为 Vue Vben Admin 框架打造。它可以让 AI 编程助手（如 Claude、Cursor、Windsurf、Cline 等）深入理解 Vben Admin 的架构、组件和最佳实践，从而提供更精准的代码建议和问题解答。

### 🎯 核心价值

| 功能 | 说明 |
|------|------|
| **智能代码补全** | AI 理解 Vben 架构，提供符合框架规范的代码建议 |
| **组件使用指导** | 详细说明 `useVbenForm`、`useVbenModal` 等组件的用法 |
| **架构理解** | 深入解析 Monorepo 结构、权限系统、路由机制 |
| **问题诊断** | 快速定位框架相关问题，提供解决方案 |
| **最佳实践** | 包含 10+ 个真实代码示例，涵盖常见开发场景 |

---

## 📊 数据来源

| 数据类型 | 数量 | 说明 |
|----------|------|------|
| **API 参考文件** | 165 个 | 从源码提取的函数、类、接口文档 |
| **文档页面** | 92 页 | 官方文档完整抓取 |
| **源码分析** | 437 个文件 | Vue/TypeScript 代码深度分析 |
| **代码示例** | 442 个 | 从文档和源码提取的实际用例 |

---

## 🚀 快速开始

### 方式一：安装到 Claude Code 全局 Skills（推荐）

Claude Code 支持全局 Skills 目录，安装后可在任何项目中使用此技能。

**安装步骤**：

```bash
# 1. 确保 Claude Code 已安装
claude --version

# 2. 创建 Claude Skills 目录（如果不存在）
mkdir -p ~/.claude/skills

# 3. 克隆本项目到 Skills 目录
cd ~/.claude/skills
git clone https://gitee.com/zhao-runlong/vue-vben-admin-skill.git

# 4. 完成！现在在任何 Vben Admin 项目中使用 Claude Code
cd /path/to/your-vben-project
claude .
# Claude 会自动加载 vue-vben-admin-skill 技能
```

**验证安装**：

```bash
# 检查 Skills 目录
ls ~/.claude/skills/vue-vben-admin-skill/SKILL.md

# 或在 Claude Code 中询问
claude .
> 你知道 Vue Vben Admin 的架构吗？
```

**更新技能**：

```bash
cd ~/.claude/skills/vue-vben-admin-skill
git pull origin master
```

---

### 方式二：项目内使用（单项目）

如果你只想在特定项目中使用：

```bash
# 1. 克隆到你的 Vben 项目目录
cd /path/to/your-vben-project
git clone https://gitee.com/zhao-runlong/vue-vben-admin-skill.git .claude-skill

# 2. 用 Claude Code 打开项目
claude .

# 3. Claude 会自动读取 .claude-skill/SKILL.md
```

---

### 方式三：用于 Cursor IDE

```bash
# 复制 SKILL.md 到你的 Vben 项目
cp SKILL.md your-vben-project/.cursorrules
```

### 方式三：用于 Windsurf / Cline

```bash
# Windsurf
cp SKILL.md your-vben-project/.windsurfrules

# Cline
cp SKILL.md your-vben-project/.clinerules
```

### 方式四：上传到 Claude AI

1. 访问 [Claude Skills](https://claude.ai/skills)
2. 点击 "Upload Skill"
3. 选择本项目的 `SKILL.md` 文件
4. 完成！

---

## 🏗️ 技术栈

本项目基于以下技术构建：

### 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| [Vue.js](https://vuejs.org/) | 3.5+ | 前端框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5.0+ | 类型系统 |
| [Vite](https://vitejs.dev/) | 6+ | 构建工具 |
| [Pinia](https://pinia.vuejs.org/) | - | 状态管理 |
| [Vue Router](https://router.vuejs.org/) | 4+ | 路由管理 |

### UI 组件库支持

| 组件库 | 目录 | 说明 |
|--------|------|------|
| [Ant Design Vue](https://antdv.com/) | `apps/web-antd` | 企业级 UI 组件库 |
| [Element Plus](https://element-plus.org/) | `apps/web-ele` | Vue 3 UI 组件库 |
| [Naive UI](https://naiveui.com/) | `apps/web-naive` | Vue 3 组件库 |
| [TDesign](https://tdesign.tencent.com/) | `apps/web-tdesign` | 腾讯企业级设计体系 |

### 工具链

| 工具 | 用途 |
|------|------|
| [pnpm](https://pnpm.io/) | 包管理器 |
| [Turborepo](https://turbo.build/) | Monorepo 构建 |
| [Vitest](https://vitest.dev/) | 单元测试 |
| [ESLint](https://eslint.org/) | 代码检查 |
| [Prettier](https://prettier.io/) | 代码格式化 |

### 技能生成工具

| 工具 | 用途 |
|------|------|
| [Skill Seekers](https://github.com/yusufkaraaslan/Skill_Seekers) | AI 技能生成框架 |
| [Claude Code](https://claude.ai/code) | AI 代码助手增强 |

---

## 📁 项目结构

```
vue-vben-admin-skill/
├── SKILL.md                    # 主技能文件（AI 知识库核心）
├── references/                 # 参考文档
│   ├── api_reference/          # 165 个 API 参考文件
│   ├── guide.md                # 开发指南（170KB）
│   ├── components.md           # 组件文档（62KB）
│   ├── documentation/          # 项目文档
│   ├── config_patterns/        # 配置模式
│   ├── architecture/           # 架构分析
│   └── patterns/               # 设计模式
├── README.md                   # 项目说明（中文）
├── README_EN.md                # 项目说明（英文）
└── LICENSE                     # MIT 许可证
```

---

## 🔧 核心功能

### 1. 表单组件（useVbenForm）

```typescript
import { useVbenForm } from '#/adapter/form';

const [Form, formApi] = useVbenForm({
  schema: [
    {
      field: 'username',
      label: '用户名',
      component: 'Input',
      rules: 'required',
    },
  ],
});
```

### 2. 弹窗组件（useVbenModal）

```typescript
import { useVbenModal } from '#/adapter/modal';

const [Modal, modalApi] = useVbenModal({
  onConfirm: async () => {
    await saveData();
    modalApi.close();
  },
});
```

### 3. 数据表格（useVbenVxeGrid）

```typescript
import { useVbenVxeGrid } from '#/adapter/table';

const [Table, tableApi] = useVbenVxeGrid({
  columns: [...],
  proxyConfig: {
    ajax: { query: fetchData },
  },
});
```

### 4. 权限控制

```vue
<!-- 指令方式 -->
<Button v-access="'AC_100100'">删除</Button>

<!-- 组件方式 -->
<AccessControl :codes="['AC_100100']">
  <Button>编辑</Button>
</AccessControl>
```

---

## 📚 参考文档

### API 参考（165 个文件）

| 分类 | 文件数 | 关键内容 |
|------|--------|----------|
| 权限系统 | 5+ | 路由守卫、权限生成、路由过滤 |
| 表单组件 | 10+ | FormApi、字段联动、展开逻辑 |
| 弹窗组件 | 8+ | Modal/Drawer API、Alert/Confirm |
| 请求客户端 | 12+ | HTTP 客户端、拦截器预设、文件下载 |
| 路由工具 | 6+ | 路由生成策略、菜单处理 |
| 工具函数 | 15+ | 颜色/日期/推断/字符串工具 |
| Vite 配置 | 10+ | 构建配置、环境变量处理 |

### 如何使用参考文件

- **初学者**：从 `api_reference/bootstrap.md` 开始理解启动流程
- **中级开发者**：关注 `api_reference/preset-interceptors.md`（Token 刷新）
- **高级开发者**：参考 `api_reference/application.md`（Vite 配置）

---

## 🔗 关联项目

| 项目 | 说明 | 链接 |
|------|------|------|
| **Vue Vben Admin** | 本技能对应的框架 | [GitHub](https://github.com/vbenjs/vue-vben-admin) |
| **Skill Seekers** | 技能生成工具 | [GitHub](https://github.com/yusufkaraaslan/Skill_Seekers) |
| **官方文档** | Vben Admin 文档 | [doc.vben.pro](https://doc.vben.pro/) |
| **预览地址** | 在线演示 | [www.vben.pro](https://www.vben.pro/) |

---

## 🤝 贡献指南

欢迎贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解详情。

### 如何更新技能

```bash
# 1. 安装 Skill Seekers
pip install skill-seekers

# 2. 更新文档源
skill-seekers create https://doc.vben.pro/ --name vue-vben-docs

# 3. 更新代码源
skill-seekers analyze --directory /path/to/vue-vben-admin --name vue-vben-github

# 4. 合并并增强
# 手动合并 SKILL.md 或使用 Claude Code 增强
```

---

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

---

## 🙏 致谢

- [Vue Vben Admin](https://github.com/vbenjs/vue-vben-admin) - 优秀的 Vue 3 后台管理框架
- [Skill Seekers](https://github.com/yusufkaraaslan/Skill_Seekers) - 强大的 AI 技能生成工具
- [Anthropic](https://www.anthropic.com/) - Claude AI 助手
- 所有贡献者

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐ Star！**

Made with ❤️ by the community

</div>