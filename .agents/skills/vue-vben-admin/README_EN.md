# Vue Vben Admin AI Skill

<div align="center">

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.5+-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Claude](https://img.shields.io/badge/Claude-Compatible-7C3AED?logo=claude)](https://claude.ai/)
[![Gitee](https://img.shields.io/badge/Gitee-Open%20Source-C71D23?logo=gitee)](https://gitee.com/)

**AI Skill Knowledge Base for Vue Vben Admin Framework**

English | [简体中文](README.md)

</div>

---

## 🛠️ Project Generation

This is an **AI-generated project**, built primarily with the following open-source tools and services:

| Tool/Service | Purpose |
|--------------|---------|
| [Skill Seekers](https://github.com/yusufkaraaslan/Skill_Seekers) | Open-source AI skill generation framework for documentation scraping, code analysis, and skill file generation |
| [Claude Sonnet 4.6](https://www.anthropic.com/) | Anthropic's AI model for document enhancement and knowledge organization |
| [OpenClaw](https://github.com/openclaw/openclaw) | AI assistant framework for project organization, Git operations, and repository publishing |

### Generation Process

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Vue Vben Admin │     │  Skill Seekers  │     │  Claude Sonnet  │
│  Docs + Source  │ ──▶ │  Scrape & Analyze│ ──▶ │   AI Enhance   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  Gitee/GitHub   │ ◀── │    OpenClaw     │
                        │   Publishing    │     │  Organize & Push│
                        └─────────────────┘     └─────────────────┘
```

### Generation Details

1. **Documentation Scraping**: Used Skill Seekers to scrape Vue Vben Admin official docs (92 pages)
2. **Code Analysis**: Analyzed GitHub source code (437 Vue/TypeScript files)
3. **AI Enhancement**: Enhanced skill docs with Claude Sonnet 4.6, adding code examples and best practices
4. **Project Organization**: Organized project structure via OpenClaw, generated README, LICENSE, etc.
5. **Repository Publishing**: Used OpenClaw for Git operations, pushed to Gitee/GitHub

---

## 📖 Overview

This project is an **AI Skill Knowledge Base** designed for Vue Vben Admin framework. It enables AI coding assistants (Claude, Cursor, Windsurf, Cline, etc.) to deeply understand Vben Admin's architecture, components, and best practices.

### 🎯 Key Benefits

| Feature | Description |
|---------|-------------|
| **Smart Code Completion** | AI understands Vben architecture and provides framework-compliant suggestions |
| **Component Usage Guide** | Detailed documentation for `useVbenForm`, `useVbenModal`, etc. |
| **Architecture Understanding** | Deep analysis of Monorepo structure, permission system, routing |
| **Problem Diagnosis** | Quickly identify framework-related issues and provide solutions |
| **Best Practices** | 10+ real code examples covering common development scenarios |

---

## 📊 Data Sources

| Data Type | Count | Description |
|-----------|-------|-------------|
| **API Reference Files** | 165 | Functions, classes, interfaces extracted from source code |
| **Documentation Pages** | 92 | Complete official documentation |
| **Source Code Analysis** | 437 files | Deep Vue/TypeScript code analysis |
| **Code Examples** | 442 | Real usage cases from docs and code |

---

## 🚀 Quick Start

### Option 1: Install to Claude Code Global Skills (Recommended)

Claude Code supports a global Skills directory. Once installed, you can use this skill in any project.

**Installation Steps**:

```bash
# 1. Make sure Claude Code is installed
claude --version

# 2. Create Claude Skills directory (if not exists)
mkdir -p ~/.claude/skills

# 3. Clone this project to Skills directory
cd ~/.claude/skills
git clone https://gitee.com/zhao-runlong/vue-vben-admin-skill.git

# 4. Done! Now use Claude Code in any Vben Admin project
cd /path/to/your-vben-project
claude .
# Claude will automatically load the vue-vben-admin-skill
```

**Verify Installation**:

```bash
# Check Skills directory
ls ~/.claude/skills/vue-vben-admin-skill/SKILL.md

# Or ask in Claude Code
claude .
> Do you know the Vue Vben Admin architecture?
```

**Update Skill**:

```bash
cd ~/.claude/skills/vue-vben-admin-skill
git pull origin master
```

---

### Option 2: Use Within Single Project

If you only want to use it in a specific project:

```bash
# 1. Clone to your Vben project directory
cd /path/to/your-vben-project
git clone https://gitee.com/zhao-runlong/vue-vben-admin-skill.git .claude-skill

# 2. Open with Claude Code
claude .

# 3. Claude will automatically read .claude-skill/SKILL.md
```

---

### Option 3: For Cursor IDE

```bash
# Copy SKILL.md to your Vben project
cp SKILL.md your-vben-project/.cursorrules
```

### Option 3: For Windsurf / Cline

```bash
# Windsurf
cp SKILL.md your-vben-project/.windsurfrules

# Cline
cp SKILL.md your-vben-project/.clinerules
```

### Option 4: Upload to Claude AI

1. Visit [Claude Skills](https://claude.ai/skills)
2. Click "Upload Skill"
3. Select the `SKILL.md` file
4. Done!

---

## 🏗️ Tech Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| [Vue.js](https://vuejs.org/) | 3.5+ | Frontend Framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.0+ | Type System |
| [Vite](https://vitejs.dev/) | 6+ | Build Tool |
| [Pinia](https://pinia.vuejs.org/) | - | State Management |
| [Vue Router](https://router.vuejs.org/) | 4+ | Routing |

### Supported UI Libraries

| Library | Directory | Description |
|---------|-----------|-------------|
| [Ant Design Vue](https://antdv.com/) | `apps/web-antd` | Enterprise UI Components |
| [Element Plus](https://element-plus.org/) | `apps/web-ele` | Vue 3 UI Library |
| [Naive UI](https://naiveui.com/) | `apps/web-naive` | Vue 3 Component Library |
| [TDesign](https://tdesign.tencent.com/) | `apps/web-tdesign` | Tencent Design System |

### Skill Generation Tools

| Tool | Purpose |
|------|---------|
| [Skill Seekers](https://github.com/yusufkaraaslan/Skill_Seekers) | AI Skill Generation Framework |
| [Claude Code](https://claude.ai/code) | AI Code Assistant Enhancement |

---

## 📁 Project Structure

```
vue-vben-admin-skill/
├── SKILL.md                    # Main skill file (AI knowledge core)
├── references/                 # Reference documentation
│   ├── api_reference/          # 165 API reference files
│   ├── guide.md                # Development guide (170KB)
│   ├── components.md           # Component docs (62KB)
│   ├── documentation/          # Project documentation
│   ├── config_patterns/        # Configuration patterns
│   ├── architecture/           # Architecture analysis
│   └── patterns/               # Design patterns
├── README.md                   # Chinese documentation
├── README_EN.md                # English documentation
└── LICENSE                     # MIT License
```

---

## 🔗 Related Projects

| Project | Description | Link |
|---------|-------------|------|
| **Vue Vben Admin** | The framework this skill is for | [GitHub](https://github.com/vbenjs/vue-vben-admin) |
| **Skill Seekers** | Skill generation tool | [GitHub](https://github.com/yusufkaraaslan/Skill_Seekers) |
| **Official Docs** | Vben Admin documentation | [doc.vben.pro](https://doc.vben.pro/) |
| **Live Demo** | Online preview | [www.vben.pro](https://www.vben.pro/) |

---

## 📄 License

This project is open-sourced under the [MIT](LICENSE) license.

---

## 🙏 Acknowledgments

- [Vue Vben Admin](https://github.com/vbenjs/vue-vben-admin) - Excellent Vue 3 admin framework
- [Skill Seekers](https://github.com/yusufkaraaslan/Skill_Seekers) - Powerful AI skill generation tool
- [Anthropic](https://www.anthropic.com/) - Claude AI assistant
- All contributors

---

<div align="center">

**If this project helps you, please give it a ⭐ Star!**

Made with ❤️ by the community

</div>