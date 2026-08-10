# 产品档案 UI 规则

## 页面结构

- 列表页展示 SPU，支持关键词、产品类型和状态筛选。
- SKU 档案页位于独立管理入口，一行展示一条真实 SKU，并扁平展示所属 SPU、RP、MP 的关键字段；它不提供新增或删除。
- SKU 档案页支持按 SKU 编码、通用名称、简称、批准文号、生产企业名称、产品类型和 SKU 状态组合查询。
- “新增”进入 `/product/spu/detail/create`；“详情”进入 `/product/spu/detail/:spuId`。
- 详情页上方维护 SPU，保存成功后刷新详情和行版本。
- 详情页下方以合并表格展示 `RP → MP → SKU`，并从对应行打开新增或编辑弹窗。
- SKU 行可打开价格抽屉，继续维护价格和阶梯价格。
- SKU 档案页的“编辑SKU”复用现有编辑弹窗且不允许更改所属 MP；“查看产品”仅进入所属 SPU 详情页，不传递 SKU 参数，也不默认定位或高亮 SKU 行。

## 按钮与权限

| 入口                 | 展示权限                                        |
| -------------------- | ----------------------------------------------- |
| 打开 SKU 档案列表    | `product:sku:list`                              |
| 编辑 SKU / 查看产品  | `product:sku:update` / `product:spu:detail`     |
| SKU 档案状态开关     | `product:sku:status`                            |
| 新增或保存 SPU       | `product:spu:create` / `product:spu:update`     |
| 新增或编辑 RP        | `product:rp:create` / `product:rp:update`       |
| 新增或编辑 MP        | `product:mp:create` / `product:mp:update`       |
| 新增或编辑 SKU       | `product:sku:create` / `product:sku:update`     |
| 打开价格             | `product:skuPrice:list`                         |
| 新增、编辑、删除价格 | `product:skuPrice:create` / `update` / `delete` |
| 切换价格状态         | `product:skuPrice:status`                       |
| 查看、保存阶梯价格   | `product:skuPriceTier:list` / `save`            |

SPU 列表状态开关使用 `product:spu:status`，SKU 档案列表状态开关使用 `product:sku:status`；两者均提交当前 `rowVersion`，成功后使用响应版本刷新当前数据。RP、MP、SKU 在各自编辑弹窗保存状态时，后端仍会校验对应行版本。

## 表单联动

- 创建 SPU 默认产品类型为 `DRUG`、状态为启用。
- 只有 SPU 已保存并取得详情数据后，页面才显示新增 RP 入口。
- MP 生产企业通过企业主体选项选择；具体有效性仍由后端校验。
- SKU 包装链由最小单位、包装单位、整箱单位和换算数量组合，拆零与追溯模式是独立字段。
- 非全局价格显示范围对象选择器；全局价格不提交有效范围对象。
- 价格和阶梯价格所有更新均携带当前行版本，任何成功保存后都应重新加载价格列表，不能继续复用旧版本。
- 阶梯弹窗将当前数组整体提交；清空所有行会提交空数组并表达“删除全部阶梯”。

## 已知差异与注意事项

1. 详情表格行的 `status` 字段表示 SKU 状态，不代表整条 SPU/RP/MP/SKU 层级均可用。
2. 非全局价格范围当前统一展示企业主体选项；若后续客户或渠道改为独立主数据，必须同步 API 类型和本页联动。
3. 核心产品层级当前没有删除按钮，因为后端没有对应接口。
