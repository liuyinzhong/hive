# 贡献指南

感谢你对 Vue Vben Admin AI Skill 项目的关注！

## 🤝 如何贡献

### 报告问题

如果你发现技能文档中有错误或遗漏，请：

1. 在 Issues 中搜索是否已有相关问题
2. 如果没有，创建新 Issue，详细描述问题
3. 提供复现步骤或相关代码示例

### 提交改进

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/improvement`)
3. 进行修改
4. 提交更改 (`git commit -m 'feat: add new component example'`)
5. 推送到分支 (`git push origin feature/improvement`)
6. 创建 Pull Request

### 更新技能文档

当 Vue Vben Admin 发布新版本时，可以更新技能文档：

```bash
# 安装 Skill Seekers
pip install skill-seekers

# 更新文档源
skill-seekers create https://doc.vben.pro/ --name vue-vben-docs

# 更新代码分析
skill-seekers analyze --directory /path/to/vue-vben-admin --name vue-vben-github

# 合并并增强 SKILL.md
```

## 📝 文档规范

### SKILL.md 格式

```markdown
---
name: vue-vben-admin
description: 简短描述
doc_version: x.x.x
---

# 标题

## 章节标题

### 子章节

- 使用列表
- 突出重点

\`\`\`typescript
// 代码示例要带语言标签
\`\`\`
```

### 参考文档格式

- 使用 Markdown 格式
- 包含代码示例和说明
- 添加来源链接

## 🎯 贡献方向

欢迎在以下方向贡献：

- 📝 完善 API 参考文档
- 🔧 添加更多代码示例
- 🌐 翻译文档（英文、日文等）
- 🐛 修复文档错误
- 💡 分享最佳实践

## 📋 行为准则

- 尊重所有贡献者
- 保持友好和建设性的讨论
- 专注于项目改进

---

再次感谢你的贡献！🙏