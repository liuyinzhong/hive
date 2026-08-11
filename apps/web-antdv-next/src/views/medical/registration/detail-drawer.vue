<script lang="ts" setup>
import type { MedicalRegistrationApi } from '#/api/medical';

import { computed, h, ref } from 'vue';

import { useVbenDrawer, VbenDescriptions } from '@vben/common-ui';

import { Divider, Empty, Spin, Tag, Timeline, TimelineItem } from 'antdv-next';

import { getRegistrationDetailApi } from '#/api/medical';
import DictTag from '#/components/DictTag/index.vue';
import { $t } from '#/locales';

import {
  registrationMethodLabel,
  registrationStatusColor,
  registrationStatusLabel,
} from './constants';

const detail = ref<MedicalRegistrationApi.Registration>();
const loading = ref(false);

const items = computed(() => {
  const value = detail.value;
  return [
    {
      content: value?.registrationNo || '-',
      label: $t('medical.registration.registrationNo'),
    },
    {
      content: value?.patientNo || '-',
      label: $t('medical.registration.patientNo'),
    },
    {
      content: value?.patientName || '-',
      label: $t('medical.registration.patientName'),
    },
    {
      content: value?.patientPhone || '-',
      label: $t('medical.registration.patientPhone'),
    },
    {
      content: value?.patientIdNumber || '-',
      label: $t('medical.registration.patientIdNumber'),
    },
    {
      content: () =>
        value
          ? h(DictTag, {
              dictType: 'MED_PATIENT_ID_TYPE',
              value: value.patientIdType,
            })
          : '-',
      label: $t('medical.registration.patientIdType'),
    },
    {
      content: () =>
        value
          ? h(DictTag, { dictType: 'GENDER', value: value.patientGender })
          : '-',
      label: $t('medical.registration.gender'),
    },
    {
      content: value?.patientBirthDate || '-',
      label: $t('medical.registration.birthDate'),
    },
    {
      content: value?.departmentName || '-',
      label: $t('medical.registration.department'),
    },
    {
      content: value?.doctorName || '-',
      label: $t('medical.registration.doctor'),
    },
    {
      content: value?.registrationTypeName || '-',
      label: $t('medical.registration.registrationType'),
    },
    {
      content: value ? registrationMethodLabel(value.registrationMethod) : '-',
      label: $t('medical.registration.registrationMethod'),
    },
    {
      content: value?.scheduleDate || '-',
      label: $t('medical.registration.visitDate'),
    },
    {
      content: value
        ? `${value.startTime.slice(0, 5)}-${value.endTime.slice(0, 5)}`
        : '-',
      label: $t('medical.registration.visitTime'),
    },
    ...(value?.queueInfo
      ? [
          {
            content: String(value.queueInfo.queueSequence),
            label: $t('medical.registration.queueSequence'),
          },
          {
            content: $t(
              `medical.registration.queueStatus${value.queueInfo.queueStatus}`,
            ),
            label: $t('medical.registration.queueStatus'),
          },
          {
            content: String(value.queueInfo.callCount),
            label: $t('medical.registration.callCount'),
          },
          {
            content: value.queueInfo.createDate,
            label: $t('medical.registration.checkInTime'),
          },
        ]
      : []),
    {
      content: value ? `¥${value.feeAmount}` : '-',
      label: $t('medical.registration.feeAmount'),
    },
    { content: value?.remark || '-', label: $t('medical.registration.remark') },
    {
      content: value?.createDate || '-',
      label: $t('medical.registration.createDate'),
    },
  ];
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const { registrationId } = drawerApi.getData<{ registrationId: string }>();
    loading.value = true;
    try {
      detail.value = await getRegistrationDetailApi(registrationId);
    } finally {
      loading.value = false;
    }
  },
});
</script>

<template>
  <Drawer
    class="w-[820px]"
    :footer="false"
    :title="$t('medical.registration.detail')"
  >
    <Spin :spinning="loading">
      <template v-if="detail">
        <div class="mb-3 flex items-center gap-2">
          <span>{{ $t('medical.registration.currentStatus') }}</span>
          <Tag :color="registrationStatusColor(detail.status)">
            {{ registrationStatusLabel(detail.status) }}
          </Tag>
        </div>
        <VbenDescriptions bordered :column="2" :items="items" size="small" />
        <Divider>{{ $t('medical.registration.lifecycle') }}</Divider>
        <Empty v-if="detail.lifecycleRecords.length === 0" />
        <Timeline v-else>
          <TimelineItem
            v-for="record in detail.lifecycleRecords"
            :key="record.lifecycleId"
            :color="registrationStatusColor(record.toStatus)"
          >
            <div class="font-medium">
              {{
                record.fromStatus == null
                  ? $t('medical.registration.created')
                  : `${registrationStatusLabel(record.fromStatus)} → ${registrationStatusLabel(record.toStatus)}`
              }}
            </div>
            <div class="text-muted-foreground">
              {{ record.operatedAt }} ·
              {{ record.operatorName || record.operatorId || '-' }}
            </div>
            <div v-if="record.reason">
              {{ $t('medical.registration.reason') }}：{{ record.reason }}
            </div>
            <div v-if="record.refundAmount">
              {{ $t('medical.registration.refundAmount') }}：¥{{
                record.refundAmount
              }}
            </div>
          </TimelineItem>
        </Timeline>
      </template>
    </Spin>
  </Drawer>
</template>
