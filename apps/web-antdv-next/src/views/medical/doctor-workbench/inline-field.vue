<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue';

import { Input, InputNumber, Select } from 'antdv-next';

interface Option {
  label: string;
  value: number | string;
}

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    multiline?: boolean;
    options?: Option[];
    placeholder?: string;
    type?: 'number' | 'select' | 'text';
    unit?: string;
  }>(),
  { disabled: false, multiline: false, options: () => [], type: 'text' },
);
const emit = defineEmits<{ commit: [] }>();
const model = defineModel<null | number | string>();
const editing = ref(false);
const controlRef = ref();

const displayValue = computed(() => {
  if (props.type === 'select') {
    return props.options.find((item) => item.value === model.value)?.label;
  }
  return model.value;
});

async function startEdit() {
  if (props.disabled) return;
  editing.value = true;
  await nextTick();
  controlRef.value?.focus?.();
}

function finishEdit() {
  if (!editing.value) return;
  editing.value = false;
  emit('commit');
}
</script>

<template>
  <span class="inline-field" :class="{ 'is-disabled': disabled }">
    <template v-if="editing && !disabled">
      <Select
        v-if="type === 'select'"
        ref="controlRef"
        v-model:value="model"
        class="min-w-28"
        :options="options"
        @blur="finishEdit"
        @change="finishEdit"
      />
      <InputNumber
        v-else-if="type === 'number'"
        ref="controlRef"
        v-model:value="model"
        class="min-w-24"
        :min="0"
        @blur="finishEdit"
        @press-enter="finishEdit"
      />
      <Input.TextArea
        v-else-if="multiline"
        ref="controlRef"
        v-model:value="model"
        auto-size
        class="w-full min-w-80"
        @blur="finishEdit"
      />
      <Input
        v-else
        ref="controlRef"
        v-model:value="model"
        class="min-w-40"
        @blur="finishEdit"
        @press-enter="finishEdit"
      />
    </template>
    <button v-else class="inline-field__display" type="button" @click="startEdit">
      <span v-if="displayValue !== null && displayValue !== undefined && displayValue !== ''">
        {{ displayValue }}<span v-if="unit" class="ml-1 text-muted-foreground">{{ unit }}</span>
      </span>
      <span v-else class="inline-field__placeholder">{{ placeholder }}</span>
    </button>
  </span>
</template>

<style scoped>
.inline-field {
  display: inline-flex;
  min-width: 7rem;
  max-width: 100%;
  vertical-align: middle;
}

.inline-field__display {
  min-height: 30px;
  width: 100%;
  cursor: text;
  border: 0;
  border-bottom: 1px dashed hsl(var(--border));
  background: rgb(254 249 195 / 45%);
  padding: 2px 6px;
  text-align: left;
  line-height: 24px;
}

.inline-field__display:hover {
  border-bottom-color: hsl(var(--primary));
  background: rgb(254 249 195 / 80%);
}

.inline-field__placeholder {
  color: hsl(var(--muted-foreground));
}

.is-disabled .inline-field__display {
  cursor: default;
  background: transparent;
}
</style>
