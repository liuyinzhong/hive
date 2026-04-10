# 部门管理API

<cite>
**本文档引用的文件**
- [apps/backend-mock/api/system/dept/.post.ts](file://apps/backend-mock/api/system/dept/.post.ts)
- [apps/backend-mock/api/system/dept/[id].delete.ts](file://apps/backend-mock/api/system/dept/[id].delete.ts)
- [apps/backend-mock/api/system/dept/[id].put.ts](file://apps/backend-mock/api/system/dept/[id].put.ts)
- [apps/backend-mock/api/system/dept/list.ts](file://apps/backend-mock/api/system/dept/list.ts)
- [apps/backend-mock/utils/response.ts](file://apps/backend-mock/utils/response.ts)
- [apps/backend-mock/utils/jwt-utils.ts](file://apps/backend-mock/utils/jwt-utils.ts)
- [apps/web-antd/src/api/system/dept.ts](file://apps/web-antd/src/api/system/dept.ts)
- [playground/src/api/system/dept.ts](file://playground/src/api/system/dept.ts)
- [apps/web-antd/src/views/system/dept/list.vue](file://apps/web-antd/src/views/system/dept/list.vue)
- [apps/web-antd/src/views/system/dept/modules/form.vue](file://apps/web-antd/src/views/system/dept/modules/form.vue)
- [playground/src/views/system/dept/list.vue](file://playground/src/views/system/dept/list.vue)
- [playground/src/views/system/dept/modules/form.vue](file://playground/src/views/system/dept/modules/form.vue)
</cite>

## 目录

1. [简介](#简介)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [架构总览](#架构总览)
5. [详细组件分析](#详细组件分析)
6. [依赖分析](#依赖分析)
7. [性能考虑](#性能考虑)
8. [故障排除指南](#故障排除指南)
9. [结论](#结论)
10. [附录](#附录)

## 简介

本文件为 Vben Admin 的部门管理 API 提供完整的技术文档，覆盖后端 Mock API 的端点定义与前端调用方式，重点说明部门树形结构的数据模型、父子关系、状态管理与权限校验流程，并给出最佳实践与一致性保障建议。

## 项目结构

部门管理相关代码分布在以下位置：

- 后端 Mock API：apps/backend-mock/api/system/dept/
- 前端 API 客户端：apps/web-antd/src/api/system/dept.ts 与 playground/src/api/system/dept.ts
- 前端视图与表单：apps/web-antd/src/views/system/dept/_ 与 playground/src/views/system/dept/_

```mermaid
graph TB
subgraph "前端应用"
FE_API["前端API客户端<br/>dept.ts"]
FE_LIST["部门列表视图<br/>list.vue"]
FE_FORM["部门表单视图<br/>modules/form.vue"]
end
subgraph "后端Mock服务"
BE_LIST["部门列表接口<br/>list.ts"]
BE_CREATE["创建部门接口<br/>.post.ts"]
BE_UPDATE["更新部门接口<br/>[id].put.ts"]
BE_DELETE["删除部门接口<br/>[id].delete.ts"]
UTIL_JWT["JWT工具<br/>jwt-utils.ts"]
UTIL_RESP["响应工具<br/>response.ts"]
end
FE_LIST --> FE_API
FE_FORM --> FE_API
FE_API --> BE_LIST
FE_API --> BE_CREATE
FE_API --> BE_UPDATE
FE_API --> BE_DELETE
BE_LIST --> UTIL_JWT
BE_CREATE --> UTIL_JWT
BE_UPDATE --> UTIL_JWT
BE_DELETE --> UTIL_JWT
BE_LIST --> UTIL_RESP
BE_CREATE --> UTIL_RESP
BE_UPDATE --> UTIL_RESP
BE_DELETE --> UTIL_RESP
```

图表来源

- [apps/web-antd/src/api/system/dept.ts:1-53](file://apps/web-antd/src/api/system/dept.ts#L1-L53)
- [playground/src/api/system/dept.ts:1-55](file://playground/src/api/system/dept.ts#L1-L55)
- [apps/backend-mock/api/system/dept/list.ts:1-62](file://apps/backend-mock/api/system/dept/list.ts#L1-L62)
- [apps/backend-mock/api/system/dept/.post.ts:1-17](file://apps/backend-mock/api/system/dept/.post.ts#L1-L17)
- [apps/backend-mock/api/system/dept/[id].put.ts](file://apps/backend-mock/api/system/dept/[id].put.ts#L1-L17)
- [apps/backend-mock/api/system/dept/[id].delete.ts](file://apps/backend-mock/api/system/dept/[id].delete.ts#L1-L17)
- [apps/backend-mock/utils/jwt-utils.ts:1-115](file://apps/backend-mock/utils/jwt-utils.ts#L1-L115)
- [apps/backend-mock/utils/response.ts:1-71](file://apps/backend-mock/utils/response.ts#L1-L71)

章节来源

- [apps/web-antd/src/api/system/dept.ts:1-53](file://apps/web-antd/src/api/system/dept.ts#L1-L53)
- [playground/src/api/system/dept.ts:1-55](file://playground/src/api/system/dept.ts#L1-L55)
- [apps/backend-mock/api/system/dept/list.ts:1-62](file://apps/backend-mock/api/system/dept/list.ts#L1-L62)
- [apps/backend-mock/api/system/dept/.post.ts:1-17](file://apps/backend-mock/api/system/dept/.post.ts#L1-L17)
- [apps/backend-mock/api/system/dept/[id].put.ts](file://apps/backend-mock/api/system/dept/[id].put.ts#L1-L17)
- [apps/backend-mock/api/system/dept/[id].delete.ts](file://apps/backend-mock/api/system/dept/[id].delete.ts#L1-L17)
- [apps/backend-mock/utils/jwt-utils.ts:1-115](file://apps/backend-mock/utils/jwt-utils.ts#L1-L115)
- [apps/backend-mock/utils/response.ts:1-71](file://apps/backend-mock/utils/response.ts#L1-L71)

## 核心组件

- 前端 API 客户端：提供获取列表、创建、更新、删除部门的函数，类型定义包含树形字段 children。
- 后端 Mock 接口：提供部门列表、创建、更新、删除的路由处理器，内置 JWT 校验与统一响应格式。
- 前端视图：使用表格组件展示树形数据，支持新增、编辑、删除、添加下级等操作。

章节来源

- [apps/web-antd/src/api/system/dept.ts:1-53](file://apps/web-antd/src/api/system/dept.ts#L1-L53)
- [playground/src/api/system/dept.ts:1-55](file://playground/src/api/system/dept.ts#L1-L55)
- [apps/backend-mock/api/system/dept/list.ts:1-62](file://apps/backend-mock/api/system/dept/list.ts#L1-L62)
- [apps/backend-mock/api/system/dept/.post.ts:1-17](file://apps/backend-mock/api/system/dept/.post.ts#L1-L17)
- [apps/backend-mock/api/system/dept/[id].put.ts](file://apps/backend-mock/api/system/dept/[id].put.ts#L1-L17)
- [apps/backend-mock/api/system/dept/[id].delete.ts](file://apps/backend-mock/api/system/dept/[id].delete.ts#L1-L17)

## 架构总览

部门管理采用前后端分离架构，前端通过统一的 API 客户端发起请求，后端使用 H3 路由处理器处理业务逻辑，所有接口均进行 JWT 认证与统一响应封装。

```mermaid
sequenceDiagram
participant UI as "前端界面"
participant API as "前端API客户端"
participant H3 as "后端H3路由"
participant AUTH as "JWT验证"
participant RESP as "响应封装"
UI->>API : 调用部门相关方法
API->>H3 : 发送HTTP请求
H3->>AUTH : 校验Authorization头
AUTH-->>H3 : 返回用户信息或拒绝
alt 未授权
H3->>RESP : 组装401错误响应
RESP-->>API : 返回错误
API-->>UI : 显示错误
else 已授权
H3->>RESP : 执行业务逻辑并返回数据
RESP-->>API : 返回成功响应
API-->>UI : 渲染结果
end
```

图表来源

- [apps/backend-mock/utils/jwt-utils.ts:27-56](file://apps/backend-mock/utils/jwt-utils.ts#L27-L56)
- [apps/backend-mock/utils/response.ts:52-55](file://apps/backend-mock/utils/response.ts#L52-L55)
- [apps/backend-mock/api/system/dept/list.ts:53-61](file://apps/backend-mock/api/system/dept/list.ts#L53-L61)
- [apps/backend-mock/api/system/dept/.post.ts:9-16](file://apps/backend-mock/api/system/dept/.post.ts#L9-L16)
- [apps/backend-mock/api/system/dept/[id].put.ts](file://apps/backend-mock/api/system/dept/[id].put.ts#L9-L16)
- [apps/backend-mock/api/system/dept/[id].delete.ts](file://apps/backend-mock/api/system/dept/[id].delete.ts#L9-L16)

## 详细组件分析

### 数据模型与树形结构

- 字段定义
  - id: 部门唯一标识（字符串）
  - name: 部门名称（字符串）
  - remark: 备注（可选字符串）
  - status: 状态（0/1）
  - children: 子部门数组（递归结构）
  - pid: 父级部门标识（用于树形映射）
- 关系说明
  - 树根节点 pid 通常为 0 或省略，表示顶级部门
  - 子节点 pid 指向父节点 id
  - 树形渲染通过表格配置 parentField='pid'、rowField='id' 实现

```mermaid
classDiagram
class DeptModel {
+string id
+string name
+string remark
+number status
+DeptModel[] children
+string pid
}
```

图表来源

- [apps/web-antd/src/api/system/dept.ts:4-11](file://apps/web-antd/src/api/system/dept.ts#L4-L11)
- [playground/src/api/system/dept.ts:4-11](file://playground/src/api/system/dept.ts#L4-L11)

章节来源

- [apps/web-antd/src/api/system/dept.ts:4-11](file://apps/web-antd/src/api/system/dept.ts#L4-L11)
- [playground/src/api/system/dept.ts:4-11](file://playground/src/api/system/dept.ts#L4-L11)

### API 端点定义

- 获取部门列表
  - 方法与路径：GET /system/dept/list
  - 请求参数：无
  - 响应数据：树形结构数组
  - 示例：见“附录/响应示例”
- 创建部门
  - 方法与路径：POST /system/dept
  - 请求体：除 children、id 外的部门字段
  - 响应数据：无具体业务数据
- 更新部门
  - 方法与路径：PUT /system/dept/:id
  - 路径参数：id（部门ID）
  - 请求体：除 children、id 外的部门字段
  - 响应数据：无具体业务数据
- 删除部门
  - 方法与路径：DELETE /system/dept/:id
  - 路径参数：id（部门ID）
  - 响应数据：无具体业务数据

章节来源

- [apps/web-antd/src/api/system/dept.ts:17-52](file://apps/web-antd/src/api/system/dept.ts#L17-L52)
- [playground/src/api/system/dept.ts:17-54](file://playground/src/api/system/dept.ts#L17-L54)
- [apps/backend-mock/api/system/dept/list.ts:53-61](file://apps/backend-mock/api/system/dept/list.ts#L53-L61)
- [apps/backend-mock/api/system/dept/.post.ts:9-16](file://apps/backend-mock/api/system/dept/.post.ts#L9-L16)
- [apps/backend-mock/api/system/dept/[id].put.ts](file://apps/backend-mock/api/system/dept/[id].put.ts#L9-L16)
- [apps/backend-mock/api/system/dept/[id].delete.ts](file://apps/backend-mock/api/system/dept/[id].delete.ts#L9-L16)

### 权限与认证流程

- 认证方式：Authorization 头携带 Bearer Token
- 校验逻辑：后端解析 Authorization 头，验证 JWT 有效性并匹配用户信息
- 未授权响应：返回 401 并使用统一错误格式

```mermaid
flowchart TD
Start(["请求到达"]) --> Parse["解析Authorization头"]
Parse --> HasBearer{"是否为Bearer?"}
HasBearer --> |否| Unauthorized["返回401未授权"]
HasBearer --> |是| Verify["验证JWT签名与有效期"]
Verify --> Valid{"有效?"}
Valid --> |否| Unauthorized
Valid --> |是| LoadUser["加载用户信息"]
LoadUser --> Found{"找到用户?"}
Found --> |否| Unauthorized
Found --> |是| Allow["允许访问"]
```

图表来源

- [apps/backend-mock/utils/jwt-utils.ts:27-56](file://apps/backend-mock/utils/jwt-utils.ts#L27-L56)
- [apps/backend-mock/utils/response.ts:52-55](file://apps/backend-mock/utils/response.ts#L52-L55)

章节来源

- [apps/backend-mock/utils/jwt-utils.ts:27-56](file://apps/backend-mock/utils/jwt-utils.ts#L27-L56)
- [apps/backend-mock/utils/response.ts:52-55](file://apps/backend-mock/utils/response.ts#L52-L55)

### 前端调用与树形渲染

- 列表加载：通过表格代理配置调用 getDeptList，设置 treeConfig.parentField='pid'、rowField='id'
- 新增/编辑：打开模态表单，提交时根据是否存在 id 决定调用 createDept 或 updateDept
- 删除：调用 deleteDept，删除成功后刷新表格

```mermaid
sequenceDiagram
participant List as "部门列表页"
participant Grid as "表格组件"
participant API as "API客户端"
participant Form as "表单模态框"
List->>Grid : 初始化并启用树形配置
Grid->>API : 查询部门列表
API-->>Grid : 返回树形数据
Grid-->>List : 渲染树形表格
List->>Form : 打开新增/编辑表单
Form->>API : 提交创建/更新请求
API-->>Form : 返回成功
Form-->>List : 触发刷新
List->>API : 删除指定部门
API-->>List : 返回成功
List->>Grid : 刷新表格
```

图表来源

- [apps/web-antd/src/views/system/dept/list.vue:94-121](file://apps/web-antd/src/views/system/dept/list.vue#L94-L121)
- [apps/web-antd/src/views/system/dept/modules/form.vue:35-51](file://apps/web-antd/src/views/system/dept/modules/form.vue#L35-L51)
- [playground/src/views/system/dept/list.vue:94-122](file://playground/src/views/system/dept/list.vue#L94-L122)
- [playground/src/views/system/dept/modules/form.vue:35-51](file://playground/src/views/system/dept/modules/form.vue#L35-L51)

章节来源

- [apps/web-antd/src/views/system/dept/list.vue:94-121](file://apps/web-antd/src/views/system/dept/list.vue#L94-L121)
- [apps/web-antd/src/views/system/dept/modules/form.vue:35-51](file://apps/web-antd/src/views/system/dept/modules/form.vue#L35-L51)
- [playground/src/views/system/dept/list.vue:94-122](file://playground/src/views/system/dept/list.vue#L94-L122)
- [playground/src/views/system/dept/modules/form.vue:35-51](file://playground/src/views/system/dept/modules/form.vue#L35-L51)

## 依赖分析

- 前端 API 客户端依赖统一请求客户端（requestClient），在不同应用中复用
- 后端接口依赖 JWT 工具进行认证，依赖响应工具生成统一格式
- 前端视图依赖表格适配器与表单适配器，实现树形渲染与表单交互

```mermaid
graph LR
FE_API["前端API客户端"] --> Request["统一请求客户端"]
FE_LIST["列表视图"] --> FE_API
FE_FORM["表单视图"] --> FE_API
BE_LIST["列表接口"] --> JWT["JWT工具"]
BE_LIST --> RESP["响应工具"]
BE_CREATE["创建接口"] --> JWT
BE_CREATE --> RESP
BE_UPDATE["更新接口"] --> JWT
BE_UPDATE --> RESP
BE_DELETE["删除接口"] --> JWT
BE_DELETE --> RESP
```

图表来源

- [apps/web-antd/src/api/system/dept.ts](file://apps/web-antd/src/api/system/dept.ts#L1)
- [playground/src/api/system/dept.ts](file://playground/src/api/system/dept.ts#L1)
- [apps/backend-mock/utils/jwt-utils.ts:1-115](file://apps/backend-mock/utils/jwt-utils.ts#L1-L115)
- [apps/backend-mock/utils/response.ts:1-71](file://apps/backend-mock/utils/response.ts#L1-L71)

章节来源

- [apps/web-antd/src/api/system/dept.ts](file://apps/web-antd/src/api/system/dept.ts#L1)
- [playground/src/api/system/dept.ts](file://playground/src/api/system/dept.ts#L1)
- [apps/backend-mock/utils/jwt-utils.ts:1-115](file://apps/backend-mock/utils/jwt-utils.ts#L1-L115)
- [apps/backend-mock/utils/response.ts:1-71](file://apps/backend-mock/utils/response.ts#L1-L71)

## 性能考虑

- 列表查询：后端使用结构化克隆返回数据，避免直接修改原始数据；前端表格开启树形配置，减少 DOM 层级渲染压力
- 请求延迟：后端接口模拟了不同耗时（创建/更新/删除），建议在生产环境合理设置超时与重试策略
- 分页与懒加载：当前示例未启用分页，若数据量大，建议引入分页或按需加载子节点

## 故障排除指南

- 401 未授权
  - 检查请求头 Authorization 是否为 Bearer Token
  - 确认 Token 未过期且密钥正确
- 403 禁止访问
  - 检查用户权限与角色配置
- 网络异常
  - 检查请求客户端配置与跨域设置
  - 查看浏览器网络面板与后端日志

章节来源

- [apps/backend-mock/utils/response.ts:44-55](file://apps/backend-mock/utils/response.ts#L44-L55)
- [apps/backend-mock/utils/jwt-utils.ts:27-56](file://apps/backend-mock/utils/jwt-utils.ts#L27-L56)

## 结论

本文档梳理了 Vben Admin 部门管理的前后端协作方式，明确了树形数据模型、认证流程与关键端点。建议在生产环境中完善权限控制、错误处理与性能优化，并保持前后端数据契约一致。

## 附录

### 响应格式规范

- 成功响应
  - code: 0
  - message: ok
  - data: 具体业务数据（如列表数组或空对象）
- 错误响应
  - code: -1
  - message: 错误描述
  - error: 错误详情（可选）

章节来源

- [apps/backend-mock/utils/response.ts:5-42](file://apps/backend-mock/utils/response.ts#L5-L42)

### 状态码说明

- 200 OK：请求成功
- 401 未授权：缺少或无效的认证信息
- 403 禁止访问：权限不足

章节来源

- [apps/backend-mock/utils/response.ts:44-55](file://apps/backend-mock/utils/response.ts#L44-L55)
- [apps/backend-mock/utils/jwt-utils.ts:27-56](file://apps/backend-mock/utils/jwt-utils.ts#L27-L56)

### 响应示例（部门列表）

- 结构概览
  - 根节点：pid=0 或省略
  - 子节点：pid 指向上级 id
  - 叶子节点：children 可为空或不存在
- 示例字段
  - id: "uuid"
  - name: "部门名称"
  - remark: "备注"
  - status: 0 或 1
  - pid: "父级ID或0"
  - children: [子节点...]

章节来源

- [apps/backend-mock/api/system/dept/list.ts:16-49](file://apps/backend-mock/api/system/dept/list.ts#L16-L49)
