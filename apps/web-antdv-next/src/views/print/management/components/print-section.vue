<script lang="ts" setup>
import type { CSSProperties } from 'vue';
import type { PrintDocumentData, PrintSection } from '#/api/print';

import { computed } from 'vue';

import { getElementText, elementStyle } from '../print-utils';

const props = defineProps<{
  data: PrintDocumentData;
  pageNumber: number;
  section: PrintSection;
  totalPages: number;
}>();

const sectionStyle = computed<CSSProperties>(() => ({
  height: `${props.section.height}mm`,
}));

function getText(element: PrintSection['elements'][number]) {
  return getElementText(
    element,
    props.data,
    props.pageNumber,
    props.totalPages,
  );
}
</script>

<template>
  <section class="print-section" :style="sectionStyle">
    <template v-for="element in section.elements" :key="element.id">
      <div
        v-if="element.kind === 'text' || element.kind === 'field'"
        class="print-element print-element-text"
        :style="elementStyle(element)"
      >
        {{ getText(element) }}
      </div>
      <img
        v-else-if="element.kind === 'image' && element.imageUrl"
        alt=""
        class="print-element print-element-image"
        :src="element.imageUrl"
        :style="elementStyle(element)"
      />
      <div
        v-else-if="element.kind === 'line'"
        class="print-element print-element-line"
        :style="elementStyle(element)"
      />
      <div
        v-else-if="element.kind === 'signature'"
        class="print-element print-element-signature"
        :style="elementStyle(element)"
      >
        {{ element.text }}
      </div>
    </template>
  </section>
</template>

<style scoped>
.print-section {
  position: relative;
  width: 100%;
  flex: none;
}

.print-element {
  position: absolute;
  box-sizing: border-box;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.print-element-text {
  display: flex;
  align-items: center;
}

.print-element-image {
  object-fit: contain;
}

.print-element-line {
  border-top: 0.3mm solid #1f2937;
}

.print-element-signature {
  display: flex;
  align-items: center;
  white-space: pre;
}
</style>
