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
import { $t } from '#/locales';

import type {
  WorkflowAssigneeType,
  WorkflowApprovalMode,
  WorkflowBranchMode,
  WorkflowConditionLogic,
  WorkflowConditionRule,
  WorkflowElement,
  WorkflowPropertyValues,
} from '../types';

interface SelectOption {
  label: string;
  value: string;
}

interface PropertyFormState {
  assigneeIds: string[];
  assigneeNames: string[];
  assigneeType: WorkflowAssigneeType;
  approvalMode: WorkflowApprovalMode;
  branchMode: WorkflowBranchMode;
  conditionExpression: string;
  conditionLogic: WorkflowConditionLogic;
  conditionRules: WorkflowConditionRule[];
  copyIds: string[];
  copyNames: string[];
  copyType: Exclude<WorkflowAssigneeType, 'leader'>;
  isDefaultBranch: boolean;
  priority: number;
  text: string;
}

const props = defineProps<{
  conditionEdge?: boolean;
  element?: WorkflowElement;
}>();

const emit = defineEmits<{
  change: [values: WorkflowPropertyValues];
  remove: [id: string];
}>();

const actorLoading = ref(false);
const assigneeNameSnapshot = ref(new Map<string, string>());
const copyNameSnapshot = ref(new Map<string, string>());
const roleOptions = ref<SelectOption[]>([]);
const userOptions = ref<SelectOption[]>([]);

const formState = reactive<PropertyFormState>({
  assigneeIds: [],
  assigneeNames: [],
  assigneeType: 'user',
  approvalMode: 'any',
  branchMode: 'firstMatch',
  conditionExpression: '',
  conditionLogic: 'and',
  conditionRules: [],
  copyIds: [],
  copyNames: [],
  copyType: 'user',
  isDefaultBranch: false,
  priority: 1,
  text: '',
});

const assigneeTypeOptions = [
  { label: $t('flow.designer.actor.specifiedUser'), value: 'user' },
  { label: $t('flow.designer.actor.initiatorLeader'), value: 'leader' },
  { label: $t('flow.designer.actor.specifiedRole'), value: 'role' },
];
const approvalModeOptions = [
  { label: $t('flow.designer.actor.approvalAny'), value: 'any' },
  { label: $t('flow.designer.actor.approvalAll'), value: 'all' },
];
const copyTypeOptions = [
  { label: $t('flow.designer.actor.specifiedUser'), value: 'user' },
  { label: $t('flow.designer.actor.specifiedRole'), value: 'role' },
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
const conditionExpressionPreview = computed(
  () => buildConditionExpression() || formState.conditionExpression,
);

watch(
  () => props.element,
  (element) => {
    const properties = element?.properties ?? {};
    formState.text = normalizeText(element?.text);
    formState.assigneeType = properties.assigneeType ?? 'user';
    formState.approvalMode = properties.approvalMode === 'all' ? 'all' : 'any';
    formState.assigneeIds = normalizeStringArray(properties.assigneeIds);
    formState.assigneeNames = normalizeStringArray(properties.assigneeNames);
    assigneeNameSnapshot.value = createNameSnapshot(
      formState.assigneeIds,
      formState.assigneeNames,
    );
    formState.copyType = properties.copyType ?? 'user';
    formState.copyIds = normalizeStringArray(properties.copyIds);
    formState.copyNames = normalizeStringArray(properties.copyNames);
    copyNameSnapshot.value = createNameSnapshot(
      formState.copyIds,
      formState.copyNames,
    );
    formState.conditionExpression = properties.conditionExpression ?? '';
    formState.conditionLogic =
      properties.conditionLogic === 'or' ? 'or' : 'and';
    formState.conditionRules = normalizeConditionRules(
      properties.conditionRules,
    );
    formState.branchMode = 'firstMatch';
    formState.isDefaultBranch = properties.isDefaultBranch === true;
    formState.priority = normalizePriority(properties.priority);
  },
  { immediate: true },
);

onMounted(() => {
  void loadActorOptions();
});

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
  if (typeof text === 'string') {
    return text;
  }
  return text?.value ?? '';
}

/** 将未知值规范化为字符串数组，兼容旧画布数据。 */
function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item));
}

/** 将未知优先级规范化为大于零的整数。 */
function normalizePriority(value: unknown) {
  const priority = Number(value);
  return Number.isInteger(priority) && priority > 0 ? priority : 1;
}

/** 根据历史 ID 和名称创建快照，供已停用对象回显使用。 */
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

/** 将历史条件数据规范化为当前条件规则结构。 */
function normalizeConditionRules(value: unknown): WorkflowConditionRule[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [createConditionRule()];
  }
  return value.map((item) => {
    if (!isRecord(item)) {
      return createConditionRule();
    }
    return {
      field: String(item.field ?? ''),
      operator: String(item.operator ?? 'equal'),
      value: String(item.value ?? ''),
    };
  });
}

/** 判断未知值是否为可读取字段的对象。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** 判断条件操作符是否需要填写比较值。 */
function operatorNeedsValue(operator: string) {
  return !['empty', 'notEmpty'].includes(operator);
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
  const expressions = getValidConditionRules().map(formatConditionRule);
  const connector = formState.conditionLogic === 'or' ? ' || ' : ' && ';
  return expressions.join(connector);
}

/** 根据已选 ID 生成名称快照，兼容已停用但仍存在于历史画布的对象。 */
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
    if (
      formState.assigneeType !== 'leader' &&
      formState.assigneeIds.length === 0
    ) {
      message.warning($t('flow.designer.message.selectAssignee'));
      return;
    }
    values.assigneeType = formState.assigneeType;
    values.approvalMode = formState.approvalMode;
    const assigneeIds =
      formState.assigneeType === 'leader' ? [] : [...formState.assigneeIds];
    values.assigneeIds = assigneeIds;
    values.assigneeNames = resolveSelectionNames(
      assigneeIds,
      activeAssigneeOptions.value,
      assigneeNameSnapshot.value,
    );
  }

  if (nodeType.value === 'copy') {
    if (formState.copyIds.length === 0) {
      message.warning($t('flow.designer.message.selectCopy'));
      return;
    }
    values.copyType = formState.copyType;
    values.copyIds = [...formState.copyIds];
    values.copyNames = resolveSelectionNames(
      formState.copyIds,
      activeCopyOptions.value,
      copyNameSnapshot.value,
    );
  }

  if (nodeType.value === 'condition') {
    values.branchMode = formState.branchMode;
    values.conditionExpression = '';
    values.conditionRules = [];
  }

  if (isEdge.value && props.conditionEdge) {
    values.isDefaultBranch = formState.isDefaultBranch;
    values.priority = formState.priority;
    if (formState.isDefaultBranch) {
      values.conditionExpression = '';
      values.conditionRules = [];
      values.conditionLogic = 'and';
      emit('change', values);
      return;
    }
    if (!conditionExpressionPreview.value) {
      message.warning($t('flow.designer.message.conditionRequired'));
      return;
    }
    values.conditionLogic = formState.conditionLogic;
    values.conditionRules = getValidConditionRules().map((rule) => ({
      ...rule,
    }));
    values.conditionExpression = conditionExpressionPreview.value;
  }

  emit('change', values);
}
</script>

<template>
  <aside class="workflow-property-panel">
    <div class="panel-title">{{ $t('flow.designer.property') }}</div>

    <div v-if="!element" class="empty-state">
      <IconifyIcon class="size-8" icon="lucide:mouse-pointer-click" />
      <span>{{ $t('flow.designer.selectElement') }}</span>
    </div>

    <div v-else class="property-form">
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
          <span>{{ $t('flow.designer.actor.approvalMode') }}</span>
          <Select
            v-model:value="formState.approvalMode"
            :options="approvalModeOptions"
          />
        </label>

        <div class="field-hint">
          {{ $t('flow.designer.actor.approvalModeHint') }}
        </div>

        <label class="field">
          <span>{{ $t('flow.designer.actor.assigneeType') }}</span>
          <Select
            v-model:value="formState.assigneeType"
            :options="assigneeTypeOptions"
            @change="onAssigneeTypeChange"
          />
        </label>

        <label v-if="formState.assigneeType !== 'leader'" class="field">
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

        <div v-else class="field-hint">
          {{ $t('flow.designer.actor.leaderHint') }}
        </div>
      </template>

      <template v-if="nodeType === 'copy'">
        <label class="field">
          <span>{{ $t('flow.designer.actor.copyType') }}</span>
          <Select
            v-model:value="formState.copyType"
            :options="copyTypeOptions"
            @change="onCopyTypeChange"
          />
        </label>

        <label class="field">
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
            <Input
              v-model:value="rule.field"
              :placeholder="$t('flow.designer.condition.fieldPlaceholder')"
            />
            <Select
              v-model:value="rule.operator"
              :options="conditionOperatorOptions"
            />
            <Input
              v-if="operatorNeedsValue(rule.operator)"
              v-model:value="rule.value"
              :placeholder="$t('flow.designer.condition.valuePlaceholder')"
            />
          </div>
        </div>

        <label v-if="!formState.isDefaultBranch" class="field">
          <span>{{ $t('flow.designer.condition.expression') }}</span>
          <TextArea
            :rows="3"
            :value="conditionExpressionPreview"
            disabled
            :placeholder="$t('flow.designer.condition.expressionPlaceholder')"
          />
        </label>
      </template>

      <div v-if="isEdge && !conditionEdge" class="field-hint">
        {{ $t('flow.designer.branch.normalEdgeHint') }}
      </div>

      <div class="actions">
        <Button type="primary" @click="submit">
          {{ $t('flow.designer.apply') }}
        </Button>
        <Button danger @click="emit('remove', elementId)">
          {{ $t('flow.designer.delete') }}
        </Button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.workflow-property-panel {
  width: 360px;
  min-height: 0;
  flex: none;
  border-left: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  overflow-y: auto;
  padding: 12px;
}

.panel-title {
  margin-bottom: 10px;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  font-weight: 600;
}

.empty-state {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
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

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
}
</style>
