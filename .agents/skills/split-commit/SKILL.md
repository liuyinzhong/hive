```markdown
---
name: split-commit
description: Help split a mixed git staging area into multiple logical commits, primarily grouped by module/scope, and secondarily by change type (feat/fix/refactor/docs). Use when staged changes contain multiple tasks and the user wants clean, rule-based N commits.
---

# Split Staged Changes into Multiple Commits

## 使用场景

当 **暂存区（staging area）里一次性包含了多个功能/修复/重构** 的修改时，使用本技能将其按规则拆成多个干净的 commit，例如：

- 一些是新功能（feat）
- 一些是 bug 修复（fix）
- 一些是重构（refactor）
- 一些是文档/样式变更（docs/style）

目标：**让每个 commit 聚焦单一目的，便于 review、回滚和排查问题**。

---

## 总体流程（Agent 必须遵循）

1. **分析暂存区**
   - 使用命令（由 Agent 运行）：
     - `git status`
     - `git diff --cached`（或带路径的 diff）
   - 识别出当前暂存区中涉及的：
     - 文件列表
     - 每个文件内的功能/逻辑块（大致判断是 feat/fix/refactor/docs/style 等）
```

- 规划时的原则：
  - **单一目的**：一个 commit 只做一件事（一个功能/一个 bug 修复/一次重构）。
  - **类型优先**：优先按照 Conventional Commits 风格分成 `feat` / `fix` / `refactor` / `docs` / `style` / `chore` 等。
  - **最小可用单元**：不要拆到难以理解（例如一个函数的增删拆成多个毫无意义的 commit）。
  - 如有明显耦合（代码强相关且难以拆开），允许合并到同一个 commit。

3. **按计划逐个提交**

   对于每个计划中的 commit，重复以下步骤：
   1. **准备暂存区内容**
      - 一次只让 **当前要提交的那一组改动** 保持在暂存区，其余改动改为未暂存。
      - 推荐做法（由 Agent 决策，可组合使用）：
        - 使用 `git restore --staged <path>` 将不属于本次 commit 的文件/片段从暂存区移回工作区。
        - 对于较复杂的文件内拆分，可使用：
          - `git add -p <path>`
          - 或 `git restore --staged <path>` 后，再 `git add -p <path>` 精选需要的 hunk。
      - 原则：**当前 commit 的暂存区必须尽可能只包含本 commit 的逻辑。**

   2. **生成 commit message**
      - 遵循 Conventional Commits（示例）：
        - `feat(user): add profile avatar upload`
        - `fix(auth): correct token refresh logic`
        - `refactor(table): simplify data loading flow`
        - `docs: update README for setup`
      - 如果适用本仓库已有规范（如 `CLAUDE.md` 中说明），Agent 应优先遵循仓库约定。

   3. **执行提交**
      - 由 Agent 运行命令：
        - `git commit -m "<消息>"`  
          或（更推荐）使用多行 message：
        - `git commit -m "type(scope): 标题" -m "详细说明（如需要）"`

   4. **校验状态**
      - 提交后运行：
        - `git status`
      - 确认：
        - 暂存区中不再包含本 commit 的内容
        - 剩余未提交的改动与计划中后续 commit 一致

4. **完成所有计划 commit 后收尾**
   - 确保：
     - `git status` 显示工作区与暂存区干净，或仅剩与计划无关的改动。
   - 简要输出：
     - 实际创建的 commit 列表（顺序、message）

---

## 拆分规则（判断逻辑）

Agent 在设计拆分方案时，应按照以下优先级进行分组（**优先按“模块/目录”划分，再在模块内部按类型细分**）：

1. **按模块/目录（module）分组**
   - 优先根据 **文件所在目录或功能模块** 拆分，例如：
     - `apps/web-antd/src/views/user/*`
     - `apps/web-antd/src/views/auth/*`
     - `packages/request/*`
     - `packages/stores/*`
   - 原则：一个 commit 尽量聚焦一个“模块”或一组强相关的文件（例如同一功能页面/同一业务域）。

2. **在模块内部按 change 类型（type）分组**
   - `feat`: 新增功能/接口/模块
   - `fix`: 修复已有 bug
   - `refactor`: 不改变外部行为的重构
   - `docs`: 纯文档变更
   - `style`: 格式化/样式类修改（无逻辑变更）
   - `test`: 仅测试代码
   - `chore`: 构建脚本、工具链、配置等

3. **按功能域（scope）再细分**
   - 同一类型下，如可以明显区分不同子域（如 `auth`、`user`、`table`），可拆成多个 commit：
     - `feat(auth): ...`
     - `feat(user): ...`

4. **什么时候可以合并？**
   - 代码片段之间有强耦合，拆分会导致：
     - 某些 commit 无法单独编译/通过测试
     - 或逻辑难以理解
   - 小改动（例如几行极小修复）且高度相关，可以合并为一个 `fix`。

5. **避免的情况**
   - 一个 commit 同时包含：
     - 逻辑改动（feat/fix/refactor） + 大量无关格式化（style）
     - 互不相关的多个功能
   - 将“配置文件更新 + 大块逻辑重构 + 文档调整”全部塞进一个大 commit。

---

## 操作指令模板（Agent 内部参考）

> 注意：下面命令是 Agent 在需要时执行的参考，不要求逐条展示给用户。

- 查看暂存区：
  - `git status`
  - `git diff --cached`
  - `git diff --cached -- <path>`

- 取消暂存：
  - `git restore --staged <path>`
  - 或旧写法：`git reset HEAD <path>`

- 精选暂存 hunk：
  - `git add -p <path>`

- 提交：
  - `git commit -m "type(scope): 标题"`
  - 或：
    - `git commit -m "type(scope): 标题" -m "更多背景或变更说明"`

---

## 示例

### 示例 1：混合 feat + fix

**场景：**

- `src/user/profile.ts`：新增头像上传逻辑（新功能）
- `src/auth/token.ts`：修复 token 刷新 bug
- `README.md`：补充接口文档

**推荐拆分方案：**

```markdown
1. feat(user): support avatar upload
   - 仅包含 src/user/profile.ts 的新增逻辑

2. fix(auth): correct token refresh on expiry
   - 仅包含 src/auth/token.ts 的修复逻辑

3. docs: document avatar upload API
   - 仅包含 README.md 的更新
```

Agent 应按上述顺序，逐个准备暂存区并执行 commit。

---

## 使用本技能时 Agent 的默认行为

当检测到“暂存区中包含多种不同类型/功能的修改”时，Agent 应自动：

1. 尽量 **最小化人工干预**：
   - 用户不强制要求手动操作时，Agent 可以直接执行 git 命令完成拆分和提交（**但绝不执行 `git push`，push 始终由用户手动完成**）。
2. 在结束时给出：
   - 最终 commit 列表（按顺序）
   - 每个 commit 对应的简要说明
