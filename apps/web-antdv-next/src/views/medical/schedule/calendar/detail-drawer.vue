<script lang="ts" setup>
import type { MedicalScheduleApi } from '#/api/medical';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed, h, nextTick, ref } from 'vue';

import { useVbenDrawer, VbenDescriptions } from '@vben/common-ui';

import { Divider, Spin, Tag } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getScheduleDetailApi } from '#/api/medical';
import DictTag from '#/components/DictTag/index.vue';
import { $t } from '#/locales';

const detail = ref<MedicalScheduleApi.Schedule>();
const loading = ref(false);

const descriptionItems = computed(() => {
  const value = detail.value;
  return [
    {
      content: value?.doctorName || '-',
      label: $t('medical.schedule.doctor'),
    },
    {
      content: value?.doctorNo || '-',
      label: $t('medical.schedule.doctorNo'),
    },
    {
      content: value?.departmentName || '-',
      label: $t('medical.schedule.department'),
    },
    {
      content: value?.departmentCode || '-',
      label: $t('medical.schedule.departmentCode'),
    },
    {
      content: () =>
        value
          ? h(DictTag, {
              dictType: 'MED_REGISTRATION_TYPE',
              value: value.registrationType,
            })
          : '-',
      label: $t('medical.schedule.registrationType'),
    },
    {
      content: () =>
        value
          ? h(DictTag, {
              dictType: 'MED_SCHEDULE_STATUS',
              value: value.status,
            })
          : '-',
      label: $t('medical.schedule.status'),
    },
    {
      content: value?.scheduleDate || '-',
      label: $t('medical.schedule.scheduleDate'),
    },
    {
      content: value
        ? `${value.startTime.slice(0, 5)}–${value.endTime.slice(0, 5)}`
        : '-',
      label: $t('medical.schedule.visitTime'),
    },
    {
      content: value?.feeAmount
        ? `¥${value.feeAmount}`
        : $t('medical.schedule.feePending'),
      label: $t('medical.schedule.feeAmount'),
    },
    {
      content: String(value?.defaultSlotQuota ?? '-'),
      label: $t('medical.schedule.defaultSlotQuota'),
    },
    {
      content: String(value?.totalQuota ?? '-'),
      label: $t('medical.schedule.totalQuota'),
    },
    {
      content: String(value?.bookedQuota ?? '-'),
      label: $t('medical.schedule.bookedQuota'),
    },
    {
      content: String(value?.remainingQuota ?? '-'),
      label: $t('medical.schedule.remainingQuota'),
    },
    {
      content: String(value?.queueCount ?? '-'),
      label: $t('medical.schedule.queueCount'),
    },
    {
      content: value?.publishedAt || '-',
      label: $t('medical.schedule.publishedAt'),
    },
    {
      content: value?.stoppedAt || '-',
      label: $t('medical.schedule.stoppedAt'),
    },
    {
      content: value?.finishedAt || '-',
      label: $t('medical.schedule.finishedAt'),
    },
    {
      content: value?.stopReason || '-',
      label: $t('medical.schedule.stopReason'),
    },
    {
      content: value?.remark || '-',
      label: $t('medical.schedule.remark'),
    },
    {
      content: value?.createDate || '-',
      label: $t('medical.schedule.createDate'),
    },
    {
      content: value?.updateDate || '-',
      label: $t('medical.schedule.updateDate'),
    },
  ];
});

function bookingStatusColor(status: string) {
  const colors: Record<string, string> = {
    available: 'success',
    closed: 'default',
    draft: 'processing',
    finished: 'default',
    full: 'warning',
    stopped: 'error',
  };
  return colors[status] ?? 'default';
}

const [SlotGrid, slotGridApi] = useVbenVxeGrid<MedicalScheduleApi.ScheduleSlot>(
  {
    showSearchForm: false,
    gridOptions: {
      columns: [
        {
          field: 'startTime',
          minWidth: 140,
          slots: { default: 'slotTime' },
          title: $t('medical.schedule.visitTime'),
        },
        {
          align: 'center',
          field: 'quota',
          title: $t('medical.schedule.slotQuota'),
          width: 120,
        },
        {
          align: 'center',
          field: 'bookedQuota',
          title: $t('medical.schedule.bookedQuota'),
          width: 120,
        },
        {
          align: 'center',
          field: 'remainingQuota',
          title: $t('medical.schedule.remainingQuota'),
          width: 120,
        },
        {
          align: 'center',
          field: 'bookingStatus',
          slots: { default: 'bookingStatus' },
          title: $t('medical.schedule.bookingStatus'),
          width: 130,
        },
      ],
      height: 520,
      pagerConfig: { enabled: false },
      rowConfig: { keyField: 'slotId' },
      toolbarConfig: { enabled: false },
    } as VxeTableGridOptions<MedicalScheduleApi.ScheduleSlot>,
  },
);

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) {
      detail.value = undefined;
      await slotGridApi.grid?.loadData?.([]);
      return;
    }

    const { scheduleId } = drawerApi.getData<{ scheduleId: string }>();
    loading.value = true;
    try {
      const value = await getScheduleDetailApi(scheduleId);
      detail.value = value;
      await nextTick();
      await slotGridApi.grid?.loadData?.(value.slots);
    } finally {
      loading.value = false;
    }
  },
});
</script>

<template>
  <Drawer
    class="w-[900px]"
    :footer="false"
    :title="$t('medical.schedule.detail')"
  >
    <Spin :spinning="loading">
      <template v-if="detail">
        <VbenDescriptions
          bordered
          :column="3"
          :items="descriptionItems"
          size="small"
        />

        <SlotGrid>
          <template #slotTime="{ row }">
            {{ row.startTime }}–{{ row.endTime }}
          </template>
          <template #bookingStatus="{ row }">
            <Tag :color="bookingStatusColor(row.bookingStatus)">
              {{ $t(`medical.schedule.bookingStatus_${row.bookingStatus}`) }}
            </Tag>
          </template>
        </SlotGrid>
      </template>
    </Spin>
  </Drawer>
</template>
