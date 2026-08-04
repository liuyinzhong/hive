<script lang="ts" setup>
import type { CSSProperties } from 'vue';
import type {
  PrintDocumentData,
  PrintLayout,
  PrintTableColumn,
} from '#/api/print';

import { computed } from 'vue';

import PrintSection from './print-section.vue';
import {
  getPrintPageSize,
  getTableCellText,
  splitPrintItems,
} from '../print-utils';

const props = defineProps<{
  data: PrintDocumentData;
  layout: PrintLayout;
}>();

const pageSize = computed(() => getPrintPageSize(props.layout));
const itemPages = computed(() => splitPrintItems(props.data.items));
const pages = computed(() =>
  itemPages.value.map((items, index) => ({
    index,
    isFirst: index === 0,
    isLast: index === itemPages.value.length - 1,
    items,
  })),
);
const pageStyle = computed<CSSProperties>(() => ({
  '--print-page-height': `${pageSize.value.height}mm`,
  '--print-page-width': `${pageSize.value.width}mm`,
  '--print-margin-bottom': `${props.layout.page.margin.bottom}mm`,
  '--print-margin-left': `${props.layout.page.margin.left}mm`,
  '--print-margin-right': `${props.layout.page.margin.right}mm`,
  '--print-margin-top': `${props.layout.page.margin.top}mm`,
}));

function getColumnWidth(width: number) {
  return { width: `${width}mm` };
}

function getCellText(column: PrintTableColumn, item: Record<string, unknown>) {
  return getTableCellText(
    column,
    item,
    props.data,
    pages.value.findIndex((page) => page.items.includes(item)) + 1,
    pages.value.length,
  );
}
</script>

<template>
  <div
    class="print-renderer"
    :class="`print-${layout.page.orientation}`"
    :style="pageStyle"
  >
    <article
      v-for="page in pages"
      :key="page.index"
      class="print-page"
      :style="{
        height: 'var(--print-page-height)',
        width: 'var(--print-page-width)',
      }"
    >
      <PrintSection
        :data="data"
        :page-number="page.index + 1"
        :section="layout.sections.pageHeader"
        :total-pages="pages.length"
      />
      <PrintSection
        v-if="page.isFirst"
        :data="data"
        :page-number="page.index + 1"
        :section="layout.sections.documentHeader"
        :total-pages="pages.length"
      />
      <section
        class="print-section print-body-section"
        :style="{ height: `${layout.sections.body.height}mm` }"
      >
        <table
          v-if="layout.sections.body.table"
          class="print-detail-table"
          :style="{
            height: `${layout.sections.body.table.height}mm`,
            left: `${layout.sections.body.table.x}mm`,
            top: `${layout.sections.body.table.y}mm`,
            width: `${layout.sections.body.table.width}mm`,
          }"
        >
          <colgroup>
            <col
              v-for="column in layout.sections.body.table.columns"
              :key="column.id"
              :style="getColumnWidth(column.width)"
            />
          </colgroup>
          <thead>
            <tr>
              <th
                v-for="column in layout.sections.body.table.columns"
                :key="column.id"
              >
                {{ column.title }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, itemIndex) in page.items"
              :key="String(item.inboundItemId ?? itemIndex)"
            >
              <td
                v-for="column in layout.sections.body.table.columns"
                :key="column.id"
              >
                {{ getCellText(column, item) }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <PrintSection
        v-if="page.isLast"
        :data="data"
        :page-number="page.index + 1"
        :section="layout.sections.documentFooter"
        :total-pages="pages.length"
      />
      <PrintSection
        :data="data"
        :page-number="page.index + 1"
        :section="layout.sections.pageFooter"
        :total-pages="pages.length"
      />
      <div v-if="!page.isLast" class="print-continuation">（续）</div>
    </article>
  </div>
</template>

<style scoped>
.print-renderer {
  display: flex;
  flex-direction: column;
  gap: 8mm;
  align-items: center;
  color: #1f2937;
}

.print-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: var(--print-margin-top) var(--print-margin-right)
    var(--print-margin-bottom) var(--print-margin-left);
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 8px rgb(15 23 42 / 10%);
  page-break-after: always;
}

.print-page:last-child {
  page-break-after: auto;
}

.print-section {
  position: relative;
  width: 100%;
  flex: none;
}

.print-body-section {
  position: relative;
  flex: none;
}

.print-detail-table {
  position: absolute;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 3.2mm;
}

.print-detail-table th,
.print-detail-table td {
  min-height: 7mm;
  padding: 1.2mm 1mm;
  overflow-wrap: anywhere;
  border: 0.25mm solid #4b5563;
  line-height: 1.25;
  text-align: left;
  vertical-align: middle;
  white-space: pre-wrap;
}

.print-detail-table th {
  font-weight: 600;
  text-align: center;
  background: #f3f4f6;
}

.print-continuation {
  align-self: flex-end;
  height: 0;
  margin-top: -5mm;
  font-size: 3mm;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }

  @page print-landscape {
    size: A4 landscape;
    margin: 0;
  }

  .print-renderer.print-landscape {
    page: print-landscape;
  }

  .print-renderer {
    gap: 0;
  }

  .print-page {
    box-shadow: none;
  }
}
</style>
