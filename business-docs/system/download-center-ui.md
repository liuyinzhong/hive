# 下载中心 UI 规则

## 页面结构

- 列表只查询当前用户的下载任务。
- 支持按任务名称、状态和创建时间范围筛选。
- 表格将进度和行数分列展示：进度列显示百分比进度条，行数列显示“已处理行数/总行数”；同时展示来源模块、创建时间、状态、文件大小、完成时间和过期时间。
- 失败任务在状态下方展示后端返回的失败原因。
- 来源导出在 Worker 真正执行时重新解析任务创建者当前数据范围；用户失效或权限变化可以使任务失败或导出行数与创建时列表不同，页面以最终任务结果为准。

## 状态呈现

| 状态 | 页面表现 | 可下载 |
|---|---|---|
| `pending` | 等待状态、当前进度 | 否 |
| `running` | 处理中进度条 | 否 |
| `succeeded` | 成功状态、文件信息 | 文件名存在且未过期时可点击 |
| `failed` | 错误状态、失败原因 | 否 |

前端可下载判断不掌握私有文件路径；即使按钮启用，服务器文件不存在时仍可能被后端拒绝。

## 实时刷新

- 页面监听全局消息 Store 的 `downloadTaskRevision`。
- 每次收到 `downloadTaskChanged` 后延迟 300 毫秒重新查询，短时间连续事件会合并为一次刷新。
- 页面卸载时清除待执行的刷新定时器。
- 列表查询结果是权威状态，前端不直接把 SSE 中的进度写入表格行。

## 文件下载

- 点击下载后显示持续加载提示，请求 Blob 成功后使用任务文件名保存到本地。
- 文件名缺失时以前端 `${taskName}.xlsx` 兜底，但正常成功任务应由后端返回文件名。
- 请求结束无论成功失败都关闭加载提示。
- 当前没有取消、重试、删除任务或延长文件有效期入口。

## 文件预览

- 操作列在"下载"按钮前展示"预览"按钮，可用条件与"下载"按钮一致：状态为 `succeeded`、存在文件名、过期时间晚于当前。
- 点击预览先显示加载提示，调用后端 `GET /api/system/downloads/:id/preview-url` 获取 5 分钟有效的签名 URL（相对路径）。
- 前端用 `window.location.origin` 拼接为完整 URL（dev 走 vite proxy 到后端，生产走 nginx 反代）；URL 上附加 `?fullfilename=<encodeURIComponent(fileName)>` 让 kkFileView 识别文件类型（公开接口路径 `/preview/:token` 不含扩展名，kkFileView 无法从 URL 推断，必须显式传文件名）。
- 拼好的完整 URL Base64 编码后构造 `${VITE_KKFILEVIEW_URL}/onlinePreview?url=<encodeURIComponent(base64(absoluteUrl))>`，在新窗口打开。
- `VITE_KKFILEVIEW_URL` 通过环境变量配置，未配置时给出错误提示。
- kkFileView 通过公开接口 `GET /api/public/downloads/preview/:token` 取文件，无需登录态；token 复用项目 JWT 密钥签发，5 分钟内有效，过期或文件失效时由后端返回对应错误。kkFileView 服务端需配置 `trust.host` 白名单加入前端访问域名（dev 为 `localhost,127.0.0.1`，生产为前端域名），否则被 SSRF 防护拦截。
- 请求结束无论成功失败都关闭加载提示。预览业务规则与权限边界见后端 `business-docs/system/download-center.md` 的 `SYS-DL-013`。

## 来源页面

- 库存余额页按当前仓库、SKU 编码、批号、仅正库存和排序创建导出任务，按钮权限为 `erp:inventoryBalance:export`。
- 开发任务页按当前任务标题、项目、版本、状态和排序创建导出任务，按钮权限为 `dev:task:export`。
- 登录日志页按当前用户名、事件类型、状态、IP、日期和排序创建导出任务，按钮权限为 `system:loginLog:export`；任务完成后在下载中心查看进度和下载固定列表字段。
- 来源页面创建成功只提示任务已创建，不直接下载文件；用户前往下载中心查看进度和取得文件。
