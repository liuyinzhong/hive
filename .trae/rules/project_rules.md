# 项目规则

## 一、 对话规范

1. 语言：全程使用中文进行对话和生成内容。
2. 系统环境：默认所有操作、命令和代码均在 Windows 系统环境下执行。
3. 任务完成后不用重启项目
4. 任务完成后不用刷新页面
5. 任务完成后不要执行任何package.json里的脚本

## 二、 代码生成规范

1. 代码注释：生成任何代码时，必须为每个函数/方法添加清晰的中文注释，说明其功能、参数及返回值。

## 三、 Git提交规范 (git commit)

4. 提交信息格式：每次生成Git提交（commit）指令时，必须附带规范的注释信息。
5. 作用域标识：注释中必须使用@scope格式明确标识本次修改所涉及的一个或多个模块/部分。标识列表如下： **基础配置 (Configuration)**

- `@vben/commitlint-config`
- `@vben/eslint-config`
- `@vben/prettier-config`
- `@vben/stylelint-config`
- `@vben/tailwind-config`
- `@vben/tsconfig`
- `@vben/vite-config`

**工具与工具包 (Utils & Packages)**

- `@vben/node-utils`
- `@vben/constants`
- `@vben/utils`
- `@vben/icons`
- `@vben/locales`
- `@vben/types`
- `@vben/request`

**核心架构 (Core Architecture)**

- `@vben-core/design` (设计变量)
- `@vben-core/icons` (图标组件)
- `@vben-core/shared` (共享逻辑)
- `vben-core/typings` (核心类型定义)
- `@vben-core/composables` (Composables)
- `@vben-core/preferences` (用户偏好)

**UI组件库 (UI Components)**

- `@vben-core/form-ui` (表单组件)
- `@vben-core/layout-ui` (布局组件)
- `@vben-core/menu-ui` (导航菜单组件)
- `@vben-core/popup-ui` (弹层组件)
- `@vben-core/shadcn-ui` (Shadcn/ui组件)
- `@vben-core/tabs-ui` (标签页组件)
- `@vben/common-ui` (公共UI组件)
- `@vben/hooks` (React/Vue Hooks)
- `@vben/layouts` (页面布局)

**状态与管理 (State & Management)**

- `@vben/stores` (状态库)
- `@vben/preferences` (应用偏好设置)
- `@vben/access` (权限管理)

**功能模块 (Feature Modules)**

- `@vben/plugins` (Vite/Webpack插件)
- `@vben/styles` (全局样式)
- `@vben/backend-mock` (Mock数据)

**项目与示例 (Projects & Examples)**

- `@vben/web-antd` (Ant Design项目)
- `@vben/web-ele` (Element Plus项目)
- `@vben/web-naive` (Naive UI项目)
- `@vben/docs` (项目文档)
- `@vben/playground` (代码演练场)

**工程与脚本 (Engineering & Scripts)**

- `@vben/turbo-run` (Turborepo运行器)
- `@vben/vsh` (自定义脚本工具)

**通用范畴 (General Categories)**

- `project` (项目级配置，如package.json、README等)
- `style` (纯样式更新，不涉及逻辑)
- `lint` (代码风格修复)
- `ci` (持续集成配置，如GitHub Actions)
- `dev` (开发环境、工具链配置)
- `deploy` (构建部署相关)
- `other` (未列出的其他修改) 示例：git commit -m "feat(layout-ui): 新增侧边栏折叠动画 [@vben-core/layout-ui]"

git commit -m "fix(utils, request): 修复axios重复请求拦截问题 [@vben/utils @vben/request]"
