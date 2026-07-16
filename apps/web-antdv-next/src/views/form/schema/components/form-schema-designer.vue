<script lang="ts" setup>
import type {
  FormComponentGroup,
  FormSchemaLayout,
  PersistentFormDependencies,
  PersistentFormRule,
  PersistentFormSchema,
} from '#/utils/form-schema';
import type { VbenFormSchema } from '#/adapter/form';
import type { Sortable } from '@vben-core/composables';

import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useSortable } from '@vben-core/composables';
import { IconifyIcon } from '@vben/icons';
import {
  Button,
  Collapse,
  CollapsePanel,
  Empty,
  Flex,
  Input,
  InputNumber,
  Select,
  Switch,
  TabPane,
  Tabs,
  TextArea,
  TypographyText,
  message,
  Card,
  Row,
  Col,
} from 'antdv-next';

import { $t } from '#/locales';
import { useVbenForm } from '#/adapter/form';
import {
  compileVbenFormSchema,
  getFormComponentMeta,
  getFormComponentMetadata,
  getFormSchemaWrapperClass,
} from '#/utils/form-schema';

const props = withDefaults(
  defineProps<{
    layout?: FormSchemaLayout;
    modelValue: PersistentFormSchema[];
  }>(),
  { layout: 'single' },
);
const emit = defineEmits<{
  'update:modelValue': [value: PersistentFormSchema[]];
}>();

const selectedFieldName = ref('');
const componentPropsText = ref('{}');
const dependenciesText = ref('');
const advancedText = ref('{}');
const componentGroupKeys: FormComponentGroup[] = [
  'basic',
  'choice',
  'date',
  'extended',
];
const activeGroupKeys = ref<FormComponentGroup[]>([...componentGroupKeys]);
const canvasHostRef = ref<HTMLElement>();
const paletteContainers = new Map<FormComponentGroup, HTMLElement>();
const sortableInstances: Sortable[] = [];

const components = getFormComponentMetadata();
const componentGroups = computed(() =>
  componentGroupKeys.map((key) => ({
    items: components.filter((item) => item.group === key),
    key,
    title: $t(`form.componentGroups.${key}`),
  })),
);
const selectedIndex = computed(() =>
  props.modelValue.findIndex(
    (item) => item.fieldName === selectedFieldName.value,
  ),
);
const selectedField = computed(() => props.modelValue[selectedIndex.value]);
const selectedMeta = computed(() =>
  selectedField.value
    ? getFormComponentMeta(selectedField.value.component)
    : undefined,
);
const componentOptions = computed(() =>
  components.map((item) => ({ label: item.title, value: item.component })),
);
const required = computed(() =>
  selectedField.value?.rules?.some((rule) =>
    ['required', 'selectRequired'].includes(rule.type),
  ),
);
const supportsLength = computed(() =>
  ['array', 'string'].includes(selectedMeta.value?.valueType ?? ''),
);
const supportsRange = computed(() =>
  ['array', 'number', 'string'].includes(selectedMeta.value?.valueType ?? ''),
);
const supportsPattern = computed(
  () => selectedMeta.value?.valueType === 'string',
);
const maxFormItemSpan = computed(() => {
  if (props.layout === 'triple') return 3;
  if (props.layout === 'double') return 2;
  return 1;
});
const formItemSpan = computed(() => {
  const matched = selectedField.value?.formItemClass?.match(
    /(?:^|\s)col-span-(\d+)(?:\s|$)/,
  );
  return matched?.[1] ? Number(matched[1]) : 1;
});

const [DesignerForm, designerFormApi] = useVbenForm({
  schema: [],
  showDefaultActions: false,
  wrapperClass: getDesignerWrapperClass(props.layout),
});

watch(
  [() => props.modelValue, () => props.layout, selectedFieldName],
  ([value, layout, selectedName]) => {
    try {
      const compiledSchema = compileVbenFormSchema(value).map((item, index) =>
        withDesignerState(item, index, selectedName),
      );
      designerFormApi.setState({
        schema: compiledSchema,
        wrapperClass: getDesignerWrapperClass(layout),
      });
    } catch {
      designerFormApi.setState({ schema: [] });
    }
  },
  { deep: true, immediate: true },
);

watch(
  selectedField,
  (field) => {
    componentPropsText.value = JSON.stringify(
      field?.componentProps ?? {},
      null,
      2,
    );
    dependenciesText.value = field?.dependencies
      ? JSON.stringify(field.dependencies, null, 2)
      : '';
    advancedText.value = JSON.stringify(field ?? {}, null, 2);
  },
  { immediate: true },
);

onMounted(initializeSortables);

onUnmounted(() => {
  sortableInstances.forEach((instance) => instance.destroy());
});

function setPaletteContainer(group: FormComponentGroup, element: unknown) {
  if (element instanceof HTMLElement) {
    paletteContainers.set(group, element);
  }
}

async function initializeSortables() {
  await nextTick();
  for (const container of paletteContainers.values()) {
    const { initializeSortable } = useSortable(container, {
      draggable: '[data-component]',
      group: { name: 'form-schema-designer', pull: 'clone', put: false },
      sort: false,
    });
    sortableInstances.push(await initializeSortable());
  }
  const canvas = canvasHostRef.value?.querySelector<HTMLElement>(
    '.designer-canvas-grid',
  );
  if (!canvas) return;
  const { initializeSortable } = useSortable(canvas, {
    draggable: '.designer-form-item',
    filter:
      'input, textarea, button, select, [contenteditable="true"], [role="button"], [role="combobox"]',
    group: { name: 'form-schema-designer', pull: true, put: true },
    preventOnFilter: false,
    onAdd(event) {
      const component = event.item.dataset.component;
      event.item.remove();
      if (!component) return;
      insertField(component, event.newIndex);
    },
    onEnd(event) {
      if (event.from !== event.to) return;
      moveField(event.oldDraggableIndex, event.newDraggableIndex);
    },
  });
  sortableInstances.push(await initializeSortable());
}

function getDesignerWrapperClass(layout?: FormSchemaLayout) {
  return `${getFormSchemaWrapperClass(layout)} designer-canvas-grid min-h-[300px] content-start`;
}

function withDesignerState(
  schema: VbenFormSchema,
  index: number,
  selectedName: string,
): VbenFormSchema {
  const designerClass = [
    'designer-form-item',
    `designer-form-item-index-${index}`,
    'cursor-grab rounded-sm border p-2 transition-colors active:cursor-grabbing',
    schema.fieldName === selectedName
      ? 'border-primary bg-accent'
      : 'border-transparent hover:border-border',
  ].join(' ');
  const formItemClass = schema.formItemClass;
  return {
    ...schema,
    formItemClass:
      typeof formItemClass === 'function'
        ? () => `${formItemClass()} ${designerClass}`
        : `${formItemClass ?? ''} ${designerClass}`,
  };
}

function selectCanvasField(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const item = target.closest<HTMLElement>('.designer-form-item');
  if (!item || !canvasHostRef.value?.contains(item)) return;
  const marker = [...item.classList].find((name) =>
    name.startsWith('designer-form-item-index-'),
  );
  const index = Number(marker?.slice('designer-form-item-index-'.length));
  const field = props.modelValue[index];
  if (field) selectedFieldName.value = field.fieldName;
}

function insertField(component: string, targetIndex = props.modelValue.length) {
  const meta = getFormComponentMeta(component);
  if (!meta) return;
  const fieldName = nextFieldName(component);
  const field: PersistentFormSchema = {
    component,
    componentProps: { ...meta.defaultProps },
    defaultValue: meta.defaultValue,
    fieldName,
    formItemClass: 'col-span-1 items-baseline',
    label: meta.title,
  };
  const next = [...props.modelValue];
  next.splice(Math.min(Math.max(targetIndex, 0), next.length), 0, field);
  emit('update:modelValue', next);
  selectedFieldName.value = fieldName;
}

function nextFieldName(component: string) {
  const base = component.charAt(0).toLowerCase() + component.slice(1);
  const names = new Set(props.modelValue.map((item) => item.fieldName));
  let index = 1;
  while (names.has(`${base}${index}`)) index += 1;
  return `${base}${index}`;
}

function updateSelected(values: Partial<PersistentFormSchema>) {
  if (selectedIndex.value < 0 || !selectedField.value) return;
  const next = [...props.modelValue];
  const previousName = selectedField.value.fieldName;
  next[selectedIndex.value] = { ...selectedField.value, ...values };
  emit('update:modelValue', next);
  if (values.fieldName && values.fieldName !== previousName) {
    selectedFieldName.value = values.fieldName;
  }
}

function updateFormItemSpan(value: null | number) {
  const span = Math.min(
    maxFormItemSpan.value,
    Math.max(1, Math.trunc(value ?? 1)),
  );
  updateSelected({ formItemClass: `col-span-${span} items-baseline` });
}

function removeSelected() {
  if (selectedIndex.value < 0) return;
  const next = props.modelValue.filter(
    (_, index) => index !== selectedIndex.value,
  );
  emit('update:modelValue', next);
  selectedFieldName.value =
    next[Math.min(selectedIndex.value, next.length - 1)]?.fieldName ?? '';
}

function moveField(oldIndex?: number, newIndex?: number) {
  if (
    oldIndex === undefined ||
    newIndex === undefined ||
    oldIndex === newIndex
  ) {
    return;
  }
  const next = [...props.modelValue];
  const [field] = next.splice(oldIndex, 1);
  if (field) next.splice(newIndex, 0, field);
  emit('update:modelValue', next);
}

function updateComponent(value: unknown) {
  if (typeof value !== 'string') return;
  const meta = getFormComponentMeta(value);
  if (!meta) return;
  updateSelected({
    component: meta.component,
    componentProps: { ...meta.defaultProps },
    defaultValue: meta.defaultValue,
    rules: undefined,
  });
}

function updateRequired(value: unknown) {
  if (!selectedField.value) return;
  const rules = (selectedField.value.rules ?? []).filter(
    (rule) => !['required', 'selectRequired'].includes(rule.type),
  );
  if (value) rules.unshift({ type: 'required' });
  updateSelected({ rules: rules.length > 0 ? rules : undefined });
}

function validationRule() {
  return selectedField.value?.rules?.find((rule) =>
    ['array', 'number', 'string'].includes(rule.type),
  );
}

function updateValidationRule(values: Partial<PersistentFormRule>) {
  if (!selectedField.value || !selectedMeta.value) return;
  const valueType = selectedMeta.value.valueType;
  let type: PersistentFormRule['type'] = 'string';
  if (valueType === 'array') type = 'array';
  if (valueType === 'number') type = 'number';
  const rules = [...(selectedField.value.rules ?? [])];
  const index = rules.findIndex((rule) =>
    ['array', 'number', 'string'].includes(rule.type),
  );
  const nextRule: PersistentFormRule = {
    ...(index === -1 ? { type } : rules[index]),
    ...values,
    type,
  };
  if (index === -1) rules.push(nextRule);
  else rules[index] = nextRule;
  updateSelected({ rules });
}

function updateRuleNumber(key: 'length' | 'max' | 'min', value: null | number) {
  updateValidationRule({ [key]: value ?? undefined });
}

function regexRule() {
  return selectedField.value?.rules?.find((rule) => rule.type === 'regex');
}

function updatePattern(value: string) {
  if (!selectedField.value) return;
  const rules = [...(selectedField.value.rules ?? [])];
  const index = rules.findIndex((rule) => rule.type === 'regex');
  if (!value.trim()) {
    if (index !== -1) rules.splice(index, 1);
  } else if (index === -1) {
    rules.push({ pattern: value, type: 'regex' });
  } else {
    rules[index] = { ...rules[index], pattern: value, type: 'regex' };
  }
  updateSelected({ rules: rules.length > 0 ? rules : undefined });
}

function applyJson(
  text: string,
  apply: (value: Record<string, unknown> | undefined) => void,
) {
  try {
    apply(
      text.trim() ? (JSON.parse(text) as Record<string, unknown>) : undefined,
    );
  } catch {
    message.error($t('form.messages.invalidJson'));
  }
}

function applyAdvancedJson() {
  try {
    const parsed = JSON.parse(advancedText.value) as PersistentFormSchema;
    if (!parsed.fieldName || !parsed.component) {
      throw new Error('Schema requires fieldName and component');
    }
    updateSelected(parsed);
  } catch {
    message.error($t('form.messages.invalidSchemaJson'));
  }
}

function applyDependenciesJson() {
  try {
    const value = dependenciesText.value.trim()
      ? (JSON.parse(dependenciesText.value) as PersistentFormDependencies)
      : undefined;
    updateSelected({ dependencies: value });
  } catch {
    message.error($t('form.messages.invalidJson'));
  }
}
</script>

<template>
  <Row :gutter="20">
    <Col :span="4">
      <Card :title="$t('form.designer.components')" size="small">
        <Collapse v-model:active-key="activeGroupKeys" size="small">
          <CollapsePanel
            v-for="group in componentGroups"
            :key="group.key"
            :header="group.title"
          >
            <div
              :ref="(element) => setPaletteContainer(group.key, element)"
              class="grid gap-2"
            >
              <Button
                v-for="item in group.items"
                :key="item.component"
                block
                class="cursor-grab active:cursor-grabbing"
                :data-component="item.component"
              >
                <IconifyIcon icon="lucide:grip-vertical" />
                {{ item.title }}
              </Button>
            </div>
          </CollapsePanel>
        </Collapse>
      </Card>
    </Col>
    <Col :span="16">
      <Card :title="$t('form.designer.canvas')" size="small">
        <div
          ref="canvasHostRef"
          class="relative min-h-[300px]"
          @click.capture="selectCanvasField"
        >
          <DesignerForm />
          <Empty
            v-if="modelValue.length === 0"
            class="pointer-events-none absolute inset-0 flex items-center justify-center"
            :description="$t('form.designer.empty')"
          />
        </div>
      </Card>
    </Col>
    <Col :span="4">
      <Card :title="$t('form.designer.properties')" size="small">
        <template #extra>
          <Button danger size="small" type="text" @click="removeSelected">
            <IconifyIcon icon="lucide:trash-2" />
          </Button>
        </template>
        <template v-if="selectedField">
          <Tabs size="small">
            <TabPane key="basic" :tab="$t('form.designer.basic')">
              <Flex :gap="14" vertical>
                <Flex :gap="6" component="label" vertical>
                  <TypographyText>{{
                    $t('form.fields.component')
                  }}</TypographyText>
                  <Select
                    class="w-full"
                    :options="componentOptions"
                    :value="selectedField.component"
                    @update:value="updateComponent"
                  />
                </Flex>
                <Flex :gap="6" component="label" vertical>
                  <TypographyText>{{ $t('form.fields.label') }}</TypographyText>
                  <Input
                    :value="selectedField.label"
                    @update:value="updateSelected({ label: $event })"
                  />
                </Flex>
                <Flex :gap="6" component="label" vertical>
                  <TypographyText>{{
                    $t('form.fields.fieldName')
                  }}</TypographyText>
                  <Input
                    :value="selectedField.fieldName"
                    @update:value="updateSelected({ fieldName: $event })"
                  />
                </Flex>
                <Flex :gap="6" component="label" vertical>
                  <TypographyText>{{
                    $t('form.fields.formItemClass')
                  }}</TypographyText>
                  <InputNumber
                    class="w-full"
                    :max="maxFormItemSpan"
                    :min="1"
                    :precision="0"
                    :value="formItemSpan"
                    @update:value="updateFormItemSpan"
                  />
                </Flex>
                <Flex
                  v-if="selectedMeta?.supportsRules"
                  align="center"
                  justify="space-between"
                >
                  <TypographyText>{{
                    $t('form.fields.required')
                  }}</TypographyText>
                  <Switch
                    :checked="required"
                    @update:checked="updateRequired"
                  />
                </Flex>
                <Flex v-if="supportsRange" :gap="6" component="label" vertical>
                  <TypographyText>{{
                    $t('form.fields.minimum')
                  }}</TypographyText>
                  <InputNumber
                    class="w-full"
                    :value="validationRule()?.min"
                    @update:value="updateRuleNumber('min', $event)"
                  />
                </Flex>
                <Flex v-if="supportsRange" :gap="6" component="label" vertical>
                  <TypographyText>{{
                    $t('form.fields.maximum')
                  }}</TypographyText>
                  <InputNumber
                    class="w-full"
                    :value="validationRule()?.max"
                    @update:value="updateRuleNumber('max', $event)"
                  />
                </Flex>
                <Flex v-if="supportsLength" :gap="6" component="label" vertical>
                  <TypographyText>{{
                    $t('form.fields.length')
                  }}</TypographyText>
                  <InputNumber
                    class="w-full"
                    :min="0"
                    :precision="0"
                    :value="validationRule()?.length"
                    @update:value="updateRuleNumber('length', $event)"
                  />
                </Flex>
                <Flex
                  v-if="supportsPattern"
                  :gap="6"
                  component="label"
                  vertical
                >
                  <TypographyText>{{
                    $t('form.fields.pattern')
                  }}</TypographyText>
                  <Input
                    :value="regexRule()?.pattern"
                    @update:value="updatePattern"
                  />
                </Flex>
                <Flex :gap="6" component="label" vertical>
                  <TypographyText>
                    {{ $t('form.fields.componentProps') }}
                  </TypographyText>
                  <TextArea
                    v-model:value="componentPropsText"
                    :auto-size="{ minRows: 4, maxRows: 10 }"
                    @blur="
                      applyJson(componentPropsText, (value) =>
                        updateSelected({ componentProps: value }),
                      )
                    "
                  />
                </Flex>
                <Flex :gap="6" component="label" vertical>
                  <TypographyText>
                    {{ $t('form.fields.dependencies') }}
                  </TypographyText>
                  <TextArea
                    v-model:value="dependenciesText"
                    :auto-size="{ minRows: 4, maxRows: 10 }"
                    @blur="applyDependenciesJson"
                  />
                </Flex>
              </Flex>
            </TabPane>
            <TabPane key="advanced" :tab="$t('form.designer.advanced')">
              <TextArea
                v-model:value="advancedText"
                :auto-size="{ minRows: 18, maxRows: 30 }"
              />
              <Button block class="mt-3" @click="applyAdvancedJson">
                {{ $t('form.actions.apply') }}
              </Button>
            </TabPane>
          </Tabs>
        </template>
        <Empty v-else :description="$t('form.designer.selectField')" />
      </Card>
    </Col>
  </Row>
</template>
