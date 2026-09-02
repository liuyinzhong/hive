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
  isDefaultBranch?: boolean;
  // 节点业务键:业务模块在节点属性中配置的稳定语义标识(如 review),流程引擎在节点完成时按此键调用业务状态钩子。
  nodeBusinessKey?: string;
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
