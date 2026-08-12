<script lang="ts" setup>
import type { MedicalOutpatientApi } from '#/api/medical';
import type { ProductSkuApi } from '#/api/product';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  Button,
  Empty,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Tag,
} from 'antdv-next';

import {
  createPrescriptionApi,
  getPrescriptionApi,
  submitPrescriptionApi,
  updatePrescriptionApi,
  voidPrescriptionApi,
  withdrawPrescriptionApi,
} from '#/api/medical';
import { getProductSkuOptionsApi } from '#/api/product';
import { getLocalDictList } from '#/dicts';
import { $t } from '#/locales';

interface DrawerData {
  readonly: boolean;
  record: MedicalOutpatientApi.OutpatientRecord;
}

const emit = defineEmits<{ success: [] }>();
const record = ref<MedicalOutpatientApi.OutpatientRecord>();
const prescriptionList = ref<MedicalOutpatientApi.Prescription[]>([]);
const selected = ref<MedicalOutpatientApi.Prescription>();
const productOptions = ref<ProductSkuApi.ProductSkuOption[]>([]);
const recordReadonly = ref(false);

const editable = computed(
  () =>
    selected.value &&
    (selected.value.status === 30 ||
      (!recordReadonly.value && selected.value.status === 0)),
);
const frequencyOptions = computed(() =>
  [
    'QD',
    'BID',
    'TID',
    'QID',
    'QAM',
    'QN',
    'Q8H',
    'Q12H',
    'QOD',
    'QW',
    'STAT',
    'PRN',
    'SOS',
  ].map((value) => ({
    label: $t(`medical.workbench.frequency.${value}`),
    value,
  })),
);
const routeOptions = computed(() => getLocalDictList('MED_MEDICATION_ROUTE'));

const [Drawer, drawerApi] = useVbenDrawer({
  footer: false,
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = drawerApi.getData<DrawerData>();
    record.value = data.record;
    recordReadonly.value = data.readonly;
    prescriptionList.value = data.record.prescriptions.map((item) => ({
      ...item,
      items: item.items.map((detail) => ({ ...detail })),
    }));
    selected.value = prescriptionList.value[0];
    productOptions.value = (
      await getProductSkuOptionsApi({ pageSize: 100 })
    ).filter((item) => item.productType === 'DRUG');
  },
});

async function createPrescription() {
  if (!record.value) return;
  const value = await createPrescriptionApi(record.value.recordId, {
    items: [],
    prescriptionType: 10,
    remark: null,
  });
  prescriptionList.value.unshift(value);
  selected.value = value;
  emit('success');
}

function selectPrescription(item: MedicalOutpatientApi.Prescription) {
  selected.value = {
    ...item,
    items: item.items.map((detail) => ({ ...detail })),
  };
}

function addItem() {
  if (!selected.value) return;
  selected.value.items.push({
    allowSplit: 0,
    approvalNo: '',
    courseDays: 1,
    dispenseQuantity: '',
    dispenseUnit: '',
    doseUnit: '',
    enterpriseName: '',
    frequency: 'TID',
    itemId: `new-${Date.now()}`,
    medicationRoute: '',
    minUnitName: '',
    packConversion: 1,
    packageSpecName: '',
    packageUnitName: '',
    prescriptionId: selected.value.prescriptionId,
    productName: '',
    singleDose: '1',
    skuCode: '',
    skuId: '',
    sort: selected.value.items.length,
    specName: '',
    totalMinQuantity: '',
  });
}

function applyProduct(
  item: MedicalOutpatientApi.PrescriptionItem,
  skuId: string,
) {
  const product = productOptions.value.find((option) => option.skuId === skuId);
  if (!product) return;
  Object.assign(item, {
    allowSplit: product.allowSplit,
    approvalNo: product.approvalNo,
    dosageForm: product.dosageForm,
    doseUnit: product.minUnitName,
    enterpriseName: product.enterpriseName,
    minUnitName: product.minUnitName,
    packConversion: product.packConversion,
    packageSpecName: product.packageSpecName,
    packageUnitName: product.packageUnitName,
    productName: product.productName,
    skuCode: product.skuCode,
    skuId: product.skuId,
    specName: product.specName,
  });
}

function removeItem(index: number) {
  selected.value?.items.splice(index, 1);
}

function buildRequest(): MedicalOutpatientApi.SavePrescription | undefined {
  if (!selected.value) return;
  return {
    items: selected.value.items.map((item, index) => ({
      courseDays: item.courseDays,
      frequency: item.frequency,
      medicationRoute: item.medicationRoute,
      remark: item.remark,
      singleDose: String(item.singleDose),
      skuId: item.skuId,
      sort: index,
      totalMinQuantity: ['PRN', 'SOS'].includes(item.frequency)
        ? String(item.totalMinQuantity || '')
        : null,
      usageInstructions: item.usageInstructions,
    })),
    prescriptionType: 10,
    remark: selected.value.remark,
  };
}

async function save() {
  if (!selected.value) return;
  const request = buildRequest();
  if (!request) return;
  selected.value = await updatePrescriptionApi(
    selected.value.prescriptionId,
    request,
  );
  replaceSelectedInList();
  message.success($t('medical.common.saveSuccess'));
  emit('success');
}

async function saveAndSubmit() {
  await save();
  if (!selected.value) {
    throw new Error('Prescription is not selected');
  }
  return submitPrescriptionApi(selected.value.prescriptionId);
}

function confirmAction(
  content: string,
  action: () => Promise<MedicalOutpatientApi.Prescription>,
) {
  Modal.confirm({
    content,
    async onOk() {
      selected.value = await action();
      replaceSelectedInList();
      message.success($t('medical.workbench.actionSuccess'));
      emit('success');
    },
    title: $t('common.confirm'),
  });
}

function replaceSelectedInList() {
  if (!selected.value) return;
  const index = prescriptionList.value.findIndex(
    (item) => item.prescriptionId === selected.value?.prescriptionId,
  );
  if (index >= 0) prescriptionList.value[index] = selected.value;
}

async function refreshSelected() {
  if (!selected.value) return;
  selected.value = await getPrescriptionApi(selected.value.prescriptionId);
  replaceSelectedInList();
}

function statusColor(status: MedicalOutpatientApi.PrescriptionStatus) {
  return ({ 0: 'default', 10: 'processing', 20: 'success', 30: 'error', 40: 'default' } as const)[status];
}
</script>

<template>
  <Drawer class="w-[1280px]" :title="$t('medical.workbench.prescription')">
    <div class="prescription-layout">
      <aside class="prescription-list">
        <Button
          block
          :disabled="recordReadonly"
          type="primary"
          @click="createPrescription"
        >
          {{ $t('medical.workbench.newPrescription') }}
        </Button>
        <Empty
          v-if="!prescriptionList.length"
          class="mt-8"
          :description="$t('medical.workbench.noPrescription')"
        />
        <button
          v-for="item in prescriptionList"
          :key="item.prescriptionId"
          class="prescription-list-item"
          :class="{ active: item.prescriptionId === selected?.prescriptionId }"
          type="button"
          @click="selectPrescription(item)"
        >
          <div class="flex items-center justify-between gap-2">
            <strong>{{ item.prescriptionNo }}</strong>
            <Tag :color="statusColor(item.status)">
              {{ $t(`medical.workbench.prescriptionStatus${item.status}`) }}
            </Tag>
          </div>
          <div class="mt-1 text-xs text-muted-foreground">
            {{ $t('medical.workbench.medicineCount', [item.items.length]) }}
          </div>
        </button>
      </aside>

      <main class="min-w-0 flex-1">
        <Empty v-if="!selected" :description="$t('medical.workbench.selectPrescription')" />
        <template v-else>
          <div class="mb-3 flex items-center justify-between">
            <div>
              <span class="text-lg font-semibold">{{ selected.prescriptionNo }}</span>
              <Tag class="ml-2" :color="statusColor(selected.status)">
                {{ $t(`medical.workbench.prescriptionStatus${selected.status}`) }}
              </Tag>
            </div>
            <Space>
              <Button @click="refreshSelected">{{ $t('common.refresh') }}</Button>
              <Button v-if="editable" @click="addItem">
                {{ $t('medical.workbench.addMedicine') }}
              </Button>
              <Button v-if="editable" type="primary" @click="save">
                {{ $t('common.save') }}
              </Button>
              <Button
                v-if="selected.status === 0 || selected.status === 30"
                type="primary"
                @click="confirmAction($t('medical.workbench.submitPrescriptionConfirm'), saveAndSubmit)"
              >
                {{ $t('medical.workbench.submitReview') }}
              </Button>
              <Button
                v-if="selected.status === 10"
                @click="confirmAction($t('medical.workbench.withdrawPrescriptionConfirm'), () => withdrawPrescriptionApi(selected!.prescriptionId))"
              >
                {{ $t('medical.workbench.withdraw') }}
              </Button>
              <Button
                v-if="selected.status === 0 || selected.status === 30"
                danger
                @click="confirmAction($t('medical.workbench.voidPrescriptionConfirm'), () => voidPrescriptionApi(selected!.prescriptionId))"
              >
                {{ $t('medical.workbench.void') }}
              </Button>
            </Space>
          </div>

          <div class="medicine-table-wrap">
            <table class="medicine-table">
              <thead>
                <tr>
                  <th>{{ $t('medical.workbench.medicine') }}</th>
                  <th>{{ $t('medical.workbench.singleDose') }}</th>
                  <th>{{ $t('medical.workbench.route') }}</th>
                  <th>{{ $t('medical.workbench.frequencyLabel') }}</th>
                  <th>{{ $t('medical.workbench.courseDays') }}</th>
                  <th>{{ $t('medical.workbench.totalQuantity') }}</th>
                  <th>{{ $t('medical.workbench.instructions') }}</th>
                  <th v-if="editable">{{ $t('medical.common.operation') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in selected.items" :key="item.itemId">
                  <td class="min-w-64">
                    <Select
                      v-if="editable"
                      v-model:value="item.skuId"
                      class="w-full"
                      :field-names="{ label: 'productName', value: 'skuId' }"
                      :options="productOptions"
                      show-search
                      :filter-option="(input: string, option: ProductSkuApi.ProductSkuOption) => `${option.productName}${option.specName}${option.skuCode}`.toLowerCase().includes(input.toLowerCase())"
                      @change="(value: string) => applyProduct(item, value)"
                    />
                    <template v-else>
                      <div>{{ item.productName }} {{ item.specName }}</div>
                      <div class="text-xs text-muted-foreground">{{ item.enterpriseName }}</div>
                    </template>
                  </td>
                  <td>
                    <InputNumber
                      v-if="editable"
                      v-model:value="item.singleDose"
                      :min="0.001"
                      :precision="3"
                      string-mode
                    />
                    <span v-else>{{ item.singleDose }}</span>
                    <span class="ml-1">{{ item.minUnitName }}</span>
                  </td>
                  <td>
                    <Select
                      v-if="editable"
                      v-model:value="item.medicationRoute"
                      class="min-w-28"
                      :options="routeOptions"
                    />
                    <span v-else>{{ item.medicationRoute }}</span>
                  </td>
                  <td>
                    <Select
                      v-if="editable"
                      v-model:value="item.frequency"
                      class="min-w-28"
                      :options="frequencyOptions"
                    />
                    <span v-else>{{ $t(`medical.workbench.frequency.${item.frequency}`) }}</span>
                  </td>
                  <td>
                    <InputNumber
                      v-if="editable"
                      v-model:value="item.courseDays"
                      :min="1"
                      :precision="0"
                    />
                    <span v-else>{{ item.courseDays }}</span>
                  </td>
                  <td>
                    <InputNumber
                      v-if="editable && ['PRN', 'SOS'].includes(item.frequency)"
                      v-model:value="item.totalMinQuantity"
                      :min="0.001"
                      :precision="3"
                      string-mode
                    />
                    <span v-else-if="item.dispenseQuantity">
                      {{ item.dispenseQuantity }} {{ item.dispenseUnit }}
                    </span>
                    <span v-else class="text-muted-foreground">{{ $t('medical.workbench.autoCalculate') }}</span>
                  </td>
                  <td>
                    <Input
                      v-if="editable"
                      v-model:value="item.usageInstructions"
                      class="min-w-36"
                    />
                    <span v-else>{{ item.usageInstructions || '-' }}</span>
                  </td>
                  <td v-if="editable">
                    <Button danger size="small" type="link" @click="removeItem(index)">
                      {{ $t('common.delete') }}
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4">
            <div class="mb-1 text-sm text-muted-foreground">{{ $t('medical.workbench.prescriptionRemark') }}</div>
            <Input.TextArea
              v-model:value="selected.remark"
              :disabled="!editable"
              :maxlength="512"
              :rows="3"
            />
          </div>
          <div v-if="selected.latestSubmission?.reviewOpinion" class="mt-4 rounded-md bg-muted p-3">
            <strong>{{ $t('medical.workbench.reviewOpinion') }}：</strong>
            {{ selected.latestSubmission.reviewOpinion }}
          </div>
        </template>
      </main>
    </div>
  </Drawer>
</template>

<style scoped>
.prescription-layout {
  display: flex;
  min-height: 620px;
  gap: 18px;
}

.prescription-list {
  width: 250px;
  flex: none;
  border-right: 1px solid hsl(var(--border));
  padding-right: 14px;
}

.prescription-list-item {
  width: 100%;
  margin-top: 10px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--card));
  padding: 10px;
  text-align: left;
}

.prescription-list-item.active {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 6%);
}

.medicine-table-wrap {
  overflow: auto;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.medicine-table {
  width: 100%;
  min-width: 1100px;
  border-collapse: collapse;
}

.medicine-table th,
.medicine-table td {
  border-bottom: 1px solid hsl(var(--border));
  padding: 10px;
  text-align: left;
  vertical-align: top;
}

.medicine-table th {
  background: hsl(var(--muted));
  font-weight: 500;
  white-space: nowrap;
}
</style>
