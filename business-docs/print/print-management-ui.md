# 打印管理 UI 规则

## 模板列表

- 当前每种单据类型最多一份模板；首期仅显示采购入库单类型。
- 列表提供创建或进入设计器、预览、发布和删除入口，并按打印模板权限控制。
- 草稿和已发布状态分别展示；保存草稿后不能把页面标记为仍然已发布。
- 创建模板时以 `createDefaultPrintTemplate` 生成的 worm TemplateData 版式作为初始草稿。

## 设计器

- 设计器画布使用 `@worm-vue3-print/canvas` 的 `PrintDesigner` 组件（npm 固定版本引入），宿主页只负责模板元信息、保存/发布流程与权限，不实现画布逻辑。
- 设计器左侧字段树来自后端字段注册表：页面通过映射函数把 `PrintFieldGroup[]` 转为 worm 的 `PrintBusinessField[]` 注入 `fields`，明细集合根（`items`，list 类型）作为表格数据源；不得手工输入任意字段路径。
- 画布「保存」与页面「保存草稿」都提交完整 TemplateData JSON 和 rowVersion；模板名称、状态等元信息在宿主页维护，不在版式 JSON 内。
- 画布「加载默认布局」按钮由 `load-default-template` 回调注入，返回 `createDefaultPrintTemplate()` 生成的默认版式。
- 「预览」按钮打开免保存预览弹层：`getTemplateJson()` 取当前画布 JSON，配合选择的真实采购入库单数据（`getPurchaseInboundPrintDataApi`）交给 `PrintHtmlPreview` 渲染，打印调用其 `print()` 方法。
- 并发冲突时提示重新加载，不能用旧 rowVersion 强行覆盖。
- 发布前先保存需要发布的草稿，再执行独立发布动作；发布失败仍保留草稿供修正。
- 设计器叠层对比截图与图片上传依赖服务端 render 服务，本期不注入对应回调，功能入口自动隐藏。

## 预览与打印

- 模板预览使用当前草稿，可选择采购入库单 ID 检查版式。
- 正式采购入库单打印页使用 `PrintHtmlPreview` 渲染已发布版式与真实单据数据，优先 `publishedLayout`；设计器未发布修改不能进入正式结果。
- 真实采购入库单的预览和正式打印都继承来源单据的数据范围；模板预览或打印按钮权限不能使越界单据可见。
- 打印由 `PrintHtmlPreview.print()` 触发；页面关闭、浏览器打印或另存 PDF 不改变来源单据状态。
