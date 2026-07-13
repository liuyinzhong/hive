# 项目规则

## 对话规范

1. 语言：全程使用中文进行对话和生成内容。
2. 系统环境：默认所有操作、命令和代码均在 Windows 系统环境下执行。
3. 任务完成后不用重启项目
4. 任务完成后不用校验代码输出
5. 任务完成后不要执行任何package.json里的脚本

## 代码生成规范

1. 代码注释：生成任何代码时，必须为每个函数/方法添加清晰的中文注释，说明其功能、参数及返回值。

## 以下是我前端项目的 apps/web-antdv-next 的目录结构：

```
web-antdv-next/
├── public/                         # 静态资源目录，打包时直接复制到输出目录
│
├── src/                            # 项目源码目录
│   ├── adapter/                    # 组件适配器，将 antdv-next 组件适配到 vben 体系
│   │   ├── component/              # 通用组件适配（表单、表格等基础组件的包装注册）
│   │   │   └── table/              # 表格单元格自定义渲染组件
│   │   └── ...
│   │
│   ├── api/                        # API 接口层，按业务模块划分
│   │   ├── auth/                   # 认证相关接口（登录、登出、获取用户信息、获取菜单等）
│   │   ├── dev/                    # 研发管理相关接口（项目、需求、任务、缺陷、变更、版本、模块）
│   │   ├── examples/               # 示例接口（包含上传等）
│   │   ├── statistics/             # 统计接口
│   │   └── system/                 # 系统管理接口（部门、字典、文件、菜单、角色、用户）
│   │
│   ├── components/                 # 项目自定义通用组件
│   │
│   ├── dicts/                      # 字典数据管理
│   │
│   ├── layouts/                    # 布局组件
│   │
│   ├── locales/                    # 国际化配置
│   │   ├── langs/                  # 语言包
│   │   │   ├── en-US/              # 英文语言包
│   │   │   └── zh-CN/              # 中文语言包
│   │   └── ...
│   │
│   ├── router/                     # 路由配置
│   │   ├── routes/                 # 路由模块定义
│   │   │   ├── modules/            # 动态路由模块（按业务拆分，自动导入）
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── store/                      # Pinia 状态管理
│   │
│   ├── template/                   # 模板配置
│   │
│   ├── utils/                      # 工具函数
│   │
│   ├── views/                      # 页面视图，按业务模块划分
│   │   ├── _core/                  # 核心页面（不依赖后端菜单的固定页面）
│   │   │   ├── about/              # 关于页面
│   │   │   ├── authentication/     # 认证页面（登录、注册、忘记密码等）
│   │   │   ├── fallback/           # 错误/兜底页面
│   │   │   └── profile/            # 个人中心页面
│   │   ├── dashboard/              # 仪表盘
│   │   │   ├── analytics/          # 分析页（趋势、访问数据、销售等）
│   │   │   └── workspace/          # 工作台
│   │   ├── dev/                    # 研发管理模块
│   │   │   ├── base/               # 基础配置
│   │   │   ├── bug/                # 缺陷管理（列表、详情、新增/编辑弹窗等）
│   │   │   │   └── components/     # 缺陷子组件
│   │   │   ├── project/            # 项目管理（首页、新增弹窗、模块管理弹窗）
│   │   │   ├── story/              # 需求管理（列表、详情、批量操作、变更日志等）
│   │   │   │   └── components/     # 需求子组件
│   │   │   ├── task/               # 任务管理（列表、详情、甘特图、批量操作等）
│   │   │   │   └── components/     # 任务子组件
│   │   │   └── versions/           # 版本管理（列表、详情、新增/编辑弹窗）
│   │   │       └── component/      # 版本子组件
│   │   └── system/                 # 系统管理模块
│   │       ├── dept/               # 部门管理
│   │       │   └── modules/        # 部门子模块
│   │       ├── dict/               # 字典管理
│   │       ├── file/               # 文件管理
│   │       ├── menu/               # 菜单管理（树形权限菜单配置）
│   │       │   └── modules/        # 菜单子模块
│   │       ├── role/               # 角色管理（角色权限分配）
│   │       │   └── modules/        # 角色子模块
│   │       └── user/               # 用户管理
│   │
│   └── vtable/                     # VisActor VTable 表格编辑器配置
│
└── *.env / *.json / *.ts / *.html  # 项目配置文件

### 项目技术栈

- **框架**: Vue 3 + TypeScript
- **UI 组件库**: ant-design-vue-next (antdv-next)
- **表格组件**: vxe-table + vxe-pc-ui
- **高维表格**: VisActor VTable（甘特图等场景）
- **构建工具**: Vite 5
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP 请求**: @vben/request（基于 axios 封装）
- **国际化**: vue-i18n + @vben/locales
- **富文本编辑器**: TipTap (@vben/plugins/tiptap)
- **工具库**: @vueuse/core、dayjs、json-bigint

### 核心启动流程

1. `main.ts` — 初始化偏好设置（preferences），然后动态导入 `bootstrap.ts`
2. `bootstrap.ts` — 按顺序初始化：组件适配器 → 表单适配器 → Vue 应用创建 → i18n → Pinia → 权限指令 → 路由 → Motion 插件 → 挂载到 #app
3. 路由通过 `router/access.ts` 从后端动态获取菜单数据，结合前端定义的页面组件生成可访问路由
4. API 请求通过 `api/request.ts` 中的 `RequestClient` 统一处理，包含 JWT token 自动刷新、BigInt JSON 解析、统一错误提示等
```
