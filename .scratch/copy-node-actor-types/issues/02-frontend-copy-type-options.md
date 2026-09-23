# 02: 设计器抄送类型增加「流程发起人」与「发起人直属上级」

**仓库：hive**（本工单在前端仓库执行，遵守其 AGENTS.md）

**What to build:** 流程设计器抄送节点的抄送类型下拉新增「流程发起人」「发起人直属上级」两个选项；选中这两类（与审批参与人一样）时隐藏人员/角色选择框、显示专用提示文案；提交时人员数组置空；切换类型清空已选。中英文词条同步。同批更新前端设计器 UI 文档中抄送节点类型说明。

**Blocked by:** None（can start immediately；与 01 无依赖，后端运行时已支持两类人员解析）

**Status:** ready-for-agent

- [ ] 抄送类型联合类型扩为五值 user/role/participant/starter/leader
- [ ] 类型下拉新增「流程发起人」「发起人直属上级」选项，文案复用审批侧既有词条
- [ ] participant/starter/leader 三类不显示选择框，各显示抄送语义提示（新增抄送专用中英文词条）；user/role 维持必选校验
- [ ] 提交画布时 starter/leader 与 participant 一样人员数组置空；切换类型清空已选与名称快照
- [ ] 前端设计器 UI 文档补抄送节点类型选项与免选人交互说明
- [ ] 局部 typecheck 通过（按改动文件过滤存量错误）
