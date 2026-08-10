<script lang="ts" setup>
import { computed } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button } from 'antdv-next';

import { $t } from '#/locales';

import TraceCodeModalComponent from './trace-code-modal.vue';

const props = withDefaults(
  defineProps<{
    contextLabel?: string;
    disabled?: boolean;
  }>(),
  { contextLabel: '', disabled: false },
);

const emit = defineEmits<{
  blur: [];
  change: [codes: string[]];
}>();

const modelValue = defineModel<string[]>({ default: () => [] });
const buttonText = computed(() =>
  $t('erp.traceCode.inputWithCount', [modelValue.value.length]),
);

const [TraceCodeModal, traceCodeModalApi] = useVbenModal({
  connectedComponent: TraceCodeModalComponent,
  destroyOnClose: true,
});

function openModal() {
  traceCodeModalApi
    .setData({ codes: [...modelValue.value], contextLabel: props.contextLabel })
    .open();
}

function updateCodes(codes: string[]) {
  modelValue.value = codes;
  emit('change', codes);
  emit('blur');
}
</script>

<template>
  <TraceCodeModal @success="updateCodes" />
  <Button :disabled="disabled" type="link" @click="openModal">
    {{ buttonText }}
  </Button>
</template>
