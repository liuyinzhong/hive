<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';

import { IconifyIcon } from '@vben/icons';

import {
  Button,
  Input,
  InputNumber,
  message,
  Select,
  Switch,
  TextArea,
} from 'antdv-next';

import { getAllRoleListApi, getUserListAllApi } from '#/api/system';
import { getAutomationOptionsApi } from '#/api/workflow';
import type {
  WorkflowAutomationApi,
  WorkflowDefinitionApi,
} from '#/api/workflow';
import { $t } from '#/locales';
import type { PersistentFormSchema } from '#/utils/form-schema';
import { getFormComponentMeta } from '#/utils/form-schema';

import type {
  WorkflowAssigneeType,
  WorkflowApprovalMode,
  WorkflowAutomationMount,
  WorkflowBranchMode,
  WorkflowConditionLogic,
  WorkflowConditionRule,
  WorkflowCopyType,
  WorkflowElement,
  WorkflowPropertyValues,
} from '../types';

interface SelectOption {
  label: string;
  title?: string;
  value: string;
}

interface PropertyFormState {
  assigneeIds: string[];
  assigneeNames: string[];
  assigneeType: WorkflowAssigneeType;
  approvalMode: WorkflowApprovalMode;
  automations: WorkflowAutomationMount[];
  branchMode: WorkflowBranchMode;
  conditionLogic: WorkflowConditionLogic;
  conditionRules: WorkflowConditionRule[];
  copyIds: string[];
  copyNames: string[];
  copyType: WorkflowCopyType;
  fieldPermissions: Record<
    string,
    WorkflowDefinitionApi.WorkflowFormFieldPermission
  >;
  isDefaultBranch: boolean;
  priority: number;
  text: string;
}

const props = defineProps<{
  // 当前流程定义声明的业务类型,用于过滤可挂载的自动化动作选项
  businessType?: string;
  conditionEdge?: boolean;
  element?: WorkflowElement;
  formFields?: PersistentFormSchema[];
}>();

const emit = defineEmits<{
  change: [values: WorkflowPropertyValues];
}>();

const actorLoading = ref(false);
const assigneeNameSnapshot = ref(new Map<string, string>());
// 自动化动作选项:按流程定义业务类型过滤的启用动作,供节点挂载选择
const automationOptions = ref<WorkflowAutomationApi.AutomationResponse[]>([]);
const automationLoading = ref(false);
const copyNameSnapshot = ref(new Map<string, string>());
const roleOptions = ref<SelectOption[]>([]);
const userOptions = ref<SelectOption[]>([]);

const formState = reactive<PropertyFormState>({
  assigneeIds: [],
  assigneeNames: [],
  assigneeType: 'user',
  approvalMode: 'any',
  automations: [],
  branchMode: 'firstMatch',
  conditionLogic: 'and',
  conditionRules: [],
  copyIds: [],
  copyNames: [],
  copyType: 'user',
  fieldPermissions: {},
  isDefaultBranch: false,
  priority: 1,
  text: '',
});

/** 加载可挂载的自动化动作选项:按流程定义声明的业务类型过滤启用的动作。 */
async function loadAutomationOptions() {
  automationLoading.value = true;
  try {
    automationOptions.value = await getAutomationOptionsApi(
      props.businessType,
    );
  } catch {
    message.error($t('flow.designer.automation.loadFailed'));
  } finally {
    automationLoading.value = false;
  }
}

/** 动作选择器选项:按动作类型生成摘要文案。 */
const automationSelectOptions = computed<SelectOption[]>(() =>
  automationOptions.value
    .filter((item) => item.automationId)
    .map((item) => ({
      label: `${item.automationName} (${getAutomationOptionSummary(item)})`,
      title: item.remark,
      value: item.automationId as string,
    })),
);

/** 按动作类型生成挂载选项摘要。 */
function getAutomationOptionSummary(
  item: WorkflowAutomationApi.AutomationResponse,
) {
  if (item.actionType === 'insert_record') {
    return '插入记录';
  }
  const updateField = item.updateField;
  if (updateField) {
    return `${updateField.targetFieldLabel || updateField.targetField} → ${updateField.targetValue}`;
  }
  return '-';
}

/** 选择器选中即挂载动作;选择器保持未选中状态,可连续添加。 */
function onSelectAutomation(automationId: string) {
  addAutomation(automationId);
}

/** 挂载动作:选中即把动作配置快照写入画布,同一节点同一动作只挂一次。 */
function addAutomation(automationId: string) {
  const automation = automationOptions.value.find(
    (item) => item.automationId === automationId,
  );
  if (!automation?.automationId) return;
  if (
    formState.automations.some(
      (item) => item.automationId === automation.automationId,
    )
  ) {
    message.warning($t('flow.designer.automation.duplicate'));
    return;
  }
  const mount = buildAutomationMount(automation);
  warnMissingFormFields(automation, mount);
  formState.automations.push(mount);
}

/** 按动作类型把动作配置固化为画布快照。 */
function buildAutomationMount(
  automation: WorkflowAutomationApi.AutomationResponse,
): WorkflowAutomationMount {
  const base: WorkflowAutomationMount = {
    automationId: automation.automationId as string,
    automationName: automation.automationName,
    businessType: automation.businessType,
    actionType: automation.actionType,
  };
  if (
    automation.actionType === 'insert_record' &&
    automation.insertRecord
  ) {
    base.mappings = (automation.insertRecord.mappings || []).map((item) => ({
      field: item.field,
      sourceType: item.sourceType,
      ...(item.sourceType === 'fixed'
        ? { value: item.value ?? '' }
        : { formField: item.formField ?? '' }),
    }));
  } else if (automation.updateField) {
    base.targetField = automation.updateField.targetField;
    base.targetValue = automation.updateField.targetValue;
  }
  return base;
}

/** 挂载时按当前流程绑定表单校验表单字段引用,缺失给出警告但不阻断(发布校验为最终依据)。 */
function warnMissingFormFields(
  automation: WorkflowAutomationApi.AutomationResponse,
  mount: WorkflowAutomationMount,
) {
  if (automation.actionType !== 'insert_record' || !mount.mappings) {
    return;
  }
  const formFieldNames = new Set(
    (props.formFields ?? []).map((field) => field.fieldName),
  );
  const missing = mount.mappings
    .filter(
      (item) => item.sourceType === 'form' && !formFieldNames.has(item.formField ?? ''),
    )
    .map((item) => item.formField);
  if (!props.formFields?.length) {
    message.warning($t('flow.designer.automation.noFormBinding'));
    return;
  }
  if (missing.length) {
    message.warning(
      $t('flow.designer.automation.formFieldMissing', [missing.join('、')]),
    );
  }
}

/** 移除挂载的动作。 */
function removeAutomation(index: number) {
  formState.automations.splice(index, 1);
}

/** 挂载项摘要:按动作类型把快照参数翻译成一行说明。 */
function getMountSummary(mount: WorkflowAutomationMount) {
  if (mount.actionType === 'insert_record') {
    const filled = (mount.mappings ?? []).filter((item) =>
      item.sourceType === 'fixed'
        ? !!item.value?.trim()
        : !!item.formField?.trim(),
    );
    const fields = filled.map((item) => item.field).join('、');
    return `插入 ${fields}${filled.length ? `(${filled.length}项)` : ''}`;
  }
  return `${mount.targetField ?? ''} → ${mount.targetValue ?? ''}`;
}

/** 上移/下移挂载动作,列表顺序即执行顺序。 */
function moveAutomation(index: number, offset: -1 | 1) {
  const target = index + offset;
  if (target < 0 || target >= formState.automations.length) return;
  const removed = formState.automations.splice(index, 1);
  const item = removed[0];
  if (!item) return;
  formState.automations.splice(target, 0, item);
}

const assigneeTypeOptions = [
  { label: $t('flow.designer.actor.specifiedUser'), value: 'user' },
  { label: $t('flow.designer.actor.initiatorLeader'), value: 'leader' },
  { label: $t('flow.designer.actor.specifiedRole'), value: 'role' },
  { label: $t('flow.designer.actor.initiator'), value: 'starter' },
];
const approvalModeOptions = [
  { label: $t('flow.designer.actor.approvalAny'), value: 'any' },
  { label: $t('flow.designer.actor.approvalAll'), value: 'all' },
];
const copyTypeOptions = [
  { label: $t('flow.designer.actor.specifiedUser'), value: 'user' },
  { label: $t('flow.designer.actor.specifiedRole'), value: 'role' },
  { label: $t('flow.designer.actor.participant'), value: 'participant' },
];
const conditionLogicOptions = [
  { label: $t('flow.designer.condition.all'), value: 'and' },
  { label: $t('flow.designer.condition.any'), value: 'or' },
];
const conditionOperatorOptions = [
  { label: $t('flow.designer.condition.equal'), value: 'equal' },
  { label: $t('flow.designer.condition.notEqual'), value: 'notEqual' },
  { label: $t('flow.designer.condition.greaterThan'), value: 'greaterThan' },
  {
    label: $t('flow.designer.condition.greaterThanOrEqual'),
    value: 'greaterThanOrEqual',
  },
  { label: $t('flow.designer.condition.lessThan'), value: 'lessThan' },
  {
    label: $t('flow.designer.condition.lessThanOrEqual'),
    value: 'lessThanOrEqual',
  },
  { label: $t('flow.designer.condition.contains'), value: 'contains' },
  {
    label: $t('flow.designer.condition.notContains'),
    value: 'notContains',
  },
  { label: $t('flow.designer.condition.empty'), value: 'empty' },
  { label: $t('flow.designer.condition.notEmpty'), value: 'notEmpty' },
];
const branchModeOptions = [
  { label: $t('flow.designer.branch.firstMatch'), value: 'firstMatch' },
];
const fieldPermissionOptions = [
  { label: $t('flow.designer.fieldPermission.hidden'), value: 'hidden' },
  { label: $t('flow.designer.fieldPermission.readonly'), value: 'readonly' },
  { label: $t('flow.designer.fieldPermission.editable'), value: 'editable' },
];

const formFieldOptions = computed(() =>
  (props.formFields ?? []).map((field) => ({
    label: `${field.label || field.fieldName} (${field.fieldName})`,
    value: field.fieldName,
  })),
);

const nodeType = computed(() => props.element?.properties?.nodeType ?? '');
const elementId = computed(() => props.element?.id ?? '');
const isEdge = computed(() =>
  Boolean(props.element?.sourceNodeId && props.element?.targetNodeId),
);
const activeAssigneeOptions = computed(() =>
  formState.assigneeType === 'role' ? roleOptions.value : userOptions.value,
);
const activeCopyOptions = computed(() =>
  formState.copyType === 'role' ? roleOptions.value : userOptions.value,
);
const generatedConditionExpression = computed(() => buildConditionExpression());

watch(
  [() => props.element, () => props.formFields],
  ([element]) => {
    const properties = element?.properties ?? {};
    formState.text = normalizeText(element?.text);
    formState.assigneeType = properties.assigneeType ?? 'user';
    formState.approvalMode = properties.approvalMode === 'all' ? 'all' : 'any';
    formState.assigneeIds = readStringArray(properties.assigneeIds);
    formState.assigneeNames = readStringArray(properties.assigneeNames);
    assigneeNameSnapshot.value = createNameSnapshot(
      formState.assigneeIds,
      formState.assigneeNames,
    );
    formState.copyType = properties.copyType ?? 'user';
    formState.automations = readAutomationMounts(properties.automations);
    formState.fieldPermissions = normalizeFieldPermissions(
      properties.fieldPermissions,
    );
    formState.copyIds = readStringArray(properties.copyIds);
    formState.copyNames = readStringArray(properties.copyNames);
    copyNameSnapshot.value = createNameSnapshot(
      formState.copyIds,
      formState.copyNames,
    );
    formState.conditionLogic =
      properties.conditionLogic === 'or' ? 'or' : 'and';
    formState.conditionRules = readConditionRules(properties.conditionRules);
    formState.branchMode = 'firstMatch';
    formState.isDefaultBranch = properties.isDefaultBranch === true;
    formState.priority = normalizePriority(properties.priority);
  },
  { immediate: true },
);

onMounted(() => {
  void loadActorOptions();
  void loadAutomationOptions();
});

/** 读取画布中的自动化动作挂载快照,过滤结构不完整的脏数据。 */
function readAutomationMounts(value: unknown): WorkflowAutomationMount[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (
      item,
    ): item is WorkflowAutomationMount =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as WorkflowAutomationMount).automationId === 'string' &&
      typeof (item as WorkflowAutomationMount).actionType === 'string',
  );
}

/** 加载可用于流程配置的启用用户和启用角色。 */
async function loadActorOptions() {
  actorLoading.value = true;
  try {
    const [users, roles] = await Promise.all([
      getUserListAllApi(),
      getAllRoleListApi(),
    ]);
    userOptions.value = (users ?? []).map((item) => ({
      label: item.realName || item.username,
      value: String(item.userId),
    }));
    roleOptions.value = (roles ?? []).map((item) => ({
      label: item.roleTitle,
      value: String(item.roleId),
    }));
  } catch {
    message.error($t('flow.designer.message.actorLoadFailed'));
  } finally {
    actorLoading.value = false;
  }
}

/** 将 LogicFlow 文本对象转换为表单可编辑字符串。 */
function normalizeText(text?: WorkflowElement['text']) {
  return text?.value ?? '';
}

/** 读取当前画布格式中的字符串数组。 */
function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

/** 读取节点字段权限,未配置字段按节点类型取默认值:发起节点默认可编辑,其余节点默认只读。 */
function normalizeFieldPermissions(value: unknown) {
  const source = isRecord(value) ? value : {};
  const fallback: WorkflowDefinitionApi.WorkflowFormFieldPermission =
    nodeType.value === 'start' ? 'editable' : 'readonly';
  return Object.fromEntries(
    (props.formFields ?? []).map((field) => {
      const permission = source[field.fieldName];
      return [
        field.fieldName,
        permission === 'editable' || permission === 'hidden'
          ? permission
          : fallback,
      ];
    }),
  ) as Record<string, WorkflowDefinitionApi.WorkflowFormFieldPermission>;
}

/** 将未知优先级规范化为大于零的整数。 */
function normalizePriority(value: unknown) {
  const priority = Number(value);
  return Number.isInteger(priority) && priority > 0 ? priority : 1;
}

/** 根据已选 ID 和保存的名称创建快照。 */
function createNameSnapshot(ids: string[], names: string[]) {
  return new Map(ids.map((id, index) => [id, names[index] ?? id]));
}

/** 创建一条空白条件规则。 */
function createConditionRule(): WorkflowConditionRule {
  return {
    field: '',
    operator: 'equal',
    value: '',
  };
}

/** 读取当前画布格式中的条件规则。 */
function readConditionRules(value: unknown): WorkflowConditionRule[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [createConditionRule()];
  }
  const rules = value
    .filter((item) => isConditionRule(item))
    .map((item) => ({ ...item }));
  return rules.length > 0 ? rules : [createConditionRule()];
}

function isConditionRule(value: unknown): value is WorkflowConditionRule {
  return (
    isRecord(value) &&
    typeof value.field === 'string' &&
    typeof value.operator === 'string' &&
    typeof value.value === 'string'
  );
}

/** 判断未知值是否为可读取字段的对象。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** 判断条件操作符是否需要填写比较值。 */
function operatorNeedsValue(operator: string) {
  return !['empty', 'notEmpty'].includes(operator);
}

/** 根据表单字段类型返回可用的条件比较操作符。 */
function conditionOperatorsForField(fieldKey: string) {
  const component = props.formFields?.find(
    (field) => field.fieldName === fieldKey,
  )?.component;
  const meta = component ? getFormComponentMeta(component) : undefined;
  if (meta?.valueType === 'number') {
    return conditionOperatorOptions.filter(
      (option) => !['contains', 'notContains'].includes(option.value),
    );
  }
  if (component === 'CheckboxGroup') {
    return conditionOperatorOptions.filter((option) =>
      ['contains', 'notContains', 'empty', 'notEmpty'].includes(option.value),
    );
  }
  if (
    [
      'AutoComplete',
      'Input',
      'InputPassword',
      'Mentions',
      'RichEditor',
      'Textarea',
      'VbenInput',
      'VbenInputPassword',
    ].includes(component ?? '')
  ) {
    return conditionOperatorOptions.filter(
      (option) =>
        ![
          'greaterThan',
          'greaterThanOrEqual',
          'lessThan',
          'lessThanOrEqual',
        ].includes(option.value),
    );
  }
  return conditionOperatorOptions.filter((option) =>
    ['equal', 'notEqual', 'empty', 'notEmpty'].includes(option.value),
  );
}

/** 表单字段变化时将操作符重置为该字段支持的首个操作符。 */
function onConditionFieldChange(rule: WorkflowConditionRule) {
  rule.operator = conditionOperatorsForField(rule.field)[0]?.value ?? 'equal';
  rule.value = '';
}

/** 返回选择类或开关字段可直接选择的条件值。 */
function conditionValueOptions(fieldKey: string) {
  const field = props.formFields?.find((item) => item.fieldName === fieldKey);
  if (field?.component === 'Switch') {
    return [
      { label: $t('flow.form.common.yes'), value: 'true' },
      { label: $t('flow.form.common.no'), value: 'false' },
    ];
  }
  const optionProp = field
    ? getFormComponentMeta(field.component)?.optionProp
    : undefined;
  const options = optionProp ? field?.componentProps?.[optionProp] : undefined;
  if (!Array.isArray(options)) return [];
  return options.flatMap((option) => {
    if (!isRecord(option) || option.value === undefined) return [];
    return [
      {
        label: String(option.label ?? option.value),
        value: String(option.value),
      },
    ];
  });
}

/** 新增一条条件规则。 */
function addConditionRule() {
  formState.conditionRules.push(createConditionRule());
}

/** 删除指定条件规则，并保证编辑器至少保留一行。 */
function removeConditionRule(index: number) {
  formState.conditionRules.splice(index, 1);
  if (formState.conditionRules.length === 0) {
    addConditionRule();
  }
}

/** 切换审批人类型时清理上一类型的已选对象。 */
function onAssigneeTypeChange() {
  formState.assigneeIds = [];
  formState.assigneeNames = [];
  assigneeNameSnapshot.value.clear();
}

/** 切换抄送类型时清理上一类型的已选对象。 */
function onCopyTypeChange() {
  formState.copyIds = [];
  formState.copyNames = [];
  copyNameSnapshot.value.clear();
}

/** 将规则值转换为可持久化表达式中的字面量。 */
function formatConditionValue(value: string) {
  const normalizedValue = value.trim();
  if (
    /^-?(?:\d+|\d*\.\d+)$/.test(normalizedValue) ||
    ['false', 'null', 'true'].includes(normalizedValue)
  ) {
    return normalizedValue;
  }
  return JSON.stringify(normalizedValue);
}

/** 将单条结构化规则转换为条件表达式。 */
function formatConditionRule(rule: WorkflowConditionRule) {
  const field = rule.field.trim();
  const value = formatConditionValue(rule.value);
  const comparisonOperators: Record<string, string> = {
    equal: '==',
    greaterThan: '>',
    greaterThanOrEqual: '>=',
    lessThan: '<',
    lessThanOrEqual: '<=',
    notEqual: '!=',
  };

  if (rule.operator === 'contains') {
    return `contains(${field}, ${value})`;
  }
  if (rule.operator === 'notContains') {
    return `!contains(${field}, ${value})`;
  }
  if (rule.operator === 'empty') {
    return `isEmpty(${field})`;
  }
  if (rule.operator === 'notEmpty') {
    return `!isEmpty(${field})`;
  }
  return `${field} ${comparisonOperators[rule.operator] ?? '=='} ${value}`;
}

/** 获取字段、操作符和值均填写完整的有效条件规则。 */
function getValidConditionRules() {
  return formState.conditionRules.filter(
    (rule) =>
      rule.field.trim() &&
      (!operatorNeedsValue(rule.operator) || rule.value.trim()),
  );
}

/** 组合所有填写完整的规则，生成最终条件表达式。 */
function buildConditionExpression() {
  const expressions = getValidConditionRules().map((rule) =>
    formatConditionRule(rule),
  );
  const connector = formState.conditionLogic === 'or' ? ' || ' : ' && ';
  return expressions.join(connector);
}

/** 根据已选 ID 生成名称快照，并保留已停用对象的保存名称。 */
function resolveSelectionNames(
  ids: string[],
  options: SelectOption[],
  nameSnapshot: Map<string, string>,
) {
  const optionNameMap = new Map(
    options.map((item) => [item.value, item.label]),
  );
  return ids.map((id) => optionNameMap.get(id) ?? nameSnapshot.get(id) ?? id);
}

/** 校验当前节点配置并提交给设计器。 */
function submit() {
  const values: WorkflowPropertyValues = {
    text: formState.text,
  };

  if (nodeType.value === 'approve') {
    const dynamicAssignee =
      formState.assigneeType !== 'leader' &&
      formState.assigneeType !== 'starter';
    if (dynamicAssignee && formState.assigneeIds.length === 0) {
      message.warning($t('flow.designer.message.selectAssignee'));
      return;
    }
    values.assigneeType = formState.assigneeType;
    // 发起人节点恒为单人,审批方式固定或签
    values.approvalMode =
      formState.assigneeType === 'starter' ? 'any' : formState.approvalMode;
    const assigneeIds = dynamicAssignee ? [...formState.assigneeIds] : [];
    values.assigneeIds = assigneeIds;
    values.assigneeNames = resolveSelectionNames(
      assigneeIds,
      activeAssigneeOptions.value,
      assigneeNameSnapshot.value,
    );
  }

  // 任意节点类型均可挂载自动化动作,提交挂载快照(顺序即执行顺序)
  values.automations = formState.automations.map((item) => ({ ...item }));

  // 发起和审批节点均支持字段权限配置
  if (nodeType.value === 'approve' || nodeType.value === 'start') {
    values.fieldPermissions = normalizeFieldPermissions(
      formState.fieldPermissions,
    );
  }

  if (nodeType.value === 'copy') {
    if (formState.copyType !== 'participant' && formState.copyIds.length === 0) {
      message.warning($t('flow.designer.message.selectCopy'));
      return;
    }
    values.copyType = formState.copyType;
    const copyIds =
      formState.copyType === 'participant' ? [] : [...formState.copyIds];
    values.copyIds = copyIds;
    values.copyNames = resolveSelectionNames(
      copyIds,
      activeCopyOptions.value,
      copyNameSnapshot.value,
    );
  }

  if (nodeType.value === 'condition') {
    values.branchMode = formState.branchMode;
    values.conditionRules = [];
  }

  if (isEdge.value && props.conditionEdge) {
    values.isDefaultBranch = formState.isDefaultBranch;
    values.priority = formState.priority;
    if (formState.isDefaultBranch) {
      values.conditionRules = [];
      values.conditionLogic = 'and';
      emit('change', values);
      return;
    }
    if (!generatedConditionExpression.value) {
      message.warning($t('flow.designer.message.conditionRequired'));
      return;
    }
    values.conditionLogic = formState.conditionLogic;
    values.conditionRules = getValidConditionRules().map((rule) => ({
      ...rule,
    }));
  }

  emit('change', values);
}

defineExpose({ submit });
</script>

<template>
  <div v-if="element" class="workflow-property-panel">
    <div class="property-form">
      <label class="field">
        <span>{{ $t('flow.designer.id') }}</span>
        <Input :value="elementId" disabled />
      </label>

      <label class="field">
        <span>{{ $t('flow.designer.name') }}</span>
        <Input v-model:value="formState.text" />
      </label>

      <template v-if="nodeType === 'approve'">
        <label class="field">
          <span>{{ $t('flow.designer.actor.assigneeType') }}</span>
          <Select
            v-model:value="formState.assigneeType"
            :options="assigneeTypeOptions"
            @change="onAssigneeTypeChange"
          />
        </label>

        <label
          v-if="formState.assigneeType !== 'leader' && formState.assigneeType !== 'starter'"
          class="field"
        >
          <span>
            {{
              formState.assigneeType === 'role'
                ? $t('flow.designer.actor.assigneeRole')
                : $t('flow.designer.actor.assigneeUser')
            }}
          </span>
          <Select
            v-model:value="formState.assigneeIds"
            allow-clear
            :loading="actorLoading"
            mode="multiple"
            :options="activeAssigneeOptions"
            option-filter-prop="label"
            :placeholder="
              formState.assigneeType === 'role'
                ? $t('flow.designer.actor.selectAssigneeRole')
                : $t('flow.designer.actor.selectAssigneeUser')
            "
            show-search
          />
        </label>

        <div v-if="formState.assigneeType === 'leader'" class="field-hint">
          {{ $t('flow.designer.actor.leaderHint') }}
        </div>
        <div
          v-else-if="formState.assigneeType === 'starter'"
          class="field-hint"
        >
          {{ $t('flow.designer.actor.initiatorHint') }}
        </div>

        <template v-if="formState.assigneeType !== 'starter'">
          <label class="field">
            <span>{{ $t('flow.designer.actor.approvalMode') }}</span>
            <Select
              v-model:value="formState.approvalMode"
              :options="approvalModeOptions"
            />
          </label>

          <div class="field-hint">
            {{ $t('flow.designer.actor.approvalModeHint') }}
          </div>
        </template>
      </template>

      <template v-if="nodeType === 'approve' || nodeType === 'start'">
        <div class="field-permission-section">
          <div class="field-permission-heading">
            {{ $t('flow.designer.fieldPermission.title') }}
          </div>
          <div class="field-hint">
            {{
              nodeType === 'start'
                ? $t('flow.designer.fieldPermission.startHint')
                : $t('flow.designer.fieldPermission.hint')
            }}
          </div>
          <div v-if="formFields?.length" class="field-permission-list">
            <div
              v-for="field in formFields"
              :key="field.fieldName"
              class="field-permission-item"
            >
              <div class="field-permission-name">
                <span>{{ field.label || field.fieldName }}</span>
                <small>{{ field.fieldName }}</small>
              </div>
              <Select
                v-model:value="formState.fieldPermissions[field.fieldName]"
                :options="fieldPermissionOptions"
              />
            </div>
          </div>
          <div v-else class="field-hint">
            {{ $t('flow.designer.fieldPermission.empty') }}
          </div>
        </div>
      </template>

      <!-- 自动化动作:任意节点类型可挂载多个,节点完成时按列表顺序同事务执行 -->
      <div class="automation-section">
        <div class="field-permission-heading">
          {{ $t('flow.designer.automation.title') }}
        </div>
        <div class="field-hint">
          {{ $t('flow.designer.automation.hint') }}
        </div>

        <div v-if="formState.automations.length" class="automation-list">
          <div
            v-for="(item, index) in formState.automations"
            :key="item.automationId"
            class="automation-item"
          >
            <div class="automation-info">
              <span class="automation-name">{{ item.automationName }}</span>
              <small>{{ getMountSummary(item) }}</small>
            </div>
            <div class="automation-actions">
              <Button
                :disabled="index === 0"
                size="small"
                type="text"
                @click="moveAutomation(index, -1)"
              >
                <IconifyIcon class="size-4" icon="lucide:arrow-up" />
              </Button>
              <Button
                :disabled="index === formState.automations.length - 1"
                size="small"
                type="text"
                @click="moveAutomation(index, 1)"
              >
                <IconifyIcon class="size-4" icon="lucide:arrow-down" />
              </Button>
              <Button
                danger
                size="small"
                type="text"
                @click="removeAutomation(index)"
              >
                <IconifyIcon class="size-4" icon="lucide:trash-2" />
              </Button>
            </div>
          </div>
        </div>

        <Select
          :loading="automationLoading"
          :options="automationSelectOptions"
          :placeholder="$t('flow.designer.automation.addPlaceholder')"
          :value="undefined"
          option-filter-prop="label"
          show-search
          @change="onSelectAutomation"
        />
      </div>

      <template v-if="nodeType === 'copy'">
        <label class="field">
          <span>{{ $t('flow.designer.actor.copyType') }}</span>
          <Select
            v-model:value="formState.copyType"
            :options="copyTypeOptions"
            @change="onCopyTypeChange"
          />
        </label>

        <label
          v-if="formState.copyType !== 'participant'"
          class="field"
        >
          <span>
            {{
              formState.copyType === 'role'
                ? $t('flow.designer.actor.copyRole')
                : $t('flow.designer.actor.copyUser')
            }}
          </span>
          <Select
            v-model:value="formState.copyIds"
            allow-clear
            :loading="actorLoading"
            mode="multiple"
            :options="activeCopyOptions"
            option-filter-prop="label"
            :placeholder="
              formState.copyType === 'role'
                ? $t('flow.designer.actor.selectCopyRole')
                : $t('flow.designer.actor.selectCopyUser')
            "
            show-search
          />
        </label>

        <div v-else class="field-hint">
          {{ $t('flow.designer.actor.participantHint') }}
        </div>
      </template>

      <template v-if="nodeType === 'condition'">
        <label class="field">
          <span>{{ $t('flow.designer.branch.strategy') }}</span>
          <Select
            v-model:value="formState.branchMode"
            :options="branchModeOptions"
          />
        </label>

        <div class="field-hint">
          {{ $t('flow.designer.branch.nodeHint') }}
        </div>
      </template>

      <template v-if="isEdge && conditionEdge">
        <div class="switch-field">
          <div>
            <div class="switch-label">
              {{ $t('flow.designer.branch.default') }}
            </div>
            <div class="switch-description">
              {{ $t('flow.designer.branch.defaultHint') }}
            </div>
          </div>
          <Switch v-model:checked="formState.isDefaultBranch" />
        </div>

        <label v-if="!formState.isDefaultBranch" class="field">
          <span>{{ $t('flow.designer.branch.priority') }}</span>
          <InputNumber
            v-model:value="formState.priority"
            :min="1"
            :precision="0"
            :step="1"
          />
        </label>

        <label v-if="!formState.isDefaultBranch" class="field">
          <span>{{ $t('flow.designer.condition.logic') }}</span>
          <Select
            v-model:value="formState.conditionLogic"
            :options="conditionLogicOptions"
          />
        </label>

        <div v-if="!formState.isDefaultBranch" class="condition-section">
          <div class="condition-header">
            <span>{{ $t('flow.designer.condition.rules') }}</span>
            <Button size="small" @click="addConditionRule">
              <IconifyIcon class="size-4" icon="lucide:plus" />
              {{ $t('flow.designer.add') }}
            </Button>
          </div>

          <div
            v-for="(rule, index) in formState.conditionRules"
            :key="index"
            class="condition-rule"
          >
            <div class="condition-rule-header">
              <span>{{
                $t('flow.designer.condition.ruleNumber', [index + 1])
              }}</span>
              <Button
                danger
                size="small"
                type="text"
                @click="removeConditionRule(index)"
              >
                <IconifyIcon class="size-4" icon="lucide:trash-2" />
              </Button>
            </div>
            <Select
              v-model:value="rule.field"
              :options="formFieldOptions"
              :placeholder="$t('flow.designer.condition.fieldPlaceholder')"
              @change="onConditionFieldChange(rule)"
            />
            <Select
              v-model:value="rule.operator"
              :options="conditionOperatorsForField(rule.field)"
            />
            <Select
              v-if="
                operatorNeedsValue(rule.operator) &&
                conditionValueOptions(rule.field).length
              "
              v-model:value="rule.value"
              :options="conditionValueOptions(rule.field)"
              :placeholder="$t('flow.designer.condition.valuePlaceholder')"
            />
            <Input
              v-if="operatorNeedsValue(rule.operator)"
              v-show="!conditionValueOptions(rule.field).length"
              v-model:value="rule.value"
              :placeholder="$t('flow.designer.condition.valuePlaceholder')"
            />
          </div>
        </div>

        <label v-if="!formState.isDefaultBranch" class="field">
          <span>{{ $t('flow.designer.condition.expression') }}</span>
          <TextArea
            :rows="3"
            :value="generatedConditionExpression"
            disabled
            :placeholder="$t('flow.designer.condition.expressionPlaceholder')"
          />
        </label>
      </template>

      <div v-if="isEdge && !conditionEdge" class="field-hint">
        {{ $t('flow.designer.branch.normalEdgeHint') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.workflow-property-panel {
  min-height: 0;
}

.property-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.field :deep(.ant-select) {
  width: 100%;
}

.field :deep(.ant-input-number) {
  width: 100%;
}

.field-hint {
  border-left: 3px solid hsl(var(--primary));
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  line-height: 1.6;
  padding: 4px 8px;
}

.switch-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.switch-label {
  color: hsl(var(--foreground));
  font-size: 13px;
}

.switch-description {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  margin-top: 2px;
}

.condition-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-permission-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid hsl(var(--border));
  padding-top: 12px;
}

.automation-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid hsl(var(--border));
  padding-top: 12px;
}

.automation-section :deep(.ant-select) {
  width: 100%;
}

.automation-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.automation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  padding: 6px 8px;
}

.automation-info {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.automation-name {
  color: hsl(var(--foreground));
  font-size: 13px;
}

.automation-info small {
  overflow: hidden;
  color: hsl(var(--muted-foreground));
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.automation-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
}

.automation-actions :deep(.ant-btn) {
  width: 26px;
  padding-inline: 0;
}

.field-permission-heading {
  color: hsl(var(--foreground));
  font-size: 13px;
  font-weight: 600;
}

.field-permission-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-permission-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 112px;
  align-items: center;
  gap: 8px;
}

.field-permission-name {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.field-permission-name span,
.field-permission-name small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-permission-name span {
  color: hsl(var(--foreground));
  font-size: 13px;
}

.field-permission-name small {
  color: hsl(var(--muted-foreground));
  font-size: 11px;
}

.condition-header,
.condition-rule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.condition-rule {
  display: grid;
  gap: 8px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  padding: 10px;
}

.condition-rule-header {
  height: 24px;
}

.condition-rule-header :deep(.ant-btn) {
  width: 28px;
  padding-inline: 0;
}
</style>
