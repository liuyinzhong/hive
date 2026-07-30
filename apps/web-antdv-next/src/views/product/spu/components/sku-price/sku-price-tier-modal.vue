<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';
import type { ProductSkuApi } from '#/api/product';

import { computed, ref } from 'vue';

import { useAccess } from '@vben/access';
import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm, z } from '#/adapter/form';
import {
  getProductSkuPriceTiersApi,
  saveProductSkuPriceTiersApi,
} from '#/api/product';
import { $t } from '#/locales';

interface ModalData {
  price: ProductSkuApi.ProductSkuPrice;
  skuId: string;
}

interface TierFormValues extends Record<string, unknown> {
  tiers: ProductSkuApi.SaveProductSkuPriceTierItem[];
}

function encodeTierFormValues(values: Readonly<TierFormValues>) {
  return {
    ...values,
    tiers: (values.tiers || []).map((tier) => {
      const maxQuantity =
        tier.maxQuantity === undefined || tier.maxQuantity === null
          ? null
          : Number(tier.maxQuantity);

      return {
        maxQuantity,
        minQuantity: Number(tier.minQuantity),
        ...(tier.tierId ? { tierId: tier.tierId } : {}),
        tierPrice: String(tier.tierPrice).trim(),
      };
    }),
  };
}

type TierSubmitValues = ReturnType<typeof encodeTierFormValues>;

function decodeTierFormValues(
  values: Readonly<TierSubmitValues>,
): TierFormValues {
  return {
    ...values,
    tiers: values.tiers.map((tier) => ({
      ...tier,
      maxQuantity: tier.maxQuantity ?? undefined,
    })),
  };
}

const emit = defineEmits<{
  success: [price: ProductSkuApi.ProductSkuPrice];
}>();

const { hasAccessByCodes } = useAccess();
const price = ref<ProductSkuApi.ProductSkuPrice>();
const skuId = ref<string>();

const title = computed(() => $t('product.skuPriceTier.manageTitle'));

const schema: VbenFormSchema<TierFormValues>[] = [
  {
    arrayProps: {
      addButtonText: $t('product.skuPriceTier.add'),
      createRow: () => ({
        maxQuantity: undefined,
        minQuantity: 1,
        tierPrice: '',
      }),
    },
    children: [
      {
        component: 'InputNumber',
        componentProps: (ctx) => ({
          min: 1,
          placeholder: `${$t('product.skuPriceTier.minQuantity')} ${
            (ctx.rowIndex ?? 0) + 1
          }`,
          precision: 0,
        }),
        fieldName: 'minQuantity',
        label: $t('product.skuPriceTier.minQuantity'),
        rules: 'required',
      },
      {
        component: 'InputNumber',
        componentProps: {
          min: 1,
          placeholder: $t('product.skuPriceTier.maxQuantityPlaceholder'),
          precision: 0,
        },
        fieldName: 'maxQuantity',
        label: $t('product.skuPriceTier.maxQuantity'),
      },
      {
        component: 'InputNumber',
        componentProps: {
          max: 9999.9999,
          min: 0.0001,
          precision: 4,
          prefix: '¥',
          stringMode: true,
        },
        fieldName: 'tierPrice',
        label: $t('product.skuPriceTier.tierPrice'),
        rules: z
          .string()
          .trim()
          .min(1, $t('product.skuPriceTier.invalidPrice')),
      },
    ],
    defaultValue: [],
    fieldName: 'tiers',
    formItemClass: 'col-span-1',
    label: $t('product.skuPriceTier.tiers'),
    rules: z.array(z.any()),
    type: 'array',
  },
];

const [Form, formApi] = useVbenForm({
  codec: {
    decode: decodeTierFormValues,
    encode: encodeTierFormValues,
  },
  commonConfig: {
    componentProps: { class: 'w-full' },
    labelWidth: 90,
  },
  handleSubmit: async (values) => {
    await saveTiers(values.tiers);
  },
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    if (!hasAccessByCodes(['product:skuPriceTier:save'])) {
      message.error($t('product.skuPriceTier.noSaveAccess'));
      return;
    }
    await formApi.validateAndSubmit();
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;

    const data = modalApi.getData<ModalData>();
    skuId.value = data.skuId;
    price.value = data.price;
    await formApi.reset();
    await loadTiers();
  },
});

async function loadTiers() {
  if (!skuId.value || !price.value?.priceId) return;
  const tiers = await getProductSkuPriceTiersApi(
    skuId.value,
    price.value.priceId,
  );
  await formApi.setValues({
    tiers: tiers.map((tier) => ({
      maxQuantity: tier.maxQuantity ?? undefined,
      minQuantity: tier.minQuantity,
      tierId: tier.tierId,
      tierPrice: tier.tierPrice,
    })),
  });
}

function validateTiers(tiers: ProductSkuApi.SaveProductSkuPriceTierItem[]) {
  const normalized = tiers.map((tier) => ({
    ...tier,
    maxQuantity: tier.maxQuantity ?? null,
  }));
  const minQuantitySet = new Set<number>();

  for (const tier of normalized) {
    if (!Number.isInteger(tier.minQuantity) || tier.minQuantity < 1) {
      message.error($t('product.skuPriceTier.invalidQuantity'));
      return false;
    }
    if (
      tier.maxQuantity !== null &&
      (!Number.isInteger(tier.maxQuantity) ||
        tier.maxQuantity < tier.minQuantity)
    ) {
      message.error($t('product.skuPriceTier.maxLessThanMin'));
      return false;
    }
    if (minQuantitySet.has(tier.minQuantity)) {
      message.error($t('product.skuPriceTier.duplicateMinQuantity'));
      return false;
    }
    minQuantitySet.add(tier.minQuantity);
    if (
      !/^\d+(\.\d{1,4})?$/.test(tier.tierPrice) ||
      Number(tier.tierPrice) <= 0
    ) {
      message.error($t('product.skuPriceTier.invalidPrice'));
      return false;
    }
  }

  const sorted = normalized.toSorted(
    (first, second) => first.minQuantity - second.minQuantity,
  );
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (!previous || !current) continue;
    if (
      previous.maxQuantity === null ||
      current.minQuantity <= previous.maxQuantity
    ) {
      message.error($t('product.skuPriceTier.intervalOverlap'));
      return false;
    }
  }

  return true;
}

async function saveTiers(tiers: ProductSkuApi.SaveProductSkuPriceTierItem[]) {
  if (!skuId.value || !price.value?.priceId) return;
  if (!validateTiers(tiers)) return;

  modalApi.lock();
  try {
    const updatedPrice = await saveProductSkuPriceTiersApi(
      skuId.value,
      price.value.priceId,
      {
        expectedPriceRowVersion: price.value.rowVersion,
        tiers,
      },
    );
    price.value = updatedPrice;
    await loadTiers();
    message.success($t('product.skuPriceTier.saveSuccess'));
    emit('success', updatedPrice);
  } finally {
    modalApi.unlock();
  }
}
</script>

<template>
  <Modal class="w-[860px]" :title="title">
    <Form />
  </Modal>
</template>
