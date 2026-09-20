# 文件管理页面上下文

修改本目录前依次阅读：

1. `hive-admin-go/business-docs/system/CONTEXT.md`。
2. `hive-admin-go/business-docs/system/file-management.md`。
3. `hive/business-docs/system/file-management-ui.md`。

- 上传文件属于文件管理，下载中心导出文件属于另一类资源，两者目录、权限、保留期和归属互不替代，不得混入同一列表。
- 使用状态统一称"已使用/未使用"（status 0/1），不得写"正式/临时"或"启用/禁用"；它表示文件是否被业务使用，不表示启用禁用。
- 后端没有文件删除入口，前端不得只在本地隐藏一行冒充删除成功；孤儿文件清理尚未实现，`status=1` 当前无写入方。
- 缩略图列按 MIME 判定，非图片只显示扩展名占位；预览按类型分流，图片走 antd Image 浮层，其它类型走 kkFileView。
- `/uploads/**` 是公开静态路径，列表不可见不等于内容私有，敏感文件不得使用该入口。

列表接口受 `system:file:list` 保护；上传接口当前只要求登录、没有单独原子权限，新增上传权限时必须同步所有上传调用方。
