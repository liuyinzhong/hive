import type { ComponentType } from '#/adapter/component';

export type FormConditionOperator =
  | 'contains'
  | 'empty'
  | 'eq'
  | 'gt'
  | 'gte'
  | 'in'
  | 'lt'
  | 'lte'
  | 'notEmpty'
  | 'notIn'
  | 'neq';

export interface FormConditionGroup {
  conditions: FormConditionSpec[];
  logic: 'and' | 'or';
}

export interface FormConditionItem {
  fieldName: string;
  operator: FormConditionOperator;
  value?: unknown;
}

export type FormConditionSpec = FormConditionGroup | FormConditionItem;

export type FormRuleType =
  | 'array'
  | 'boolean'
  | 'custom'
  | 'date'
  | 'email'
  | 'enum'
  | 'number'
  | 'regex'
  | 'required'
  | 'selectRequired'
  | 'string'
  | 'url';

export interface PersistentFormRule {
  handlerKey?: string;
  integer?: boolean;
  length?: number;
  max?: number;
  message?: string;
  min?: number;
  pattern?: string;
  type: FormRuleType;
  values?: unknown[];
}

export interface PersistentDynamicComponentProps {
  cases: Array<{
    condition: FormConditionSpec;
    props: Record<string, unknown>;
  }>;
  default?: Record<string, unknown>;
}

export interface PersistentDynamicRules {
  cases: Array<{
    condition: FormConditionSpec;
    rules: PersistentFormRule[];
  }>;
  default?: PersistentFormRule[];
}

export interface PersistentFormDependencies {
  componentProps?: PersistentDynamicComponentProps;
  disabled?: boolean | FormConditionSpec;
  if?: boolean | FormConditionSpec;
  required?: boolean | FormConditionSpec;
  rules?: PersistentDynamicRules;
  show?: boolean | FormConditionSpec;
  trigger?: string;
  triggerFields: string[];
}

/** 数据库存储的 Vben Form Schema，不包含不可序列化的函数和组件实例。 */
export interface PersistentFormSchema {
  [key: string]: unknown;
  collapsible?: boolean;
  colon?: boolean;
  component: ComponentType;
  componentProps?: Record<string, unknown>;
  controlClass?: string;
  defaultCollapsed?: boolean;
  defaultValue?: unknown;
  dependencies?: PersistentFormDependencies;
  description?: string;
  descriptionRendererKey?: string;
  disabled?: boolean;
  disabledOnChangeListener?: boolean;
  disabledOnInputListener?: boolean;
  emptyStateValue?: null;
  fieldName: string;
  formFieldProps?: Record<string, unknown>;
  formItemClass?: string;
  formItemClassResolverKey?: string;
  help?: string;
  helpRendererKey?: string;
  hide?: boolean;
  hideLabel?: boolean;
  hideRequiredMark?: boolean;
  label?: string;
  labelClass?: string;
  labelRendererKey?: string;
  labelWidth?: number;
  modelPropName?: string;
  propsResolverKey?: string;
  renderComponentContentKey?: string;
  rules?: PersistentFormRule[];
  suffix?: string;
  suffixRendererKey?: string;
  valueFormatterKey?: string;
  wrapperClass?: string;
}

export type FormComponentGroup = 'basic' | 'choice' | 'date' | 'extended';

export type FormSchemaLayout = 'double' | 'single' | 'triple';

export type FormValueType =
  | 'array'
  | 'boolean'
  | 'date'
  | 'number'
  | 'object'
  | 'string'
  | 'unknown';

export interface FormComponentMeta {
  component: ComponentType;
  defaultProps?: Record<string, unknown>;
  defaultValue?: unknown;
  group: FormComponentGroup;
  optionProp?: string;
  supportsRules?: boolean;
  title: string;
  valueType: FormValueType;
}
