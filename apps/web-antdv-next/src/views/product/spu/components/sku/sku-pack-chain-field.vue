<script lang="ts" setup>
import { computed } from 'vue';

import { InputNumber, Select, TypographyText } from 'antdv-next';

import { getLocalDictList } from '#/dicts';
import { $t } from '#/locales';

export interface SkuPackChainValue {
  cartonConversion?: number;
  cartonUnitName?: string;
  minUnitName?: string;
  packConversion?: number;
  packageUnitName?: string;
}

const emit = defineEmits<{
  blur: [];
  change: [value: SkuPackChainValue];
}>();

const modelValue = defineModel<SkuPackChainValue>({
  default: () => ({}),
});

const minUnitOptions = computed(() => getLocalDictList('PRODUCT_MIN_UNIT'));
const packageUnitOptions = computed(() =>
  getLocalDictList('PRODUCT_PACKAGE_UNIT'),
);
const cartonUnitOptions = computed(() =>
  getLocalDictList('PRODUCT_CARTON_UNIT'),
);

function updateValue(
  field: keyof SkuPackChainValue,
  value: null | number | string | undefined,
) {
  const nextValue = {
    ...modelValue.value,
    [field]: value ?? undefined,
  };
  modelValue.value = nextValue;
  emit('change', nextValue);
}
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <div class="flex flex-wrap items-center gap-2">
      <InputNumber
        class="w-28"
        :max="999_999"
        :min="1"
        :placeholder="$t('product.sku.packConversion')"
        :precision="0"
        :step="1"
        :value="modelValue.packConversion"
        @blur="emit('blur')"
        @change="(value) => updateValue('packConversion', value)"
      />
      <Select
        allow-clear
        class="w-28"
        :options="minUnitOptions"
        :placeholder="$t('product.sku.minUnitName')"
        show-search
        :value="modelValue.minUnitName"
        @blur="emit('blur')"
        @change="(value) => updateValue('minUnitName', value as string)"
      />
      <span class="text-gray-500">=1</span>
      <Select
        allow-clear
        class="w-28"
        :options="packageUnitOptions"
        :placeholder="$t('product.sku.packageUnitName')"
        show-search
        :value="modelValue.packageUnitName"
        @blur="emit('blur')"
        @change="(value) => updateValue('packageUnitName', value as string)"
      />
      <TypographyText>例:20粒=1盒</TypographyText>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <InputNumber
        class="w-28"
        :max="999_999"
        :min="1"
        :placeholder="$t('product.sku.cartonConversion')"
        :precision="0"
        :step="1"
        :value="modelValue.cartonConversion"
        @blur="emit('blur')"
        @change="(value) => updateValue('cartonConversion', value)"
      />
      <Select
        allow-clear
        class="w-28"
        :options="packageUnitOptions"
        :placeholder="$t('product.sku.packageUnitName')"
        show-search
        :value="modelValue.packageUnitName"
        @blur="emit('blur')"
        @change="(value) => updateValue('packageUnitName', value as string)"
      />
      <span class="text-gray-500">=1</span>
      <Select
        allow-clear
        class="w-28"
        :options="cartonUnitOptions"
        :placeholder="$t('product.sku.cartonUnitName')"
        show-search
        :value="modelValue.cartonUnitName"
        @blur="emit('blur')"
        @change="(value) => updateValue('cartonUnitName', value as string)"
      />
      <TypographyText>例:20盒=1箱</TypographyText>
    </div>
  </div>
</template>
