export type WorkflowAssigneeType =
  | 'leader'
  | 'role'
  | 'starter'
  | 'user';
export type WorkflowApprovalMode = 'all' | 'any';
export type WorkflowBranchMode = 'firstMatch';
export type WorkflowConditionLogic = 'and' | 'or';
export type WorkflowCopyType = 'participant' | 'role' | 'user';
export type WorkflowNodeType =
  | 'approve'
  | 'condition'
  | 'copy'
  | 'end'
  | 'start';

export interface WorkflowConditionRule {
  field: string;
  operator: string;
  value: string;
}

/** 插入记录动作的字段映射快照 */
export interface WorkflowInsertMapping {
  field: string;
  sourceType: 'fixed' | 'form';
  value?: string;
  formField?: string;
}

/** 节点挂载的自动化动作快照:选中动作时固化配置到画布,发布后按快照执行,不回查动作库 */
export interface WorkflowAutomationMount {
  automationId: string;
  automationName: string;
  /** 业务类型,字典BUSINESS_TYPE的值 */
  businessType: string;
  /** 动作类型:update_field修改字段值 insert_record插入记录 */
  actionType: string;
  /** 修改字段值参数 */
  targetField?: string;
  targetValue?: string;
  /** 插入记录参数(插入目标即动作业务类型) */
  mappings?: WorkflowInsertMapping[];
  /** 执行条件留位,版本1恒为空(始终执行) */
  condition?: string;
}

export interface WorkflowElementProperties {
  [key: string]: unknown;
  assigneeIds?: string[];
  assigneeNames?: string[];
  assigneeType?: WorkflowAssigneeType;
  approvalMode?: WorkflowApprovalMode;
  branchMode?: WorkflowBranchMode;
  conditionLogic?: WorkflowConditionLogic;
  conditionRules?: WorkflowConditionRule[];
  copyIds?: string[];
  copyNames?: string[];
  copyType?: WorkflowCopyType;
  fieldPermissions?: Record<
    string,
    import('#/api/workflow').WorkflowDefinitionApi.WorkflowFormFieldPermission
  >;
  /** 自动化动作挂载快照,任意节点类型可配多个,按顺序同事务执行 */
  automations?: WorkflowAutomationMount[];
  isDefaultBranch?: boolean;
  nodeType?: WorkflowNodeType;
  priority?: number;
}

export interface WorkflowElementText {
  value: string;
  x: number;
  y: number;
}

export interface WorkflowElement {
  id: string;
  properties?: WorkflowElementProperties;
  sourceNodeId?: string;
  targetNodeId?: string;
  text?: WorkflowElementText;
}

export interface WorkflowNodeData extends WorkflowElement {
  type: string;
  x: number;
  y: number;
}

export interface WorkflowEdgeData extends WorkflowElement {
  sourceNodeId: string;
  targetNodeId: string;
  type: string;
}

export interface WorkflowGraphData {
  edges: WorkflowEdgeData[];
  nodes: WorkflowNodeData[];
}

export interface WorkflowPaletteNode {
  icon: string;
  nodeType: WorkflowNodeType;
  text: string;
  type: string;
}

export interface WorkflowPropertyValues extends WorkflowElementProperties {
  text: string;
}
