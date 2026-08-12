<script lang="ts" setup>
import type { MedicalOutpatientApi } from '#/api/medical';

import { computed, h, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Input,
  message,
  Modal,
  Space,
  Table,
  Tag,
} from 'antdv-next';

import {
  getPrescriptionReviewDetailApi,
  reviewPrescriptionApi,
} from '#/api/medical';
import { $t } from '#/locales';

const emit = defineEmits<{ success: [] }>();
const prescription = ref<MedicalOutpatientApi.Prescription>();
const title = computed(() =>
  prescription.value
    ? `${$t('medical.prescriptionReview.detail')} · ${prescription.value.prescriptionNo}`
    : $t('medical.prescriptionReview.detail'),
);
const reviewItems = computed(() =>
  prescription.value?.submissionItems.length
    ? prescription.value.submissionItems
    : (prescription.value?.items ?? []),
);
const columns = computed(() => [
  { dataIndex: 'productName', key: 'productName', title: $t('medical.workbench.medicine') },
  { dataIndex: 'specName', key: 'specName', title: $t('medical.workbench.specification') },
  { dataIndex: 'singleDose', key: 'singleDose', title: $t('medical.workbench.singleDose') },
  { dataIndex: 'medicationRoute', key: 'medicationRoute', title: $t('medical.workbench.route') },
  { dataIndex: 'frequency', key: 'frequency', title: $t('medical.workbench.frequencyLabel') },
  { dataIndex: 'courseDays', key: 'courseDays', title: $t('medical.workbench.courseDays') },
  { dataIndex: 'dispenseQuantity', key: 'dispenseQuantity', title: $t('medical.workbench.totalQuantity') },
]);

const [Drawer, drawerApi] = useVbenDrawer({
  footer: false,
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const { prescriptionId } = drawerApi.getData<{ prescriptionId: string }>();
    prescription.value = await getPrescriptionReviewDetailApi(prescriptionId);
  },
});

function review(approved: 0 | 1) {
  if (!prescription.value) return;
  let opinion = '';
  Modal.confirm({
    content: () =>
      h(Input.TextArea, {
        maxlength: 1000,
        'onUpdate:value': (value?: number | string) =>
          (opinion = String(value ?? '')),
        placeholder:
          approved === 1
            ? $t('medical.prescriptionReview.opinionOptional')
            : $t('medical.prescriptionReview.opinionRequired'),
        rows: 4,
        showCount: true,
      }),
    async onOk() {
      if (approved === 0 && !opinion.trim()) {
        message.warning($t('medical.prescriptionReview.opinionRequired'));
        return Promise.reject(new Error('review opinion required'));
      }
      prescription.value = await reviewPrescriptionApi(
        prescription.value!.prescriptionId,
        { approved, opinion: opinion.trim() || null },
      );
      message.success($t('medical.prescriptionReview.reviewSuccess'));
      emit('success');
    },
    title:
      approved === 1
        ? $t('medical.prescriptionReview.approve')
        : $t('medical.prescriptionReview.reject'),
  });
}
</script>

<template>
  <Drawer class="w-[1100px]" :title="title">
    <template v-if="prescription">
      <Descriptions bordered size="small" :column="3">
        <DescriptionsItem :label="$t('medical.prescriptionReview.patientName')">
          {{ prescription.patientName }}（{{ prescription.patientNo }}）
        </DescriptionsItem>
        <DescriptionsItem :label="$t('medical.prescriptionReview.doctorName')">
          {{ prescription.doctorName }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('medical.prescriptionReview.departmentName')">
          {{ prescription.departmentName }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('medical.prescriptionReview.status')">
          <Tag :color="prescription.status === 20 ? 'success' : prescription.status === 30 ? 'error' : 'processing'">
            {{ $t(`medical.workbench.prescriptionStatus${prescription.status}`) }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem :label="$t('medical.prescriptionReview.version')">
          v{{ prescription.currentVersion }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('medical.prescriptionReview.registrationNo')">
          {{ prescription.registrationNo }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('medical.workbench.diagnosis')" :span="3">
          {{
            prescription.submissionDiagnoses
              .map((item) => `${item.icdCode} ${item.icdName}`)
              .join('、') || '-'
          }}
        </DescriptionsItem>
        <DescriptionsItem :label="$t('medical.workbench.allergyHistory')" :span="3">
          {{ prescription.latestSubmission?.allergyHistory || '-' }}
        </DescriptionsItem>
      </Descriptions>

      <Table
        class="mt-4"
        :columns="columns"
        :data-source="reviewItems"
        :pagination="false"
        row-key="itemId"
        size="small"
      >
        <template #bodyCell="{ column, record: item }">
          <template v-if="column.key === 'singleDose'">
            {{ item.singleDose }} {{ item.doseUnit }}
          </template>
          <template v-else-if="column.key === 'frequency'">
            {{ $t(`medical.workbench.frequency.${item.frequency}`) }}
          </template>
          <template v-else-if="column.key === 'dispenseQuantity'">
            {{ item.dispenseQuantity }} {{ item.dispenseUnit }}
          </template>
        </template>
      </Table>

      <div v-if="prescription.latestSubmission?.reviewOpinion" class="mt-4 rounded-md bg-muted p-3">
        <strong>{{ $t('medical.workbench.reviewOpinion') }}：</strong>
        {{ prescription.latestSubmission.reviewOpinion }}
      </div>

      <Space v-if="prescription.status === 10" class="mt-5 flex justify-end">
        <Button danger @click="review(0)">{{ $t('medical.prescriptionReview.reject') }}</Button>
        <Button type="primary" @click="review(1)">{{ $t('medical.prescriptionReview.approve') }}</Button>
      </Space>
    </template>
  </Drawer>
</template>
