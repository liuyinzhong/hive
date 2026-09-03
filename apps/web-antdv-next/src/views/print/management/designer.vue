<script lang="ts" setup>
import type {
  PrintDocumentData,
  PrintFieldDefinition,
  PrintLayout,
  PrintLayoutElement,
  PrintSection,
  PrintTableColumn,
  PrintTemplateDetail,
  PrintTemplateMetadata,
} from '#/api/print';

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Empty,
  Flex,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  TypographyText,
  message,
} from 'antdv-next';

import {
  getPurchaseInboundPrintDataApi,
  getPrintTemplateDetailApi,
  getPrintTemplateMetadataApi,
  publishPrintTemplateApi,
  updatePrintTemplateApi,
} from '#/api/print';
import { getPurchaseInboundListApi } from '#/api/erp';
import type { ErpPurchaseInboundApi } from '#/api/erp';
import { $t } from '#/locales';

import PrintRenderer from './components/print-renderer.vue';
import { createDefaultPrintLayout } from './default-layout';
import { elementStyle } from './print-utils';

defineOptions({ name: 'PrintTemplateDesigner' });

type SectionKey =
  | 'documentFooter'
  | 'documentHeader'
  | 'pageFooter'
  | 'pageHeader';

type Selection =
  | { index: number; kind: 'column' }
  | { index: number; kind: 'element'; section: SectionKey }
  | { kind: 'table' }
  | undefined;

const route = useRoute();
const router = useRouter();
const { hasAccessByCodes } = useAccess();

const templateId = String(route.query.templateId ?? '');
const loading = ref(true);
const saving = ref(false);
const previewMode = ref(false);
const layout = ref<PrintLayout>(createDefaultPrintLayout());
const template = ref<PrintTemplateDetail>();
const metadata = ref<PrintTemplateMetadata>();
const selection = ref<Selection>();
const draggingFieldPath = ref('');
const previewData = ref<PrintDocumentData>();
const previewInboundId = ref('');
const previewInboundOptions = ref<Array<{ label: string; value: string }>>([]);
const previewLoading = ref(false);
const moving = ref<
  | {
      index: number;
      section: SectionKey;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
    }
  | undefined
>();

const sectionKeys: SectionKey[] = [
  'pageHeader',
  'documentHeader',
  'documentFooter',
  'pageFooter',
];

const sectionLabels = computed<Record<SectionKey, string>>(() => ({
  documentFooter: $t('print.designer.documentFooter'),
  documentHeader: $t('print.designer.documentHeader'),
  pageFooter: $t('print.designer.pageFooter'),
  pageHeader: $t('print.designer.pageHeader'),
}));

const allFields = computed(
  () => metadata.value?.fieldGroups.flatMap((group) => group.fields) ?? [],
);
const itemFields = computed(() =>
  allFields.value.filter((field) => field.scope === 'item'),
);
const fieldOptions = computed(() =>
  allFields.value.map((field) => ({
    label: `${field.label}（${field.path}）`,
    value: field.path,
  })),
);
const itemFieldOptions = computed(() =>
  itemFields.value.map((field) => ({
    label: `${field.label}（${field.path}）`,
    value: field.path,
  })),
);
// oxlint-disable-next-line vue/return-in-computed-property
const selectedElement = computed<PrintLayoutElement | undefined>(() => {
  if (selection.value?.kind !== 'element') return;
  return layout.value.sections[selection.value.section].elements[
    selection.value.index
  ];
});
// oxlint-disable-next-line vue/return-in-computed-property
const selectedColumn = computed<PrintTableColumn | undefined>(() => {
  if (selection.value?.kind !== 'column') return;
  return layout.value.sections.body.table?.columns[selection.value.index];
});
const selectedTable = computed(() =>
  selection.value?.kind === 'table'
    ? layout.value.sections.body.table
    : undefined,
);
const pageDimensions = computed(() =>
  layout.value.page.orientation === 'landscape'
    ? { height: 210, width: 297 }
    : { height: 297, width: 210 },
);
const designerPageStyle = computed(() => ({
  minHeight: `${pageDimensions.value.height}mm`,
  padding: `${layout.value.page.margin.top}mm ${layout.value.page.margin.right}mm ${layout.value.page.margin.bottom}mm ${layout.value.page.margin.left}mm`,
  width: `${pageDimensions.value.width}mm`,
}));
const contentWidth = computed(
  () =>
    pageDimensions.value.width -
    layout.value.page.margin.left -
    layout.value.page.margin.right,
);

onMounted(async () => {
  window.addEventListener('pointermove', moveSelectedElement);
  window.addEventListener('pointerup', stopMovingElement);
  await loadDesigner();
});

onUnmounted(() => {
  window.removeEventListener('pointermove', moveSelectedElement);
  window.removeEventListener('pointerup', stopMovingElement);
});

watch(previewMode, async (value) => {
  if (value) await loadPreviewOptions();
});

async function loadDesigner() {
  if (!templateId) {
    message.error($t('print.messages.templateMissing'));
    router.back();
    return;
  }
  loading.value = true;
  try {
    const [detail, fields] = await Promise.all([
      getPrintTemplateDetailApi(templateId),
      getPrintTemplateMetadataApi(),
    ]);
    template.value = detail;
    layout.value = structuredClone(detail.draftLayout);
    metadata.value = fields;
  } finally {
    loading.value = false;
  }
}

async function saveDraft(showMessage = true) {
  if (!template.value || !hasAccessByCodes(['print:template:update'])) {
    message.warning($t('print.messages.noUpdatePermission'));
    return false;
  }
  saving.value = true;
  try {
    const updated = await updatePrintTemplateApi(templateId, {
      draftLayout: structuredClone(layout.value),
      rowVersion: template.value.rowVersion,
      templateName: template.value.templateName.trim(),
    });
    template.value = updated;
    layout.value = structuredClone(updated.draftLayout);
    if (showMessage) message.success($t('print.messages.saveSuccess'));
    return true;
  } finally {
    saving.value = false;
  }
}

async function publishDraft() {
  if (!template.value || !hasAccessByCodes(['print:template:publish'])) return;
  if (!(await saveDraft(false)) || !template.value) return;
  saving.value = true;
  try {
    const published = await publishPrintTemplateApi(
      templateId,
      template.value.rowVersion,
    );
    template.value = published;
    layout.value = structuredClone(published.draftLayout);
    message.success($t('print.messages.publishSuccess'));
  } finally {
    saving.value = false;
  }
}

function sectionStyle(section: Pick<PrintSection, 'height'>) {
  return { height: `${section.height}mm` };
}

function elementDisplayText(element: PrintLayoutElement) {
  if (element.kind === 'field') {
    const field = allFields.value.find(
      (item) => item.path === element.fieldPath,
    );
    return `${element.text}${field ? `{{${field.label}}}` : `{{${element.fieldPath}}}`}`;
  }
  if (element.kind === 'image') {
    return element.imageUrl || $t('print.designer.imagePlaceholder');
  }
  return element.text || $t(`print.designer.kind.${element.kind}`);
}

function selectElement(section: SectionKey, index: number) {
  selection.value = { index, kind: 'element', section };
}

function selectTable() {
  selection.value = { kind: 'table' };
}

function selectColumn(index: number) {
  selection.value = { index, kind: 'column' };
}

function startDraggingField(path: string) {
  draggingFieldPath.value = path;
}

function dropField(section: SectionKey, event: DragEvent) {
  event.preventDefault();
  const field = allFields.value.find(
    (item) => item.path === draggingFieldPath.value,
  );
  if (!field) return;
  if (field.scope === 'item') {
    addTableColumn(field);
    draggingFieldPath.value = '';
    return;
  }
  const target = event.currentTarget;
  if (!(target instanceof HTMLElement)) return;
  const rect = target.getBoundingClientRect();
  const x = Math.max(
    0,
    Math.min(
      contentWidth.value - 30,
      ((event.clientX - rect.left) / rect.width) * contentWidth.value - 15,
    ),
  );
  const y = Math.max(
    0,
    Math.min(
      layout.value.sections[section].height - 7,
      ((event.clientY - rect.top) / rect.height) *
        layout.value.sections[section].height -
        3.5,
    ),
  );
  insertFieldElement(field, section, x, y);
  draggingFieldPath.value = '';
}

function addField(field: PrintFieldDefinition) {
  if (field.scope === 'item') {
    addTableColumn(field);
    return;
  }
  const section: SectionKey =
    // oxlint-disable-next-line no-nested-ternary
    field.scope === 'header'
      ? 'documentHeader'
      : field.scope === 'summary'
        ? 'documentFooter'
        : 'pageFooter';
  insertFieldElement(field, section, 0, 0);
}

function insertFieldElement(
  field: PrintFieldDefinition,
  section: SectionKey,
  x: number,
  y: number,
) {
  const element: PrintLayoutElement = {
    fieldPath: field.path,
    height: 7,
    id: nextId(`field-${field.scope}`),
    imageUrl: '',
    kind: 'field',
    style: defaultElementStyle(),
    text: `${field.label}：`,
    width: Math.min(60, contentWidth.value),
    x,
    y,
  };
  layout.value.sections[section].elements.push(element);
  selection.value = {
    index: layout.value.sections[section].elements.length - 1,
    kind: 'element',
    section,
  };
}

function addTableColumn(field: PrintFieldDefinition) {
  const table = ensureTable();
  const column: PrintTableColumn = {
    fieldPath: field.path,
    format: field.dataType === 'currency' ? 'currency' : 'text',
    id: nextId('column'),
    title: field.label,
    width: Math.min(
      30,
      contentWidth.value / Math.max(table.columns.length + 1, 1),
    ),
  };
  table.columns.push(column);
  selection.value = { index: table.columns.length - 1, kind: 'column' };
}

function ensureTable() {
  if (!layout.value.sections.body.table) {
    layout.value.sections.body.table = {
      columns: [],
      height: layout.value.sections.body.height,
      id: nextId('detail-table'),
      width: contentWidth.value,
      x: 0,
      y: 0,
    };
  }
  return layout.value.sections.body.table;
}

function addStaticElement(kind: 'image' | 'line' | 'signature' | 'text') {
  const defaults: Record<typeof kind, Partial<PrintLayoutElement>> = {
    image: { imageUrl: '', text: '' },
    line: { text: '' },
    signature: { text: $t('print.designer.signatureDefault') },
    text: { text: $t('print.designer.staticTextDefault') },
  };
  const section = layout.value.sections.documentHeader;
  section.elements.push({
    fieldPath: '',
    height: kind === 'line' ? 3 : 7,
    id: nextId(kind),
    imageUrl: '',
    kind,
    style: defaultElementStyle(),
    text: '',
    width: contentWidth.value,
    x: 0,
    y: Math.max(section.height - 8, 0),
    ...defaults[kind],
  });
  selection.value = {
    index: section.elements.length - 1,
    kind: 'element',
    section: 'documentHeader',
  };
}

function removeSelection() {
  if (selection.value?.kind === 'element') {
    layout.value.sections[selection.value.section].elements.splice(
      selection.value.index,
      1,
    );
  } else if (selection.value?.kind === 'column') {
    layout.value.sections.body.table?.columns.splice(selection.value.index, 1);
  } else if (selection.value?.kind === 'table') {
    layout.value.sections.body.table = null;
  }
  selection.value = undefined;
}

function updateElementNumber(
  key: 'height' | 'width' | 'x' | 'y',
  value: null | number,
) {
  if (!selectedElement.value || value === null) return;
  selectedElement.value[key] = Math.max(0, value);
}

function updateElementStyle(
  key: 'fontSize' | 'lineHeight',
  value: null | number,
) {
  if (!selectedElement.value || value === null) return;
  selectedElement.value.style[key] = value;
}

function updateTableNumber(
  key: 'height' | 'width' | 'x' | 'y',
  value: null | number,
) {
  if (!selectedTable.value || value === null) return;
  selectedTable.value[key] = Math.max(0, value);
}

function updateMargin(
  key: 'bottom' | 'left' | 'right' | 'top',
  value: null | number,
) {
  if (value === null) return;
  layout.value.page.margin[key] = Math.max(0, value);
}

function startMovingElement(
  event: PointerEvent,
  section: SectionKey,
  index: number,
) {
  event.preventDefault();
  selectElement(section, index);
  const element = layout.value.sections[section].elements[index];
  if (!element) return;
  moving.value = {
    index,
    originX: element.x,
    originY: element.y,
    section,
    startX: event.clientX,
    startY: event.clientY,
  };
}

function moveSelectedElement(event: PointerEvent) {
  if (!moving.value) return;
  const target =
    layout.value.sections[moving.value.section].elements[moving.value.index];
  if (!target) return;
  const sectionElement = document.querySelector<HTMLElement>(
    `[data-print-section="${moving.value.section}"]`,
  );
  if (!sectionElement) return;
  const mmPerPixel = contentWidth.value / sectionElement.clientWidth;
  target.x = Math.max(
    0,
    Math.min(
      contentWidth.value - target.width,
      moving.value.originX + (event.clientX - moving.value.startX) * mmPerPixel,
    ),
  );
  target.y = Math.max(
    0,
    Math.min(
      layout.value.sections[moving.value.section].height - target.height,
      moving.value.originY + (event.clientY - moving.value.startY) * mmPerPixel,
    ),
  );
}

function stopMovingElement() {
  moving.value = undefined;
}

async function loadPreviewOptions() {
  if (previewInboundOptions.value.length > 0) return;
  if (!hasAccessByCodes(['erp:purchaseInbound:list'])) return;
  try {
    const result = await getPurchaseInboundListApi({ page: 1, pageSize: 20 });
    previewInboundOptions.value = result.items.map(
      (item: ErpPurchaseInboundApi.PurchaseInboundListItem) => ({
        label: `${item.inboundNo} / ${item.supplierName} / ${item.inboundDate}`,
        value: item.inboundId,
      }),
    );
  } catch {
    previewInboundOptions.value = [];
  }
}

async function loadPreviewData() {
  if (!previewInboundId.value) return;
  previewLoading.value = true;
  try {
    previewData.value = await getPurchaseInboundPrintDataApi(
      previewInboundId.value,
    );
  } finally {
    previewLoading.value = false;
  }
}

function printPage() {
  window.print();
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function defaultElementStyle() {
  return {
    border: 'none',
    color: '#1f2937',
    fontSize: 3.5,
    fontWeight: 'normal',
    lineHeight: 1.35,
    textAlign: 'left' as const,
  };
}
</script>

<template>
  <Page
    auto-content-height
    class="print-designer-page"
    header-class="print-page-header"
    :title="template?.templateName || $t('print.designer.title')"
  >
    <template #extra>
      <Space>
        <Button @click="router.back()">{{ $t('print.actions.back') }}</Button>
        <Button :loading="saving" @click="saveDraft()">
          {{ $t('print.actions.saveDraft') }}
        </Button>
        <Button
          v-if="hasAccessByCodes(['print:template:publish'])"
          :loading="saving"
          type="primary"
          @click="publishDraft"
        >
          {{ $t('print.actions.publish') }}
        </Button>
        <Button @click="previewMode = !previewMode">
          {{
            previewMode
              ? $t('print.actions.backToDesign')
              : $t('print.actions.preview')
          }}
        </Button>
      </Space>
    </template>

    <div v-if="!loading && template" class="h-full min-h-0">
      <div v-if="previewMode" class="preview-host">
        <Card size="small">
          <Flex align="center" :gap="12" wrap>
            <TypographyText>{{ $t('print.preview.document') }}</TypographyText>
            <Select
              v-if="previewInboundOptions.length > 0"
              v-model:value="previewInboundId"
              allow-clear
              class="min-w-[360px]"
              :options="previewInboundOptions"
              :placeholder="$t('print.preview.selectDocument')"
              show-search
              @change="loadPreviewData"
            />
            <Input
              v-else
              v-model:value="previewInboundId"
              class="min-w-[360px]"
              :placeholder="$t('print.preview.documentIdPlaceholder')"
              @press-enter="loadPreviewData"
            />
            <Button :loading="previewLoading" @click="loadPreviewData">
              {{ $t('print.preview.load') }}
            </Button>
            <Button v-if="previewData" type="primary" @click="printPage">
              {{ $t('print.actions.print') }}
            </Button>
          </Flex>
        </Card>
        <Empty
          v-if="!previewData"
          class="preview-empty"
          :description="$t('print.preview.empty')"
        />
        <PrintRenderer v-else :data="previewData" :layout="layout" />
      </div>

      <div v-else class="designer-shell">
        <aside class="designer-sidebar designer-palette">
          <Card size="small" :title="$t('print.designer.fields')">
            <div
              v-for="group in metadata?.fieldGroups"
              :key="group.code"
              class="field-group"
            >
              <div class="field-group-title">{{ group.name }}</div>
              <button
                v-for="field in group.fields"
                :key="field.path"
                class="field-chip"
                draggable="true"
                type="button"
                @click="addField(field)"
                @dragstart="startDraggingField(field.path)"
              >
                <span>{{ field.label }}</span>
                <small>{{ field.path }}</small>
              </button>
            </div>
          </Card>
          <Card
            class="mt-3"
            size="small"
            :title="$t('print.designer.staticElements')"
          >
            <Flex vertical :gap="8">
              <Button block @click="addStaticElement('text')">
                {{ $t('print.designer.addText') }}
              </Button>
              <Button block @click="addStaticElement('image')">
                {{ $t('print.designer.addImage') }}
              </Button>
              <Button block @click="addStaticElement('line')">
                {{ $t('print.designer.addLine') }}
              </Button>
              <Button block @click="addStaticElement('signature')">
                {{ $t('print.designer.addSignature') }}
              </Button>
            </Flex>
          </Card>
        </aside>

        <main class="designer-workspace">
          <Card size="small">
            <Flex align="center" justify="space-between" wrap>
              <Flex align="center" :gap="8">
                <TypographyText>{{
                  $t('print.designer.templateName')
                }}</TypographyText>
                <Input
                  v-model:value="template.templateName"
                  class="w-[260px]"
                />
              </Flex>
              <Flex align="center" :gap="8" wrap>
                <TypographyText>{{
                  $t('print.designer.orientation')
                }}</TypographyText>
                <Select
                  v-model:value="layout.page.orientation"
                  class="w-[120px]"
                  :options="[
                    { label: $t('print.designer.portrait'), value: 'portrait' },
                    {
                      label: $t('print.designer.landscape'),
                      value: 'landscape',
                    },
                  ]"
                />
                <Tag>{{ $t('print.designer.a4Only') }}</Tag>
              </Flex>
            </Flex>
          </Card>

          <div class="designer-canvas-wrap">
            <div class="designer-page" :style="designerPageStyle">
              <section
                v-for="sectionKey in sectionKeys"
                :key="sectionKey"
                :data-print-section="sectionKey"
                class="designer-section"
                :style="sectionStyle(layout.sections[sectionKey])"
                @dragover.prevent
                @drop="dropField(sectionKey, $event)"
              >
                <span class="section-label">{{
                  sectionLabels[sectionKey]
                }}</span>
                <div
                  v-for="(element, index) in layout.sections[sectionKey]
                    .elements"
                  :key="element.id"
                  class="designer-element"
                  :class="{
                    'designer-element-selected':
                      selection?.kind === 'element' &&
                      selection.section === sectionKey &&
                      selection.index === index,
                  }"
                  :style="elementStyle(element)"
                  @click.stop="selectElement(sectionKey, index)"
                  @pointerdown="startMovingElement($event, sectionKey, index)"
                >
                  <span v-if="element.kind !== 'image'">{{
                    elementDisplayText(element)
                  }}</span>
                  <img
                    v-else-if="element.imageUrl"
                    alt=""
                    :src="element.imageUrl"
                  />
                  <span v-else class="text-muted">{{
                    elementDisplayText(element)
                  }}</span>
                </div>
              </section>

              <section
                class="designer-section designer-body-section"
                :style="sectionStyle(layout.sections.body)"
                @click.stop="selectTable"
              >
                <span class="section-label">{{
                  $t('print.designer.detailTable')
                }}</span>
                <table
                  v-if="layout.sections.body.table"
                  class="designer-detail-table"
                  :class="{
                    'designer-element-selected': selection?.kind === 'table',
                  }"
                  :style="{
                    height: `${layout.sections.body.table.height}mm`,
                    left: `${layout.sections.body.table.x}mm`,
                    top: `${layout.sections.body.table.y}mm`,
                    width: `${layout.sections.body.table.width}mm`,
                  }"
                >
                  <thead>
                    <tr>
                      <th
                        v-for="(column, index) in layout.sections.body.table
                          .columns"
                        :key="column.id"
                        :style="{ width: `${column.width}mm` }"
                        @click.stop="selectColumn(index)"
                      >
                        {{ column.title }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        v-for="column in layout.sections.body.table.columns"
                        :key="column.id"
                      >
                        {{ column.fieldPath }}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Empty
                  v-else
                  class="designer-table-empty"
                  :description="$t('print.designer.tableEmpty')"
                />
              </section>
            </div>
          </div>
        </main>

        <aside class="designer-sidebar designer-properties">
          <Card size="small" :title="$t('print.designer.properties')">
            <template v-if="selectedElement">
              <Flex vertical :gap="10">
                <label>
                  <TypographyText>{{
                    $t('print.designer.text')
                  }}</TypographyText>
                  <Input v-model:value="selectedElement.text" />
                </label>
                <label v-if="selectedElement.kind === 'field'">
                  <TypographyText>{{
                    $t('print.designer.binding')
                  }}</TypographyText>
                  <Select
                    v-model:value="selectedElement.fieldPath"
                    class="w-full"
                    :options="fieldOptions"
                  />
                </label>
                <label v-if="selectedElement.kind === 'image'">
                  <TypographyText>{{
                    $t('print.designer.imageUrl')
                  }}</TypographyText>
                  <Input v-model:value="selectedElement.imageUrl" />
                </label>
                <div class="property-grid">
                  <label>
                    <TypographyText>X</TypographyText>
                    <InputNumber
                      class="w-full"
                      :min="0"
                      :value="selectedElement.x"
                      @update:value="updateElementNumber('x', $event)"
                    />
                  </label>
                  <label>
                    <TypographyText>Y</TypographyText>
                    <InputNumber
                      class="w-full"
                      :min="0"
                      :value="selectedElement.y"
                      @update:value="updateElementNumber('y', $event)"
                    />
                  </label>
                  <label>
                    <TypographyText>{{
                      $t('print.designer.width')
                    }}</TypographyText>
                    <InputNumber
                      class="w-full"
                      :min="1"
                      :value="selectedElement.width"
                      @update:value="updateElementNumber('width', $event)"
                    />
                  </label>
                  <label>
                    <TypographyText>{{
                      $t('print.designer.height')
                    }}</TypographyText>
                    <InputNumber
                      class="w-full"
                      :min="1"
                      :value="selectedElement.height"
                      @update:value="updateElementNumber('height', $event)"
                    />
                  </label>
                </div>
                <label>
                  <TypographyText>{{
                    $t('print.designer.textAlign')
                  }}</TypographyText>
                  <Select
                    v-model:value="selectedElement.style.textAlign"
                    class="w-full"
                    :options="[
                      { label: $t('print.designer.alignLeft'), value: 'left' },
                      {
                        label: $t('print.designer.alignCenter'),
                        value: 'center',
                      },
                      {
                        label: $t('print.designer.alignRight'),
                        value: 'right',
                      },
                    ]"
                  />
                </label>
                <div class="property-grid">
                  <label>
                    <TypographyText>{{
                      $t('print.designer.fontSize')
                    }}</TypographyText>
                    <InputNumber
                      class="w-full"
                      :min="1"
                      :value="selectedElement.style.fontSize"
                      @update:value="updateElementStyle('fontSize', $event)"
                    />
                  </label>
                  <label>
                    <TypographyText>{{
                      $t('print.designer.lineHeight')
                    }}</TypographyText>
                    <InputNumber
                      class="w-full"
                      :min="1"
                      :value="selectedElement.style.lineHeight"
                      @update:value="updateElementStyle('lineHeight', $event)"
                    />
                  </label>
                </div>
                <Button danger block @click="removeSelection">
                  {{ $t('print.actions.deleteElement') }}
                </Button>
              </Flex>
            </template>

            <template v-else-if="selectedColumn">
              <Flex vertical :gap="10">
                <label>
                  <TypographyText>{{
                    $t('print.designer.binding')
                  }}</TypographyText>
                  <Select
                    v-model:value="selectedColumn.fieldPath"
                    class="w-full"
                    :options="itemFieldOptions"
                  />
                </label>
                <label>
                  <TypographyText>{{
                    $t('print.designer.columnTitle')
                  }}</TypographyText>
                  <Input v-model:value="selectedColumn.title" />
                </label>
                <label>
                  <TypographyText>{{
                    $t('print.designer.width')
                  }}</TypographyText>
                  <InputNumber
                    class="w-full"
                    :min="1"
                    :value="selectedColumn.width"
                    @update:value="
                      selectedColumn.width = $event ?? selectedColumn.width
                    "
                  />
                </label>
                <label>
                  <TypographyText>{{
                    $t('print.designer.format')
                  }}</TypographyText>
                  <Select
                    v-model:value="selectedColumn.format"
                    class="w-full"
                    :options="[
                      { label: $t('print.designer.formatText'), value: 'text' },
                      {
                        label: $t('print.designer.formatNumber'),
                        value: 'number',
                      },
                      {
                        label: $t('print.designer.formatCurrency'),
                        value: 'currency',
                      },
                    ]"
                  />
                </label>
                <Button danger block @click="removeSelection">
                  {{ $t('print.actions.deleteColumn') }}
                </Button>
              </Flex>
            </template>

            <template v-else-if="selectedTable">
              <Flex vertical :gap="10">
                <TypographyText>{{
                  $t('print.designer.tableProperties')
                }}</TypographyText>
                <div class="property-grid">
                  <label>
                    <TypographyText>X</TypographyText>
                    <InputNumber
                      class="w-full"
                      :min="0"
                      :value="selectedTable.x"
                      @update:value="updateTableNumber('x', $event)"
                    />
                  </label>
                  <label>
                    <TypographyText>Y</TypographyText>
                    <InputNumber
                      class="w-full"
                      :min="0"
                      :value="selectedTable.y"
                      @update:value="updateTableNumber('y', $event)"
                    />
                  </label>
                  <label>
                    <TypographyText>{{
                      $t('print.designer.width')
                    }}</TypographyText>
                    <InputNumber
                      class="w-full"
                      :min="1"
                      :value="selectedTable.width"
                      @update:value="updateTableNumber('width', $event)"
                    />
                  </label>
                  <label>
                    <TypographyText>{{
                      $t('print.designer.height')
                    }}</TypographyText>
                    <InputNumber
                      class="w-full"
                      :min="1"
                      :value="selectedTable.height"
                      @update:value="updateTableNumber('height', $event)"
                    />
                  </label>
                </div>
                <Button danger block @click="removeSelection">
                  {{ $t('print.actions.deleteTable') }}
                </Button>
              </Flex>
            </template>

            <template v-else>
              <Flex vertical :gap="10">
                <TypographyText>{{
                  $t('print.designer.pageProperties')
                }}</TypographyText>
                <div class="property-grid">
                  <label>
                    <TypographyText>{{
                      $t('print.designer.marginTop')
                    }}</TypographyText>
                    <InputNumber
                      class="w-full"
                      :min="0"
                      :value="layout.page.margin.top"
                      @update:value="updateMargin('top', $event)"
                    />
                  </label>
                  <label>
                    <TypographyText>{{
                      $t('print.designer.marginRight')
                    }}</TypographyText>
                    <InputNumber
                      class="w-full"
                      :min="0"
                      :value="layout.page.margin.right"
                      @update:value="updateMargin('right', $event)"
                    />
                  </label>
                  <label>
                    <TypographyText>{{
                      $t('print.designer.marginBottom')
                    }}</TypographyText>
                    <InputNumber
                      class="w-full"
                      :min="0"
                      :value="layout.page.margin.bottom"
                      @update:value="updateMargin('bottom', $event)"
                    />
                  </label>
                  <label>
                    <TypographyText>{{
                      $t('print.designer.marginLeft')
                    }}</TypographyText>
                    <InputNumber
                      class="w-full"
                      :min="0"
                      :value="layout.page.margin.left"
                      @update:value="updateMargin('left', $event)"
                    />
                  </label>
                </div>
                <TypographyText type="secondary">
                  {{ $t('print.designer.dragTip') }}
                </TypographyText>
              </Flex>
            </template>
          </Card>
        </aside>
      </div>
    </div>
  </Page>
</template>

<style scoped>
.print-designer-page :deep(.ant-page-header-heading) {
  align-items: flex-start;
}

.designer-shell {
  display: grid;
  grid-template-columns: 240px minmax(600px, 1fr) 260px;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.designer-sidebar,
.designer-workspace {
  min-height: 0;
  overflow: auto;
}

.designer-workspace {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.designer-canvas-wrap {
  flex: 1;
  min-height: 0;
  padding: 16px;
  overflow: auto;
  background: #f1f5f9;
  border-radius: 8px;
}

.designer-page {
  box-sizing: border-box;
  margin: 0 auto;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 10px rgb(15 23 42 / 12%);
}

.designer-section {
  position: relative;
  width: 100%;
  border: 1px dashed #cbd5e1;
}

.designer-body-section {
  overflow: hidden;
}

.section-label {
  position: absolute;
  top: 1mm;
  right: 1mm;
  z-index: 2;
  padding: 0.5mm 1mm;
  font-size: 2.5mm;
  color: #64748b;
  pointer-events: none;
  background: rgb(241 245 249 / 80%);
}

.designer-element {
  position: absolute;
  z-index: 1;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 1mm;
  overflow: hidden;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  cursor: move;
}

.designer-element:hover,
.designer-element-selected {
  outline: 0.5mm solid #1677ff;
  outline-offset: -0.5mm;
}

.designer-element img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.designer-element .text-muted {
  color: #94a3b8;
}

.designer-detail-table {
  position: absolute;
  z-index: 1;
  font-size: 3.2mm;
  table-layout: fixed;
  border-collapse: collapse;
}

.designer-detail-table th,
.designer-detail-table td {
  padding: 1mm;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  border: 0.25mm solid #94a3b8;
}

.designer-detail-table th {
  cursor: pointer;
  background: #e2e8f0;
}

.designer-detail-table.designer-element-selected {
  outline: 0.5mm solid #1677ff;
  outline-offset: -0.5mm;
}

.designer-table-empty {
  position: absolute;
  inset: 20% 0 0;
}

.field-group + .field-group {
  margin-top: 14px;
}

.field-group-title {
  margin-bottom: 6px;
  font-size: 12px;
  color: #64748b;
}

.field-chip {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 7px 8px;
  margin-bottom: 6px;
  color: inherit;
  text-align: left;
  cursor: grab;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
}

.field-chip:hover {
  color: #1677ff;
  border-color: #1677ff;
}

.field-chip small {
  margin-top: 2px;
  font-size: 10px;
  color: #94a3b8;
}

.property-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.preview-host {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
  overflow: auto;
}

.preview-empty {
  flex: 1;
}

@media (max-width: 1400px) {
  .designer-shell {
    grid-template-columns: 210px minmax(500px, 1fr) 230px;
  }
}

@media print {
  .print-designer-page :deep(.print-page-header),
  .print-designer-page :deep(.preview-host > .ant-card) {
    display: none;
  }
}
</style>
