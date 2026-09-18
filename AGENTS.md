# Hive 前端开发规范

## 项目范围

本项目是基于 Vben5 二次开发的前端 monorepo，当前业务应用为：

```text
apps/web-antdv-next
```

主要业务目录：

- 页面：`apps/web-antdv-next/src/views`
- API：`apps/web-antdv-next/src/api`
- 组件：`apps/web-antdv-next/src/components`
- 适配器：`apps/web-antdv-next/src/adapter`
- 国际化：`apps/web-antdv-next/src/locales/langs`

项目使用 Node.js `22.22.0`、pnpm `11.7.0`，以仓库中的 `.node-version`、`package.json` 和锁文件为准。

## 开发前

进入任何已有业务模块时，必须先阅读前后端 `business-docs` 中对应的领域词汇、业务规则和 UI 说明，用文档先建立对业务目标、状态、边界和运行逻辑的整体理解，再阅读页面、API 和后端代码核实现状。不得一开始通过逐文件钻研代码来反推业务规则；代码用于验证文档、发现差异和完成实现，不代替文档提供业务上下文。

按以下顺序获取上下文：

1. 先从 `business-docs/README.md` 定位领域，再阅读对应前后端手册；`docs` 只用于 Vben 上游框架和通用技术文档。
2. 阅读当前业务模块和相似页面。
3. 查找已有公共组件、Hook、工具函数、Schema 和类型。
4. 必要时对比只读的 Vben5 官方上游实现。
5. 确认没有可复用方案后再设计新实现。

文档已有明确实现方式时优先遵循文档。文档与现有代码不一致时，先说明差异，不要直接照搬任一方。

### 业务文档一致性规则

`business-docs` 是业务人员、开发、测试和 AI 共用的业务知识库。新增功能、修改既有功能或修复会改变用户可见行为的缺陷时，文档同步是同一项工作的完成条件，不能留作后续事项。

文档边界：

- 后端仓库 `../hive-admin-go/business-docs/<领域>` 是术语、业务规则、状态流转、前置条件、副作用和权限的唯一正文；本仓库 `business-docs/<领域>` 只维护页面入口、按钮展示、表单联动、刷新和交互规则，并链接后端正文。
- `business-docs/README.md` 是页面和 API 到业务领域的总索引，新增顶层业务页面、API、Store 或菜单时必须登记。
- 前端 `docs` 只用于 Vben 上游框架和通用技术文档，不混入 Hive 业务文档。
- 后端 `CONTEXT.md` 只定义领域词汇，具体规则写入模块文档；新领域或跨领域关系同步后端 `CONTEXT-MAP.md`。
- API 类型和页面代码不能代替业务文档，按钮隐藏也不能代替后端权限和状态校验。

新增功能时：先与后端共同判断功能归入现有领域还是新建领域，避免前后端上下文名称不一致；后端先建立或补充领域词汇、README 和模块规则，前端再建立对应 README 与 `*-ui.md` 并链接后端正文，不复制成两套可能分叉的规则；为新页面和 API 目录增加或更新就近 `AGENTS.md`；稳定规则编号以后端正文为准，必须唯一且不复用旧含义。

修改功能时逐项判断并同步：术语、状态、业务前置条件和跨模块关系；接口地址、方法、字段、类型、必填、枚举、错误和分页；权限码、菜单按钮及不同状态下的可用动作；页面入口、按钮显示、表单联动、默认值、刷新和失败表现；异步任务、实时事件、幂等、并发、保留期和清理行为；对其它页面、API、Store、公共组件和后端副作用的影响。

纯重构、格式化或内部性能调整确认没有改变业务语义时可以不改业务正文，但交付前仍必须完成文档影响检查，并在交付说明中明确“业务文档已核对，无语义变化”。

不一致时先列出差异、当前实际行为和影响，不得静默选择一方；用户当前确认的新规则优先于旧文档，但代码、API 类型和前后端业务文档必须在同一次修改中恢复一致。完成前检查前后端相对链接、规则编号唯一性、UTF-8 编码，以及业务文档没有进入 `docs`。交付总结必须列出同步修改的业务文档，无需修改时说明核对结果和原因；业务文档未同步时，不得声称功能完整交付。

### 领域业务文档

各业务领域的阅读顺序已下沉到对应源码目录的就近 `AGENTS.md`。改动某领域前必须先读就近规则，再按其中顺序读前后端业务文档：

- ERP：`src/views/erp/AGENTS.md`、`src/api/erp/AGENTS.md`
- 产品：`src/views/product/AGENTS.md`、`src/api/product/AGENTS.md`
- 医疗：`src/views/medical/AGENTS.md`（`doctor`、`schedule` 子目录另有更细规则）
- 系统管理：`src/views/system/AGENTS.md`、`src/api/system/AGENTS.md`
- 其它领域：`src/views/<领域>/AGENTS.md` 与 `src/api/<领域>/AGENTS.md`

后端业务手册是该领域术语、状态、业务前置条件与副作用的唯一正文，前端只维护页面入口、按钮展示、表单联动和交互规则。登录授权、动态菜单、字典参数、文件、审计、外部页面、支付渠道、菜单消息和下载中心各有独立规则，不能互相套用。领域规则、接口、权限或 UI 行为变化时，必须在同一次修改中同步对应文档。

## 技能自动调用

工程技能全局安装，通用规则见工作区根 `AGENTS.md` 的“技能调用与路由”一节；本节只列前端技术栈的定制路由。任务与技能说明匹配时无需用户点名，先阅读对应 `SKILL.md` 再使用。

- 新增页面、组件、API 调用或修复明确缺陷：`implement`；可在函数、Hook、组件行为或数据转换边界稳定验证时并用 `tdd`（Vitest、Playwright、项目现有测试方式）。
- 页面异常、请求竞态、渲染错误、构建失败或性能回退且根因不明：`diagnosing-bugs`，先建立能稳定复现的最小反馈命令。
- 复杂交互、状态模型或 UI 方向无法仅靠讨论确定：`prototype`，原型与正式页面隔离，结论确认前不接入业务路由或公共组件。
- 涉及公共组件、适配器、请求封装、状态边界或跨模块复用设计：`codebase-design`；这不改变修改公共能力前必须评估调用方并说明影响的要求。
- 前后端字段、枚举、业务术语或页面概念有歧义：`domain-modeling`；需集中澄清并沉淀文档时组合 `grilling` 与 `grill-with-docs`。
- 有实质代码变更的实现完成后：`code-review`，重点核对 Vben5 约定、类型安全、国际化、权限、请求状态和需求一致性。
- 新需求按工作区根 `AGENTS.md` 的「需求开发流程」执行时，推导完成后用 `to-spec` 沉淀方案、`to-tickets` 拆分任务；该流程之外的架构巡检或独立规格仍需用户明确要求才用 `to-spec`、`to-tickets`、`improve-codebase-architecture`；不得自动向外部工单系统发布内容。
- 技能不构成修改 `RequestClient`、权限框架、动态路由、登录流程、Layout、公共包或新增依赖的授权。

## 复用优先级

1. 项目已有公共组件、Hook、工具函数和适配器。
2. 当前项目的成熟业务实现。
3. Vben5 官方组件、文档和上游实现。
4. 项目已经安装的第三方组件。

参考成熟实现并做局部调整，不要机械复制形成重复逻辑。只有多个模块确实共享能力时，才考虑提取公共实现。

## 页面与目录

- 新增页面保持同业务模块的目录和文件组织方式。
- API、页面局部组件、Schema 和类型放在对应业务模块中。
- 不随意增加新的顶层目录或修改 monorepo 架构。
- 不因单个需求修改公共包；确需修改时先评估所有调用方。

## API

- 所有业务接口统一放在 `apps/web-antdv-next/src/api`，按业务模块组织。
- Vue 页面和组件中不得直接创建 Axios 请求或绕过项目请求封装。
- 统一使用项目现有 `RequestClient` 和请求实例。
- API 地址和前端调用中的多词业务资源使用小驼峰，禁止连字符，例如 `/scheduleTemplates`，不得写成 `/schedule-templates`；必须与后端 Router 硬编码保持一致。
- 配合新增或调整后端接口文档时，后端 Swagger 分组约定为 `@Tags 大模块/子模块`，例如 `系统管理/日志管理`；Apifox 同步时直接按该格式识别二级目录。前端 API 模块、路由、权限码和国际化 key 不复用该斜杠目录格式。
- 请求参数、响应数据和分页结果应定义明确的 TypeScript 类型。
- 保持前后端地址、方法、字段、枚举、分页和错误结构一致。
- 正确处理 loading、成功、失败和清理状态，不得用空 `catch` 吞掉错误。
- 避免重复请求；涉及搜索或快速切换时沿用现有防抖、取消或竞态处理方式。

## 路由与菜单

- 普通业务菜单页面使用后端动态菜单和动态路由，不新增静态业务路由。
- 不修改动态路由机制、权限框架、登录流程或 Layout。
- 登录、异常页、框架初始化等特殊静态路由如需调整，必须先说明影响。
- 业务路由名称、前端路由硬编码及相关多词标识使用小驼峰，禁止连字符；非按钮菜单必须保留有效、简洁且语义明确的路由名称。
- 每个后端受保护接口权限码必须对应业务菜单下的独立 `type=button` 节点。按钮不得放在根级，也不得把接口权限码配置到目录或菜单节点。
- `type=button` 节点必须满足：`name = NULL`、`title` 为国际化 key、`auth_code` 为权限码，并且不得参与动态路由生成。
- 后端接口权限按钮的 `auth_code` 只保存该接口的独占原子权限码。确需在其他菜单数据中保存多个权限码时，使用英文逗号分隔，消费时逐项 Trim、过滤空值并去重。

## UI 组件

使用优先级：

1. Vben 提供的组件。
2. 项目已有公共组件。
3. `antdv-next`。
4. 项目已有的 shadcn 组件。

不得自行引入新的 UI 库。修改公共组件行为前，必须检查所有调用方并说明影响。

## 图标

- 业务图标来源统一使用 Lucide 图标集。
- 允许沿用项目现有的 `IconifyIcon`、`lucide:xxx` 和 `icon-[lucide--xxx]` 渲染方式。
- 不新增或混用 Element Icon、Font Awesome 等其他图标集。

## 表格与表单

普通业务表格优先使用：

```ts
import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
```

- 表格配置、分页、排序、筛选和操作列保持同模块一致。
- 表格中的启用/停用状态切换优先使用 `CellSwitch` 列渲染，并在 `attrs.auth` 配置对应权限码；不要在操作列额外实现启用/停用按钮。无权限时应沿用 `CellSwitch` 的只读降级展示。
- 表单优先使用项目现有表单适配器和 Schema 方案。
- 保持校验、布局、弹窗/抽屉和提交状态处理一致。
- 不为单一页面重新封装一套 Table 或 Form。

## 国际化

- 所有用户可见的静态文案必须国际化，不在页面中写死中文或英文。
- 新增 key 时同步维护：
  - `apps/web-antdv-next/src/locales/langs/zh-CN`
  - `apps/web-antdv-next/src/locales/langs/en-US`
- 后端返回的动态业务数据、开发日志和代码注释不需要放入语言包。
- key 命名和文件拆分保持现有模块风格。
- 菜单按钮 `title` 必须使用 `模块.permission.动作语义` 的点分 key，例如 `system.permission.menuUpdate`、`dev.permission.taskAdvance`，不得直接填写中文、英文或冒号权限码。
- 每个按钮 key 必须在 `zh-CN` 和 `en-US` 对应模块语言包中同时存在，文案应简短、准确表达动作，例如“新增、修改、删除、详情、列表、发布”。
- 国际化命名空间按实际语言包文件名确定。工作流语言包为 `flow.json`，所以 `workflow:task:approve` 对应的标题可为 `flow.permission.taskApprove`。

## TypeScript 与 Vue

- 业务代码避免显式 `any`；第三方库边界确实无法准确表达时，只能局部使用并缩小范围。
- 不使用大量 `as unknown as` 绕过真实类型问题。
- 对象契约优先使用 `interface`；联合类型、映射类型和工具类型使用 `type`。
- 类型放入对应业务模块，不为局部类型污染全局声明。
- 保持现有 Vue Composition API 和 `<script setup lang="ts">` 风格。
- 响应式变量、computed、watch、生命周期和事件方法按同模块习惯组织。
- 清理定时器、监听器和其他副作用，避免组件卸载后继续执行。

## 样式

使用优先级：

0. 优先使用组件默认样式，组件选择按「UI 组件」章节的优先级执行。
1. 组件自身能力和现有设计变量。
2. Tailwind。
3. 局部 scoped 样式或项目现有 SCSS。

- 避免大量 inline style。
- 默认不使用 `!important`；覆盖第三方组件且无更合理方案时，必须限制作用域并说明原因。
- 不全局覆盖组件库样式，不因格式化产生大面积 Diff。

## 状态与工具

- 跨页面或全局状态统一使用 Pinia。
- 页面临时状态优先使用 `ref`、`reactive` 和 `computed`。
- 优先复用项目 `utils`、`@vueuse/core` 和现有 Hooks。
- 不重复实现时间格式化、防抖、节流、上传、下载或请求封装。

## kkFileView 文件预览

统一调用公共方法 `previewWithKkFileView(fileUrl, fileName?)`（`src/utils/preview.ts`，通过 `#/utils` 引入）。公共方法负责 `/onlinePreview` URL 拼接、`fullfilename` 附加、Base64 编码和 `openWindow`；调用方负责调后端 API 取可访问的文件 URL、提供文件名、处理 loading 和异常。不要在业务页面自行拼接 base64、`fullfilename`、`openWindow` 或复制 URL 拼接逻辑。

调用约束：

- `fileUrl` 必须是 kkFileView 服务端能直接 fetch 到的绝对 URL：相对路径用 `window.location.origin` 拼接（dev 走 vite proxy，生产走 nginx 反代，保持与登录态同源）；公开文件可直接用绝对 URL。
- `fileName` 含扩展名（如 `库存余额.xlsx`）；URL 路径不含扩展名时必须提供，供 kkFileView 识别类型。
- `VITE_KKFILEVIEW_URL` 未配置时公共方法抛 `Error`，调用方必须 `try/catch` 并用 `message.error` 提示。

配置要求：`.env.development` 与 `.env.production` 必须配置 `VITE_KKFILEVIEW_URL`（dev 通常 `http://127.0.0.1:8012`，生产独立部署）；kkFileView 服务端 `application.properties` 的 `trust.host` 必须加入后端访问域名白名单（dev 配 `localhost,127.0.0.1`，生产配后端真实域名，不要用 `*`）。改 `.env.*` 需重启 vite dev server，改 `trust.host` 需重启 kkFileView。

安全约束：**私有文件预览必须走短时 token**——需登录态才能访问的文件（如下载中心任务结果）先调后端短时 token 接口换临时签名 URL 再传给 kkFileView，不要把用户 Token 附加到 URL，也不要把长期可访问的私有文件 URL 暴露给前端；后端规范见 `hive-admin-go/utils/AGENTS.md`。公开文件（CDN 资源、机构 logo）可直接传 URL。

新增预览入口必须复用本公共方法，并在交付说明中列出文件来源、是否需要短时 token、`fullfilename` 来源和 kkFileView 配置变更。下载中心现有实现见 `business-docs/system/download-center-ui.md`。

## 权限

- 按钮和操作权限使用项目已有权限方案，权限码来自后端。
- 不通过用户名、角色名称或 `role === 'admin'` 等写死方式判断权限。
- 前端权限只控制界面展示，不能代替后端鉴权和授权。
- 原子权限码统一为 `模块:资源:动作` 三段格式，三段均使用小驼峰，例如 `dev:task:batchCreate`、`medical:scheduleTemplate:update`；禁止连字符、空格、中文和额外层级。
- 前端专用权限码与后端接口权限码使用同一命名格式，并共同遵守全局原子唯一性。前端专用权限码可以只控制文本、区域或操作显示，后端路由无需使用。
- `auth_code` 使用冒号权限码，`title` 使用点分国际化 key，两者职责不同，不得互换或混用。
- 页面按钮是否显示，应使用登录用户从 `/api/auth/codes` 获得的权限集合和项目现有权限组件或 Hook 判断；不要从菜单标题、路由名称或接口地址推导权限。
- 前端隐藏或显示仅改善交互。用户直接请求受保护接口时，最终是否放行始终以后端路由权限校验为准。
- 所有业务模块（包括医疗模块）的前端权限使用方式均遵守本节，不因模块已有较完整的历史权限码而保留旧格式或例外判断。

## 数据权限

数据权限的后端正文和全接口分类位于 `../hive-admin-go/business-docs/system/data-permission.md`，前端交互规则位于 `business-docs/system/data-permission-ui.md`。AI 修改角色、用户、业务列表、详情、下拉选项、统计、打印或导出页面时必须先阅读两份文档。

- 前端不得计算或缓存一份可用于授权的角色部门范围，不向普通业务请求提交 `dataScope`、操作者部门集合或伪造创建人来决定可见性。后端响应是记录范围的唯一权威。
- 角色 API、表单和列表必须完整维护 `dataScope` 与 `dataScopeDeptIds`；自定义部门时才显示并要求部门树，其它范围提交空集合。新增范围值必须同步 TypeScript 联合类型、中英文国际化、后端 DTO、迁移和业务文档。
- 原子按钮权限与数据范围分开处理：按钮可见不保证目标 ID 可操作，数据范围为 `none` 也不自动隐藏已经授权的全局主数据页面。不得从角色名称或数据范围推断按钮权限。
- 列表、详情和下拉选项都可能因角色、部门或关联人变化而收窄。记录消失、详情无权或批量整批失败时，应清理失效选择、刷新权威数据并展示后端错误，不能回退调用未受限接口或继续用旧行缓存提交。
- 统计图表直接展示后端按范围聚合的结果，不用当前分页数据补算“全量”；异步导出以 Worker 执行时的当前权限为准，前端不得按创建任务时缓存的数据在浏览器补生成文件。
- 流程参与者、当前排班医生、处方开具/审核等领域归属不能被 `all` 前端判断绕过；页面只展示后端允许的对象和动作。
- 文件元数据列表受范围限制，但现有 `/uploads/**` 是公开静态 URL。不得把列表隐藏描述为私有文件保护；敏感文件需求必须先配合后端建设私有下载能力。
- 前端修改接口类型、页面或导出入口时，必须核对后端 Swagger `@Description` 中的“数据权限”分类；不得把后端标注为全局主数据、当前用户归属或领域归属的接口在前端描述成角色部门范围，也不得遗漏该分类对列表、详情、写入和导出的影响。
- 新增或修改 API/页面时必须在后端全路由分类矩阵登记其类别，并同步对应前端 UI 文档。前端类型检查只能验证契约，不能替代详情、写入和导出的后端 IDOR 审查。

## 性能与数据加载

- 远程大列表使用分页，不一次加载全部业务数据。
- 小型字典、枚举和下拉选项可沿用现有全量接口，不机械套用分页。
- 避免模板中的重复重计算、循环请求和可消除的 N+1 请求。
- 上传下载统一复用已有组件和文件接口。

## 字典与枚举

字典方法统一从 `#/dicts` 引入，按场景选择：

```ts
// 表单字段
import { getLocalDictList } from '#/dicts'
{ component: 'Select', fieldName: 'category', label: '流程分类',
  componentProps: { options: getLocalDictList('WORKFLOW_CATEGORY') } }

// 表格列
{ field: 'category', title: '分类',
  cellRender: { name: 'DictTag', props: { type: 'WORKFLOW_CATEGORY' } } }

// 回显文本与其它
import { getLocalDictText, getLocalDictColor, getLocalDictRow } from '#/dicts';
getLocalDictText('WORKFLOW_CATEGORY', value);   // 名称
getLocalDictColor('WORKFLOW_CATEGORY', value);  // 标签颜色
getLocalDictRow('WORKFLOW_CATEGORY', value);    // 行数据
```

使用枚举时，若存在枚举转选项数组函数，用该函数获取选项数组，不直接使用枚举值：

```ts
import { enumToOptions } from '#/utils/enumUtils';
const options = enumToOptions(TaskStatusEnum);
```

## 验证

涉及公共包、工具链或影响范围较大时，再按需运行：

```bash
pnpm lint
pnpm check
pnpm test:unit
pnpm --filter @vben/web-antdv-next typecheck
pnpm --filter @vben/web-antdv-next build
```

只修改局部业务代码时，不要为了验证而自动修复或格式化整个仓库。若命令因存量问题失败，应说明失败位置及其与当前修改的关系。

## 完成检查与交付

完成检查：是否符合 Vben5 与项目风格；是否复用已有组件、API、Hook 和工具函数；是否同步维护类型与中英文国际化资源；API 地址、业务路由名称和权限码是否小驼峰且不含连字符；权限按钮的父级、`name`、`title`、`auth_code` 是否符合约定且与后端受保护路由一一对应；是否存在重复代码、未使用 import、无必要的 `any` 或类型断言；是否正确处理错误、loading、副作用和权限；是否按“业务文档一致性规则”同步后端业务正文、前端 UI 文档和就近 `AGENTS.md`（或明确核对后无需修改）；是否影响其它页面、公共组件或接口。

交付时必须列出需要手动配置的数据：按钮权限用三列表格 `标题`／`国际化`／`权限码`；菜单权限列出六项 `类型`／`标题`／`名称`／`路径`／`组件`／`图标`；其它需手动调整的数据逐项用列表或表格列出，没有时明确写“无”。

最终代码应像项目原有代码一样自然、一致、易维护。
