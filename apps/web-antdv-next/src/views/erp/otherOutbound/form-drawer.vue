<script lang="ts" setup>
import type { ErpOtherOutboundApi } from '#/api/erp';
import type { OtherOutboundFormValues } from './data';

import dayjs from 'dayjs';
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Alert, message, Modal } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { createOtherOutboundApi, getInventoryBalanceListApi } from '#/api/erp';
import { $t } from '#/locales';

import {
  createOtherOutboundFormItem,
  setOtherOutboundActiveWarehouse,
  useOtherOutboundFormSchema,
} from './data';

const emit = defineEmits<{ success: [] }>();

const initialValuesSnapshot = ref('');
const skipCloseConfirm = ref(false);

function createInitialValues(): OtherOutboundFormValues {
  return {
    items: [createOtherOutboundFormItem()],
    outboundDate: dayjs().format('YYYY-MM-DD'),
    remark: '',
    warehouseId: '',
  };
}

function encodeFormValues(
  values: Readonly<OtherOutboundFormValues>,
): ErpOtherOutboundApi.CreateOtherOutbound {
  return {
    items: (values.items || []).map((item) => ({
      balanceId: item.balanceId,
      quantity:
        item.traceMode === 'REQUIRED'
          ? item.traceCodes?.length || 0
          : Number(item.quantity),
      remark: item.remark?.trim() || null,
      traceCodes: item.traceCodes || [],
    })),
    outboundDate: values.outboundDate,
    remark: values.remark?.trim() || null,
    warehouseId: values.warehouseId,
  };
}

function validateItems(items: OtherOutboundFormValues['items']) {
  const seen = new Map<string, number>();
  const seenTraceCodes = new Map<string, number>();
  for (const [index, item] of (items || []).entries()) {
    const lineNo = index + 1;
    if (!item.balanceId) {
      message.error($t('erp.otherOutbound.inventoryBalanceRequired', [lineNo]));
      return false;
    }
    const traceCodes = item.traceCodes || [];
    if (item.traceMode === 'REQUIRED' && traceCodes.length < 1) {
      message.error($t('erp.inventory.traceCodesRequired', [lineNo]));
      return false;
    }
    if (
      item.traceMode !== 'REQUIRED' &&
      (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1)
    ) {
      message.error($t('erp.otherOutbound.quantityInvalid', [lineNo]));
      return false;
    }
    for (const traceCode of traceCodes) {
      const duplicateLineNo = seenTraceCodes.get(traceCode);
      if (duplicateLineNo) {
        message.error(
          $t('erp.inventory.duplicateTraceCodeAcrossLines', [
            traceCode,
            lineNo,
            duplicateLineNo,
          ]),
        );
        return false;
      }
      seenTraceCodes.set(traceCode, lineNo);
    }
    const duplicateLineNo = seen.get(item.balanceId);
    if (duplicateLineNo) {
      message.error(
        $t('erp.otherOutbound.duplicateItem', [lineNo, duplicateLineNo]),
      );
      return false;
    }
    seen.set(item.balanceId, lineNo);
  }
  return true;
}

function confirmDiscard() {
  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      content: $t('erp.otherOutbound.discardConfirm'),
      onCancel: () => resolve(false),
      onOk: () => resolve(true),
      title: $t('erp.otherOutbound.discardTitle'),
    });
  });
}

async function hasFormChanges() {
  if (!initialValuesSnapshot.value) return false;
  const values = await formApi.getValues();
  return JSON.stringify(values) !== initialValuesSnapshot.value;
}

async function warnInventoryShortage(values: OtherOutboundFormValues) {
  try {
    const items = values.items || [];
    const { items: balances } = await getInventoryBalanceListApi({
      balanceIds: items.map((item) => item.balanceId).join(','),
      page: 1,
      pageSize: 100,
      warehouseId: values.warehouseId,
    });
    const balanceMap = new Map(
      balances.map((balance) => [balance.balanceId, balance]),
    );
    const warnings = items.flatMap((item, index) => {
      const balance = balanceMap.get(item.balanceId);
      if (!balance || balance.packageUnitCount >= Number(item.quantity)) {
        return [];
      }
      return [
        $t('erp.otherOutbound.stockPrecheckWarning', [
          index + 1,
          balance.skuCode,
          balance.batchNo,
          item.quantity,
          balance.packageUnitName,
          balance.packageUnitCount,
          balance.packageUnitName,
        ]),
      ];
    });
    if (warnings.length > 0) {
      message.warning(warnings.join('；'));
    }
  } catch {
    message.warning($t('erp.otherOutbound.stockPrecheckFailed'));
  }
}

const [Form, formApi] = useVbenForm<OtherOutboundFormValues>({
  commonConfig: {
    componentProps: { class: 'w-full' },
    labelWidth: 90,
  },
  handleSubmit: async (values) => {
    await saveOtherOutbound(values);
  },
  schema: useOtherOutboundFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 gap-x-4 md:grid-cols-2',
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onBeforeClose() {
    if (skipCloseConfirm.value || !(await hasFormChanges())) return true;
    return confirmDiscard();
  },
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    await formApi.validateAndSubmit();
  },
  async onOpenChange(isOpen) {
    if (!isOpen) {
      setOtherOutboundActiveWarehouse();
      return;
    }
    setOtherOutboundActiveWarehouse();
    const values = createInitialValues();
    await formApi.reset();
    await formApi.setValues(values);
    initialValuesSnapshot.value = JSON.stringify(values);
  },
});

async function saveOtherOutbound(values: OtherOutboundFormValues) {
  if (!validateItems(values.items)) return;

  drawerApi.lock();
  try {
    await warnInventoryShortage(values);
    const result = await createOtherOutboundApi(encodeFormValues(values));
    message.success($t('erp.otherOutbound.createSuccess', [result.outboundNo]));
    skipCloseConfirm.value = true;
    await drawerApi.close();
    emit('success');
  } finally {
    skipCloseConfirm.value = false;
    drawerApi.unlock();
  }
}
</script>

<template>
  <Drawer class="w-[1500px]" :title="$t('erp.otherOutbound.create')">
    <Alert
      class="mb-4"
      show-icon
      :message="$t('erp.otherOutbound.createTip')"
      type="info"
    />
    <Form />
  </Drawer>
</template>
