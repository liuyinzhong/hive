---
name: vue-vben-admin
description: Vue Vben Admin - Modern Vue 3 Admin Framework with Monorepo Architecture
doc_version: 5.8.0
---

# Vue Vben Admin 技能

Vue Vben Admin 是一个现代化 Vue 3 后台管理框架，基于 Monorepo 架构，支持多种 UI 组件库（Ant Design Vue、Element Plus、Naive UI、TDesign）。

> **数据来源**: 本技能基于 94 个 API 参考文件综合分析而成，涵盖框架核心源码、工具函数、组件 API 等真实代码结构。

---

## 何时使用本技能

**触发场景（具体条件）**：

- 开发或维护 Vue Vben Admin 后台管理系统
- 使用 `useVbenForm`、`useVbenModal`、`useVbenDrawer`、`useVbenVxeGrid` 等适配器组件
- 配置 `@vben/preferences`、`@vben/request`、`@vben/access` 等核心包
- 处理权限路由（frontend / backend / mixed 模式）
- 扩展 VxeTable、配置拦截器、实现 Token 刷新
- 搭建新的 Monorepo 应用模块（如新增 UI 库支持）
- 调试 Vite 配置、环境变量加载、构建产物

**不适用场景**：

- 通用 Vue 3 开发（与 Vben 无关）
- 纯 UI 库使用（未集成 Vben 适配层）

---

## 项目概览

| 属性 | 值 |
|------|-----|
| 框架版本 | 5.8.0 |
| Vue 版本 | Vue 3.5+ |
| 构建工具 | Vite 6+ |
| 包管理 | pnpm workspaces + Turborepo |
| Node 要求 | ≥ 20.19.0 |
| pnpm 要求 | ≥ 10 |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 国际化 | vue-i18n |
| HTTP 客户端 | Axios（@vben/request 封装） |
| Mock 服务 | Nitro + h3 |

### 支持的 UI 框架

| 应用目录 | UI 库 | 启动命令 |
|----------|-------|----------|
| `apps/web-antd` | Ant Design Vue | `pnpm dev:antd` |
| `apps/web-ele` | Element Plus | `pnpm dev:ele` |
| `apps/web-naive` | Naive UI | `pnpm dev:naive` |
| `apps/web-tdesign` | TDesign Vue | `pnpm dev:tdesign` |

---

## 快速开始

```bash
# 克隆项目
git clone https://github.com/vbenjs/vue-vben-admin.git

# 安装依赖
pnpm install

# 启动开发服务器 (Ant Design Vue 版本)
pnpm dev:antd
```

---

## Monorepo 目录结构

```
vue-vben-admin/
├── apps/                    # 应用目录
│   ├── backend-mock/        # Mock API 服务 (Nitro + h3)
│   ├── web-antd/            # Ant Design Vue 应用
│   ├── web-ele/             # Element Plus 应用
│   ├── web-naive/           # Naive UI 应用
│   └── web-tdesign/         # TDesign Vue 应用
│
├── packages/                # 核心包
│   ├── @core/               # 框架核心（不依赖具体 UI 库）
│   │   ├── base/            # 共享工具、缓存、颜色、类型
│   │   │   └── shared/      # 颜色转换、日期格式化、DOM、推断工具等
│   │   ├── composables/     # 核心 Vue composable
│   │   ├── preferences/     # PreferenceManager（响应式配置）
│   │   └── ui-kit/          # UI 组件片段
│   │       ├── form-ui/     # 表单 UI（FormApi、依赖处理、展开逻辑）
│   │       └── popup-ui/    # 弹窗 UI（AlertBuilder）
│   ├── effects/             # 高层模块
│   │   ├── access/          # 路由/菜单生成与权限（accessible.ts）
│   │   ├── common-ui/       # 通用 UI 组件
│   │   ├── hooks/           # 通用 hooks
│   │   ├── layouts/         # 布局组件
│   │   ├── plugins/         # 插件（VxeTable 扩展、初始化）
│   │   └── request/         # Axios 封装（拦截器、下载器）
│   ├── constants/           # 全局常量
│   ├── icons/               # Iconify 图标封装（SVG 加载）
│   ├── locales/             # 国际化 (vue-i18n)
│   ├── stores/              # Pinia stores
│   ├── styles/              # 全局样式
│   ├── types/               # TypeScript 类型
│   └── utils/               # 工具函数
│       └── helpers/         # 路由生成、菜单查找
│
├── internal/                # 内部工具
│   ├── lint-configs/        # ESLint/Prettier/Stylelint 配置
│   ├── node-utils/          # Node 工具（fs、monorepo）
│   ├── tailwind-config/     # Tailwind 共享配置
│   ├── tsconfig/            # TypeScript 配置
│   └── vite-config/         # Vite 共享配置（应用/库/插件）
│
├── playground/              # 组件演示场（独立演示路由、store、API）
├── scripts/                 # 构建脚本（publint、格式化）
└── docs/                    # VitePress 文档
```

---

## 核心架构

### 应用启动流程

```typescript
// src/main.ts
import { bootstrap } from './bootstrap';

bootstrap('vben-admin');
```

`bootstrap(namespace: string)` 执行顺序（来源：`api_reference/bootstrap.md`）：

1. 初始化**组件适配器**（映射通用组件到具体 UI 库）
2. 配置通用表单系统 `initSetupVbenForm()`
3. 初始化 i18n、Pinia stores
4. 初始化权限指令、Tippy
5. 初始化路由、MotionPlugin
6. 挂载到 `#app`

### 权限系统 (Access Control)

支持三种访问模式（来源：`api_reference/accessible.md`）：

| 模式 | 说明 | 核心函数 |
|------|------|----------|
| `frontend` | 根据用户角色过滤静态路由 | `generateRoutesByFrontend()` |
| `backend` | 从接口获取菜单动态注册路由 | `generateRoutesByBackend()` |
| `mixed` | 同时使用以上两种方式 | `generateAccessible()` |

```typescript
// packages/effects/access/src/accessible.ts
// generateAccessible 统一入口
async function generateAccessible(
  mode: AccessModeType,
  options: GenerateMenuAndRoutesOptions
) {
  // 根据 mode 选择 frontend 或 backend 路由生成策略
}
```

### 路由守卫

```typescript
// playground/src/router/guard.ts
// setupCommonGuard(router) 安装通用守卫
router.beforeEach(async (to, from) => {
  if (!isAuthenticated) return '/login';

  if (!accessStore.isAccessChecked) {
    await accessStore.generateAccess();
  }
});
```

### 偏好设置系统

```typescript
// packages/@core/preferences/src/preferences.ts
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  theme: 'dark',
  layout: 'sidebar-nav',
  colorPrimary: '#0960bd',
});
```

**特点**：响应式配置、自动持久化到 localStorage、驱动主题 CSS 变量更新

### 请求客户端

```typescript
// playground/src/api/request.ts
// createRequestClient(baseURL, options?) 工厂函数
import { RequestClient } from '@vben/request';

export const requestClient = new RequestClient({
  baseURL: import.meta.env.VITE_API_URL,
});

// 认证拦截器（packages/effects/request/src/request-client/preset-interceptors.ts）
requestClient.addRequestInterceptor({
  onFulfilled: (config) => {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
});

// 响应拦截器 + Token 刷新（defaultResponseInterceptor）
requestClient.addResponseInterceptor({
  onFulfilled: (response) => response.data.data,
});
```

---

## 快速参考：最佳实践代码示例

### 1. 表单组件（useVbenForm）

```vue
<script setup lang="ts">
import { useVbenForm } from '#/adapter/form';

const [Form, formApi] = useVbenForm({
  schema: [
    {
      field: 'username',
      label: '用户名',
      component: 'Input',
      rules: 'required',
    },
    {
      field: 'role',
      label: '角色',
      component: 'Select',
      componentProps: {
        options: [
          { label: '管理员', value: 'admin' },
          { label: '用户', value: 'user' },
        ],
      },
      dependencies: {
        // 表单字段联动
        triggerFields: ['username'],
        show: (values) => !!values.username,
      },
    },
  ],
  handleSubmit: async (values) => {
    await createUser(values);
  },
});
</script>

<template>
  <Form />
</template>
```

### 2. 弹窗组件（useVbenModal）

```vue
<script setup lang="ts">
import { useVbenModal } from '#/adapter/modal';

const [Modal, modalApi] = useVbenModal({
  onConfirm: async () => {
    const values = await formApi.getValues();
    await saveData(values);
    modalApi.close();
  },
  onCancel: () => modalApi.close(),
});

// 外部打开弹窗
function openEdit(row: User) {
  modalApi.setData(row);
  modalApi.open();
}
</script>

<template>
  <Modal title="编辑用户" :loading="saving">
    <!-- 弹窗内容 -->
  </Modal>
</template>
```

### 3. 数据表格（useVbenVxeGrid）

```vue
<script setup lang="ts">
import { useVbenVxeGrid } from '#/adapter/table';
import { getUserList } from '#/api/system/user';

const [Table, tableApi] = useVbenVxeGrid({
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'username', title: '用户名' },
    { field: 'status', title: '状态', slots: { default: 'status' } },
  ],
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        const res = await getUserList({
          page: page.currentPage,
          pageSize: page.pageSize,
        });
        return { result: res.data, total: res.total };
      },
    },
  },
  toolbarConfig: { refresh: true, zoom: true },
});
</script>

<template>
  <Table>
    <template #status="{ row }">
      <Tag :color="row.status === 1 ? 'green' : 'red'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </Tag>
    </template>
  </Table>
</template>
```

### 4. 抽屉组件（useVbenDrawer）

```vue
<script setup lang="ts">
import { useVbenDrawer } from '#/adapter/drawer';

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: async () => {
    const data = drawerApi.getData<User>();
    await updateUser(data.id, formValues);
    drawerApi.close();
    emit('refresh');
  },
});
</script>

<template>
  <Drawer title="用户详情" width="600px">
    <!-- 抽屉内容 -->
  </Drawer>
</template>
```

### 5. Alert / Confirm 弹窗（AlertBuilder）

```typescript
// packages/@core/ui-kit/popup-ui/src/alert/AlertBuilder.ts
import { vbenAlert, vbenConfirm } from '@vben/common-ui';

// 简单提示
await vbenAlert('操作成功！');

// 带标题
await vbenAlert('用户已创建', '成功');

// 确认对话框
await vbenConfirm({
  title: '确认删除',
  content: '此操作不可逆，确定继续？',
  onConfirm: async () => {
    await deleteUser(id);
  },
});
```

### 6. 颜色工具函数

```typescript
// packages/@core/base/shared/src/color/convert.ts
import { convertToHsl, convertToHslCssVar, convertToRgb } from '@vben/utils';

convertToHsl('#0960bd')       // → 'hsl(211, 93%, 38%)'
convertToHslCssVar('#0960bd') // → '211 93% 38%'  (CSS 变量格式)
convertToRgb('#0960bd')       // → 'rgb(9, 96, 189)'
```

### 7. 日期格式化

```typescript
// packages/@core/base/shared/src/utils/date.ts
import { formatDate, formatDateTime } from '@vben/utils';

formatDate(new Date())             // → '2026-03-11'
formatDate(1700000000000, 'MM/DD/YYYY') // → '11/14/2023'
formatDateTime(new Date())         // → '2026-03-11 12:00:00'
```

### 8. API 定义模式

```typescript
// 参考 playground/src/api/system/dept.ts
import { requestClient } from '#/api/request';

// 获取部门列表
export const getDeptList = () =>
  requestClient.get<SystemDeptApi.SystemDept[]>('/system/dept/list');

// 创建部门
export const createDept = (
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>
) => requestClient.post('/system/dept', data);
```

### 9. JWT 工具（Mock 服务）

```typescript
// apps/backend-mock/utils/jwt-utils.ts
import { generateAccessToken, generateRefreshToken } from '../utils/jwt-utils';

// 登录接口中生成令牌
const userInfo = { id: 1, username: 'admin', roles: ['super'] };
const accessToken = generateAccessToken(userInfo);
const refreshToken = generateRefreshToken(userInfo);
```

### 10. 路由生成（后端模式）

```typescript
// packages/utils/src/helpers/generate-routes-backend.ts
import { generateRoutesByBackend } from '@vben/utils';

// 将后端菜单数据转换为 Vue Router 路由
const routes = await generateRoutesByBackend({
  menuData: backendMenus,
  forbiddenComponent: () => import('#/views/403.vue'),
});
```

---

## 核心概念

### 适配器模式（Adapter Pattern）

Vben 将通用组件与具体 UI 库解耦，通过适配器注入。每个应用（如 `web-antd`）在 `src/adapter/` 目录下实现适配：

```
src/adapter/
├── component.ts   # 注册通用组件到具体 UI 库组件
├── form.ts        # useVbenForm 适配
├── modal.ts       # useVbenModal 适配
├── drawer.ts      # useVbenDrawer 适配
└── table.ts       # useVbenVxeGrid 适配
```

### 偏好系统（Preferences）

`PreferenceManager`（`packages/@core/preferences`）响应式驱动全局配置：

- 主题切换（`light` / `dark` / `system`）
- 布局模式（`sidebar-nav` / `header-nav` / `mixed-nav`）
- 颜色主题、圆角、字体大小
- 响应式状态通过 `usePreferences()` composable 订阅

### 请求拦截器预设

`packages/effects/request/src/request-client/preset-interceptors.ts` 提供两个预设拦截器：

| 拦截器 | 说明 |
|--------|------|
| `defaultResponseInterceptor` | 统一提取 `response.data.data`，处理业务错误码 |
| `authenticateResponseInterceptor` | 处理 401，自动刷新 Token，支持请求队列 |

### VxeTable 扩展

`packages/effects/plugins/src/vxe-table/extends.ts` 提供：

- `extendProxyOptions()` — 扩展代理配置，注入表单值
- `extendsDefaultFormatter()` — 注册默认列格式化器

---

## 权限控制

### 基于角色的权限

```typescript
// 路由 meta 配置
{
  meta: {
    authority: ['super', 'admin'], // 允许的角色
    icon: 'mdi:account',
    title: '用户管理',
  }
}
```

### 基于权限码的权限

```vue
<!-- 指令方式 -->
<Button v-access="'AC_100100'">删除</Button>

<!-- 组件方式 -->
<AccessControl :codes="['AC_100100', 'AC_100110']">
  <Button>编辑</Button>
</AccessControl>
```

### 前端路由生成

```typescript
// packages/utils/src/helpers/generate-routes-frontend.ts
async function generateRoutesByFrontend(
  routes: RouteRecordRaw[],
  roles: string[],
  forbiddenComponent?: RouteRecordRaw['component']
): Promise<RouteRecordRaw[]>
```

---

## 路由组织

```
src/router/
├── routes/
│   ├── modules/          # 业务路由模块
│   │   ├── dashboard.ts
│   │   ├── system.ts
│   │   └── ...
│   └── core/             # 核心路由（无需权限）
│       ├── login.ts
│       └── error.ts
└── guard.ts              # 路由守卫（setupCommonGuard）
```

```typescript
// 路由模块结构
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('#/views/dashboard/index.vue'),
    meta: {
      title: '仪表板',
      icon: 'mdi:view-dashboard',
      authority: ['super', 'admin'],
      keepAlive: true,
    },
  },
];

export default routes;
```

---

## 国际化（i18n）

```typescript
// packages/locales/src/i18n.ts
import { loadLocalesMap, setI18nLanguage } from '@vben/locales';

// 加载语言包（支持动态导入）
const localesMap = loadLocalesMap(
  import.meta.glob('./langs/**/*.json')
);

// 切换语言
await setI18nLanguage('zh-CN');
```

---

## 工具函数参考

### 推断工具（inference.ts）

```typescript
// packages/@core/base/shared/src/utils/inference.ts
import { isBoolean, isUndefined } from '@vben/utils';

isUndefined(undefined) // → true
isBoolean(true)        // → true
```

### 字母工具（letter.ts）

```typescript
// packages/@core/base/shared/src/utils/letter.ts
import { capitalizeFirstLetter, toLowerCaseFirstLetter } from '@vben/utils';

capitalizeFirstLetter('hello') // → 'Hello'
toLowerCaseFirstLetter('Hello') // → 'hello'
```

### 差异对比（diff.ts）

```typescript
// findDifferences(o1, o2) — 对比两个对象的差异
import { findDifferences } from '@vben/utils';

const diff = findDifferences(oldUser, newUser);
// 返回有差异的字段
```

### 菜单路径查找（find-menu-by-path.ts）

```typescript
// packages/utils/src/helpers/find-menu-by-path.ts
import { findMenuByPath } from '@vben/utils';

const menu = findMenuByPath(menuList, '/dashboard');
```

---

## 开发命令

```bash
# 开发
pnpm dev:antd        # Ant Design Vue
pnpm dev:ele         # Element Plus
pnpm dev:naive       # Naive UI
pnpm dev:tdesign     # TDesign

# 构建
pnpm build:antd
pnpm build:ele
pnpm build:naive
pnpm build:tdesign

# 代码检查
pnpm lint            # ESLint
pnpm format          # Prettier（prettier.ts: prettierFormat(filepath)）
pnpm check:circular  # 循环依赖
pnpm check:dep       # 依赖检查（publint）

# 测试
pnpm test            # Vitest

# 提交
pnpm commit          # czg 交互式提交

# 清理
pnpm clean
pnpm reinstall
```

---

## 配置说明

### 路径别名

```json
{
  "imports": {
    "#/*": "./src/*"
  }
}
```

```typescript
import { useVbenForm } from '#/adapter/form';
import { requestClient } from '#/api/request';
import type { UserInfo } from '#/types/user';
```

### 环境变量

```env
# .env.development
VITE_API_URL=http://localhost:3000
VITE_APP_TITLE=Vben Admin

# .env.production
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=Vben Admin
```

```typescript
// internal/vite-config/src/utils/env.ts
// loadAndConvertEnv() 自动加载并转换 VITE_ 前缀环境变量
// getBoolean(value) 将字符串 'true'/'false' 转为 boolean
```

### Vite 配置扩展

```typescript
// internal/vite-config/src/config/application.ts
// 应用构建配置（含 archiver、nitro-mock、importmap、inject-metadata 等插件）

// internal/vite-config/src/plugins/extra-app-config.ts
// 注入运行时应用配置

// internal/vite-config/src/plugins/nitro-mock.ts
// 集成 Nitro Mock 服务器
```

---

## 参考文档导航

### API 参考文件（94 个，置信度：中等）

| 分类 | 关键文件 | 内容说明 |
|------|----------|----------|
| 权限系统 | `access.md`, `accessible.md`, `guard.md` | 路由守卫、权限生成、路由过滤 |
| 表单 | `form-api.md`, `form.md`, `dependencies.md`, `expandable.ts` | FormApi 类、字段联动、展开逻辑 |
| 弹窗 | `modal-api.md`, `drawer-api.md`, `AlertBuilder.md` | 弹窗/抽屉 API、Alert/Confirm |
| 请求 | `request.md`, `request-client.md`, `interceptor.md`, `preset-interceptors.md`, `downloader.md` | HTTP 客户端、拦截器预设、文件下载 |
| 路由 | `generate-routes-backend.md`, `generate-routes-frontend.md`, `merge-route-modules.md`, `find-menu-by-path.md` | 路由生成策略、菜单处理 |
| 工具 | `color.md`, `convert.md`, `date.md`, `diff.md`, `inference.md`, `letter.md`, `dom.md` | 颜色/日期/推断/字符串工具 |
| 国际化 | `i18n.md`, `messages.md` | 语言包加载、语言切换 |
| 图标 | `icons.md`, `load.md`, `create-icon.md` | Iconify 图标、SVG 加载 |
| Vite 配置 | `application.md`, `env.md`, `archiver.md`, `importmap.md`, `inject-metadata.md`, `nitro-mock.md` | 构建配置、环境变量 |
| VxeTable | `extends.md`, `init.md` | 表格扩展、初始化 |
| Mock 服务 | `jwt-utils.md`, `cookie-utils.md`, `mock-data.md` | JWT 工具、Cookie、测试数据 |
| Node 工具 | `fs.md`, `monorepo.md`, `prettier.md` | 文件操作、Monorepo 工具 |
| 系统 API | `dept.md`, `menu.md` | 部门/菜单 CRUD API 示例 |

### 如何使用参考文件

- **初学者**：从 `bootstrap.md` → `guard.md` → `form-api.md` 开始，理解核心启动流程
- **中级开发者**：关注 `preset-interceptors.md`（Token 刷新）、`dependencies.md`（表单联动）、`extends.md`（表格扩展）
- **高级开发者**：参考 `application.md`、`env.md`（Vite 配置）、`accessible.md`（权限架构）

---

## 常见问题

### Q: 如何切换主题？

```typescript
import { preferences } from '@vben/preferences';

preferences.theme = 'dark';   // 'light' | 'dark' | 'system'
```

### Q: 如何实现 Token 自动刷新？

```typescript
// 使用 preset-interceptors.ts 中的 authenticateResponseInterceptor
import { authenticateResponseInterceptor } from '@vben/request';

requestClient.addResponseInterceptor(
  authenticateResponseInterceptor({
    client: requestClient,
    doReAuthenticate: () => router.push('/login'),
    doRefreshToken: async () => {
      const res = await refreshTokenApi();
      return res.accessToken;
    },
    enableRefreshToken: true,
    formatToken: (token) => `Bearer ${token}`,
  })
);
```

### Q: 如何添加新页面？

1. 在 `src/views/` 下创建 `.vue` 文件
2. 在 `src/router/routes/modules/` 下添加路由模块
3. 配置 `meta.authority` 设置权限
4. 如使用 backend 模式，确保后端返回对应菜单数据

### Q: 如何在表单中实现字段联动？

```typescript
// 使用 dependencies 配置（form-render/dependencies.ts）
{
  field: 'detail',
  component: 'Input',
  dependencies: {
    triggerFields: ['type'],
    show: (values) => values.type === 'advanced',
    required: (values) => values.type === 'advanced',
  }
}
```

### Q: 如何下载文件？

```typescript
// packages/effects/request/src/request-client/modules/downloader.ts
requestClient.download('/api/export', { params: filters }, 'users.xlsx');
```

---

## 相关链接

- **官方文档**: https://doc.vben.pro/
- **GitHub**: https://github.com/vbenjs/vue-vben-admin
- **预览地址**: https://www.vben.pro/

---

**生成时间**: 2026-03-11
**数据来源**: 94 个 API 参考文件（代码库分析）+ 官方文档
**版本**: 5.8.0
