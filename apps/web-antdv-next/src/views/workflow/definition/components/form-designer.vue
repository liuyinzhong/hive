<script lang="ts" setup>
import type { WorkflowDefinitionApi } from '#/api/workflow';

import { computed, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';

import {
  Button,
  Col,
  Empty,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
} from 'antdv-next';

import { $t } from '#/locales';
import {
  getWorkflowFormFields,
  isWorkflowFormGrid,
} from '#/views/workflow/form/schema';

import FormDesignerField from './form-designer-field.vue';

interface FieldPaletteItem {
  icon: string;
  type: WorkflowDefinitionApi.WorkflowFormFieldType;
}

const props = defineProps<{
  modelValue: WorkflowDefinitionApi.WorkflowFormSchema;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: WorkflowDefinitionApi.WorkflowFormSchema];
}>();

const selectedFieldId = ref<string>();
const selectedGridId = ref<string>();
const selectedColumnId = ref<string>();
const draggedElementId = ref<string>();

const palette: FieldPaletteItem[] = [
  { icon: 'lucide:type', type: 'input' },
  { icon: 'lucide:align-left', type: 'textarea' },
  { icon: 'lucide:hash', type: 'number' },
  { icon: 'lucide:list-filter', type: 'select' },
  { icon: 'lucide:circle-dot', type: 'radio' },
  { icon: 'lucide:list-checks', type: 'checkbox' },
  { icon: 'lucide:calendar-days', type: 'date' },
  { icon: 'lucide:toggle-left', type: 'switch' },
];

const selectedField = computed(() =>
  getWorkflowFormFields(props.modelValue).find(
    (field) => field.id === selectedFieldId.value,
  ),
);

const selectedGrid = computed(
  () =>
    props.modelValue.fields.find(
      (element) =>
        isWorkflowFormGrid(element) && element.id === selectedGridId.value,
    ) as WorkflowDefinitionApi.WorkflowFormGrid | undefined,
);

const hasOptions = computed(() =>
  ['checkbox', 'radio', 'select'].includes(selectedField.value?.type ?? ''),
);

/** 返回指定字段类型的国际化名称。 */
function fieldTypeLabel(type: WorkflowDefinitionApi.WorkflowFormFieldType) {
  return $t(`flow.form.fieldType.${type}`);
}

/** 生成当前表单内唯一的字段标识。 */
function nextFieldKey(type: WorkflowDefinitionApi.WorkflowFormFieldType) {
  const fields = getWorkflowFormFields(props.modelValue);
  const keys = new Set(fields.map((field) => field.key));
  let index = fields.length + 1;
  let key = `${type}${index}`;
  while (keys.has(key)) {
    index += 1;
    key = `${type}${index}`;
  }
  return key;
}

/** 生成不依赖后端的表单字段ID。 */
function createFieldId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `field_${Date.now()}_${Math.random().toString(16).slice(2)}`
  );
}

/** 向表单末尾新增一个指定类型的字段并立即选中。 */
function addField(type: WorkflowDefinitionApi.WorkflowFormFieldType) {
  const id = createFieldId();
  const field: WorkflowDefinitionApi.WorkflowFormField = {
    id,
    key: nextFieldKey(type),
    label: fieldTypeLabel(type),
    required: false,
    type,
  };
  if (['checkbox', 'radio', 'select'].includes(type)) {
    field.options = [
      { label: $t('flow.form.designer.optionDefault'), value: 'option1' },
    ];
  }
  const elements = cloneElements();
  const column = findColumn(elements, selectedColumnId.value);
  if (column) {
    column.fields.push(field);
  } else {
    elements.push(field);
  }
  emitSchema(elements);
  selectField(id);
}

/** 新增一行默认等分为两列的24栅格布局。 */
function addGrid() {
  const id = createFieldId();
  const grid: WorkflowDefinitionApi.WorkflowFormGrid = {
    columns: [createGridColumn(12), createGridColumn(12)],
    id,
    type: 'grid',
  };
  emitSchema([...props.modelValue.fields, grid]);
  selectGrid(id);
}

/** 创建一个空栅格列。 */
function createGridColumn(span: number) {
  return {
    fields: [],
    id: createFieldId(),
    span,
  } satisfies WorkflowDefinitionApi.WorkflowFormGridColumn;
}

/** 删除当前字段并选择相邻字段。 */
function removeElement(id: string) {
  const elements = cloneElements();
  const rootIndex = elements.findIndex((element) => element.id === id);
  if (rootIndex >= 0) {
    elements.splice(rootIndex, 1);
  } else {
    for (const element of elements) {
      if (!isWorkflowFormGrid(element)) continue;
      for (const column of element.columns) {
        const fieldIndex = column.fields.findIndex((field) => field.id === id);
        if (fieldIndex >= 0) {
          column.fields.splice(fieldIndex, 1);
          break;
        }
      }
    }
  }
  emitSchema(elements);
  if (selectedFieldId.value === id) selectedFieldId.value = undefined;
  if (selectedGridId.value === id) {
    selectedGridId.value = undefined;
    selectedColumnId.value = undefined;
  }
}

/** 将当前字段向上或向下移动一个位置。 */
function moveElement(id: string, offset: number) {
  const elements = cloneElements();
  const container = findElementContainer(elements, id);
  if (!container) return;
  const from = container.findIndex((element) => element.id === id);
  const to = from + offset;
  if (from < 0 || to < 0 || to >= container.length) return;
  const [element] = container.splice(from, 1);
  if (!element) return;
  container.splice(to, 0, element);
  emitSchema(elements);
}

/** 记录当前开始拖拽的表单字段。 */
function onDragStart(id: string) {
  draggedElementId.value = id;
}

/** 将拖拽字段移动到目标字段所在位置。 */
function onDropBefore(targetId: string) {
  const sourceId = draggedElementId.value;
  draggedElementId.value = undefined;
  if (!sourceId || sourceId === targetId) return;
  const elements = cloneElements();
  const source = takeElement(elements, sourceId);
  if (!source || !insertBefore(elements, targetId, source)) return;
  emitSchema(elements);
}

/** 将拖拽字段移动到指定栅格列末尾。 */
function onDropToColumn(columnId: string) {
  const sourceId = draggedElementId.value;
  draggedElementId.value = undefined;
  if (!sourceId) return;
  const elements = cloneElements();
  const source = takeElement(elements, sourceId);
  if (!source || isWorkflowFormGrid(source)) return;
  const column = findColumn(elements, columnId);
  if (!column) return;
  column.fields.push(source);
  emitSchema(elements);
  selectField(source.id);
}

/** 将拖拽元素移动到表单根级末尾。 */
function onDropToRoot() {
  const sourceId = draggedElementId.value;
  draggedElementId.value = undefined;
  if (!sourceId) return;
  const elements = cloneElements();
  const source = takeElement(elements, sourceId);
  if (!source) return;
  elements.push(source);
  emitSchema(elements);
}

/** 更新当前选中字段的一个属性。 */
function updateSelectedField(
  values: Partial<WorkflowDefinitionApi.WorkflowFormField>,
) {
  const id = selectedFieldId.value;
  if (!id) return;
  const elements = cloneElements();
  const container = findElementContainer(elements, id);
  if (!container) return;
  const index = container.findIndex((element) => element.id === id);
  const field = container[index];
  if (!field || isWorkflowFormGrid(field)) return;
  container[index] = { ...field, ...values };
  emitSchema(elements);
}

/** 切换字段类型并按新类型重置选项和默认值。 */
function updateFieldType(type: WorkflowDefinitionApi.WorkflowFormFieldType) {
  updateSelectedField({
    defaultValue:
      type === 'checkbox' ? [] : type === 'switch' ? false : undefined,
    options: ['checkbox', 'radio', 'select'].includes(type)
      ? selectedField.value?.options?.length
        ? selectedField.value.options
        : [{ label: $t('flow.form.designer.optionDefault'), value: 'option1' }]
      : undefined,
    type,
  });
}

/** 校验下拉组件输出后切换当前字段类型。 */
function onFieldTypeChange(value: unknown) {
  if (
    typeof value === 'string' &&
    palette.some((item) => item.type === value)
  ) {
    updateFieldType(value as WorkflowDefinitionApi.WorkflowFormFieldType);
  }
}

/** 将开关组件输出规范为布尔值后更新字段必填状态。 */
function updateRequired(value: unknown) {
  updateSelectedField({ required: Boolean(value) });
}

/** 在选中字段末尾新增一个可配置选项。 */
function addOption() {
  const options = [...(selectedField.value?.options ?? [])];
  const index = options.length + 1;
  options.push({
    label: $t('flow.form.designer.optionNumber', [index]),
    value: `option${index}`,
  });
  updateSelectedField({ options });
}

/** 更新选择类字段的指定选项。 */
function updateOption(
  index: number,
  values: Partial<WorkflowDefinitionApi.WorkflowFormOption>,
) {
  const options = (selectedField.value?.options ?? []).map(
    (option, itemIndex) =>
      itemIndex === index ? { ...option, ...values } : option,
  );
  updateSelectedField({ options });
}

/** 删除选择类字段的指定选项。 */
function removeOption(index: number) {
  const options = (selectedField.value?.options ?? []).filter(
    (_, itemIndex) => itemIndex !== index,
  );
  updateSelectedField({ options });
}

/** 选中一个业务字段并清除布局选择。 */
function selectField(id: string) {
  selectedFieldId.value = id;
  selectedGridId.value = undefined;
  selectedColumnId.value = undefined;
}

/** 选中一个栅格布局。 */
function selectGrid(id: string) {
  selectedFieldId.value = undefined;
  selectedGridId.value = id;
  selectedColumnId.value = undefined;
}

/** 选中栅格列，后续新增字段将进入该列。 */
function selectColumn(gridId: string, columnId: string) {
  selectedFieldId.value = undefined;
  selectedGridId.value = gridId;
  selectedColumnId.value = columnId;
}

/** 返回指定元素是否位于当前容器首位。 */
function isFirstElement(id: string) {
  const container = findElementContainer(props.modelValue.fields, id);
  return container?.[0]?.id === id;
}

/** 返回指定元素是否位于当前容器末位。 */
function isLastElement(id: string) {
  const container = findElementContainer(props.modelValue.fields, id);
  return container?.[container.length - 1]?.id === id;
}

/** 返回栅格列已使用的总宽度。 */
function gridSpanTotal(grid: WorkflowDefinitionApi.WorkflowFormGrid) {
  return grid.columns.reduce((total, column) => total + column.span, 0);
}

/** 返回指定列在不挤压其它列时允许设置的最大宽度。 */
function maxColumnSpan(
  grid: WorkflowDefinitionApi.WorkflowFormGrid,
  columnId: string,
) {
  const otherSpan = grid.columns.reduce(
    (total, column) => total + (column.id === columnId ? 0 : column.span),
    0,
  );
  return Math.max(1, 24 - otherSpan);
}

/** 更新当前栅格的一列宽度。 */
function updateColumnSpan(columnId: string, value: unknown) {
  if (!selectedGrid.value || typeof value !== 'number') return;
  const elements = cloneElements();
  const grid = elements.find(
    (element) =>
      isWorkflowFormGrid(element) && element.id === selectedGrid.value?.id,
  );
  if (!grid || !isWorkflowFormGrid(grid)) return;
  const column = grid.columns.find((item) => item.id === columnId);
  if (!column) return;
  column.span = Math.min(
    Math.max(Math.round(value), 1),
    maxColumnSpan(grid, columnId),
  );
  emitSchema(elements);
}

/** 当前栅格是否还可以拆分出新列。 */
function canAddGridColumn(grid: WorkflowDefinitionApi.WorkflowFormGrid) {
  return (
    grid.columns.length < 24 &&
    (gridSpanTotal(grid) < 24 || grid.columns.some((column) => column.span > 1))
  );
}

/** 给当前栅格新增一列，优先使用剩余宽度，否则拆分最宽列。 */
function addGridColumn() {
  if (!selectedGrid.value || !canAddGridColumn(selectedGrid.value)) return;
  const elements = cloneElements();
  const grid = elements.find(
    (element) =>
      isWorkflowFormGrid(element) && element.id === selectedGrid.value?.id,
  );
  if (!grid || !isWorkflowFormGrid(grid)) return;

  const remaining = 24 - gridSpanTotal(grid);
  const column = createGridColumn(remaining);
  if (remaining > 0) {
    grid.columns.push(column);
  } else {
    let widestIndex = 0;
    grid.columns.forEach((item, index) => {
      if (item.span > (grid.columns[widestIndex]?.span ?? 0)) {
        widestIndex = index;
      }
    });
    const widest = grid.columns[widestIndex];
    if (!widest || widest.span <= 1) return;
    column.span = Math.floor(widest.span / 2);
    widest.span -= column.span;
    grid.columns.splice(widestIndex + 1, 0, column);
  }
  emitSchema(elements);
  selectColumn(grid.id, column.id);
}

/** 删除当前栅格的一列，并把其中字段移入相邻列。 */
function removeGridColumn(columnId: string) {
  if (!selectedGrid.value || selectedGrid.value.columns.length <= 1) return;
  const elements = cloneElements();
  const grid = elements.find(
    (element) =>
      isWorkflowFormGrid(element) && element.id === selectedGrid.value?.id,
  );
  if (!grid || !isWorkflowFormGrid(grid)) return;
  const index = grid.columns.findIndex((column) => column.id === columnId);
  if (index < 0) return;
  const [removed] = grid.columns.splice(index, 1);
  const target = grid.columns[Math.max(0, index - 1)];
  if (!removed || !target) return;
  target.span += removed.span;
  target.fields.push(...removed.fields);
  emitSchema(elements);
  selectColumn(grid.id, target.id);
}

/** 克隆表单元素，确保编辑过程中不直接修改父级数据。 */
function cloneElements() {
  return props.modelValue.fields.map((element) =>
    isWorkflowFormGrid(element)
      ? {
          ...element,
          columns: element.columns.map((column) => ({
            ...column,
            fields: column.fields.map((field) => ({ ...field })),
          })),
        }
      : { ...element },
  ) as WorkflowDefinitionApi.WorkflowFormElement[];
}

/** 查找元素所在的根级或栅格列容器。 */
function findElementContainer(
  elements: WorkflowDefinitionApi.WorkflowFormElement[],
  id: string,
): WorkflowDefinitionApi.WorkflowFormElement[] | undefined {
  if (elements.some((element) => element.id === id)) return elements;
  for (const element of elements) {
    if (!isWorkflowFormGrid(element)) continue;
    const column = element.columns.find((item) =>
      item.fields.some((field) => field.id === id),
    );
    if (column) return column.fields;
  }
}

/** 按ID查找一个栅格列。 */
function findColumn(
  elements: WorkflowDefinitionApi.WorkflowFormElement[],
  id?: string,
) {
  if (!id) return undefined;
  for (const element of elements) {
    if (!isWorkflowFormGrid(element)) continue;
    const column = element.columns.find((item) => item.id === id);
    if (column) return column;
  }
}

/** 从表单结构中取出一个元素。 */
function takeElement(
  elements: WorkflowDefinitionApi.WorkflowFormElement[],
  id: string,
) {
  const container = findElementContainer(elements, id);
  if (!container) return undefined;
  const index = container.findIndex((element) => element.id === id);
  const [element] = container.splice(index, 1);
  return element;
}

/** 将元素插入目标元素之前，栅格布局不能放入另一栅格列。 */
function insertBefore(
  elements: WorkflowDefinitionApi.WorkflowFormElement[],
  targetId: string,
  source: WorkflowDefinitionApi.WorkflowFormElement,
) {
  const container = findElementContainer(elements, targetId);
  if (!container || (container !== elements && isWorkflowFormGrid(source))) {
    return false;
  }
  const index = container.findIndex((element) => element.id === targetId);
  if (index < 0) return false;
  container.splice(index, 0, source);
  return true;
}

/** 将未知默认值转换为文本组件可用的字符串。 */
function defaultStringValue(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

/** 将未知默认值转换为多选组件可用的字符串数组。 */
function defaultArrayValue(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

/** 向父组件提交一份新的不可变表单结构。 */
function emitSchema(fields: WorkflowDefinitionApi.WorkflowFormElement[]) {
  emit('update:modelValue', { fields, version: 1 });
}
</script>

<template>
  <div class="form-designer">
    <aside class="field-palette">
      <div class="panel-title">{{ $t('flow.form.designer.components') }}</div>
      <div class="palette-grid">
        <button
          v-for="item in palette"
          :key="item.type"
          class="palette-item"
          type="button"
          @click="addField(item.type)"
        >
          <IconifyIcon class="size-5" :icon="item.icon" />
          <span>{{ fieldTypeLabel(item.type) }}</span>
        </button>
      </div>
      <div class="panel-title layout-title">
        {{ $t('flow.form.designer.layoutComponents') }}
      </div>
      <button class="palette-item layout-item" type="button" @click="addGrid">
        <IconifyIcon class="size-5" icon="lucide:columns-3" />
        <span>{{ $t('flow.form.fieldType.grid') }}</span>
      </button>
    </aside>

    <main class="form-canvas">
      <div class="canvas-title">{{ $t('flow.form.designer.preview') }}</div>
      <Empty
        v-if="modelValue.fields.length === 0"
        :description="$t('flow.form.designer.empty')"
      />
      <div
        v-else
        class="field-list"
        @dragover.prevent
        @drop.self="onDropToRoot"
      >
        <template v-for="element in modelValue.fields" :key="element.id">
          <div
            v-if="isWorkflowFormGrid(element)"
            class="grid-layout"
            :class="{ selected: element.id === selectedGridId }"
            draggable="true"
            @click="selectGrid(element.id)"
            @dragover.prevent
            @dragstart.stop="onDragStart(element.id)"
            @drop.stop="onDropBefore(element.id)"
          >
            <div class="grid-heading">
              <div class="grid-name">
                <IconifyIcon class="size-4" icon="lucide:columns-3" />
                {{ $t('flow.form.fieldType.grid') }}
              </div>
              <div class="field-actions">
                <Button
                  :disabled="isFirstElement(element.id)"
                  size="small"
                  type="text"
                  :title="$t('flow.form.designer.moveUp')"
                  @click.stop="moveElement(element.id, -1)"
                >
                  <IconifyIcon class="size-4" icon="lucide:arrow-up" />
                </Button>
                <Button
                  :disabled="isLastElement(element.id)"
                  size="small"
                  type="text"
                  :title="$t('flow.form.designer.moveDown')"
                  @click.stop="moveElement(element.id, 1)"
                >
                  <IconifyIcon class="size-4" icon="lucide:arrow-down" />
                </Button>
                <Button
                  danger
                  size="small"
                  type="text"
                  :title="$t('flow.designer.delete')"
                  @click.stop="removeElement(element.id)"
                >
                  <IconifyIcon class="size-4" icon="lucide:trash-2" />
                </Button>
              </div>
            </div>
            <Row :gutter="[12, 12]">
              <Col
                v-for="(column, columnIndex) in element.columns"
                :key="column.id"
                :span="column.span"
              >
                <div
                  class="grid-column"
                  :class="{ selected: column.id === selectedColumnId }"
                  @click.stop="selectColumn(element.id, column.id)"
                  @dragover.prevent
                  @drop.stop="onDropToColumn(column.id)"
                >
                  <div class="column-label">
                    {{
                      $t('flow.form.designer.columnNumber', [columnIndex + 1])
                    }}
                    <span>{{ column.span }}/24</span>
                  </div>
                  <div v-if="column.fields.length === 0" class="column-empty">
                    {{ $t('flow.form.designer.columnEmpty') }}
                  </div>
                  <div v-else class="column-fields">
                    <FormDesignerField
                      v-for="field in column.fields"
                      :key="field.id"
                      compact
                      :field="field"
                      :first="isFirstElement(field.id)"
                      :last="isLastElement(field.id)"
                      :selected="field.id === selectedFieldId"
                      @drag-start="onDragStart(field.id)"
                      @drop="onDropBefore(field.id)"
                      @move-down="moveElement(field.id, 1)"
                      @move-up="moveElement(field.id, -1)"
                      @remove="removeElement(field.id)"
                      @select="selectField(field.id)"
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <FormDesignerField
            v-else
            :field="element"
            :first="isFirstElement(element.id)"
            :last="isLastElement(element.id)"
            :selected="element.id === selectedFieldId"
            @drag-start="onDragStart(element.id)"
            @drop="onDropBefore(element.id)"
            @move-down="moveElement(element.id, 1)"
            @move-up="moveElement(element.id, -1)"
            @remove="removeElement(element.id)"
            @select="selectField(element.id)"
          />
        </template>
        <div class="root-drop-zone" @dragover.prevent @drop.stop="onDropToRoot">
          {{ $t('flow.form.designer.rootDrop') }}
        </div>
      </div>
    </main>

    <aside class="field-properties">
      <div class="panel-title">{{ $t('flow.form.designer.properties') }}</div>
      <Empty
        v-if="!selectedField && !selectedGrid"
        :description="$t('flow.form.designer.selectField')"
      />
      <div v-else-if="selectedGrid" class="property-list">
        <div class="layout-summary">
          <span>{{ $t('flow.form.designer.gridColumns') }}</span>
          <strong>{{ selectedGrid.columns.length }}</strong>
        </div>
        <div class="layout-summary">
          <span>{{ $t('flow.form.designer.allocatedSpan') }}</span>
          <strong>{{ gridSpanTotal(selectedGrid) }}/24</strong>
        </div>
        <div class="options-section">
          <div class="options-heading">
            <span>{{ $t('flow.form.designer.columnSettings') }}</span>
            <Button
              :disabled="!canAddGridColumn(selectedGrid)"
              size="small"
              @click="addGridColumn"
            >
              <IconifyIcon class="size-4" icon="lucide:plus" />
              {{ $t('flow.form.designer.addColumn') }}
            </Button>
          </div>
          <div
            v-for="(column, index) in selectedGrid.columns"
            :key="column.id"
            class="column-setting"
            :class="{ selected: column.id === selectedColumnId }"
            @click="selectColumn(selectedGrid.id, column.id)"
          >
            <span>
              {{ $t('flow.form.designer.columnNumber', [index + 1]) }}
            </span>
            <InputNumber
              :max="maxColumnSpan(selectedGrid, column.id)"
              :min="1"
              :value="column.span"
              @update:value="updateColumnSpan(column.id, $event)"
            />
            <Button
              danger
              :disabled="selectedGrid.columns.length === 1"
              type="text"
              :title="$t('flow.form.designer.removeColumn')"
              @click.stop="removeGridColumn(column.id)"
            >
              <IconifyIcon class="size-4" icon="lucide:trash-2" />
            </Button>
          </div>
        </div>
        <small class="layout-hint">
          {{ $t('flow.form.designer.gridHint') }}
        </small>
      </div>
      <div v-else-if="selectedField" class="property-list">
        <label class="property-field">
          <span>{{ $t('flow.form.designer.fieldType') }}</span>
          <Select
            :options="
              palette.map((item) => ({
                label: fieldTypeLabel(item.type),
                value: item.type,
              }))
            "
            :value="selectedField.type"
            @update:value="onFieldTypeChange"
          />
        </label>
        <label class="property-field">
          <span>{{ $t('flow.form.designer.fieldLabel') }}</span>
          <Input
            :maxlength="128"
            :value="selectedField.label"
            @update:value="updateSelectedField({ label: $event })"
          />
        </label>
        <label class="property-field">
          <span>{{ $t('flow.form.designer.fieldKey') }}</span>
          <Input
            :maxlength="64"
            :value="selectedField.key"
            @update:value="updateSelectedField({ key: $event })"
          />
          <small>{{ $t('flow.form.designer.fieldKeyHint') }}</small>
        </label>
        <label v-if="selectedField.type !== 'switch'" class="property-field">
          <span>{{ $t('flow.form.designer.placeholder') }}</span>
          <Input
            :maxlength="128"
            :value="selectedField.placeholder"
            @update:value="updateSelectedField({ placeholder: $event })"
          />
        </label>
        <div class="switch-property">
          <span>{{ $t('flow.form.designer.required') }}</span>
          <Switch
            :checked="selectedField.required"
            @update:checked="updateRequired"
          />
        </div>

        <label class="property-field">
          <span>{{ $t('flow.form.designer.defaultValue') }}</span>
          <Switch
            v-if="selectedField.type === 'switch'"
            :checked="Boolean(selectedField.defaultValue)"
            @update:checked="updateSelectedField({ defaultValue: $event })"
          />
          <Select
            v-else-if="selectedField.type === 'checkbox'"
            allow-clear
            mode="multiple"
            :options="selectedField.options"
            :value="defaultArrayValue(selectedField.defaultValue)"
            @update:value="updateSelectedField({ defaultValue: $event })"
          />
          <Select
            v-else-if="['radio', 'select'].includes(selectedField.type)"
            allow-clear
            :options="selectedField.options"
            :value="defaultStringValue(selectedField.defaultValue)"
            @update:value="updateSelectedField({ defaultValue: $event })"
          />
          <InputNumber
            v-else-if="selectedField.type === 'number'"
            class="w-full"
            :value="selectedField.defaultValue as number"
            @update:value="updateSelectedField({ defaultValue: $event })"
          />
          <Input
            v-else
            allow-clear
            :placeholder="
              selectedField.type === 'date'
                ? $t('flow.form.designer.dateDefaultHint')
                : undefined
            "
            :value="defaultStringValue(selectedField.defaultValue)"
            @update:value="updateSelectedField({ defaultValue: $event })"
          />
        </label>

        <div v-if="hasOptions" class="options-section">
          <div class="options-heading">
            <span>{{ $t('flow.form.designer.options') }}</span>
            <Button size="small" @click="addOption">
              <IconifyIcon class="size-4" icon="lucide:plus" />
              {{ $t('flow.designer.add') }}
            </Button>
          </div>
          <div
            v-for="(option, index) in selectedField.options"
            :key="index"
            class="option-row"
          >
            <Input
              :placeholder="$t('flow.form.designer.optionLabel')"
              :value="option.label"
              @update:value="updateOption(index, { label: $event })"
            />
            <Input
              :placeholder="$t('flow.form.designer.optionValue')"
              :value="option.value"
              @update:value="updateOption(index, { value: $event })"
            />
            <Button danger type="text" @click="removeOption(index)">
              <IconifyIcon class="size-4" icon="lucide:trash-2" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.form-designer {
  display: grid;
  overflow: hidden;
  height: 100%;
  min-height: 0;
  grid-template-columns: 220px minmax(360px, 1fr) 300px;
}

.field-palette,
.field-properties {
  overflow-y: auto;
  min-height: 0;
  background: hsl(var(--background));
}

.field-palette {
  border-right: 1px solid hsl(var(--border));
  padding: 16px;
}

.field-properties {
  border-left: 1px solid hsl(var(--border));
  padding: 16px;
}

.panel-title,
.canvas-title {
  margin-bottom: 14px;
  color: hsl(var(--foreground));
  font-size: 14px;
  font-weight: 600;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.palette-item {
  display: flex;
  min-height: 72px;
  align-items: center;
  justify-content: center;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  cursor: pointer;
  flex-direction: column;
  gap: 7px;
  font-size: 12px;
}

.palette-item:hover {
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
}

.layout-title {
  margin-top: 24px;
}

.layout-item {
  width: 100%;
  min-height: 64px;
}

.form-canvas {
  overflow-y: auto;
  min-height: 0;
  background: hsl(var(--muted) / 0.45);
  padding: 18px 24px 32px;
}

.field-list {
  display: flex;
  max-width: 760px;
  margin: 0 auto;
  flex-direction: column;
  gap: 10px;
}

.grid-layout {
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  cursor: pointer;
  padding: 12px;
}

.grid-layout.selected {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 1px hsl(var(--primary));
}

.grid-heading,
.grid-name,
.field-actions,
.options-heading,
.switch-property,
.layout-summary,
.column-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.grid-heading {
  min-height: 28px;
  margin-bottom: 10px;
}

.grid-name {
  justify-content: flex-start;
  color: hsl(var(--foreground));
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
}

.grid-column {
  display: flex;
  min-height: 112px;
  border: 1px dashed hsl(var(--border));
  border-radius: 5px;
  background: hsl(var(--muted) / 0.25);
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}

.grid-column.selected {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.05);
}

.column-label {
  color: hsl(var(--muted-foreground));
  font-size: 11px;
}

.column-empty {
  display: flex;
  min-height: 60px;
  align-items: center;
  justify-content: center;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.column-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.root-drop-zone {
  display: flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  border: 1px dashed transparent;
  border-radius: 5px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.root-drop-zone:hover {
  border-color: hsl(var(--border));
}

.property-list,
.property-field,
.options-section {
  display: flex;
  flex-direction: column;
}

.property-list {
  gap: 16px;
}

.layout-summary {
  color: hsl(var(--foreground));
  font-size: 13px;
}

.column-setting {
  display: grid;
  align-items: center;
  border: 1px solid transparent;
  border-radius: 5px;
  gap: 8px;
  grid-template-columns: minmax(60px, 1fr) 86px 32px;
  padding: 5px;
}

.column-setting.selected {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.05);
}

.column-setting :deep(.ant-input-number) {
  width: 100%;
}

.layout-hint {
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
}

.property-field {
  gap: 7px;
  color: hsl(var(--foreground));
  font-size: 13px;
}

.property-field small {
  color: hsl(var(--muted-foreground));
  line-height: 1.5;
}

.switch-property {
  min-height: 32px;
  color: hsl(var(--foreground));
  font-size: 13px;
}

.options-section {
  gap: 10px;
  border-top: 1px solid hsl(var(--border));
  padding-top: 14px;
}

.option-row {
  display: grid;
  align-items: center;
  gap: 6px;
  grid-template-columns: 1fr 1fr 32px;
}

@media (max-width: 1100px) {
  .form-designer {
    grid-template-columns: 180px minmax(320px, 1fr) 260px;
  }
}
</style>
