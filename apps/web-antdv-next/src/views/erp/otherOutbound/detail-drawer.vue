<script lang="ts" setup>
import type { DescriptionsItemType } from '@vben/common-ui';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpOtherOutboundApi } from '#/api/erp';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer, VbenDescriptions } from '@vben/common-ui';

import { Spin } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getOtherOutboundDetailApi } from '#/api/erp';
import { $t } from '#/locales';

import { useOtherOutboundDetailColumns } from './data';

const detail = ref<ErpOtherOutboundApi.OtherOutbound>();
const loading = ref(false);

const basicItems = computed<DescriptionsItemType[]>(() => [
  {
    content: detail.value?.outboundNo || '-',
    label: $t('erp.otherOutbound.outboundNo'),
  },
  {
    content: detail.value?.outboundDate || '-',
    label: $t('erp.otherOutbound.outboundDate'),
  },
  {
    content: detail.value?.warehouseName || '-',
    label: $t('erp.otherOutbound.warehouse'),
  },
  {
    content: detail.value?.lineCount ?? '-',
    label: $t('erp.otherOutbound.lineCount'),
  },
  {
    content: detail.value?.createDate || '-',
    label: $t('erp.otherOutbound.createDate'),
  },
  {
    content: detail.value?.remark || '-',
    label: $t('erp.otherOutbound.remark'),
  },
]);

const [Grid, gridApi] = useVbenVxeGrid<ErpOtherOutboundApi.OtherOutboundItem>({
  gridOptions: {
    columns: useOtherOutboundDetailColumns(),
    height: 420,
    pagerConfig: { enabled: false },
    rowConfig: { keyField: 'outboundItemId' },
    showOverflow: true,
    toolbarConfig: { custom: true, zoom: true },
  } as VxeTableGridOptions<ErpOtherOutboundApi.OtherOutboundItem>,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data =
      drawerApi.getData<
        Pick<ErpOtherOutboundApi.OtherOutbound, 'outboundId'>
      >();
    loading.value = true;
    detail.value = undefined;
    await gridApi.grid?.loadData?.([]);
    try {
      detail.value = await getOtherOutboundDetailApi(data.outboundId);
      await nextTick();
      await gridApi.grid?.loadData?.(detail.value.items || []);
    } finally {
      loading.value = false;
    }
  },
});
</script>

<template>
  <Drawer
    :footer="false"
    class="w-[1280px]"
    :title="$t('erp.otherOutbound.detail')"
  >
    <Spin :spinning="loading">
      <template v-if="detail">
        <VbenDescriptions
          bordered
          :column="2"
          :items="basicItems"
          size="small"
        />
        <Grid :table-title="$t('erp.otherOutbound.items')" />
      </template>
    </Spin>
  </Drawer>
</template>
