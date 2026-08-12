<script lang="ts" setup>
import type { MedicalDiagnosisApi, MedicalOutpatientApi } from '#/api/medical';

import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import {
  Button,
  Card,
  Descriptions,
  DescriptionsItem,
  Divider,
  Drawer,
  Empty,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
} from 'antdv-next';

import {
  callNextPatientApi,
  completeOutpatientRecordApi,
  getDoctorWorkbenchApi,
  getOutpatientHistoryApi,
  getOutpatientRecordApi,
  getWorkbenchDiagnosisOptionsApi,
  passPatientApi,
  recallPatientApi,
  repeatCallPatientApi,
  saveOutpatientRecordApi,
  startConsultationApi,
} from '#/api/medical';
import { $t } from '#/locales';

import InlineField from './inline-field.vue';
import PrescriptionDrawerComponent from './prescription-drawer.vue';

type SaveState = 'failed' | 'idle' | 'saved' | 'saving';
type TextRecordField =
  | 'allergyHistory'
  | 'auxiliaryExamination'
  | 'chiefComplaint'
  | 'familyHistory'
  | 'followUpAdvice'
  | 'maritalReproductive'
  | 'medicalAdvice'
  | 'menstrualHistory'
  | 'pastHistory'
  | 'personalHistory'
  | 'physicalExamination'
  | 'presentIllness'
  | 'remark'
  | 'specialistExamination'
  | 'treatmentPlan';

const medicalHistoryFields: Array<[TextRecordField, string]> = [
  ['chiefComplaint', 'chiefComplaint'],
  ['presentIllness', 'presentIllness'],
  ['pastHistory', 'pastHistory'],
  ['personalHistory', 'personalHistory'],
  ['familyHistory', 'familyHistory'],
  ['allergyHistory', 'allergyHistory'],
  ['maritalReproductive', 'maritalReproductive'],
  ['menstrualHistory', 'menstrualHistory'],
];
const examinationFields: Array<[TextRecordField, string]> = [
  ['physicalExamination', 'physicalExamination'],
  ['specialistExamination', 'specialistExamination'],
  ['auxiliaryExamination', 'auxiliaryExamination'],
];
const treatmentFields: Array<[TextRecordField, string]> = [
  ['treatmentPlan', 'treatmentPlan'],
  ['medicalAdvice', 'medicalAdvice'],
  ['followUpAdvice', 'followUpAdvice'],
  ['remark', 'remark'],
];

const loading = ref(false);
const workbench = ref<MedicalOutpatientApi.Workbench>();
const selectedScheduleId = ref<string>();
const record = ref<MedicalOutpatientApi.OutpatientRecord>();
const diagnosisOptions = ref<MedicalDiagnosisApi.Diagnosis[]>([]);
const selectedDiagnosisId = ref<string>();
const historyOpen = ref(false);
const history = ref<MedicalOutpatientApi.OutpatientRecord[]>([]);
const historyLoading = ref(false);
const saveState = ref<SaveState>('idle');
let saveTimer: ReturnType<typeof setTimeout> | undefined;

const [PrescriptionDrawer, prescriptionDrawerApi] = useVbenDrawer({
  connectedComponent: PrescriptionDrawerComponent,
  destroyOnClose: true,
});

const selectedSchedule = computed(() =>
  workbench.value?.schedules.find(
    (item) => item.scheduleId === selectedScheduleId.value,
  ),
);
const readonly = computed(() => Boolean(record.value?.endDate));
const hasActiveQueue = computed(() =>
  selectedSchedule.value?.queues.some((item) =>
    [10, 20].includes(item.queueStatus),
  ),
);
const visitTypeOptions = computed(() => [
  { label: $t('medical.workbench.initialVisit'), value: 0 },
  { label: $t('medical.workbench.followUpVisit'), value: 10 },
]);
const saveStateText = computed(() =>
  $t(`medical.workbench.saveState.${saveState.value}`),
);

async function loadWorkbench(keepSelection = true) {
  loading.value = true;
  try {
    const data = await getDoctorWorkbenchApi();
    workbench.value = data;
    if (
      !keepSelection ||
      !data.schedules.some(
        (item) => item.scheduleId === selectedScheduleId.value,
      )
    ) {
      selectedScheduleId.value = data.schedules[0]?.scheduleId;
    }
  } finally {
    loading.value = false;
  }
}

async function refreshRecord() {
  if (!record.value) return;
  record.value = await getOutpatientRecordApi(record.value.recordId);
}

async function runQueueAction(action: () => Promise<unknown>) {
  await action();
  message.success($t('medical.workbench.actionSuccess'));
  await loadWorkbench();
}

async function startConsultation(queueId: string) {
  record.value = await startConsultationApi(queueId);
  saveState.value = 'saved';
  await loadWorkbench();
}

async function openRecord(item: MedicalOutpatientApi.WorkbenchQueue) {
  if (!item.recordId) return;
  record.value = await getOutpatientRecordApi(item.recordId);
  saveState.value = 'saved';
}

function buildSavePayload():
  | MedicalOutpatientApi.SaveOutpatientRecord
  | undefined {
  const value = record.value;
  if (!value) return;
  return {
    allergyHistory: value.allergyHistory,
    auxiliaryExamination: value.auxiliaryExamination,
    chiefComplaint: value.chiefComplaint,
    diagnoses: value.diagnoses.map((item, index) => ({
      diagnosisId: item.diagnosisId,
      isPrimary: item.isPrimary,
      sort: index,
    })),
    diastolicPressure: value.diastolicPressure,
    familyHistory: value.familyHistory,
    followUpAdvice: value.followUpAdvice,
    height: value.height,
    informant: value.informant,
    maritalReproductive: value.maritalReproductive,
    medicalAdvice: value.medicalAdvice,
    menstrualHistory: value.menstrualHistory,
    pastHistory: value.pastHistory,
    personalHistory: value.personalHistory,
    physicalExamination: value.physicalExamination,
    presentIllness: value.presentIllness,
    pulse: value.pulse,
    remark: value.remark,
    respiratoryRate: value.respiratoryRate,
    specialistExamination: value.specialistExamination,
    systolicPressure: value.systolicPressure,
    temperature: value.temperature,
    treatmentPlan: value.treatmentPlan,
    visitType: value.visitType,
    weight: value.weight,
  };
}

async function saveRecord() {
  if (!record.value || readonly.value) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveState.value = 'saving';
  try {
    const payload = buildSavePayload();
    if (!payload) return;
    record.value = await saveOutpatientRecordApi(
      record.value.recordId,
      payload,
    );
    saveState.value = 'saved';
  } catch (error) {
    saveState.value = 'failed';
    throw error;
  }
}

function scheduleSave() {
  if (readonly.value) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveState.value = 'idle';
  saveTimer = setTimeout(() => {
    void saveRecord().catch(() => undefined);
  }, 700);
}

function textFieldValue(field: TextRecordField) {
  return record.value?.[field];
}

function updateTextField(
  field: TextRecordField,
  value: null | number | string | undefined,
) {
  if (!record.value) return;
  record.value[field] =
    value === null || value === undefined ? null : String(value);
}

function addDiagnosis() {
  const diagnosis = diagnosisOptions.value.find(
    (item) => item.diagnosisId === selectedDiagnosisId.value,
  );
  if (!record.value || !diagnosis) return;
  if (
    record.value.diagnoses.some(
      (item) => item.diagnosisId === diagnosis.diagnosisId,
    )
  ) {
    message.warning($t('medical.workbench.diagnosisDuplicated'));
    return;
  }
  record.value.diagnoses.push({
    diagnosisId: diagnosis.diagnosisId,
    icdCode: diagnosis.icdCode,
    icdName: diagnosis.icdName,
    isPrimary: record.value.diagnoses.length === 0 ? 1 : 0,
    recordDiagnosisId: '',
    sort: record.value.diagnoses.length,
  });
  selectedDiagnosisId.value = undefined;
  scheduleSave();
}

function setPrimaryDiagnosis(diagnosisId: string) {
  if (!record.value || readonly.value) return;
  record.value.diagnoses.forEach((item) => {
    item.isPrimary = item.diagnosisId === diagnosisId ? 1 : 0;
  });
  scheduleSave();
}

function removeDiagnosis(diagnosisId: string) {
  if (!record.value || readonly.value) return;
  const wasPrimary = record.value.diagnoses.some(
    (item) => item.diagnosisId === diagnosisId && item.isPrimary === 1,
  );
  record.value.diagnoses = record.value.diagnoses.filter(
    (item) => item.diagnosisId !== diagnosisId,
  );
  if (wasPrimary && record.value.diagnoses[0]) {
    record.value.diagnoses[0].isPrimary = 1;
  }
  scheduleSave();
}

function completeConsultation() {
  if (!record.value) return;
  Modal.confirm({
    content: $t('medical.workbench.completeConfirm'),
    async onOk() {
      await saveRecord();
      record.value = await completeOutpatientRecordApi(record.value!.recordId);
      message.success($t('medical.workbench.completeSuccess'));
      await loadWorkbench();
    },
    title: $t('common.confirm'),
  });
}

async function openHistory() {
  if (!record.value) return;
  historyOpen.value = true;
  historyLoading.value = true;
  try {
    history.value = await getOutpatientHistoryApi(record.value.recordId);
  } finally {
    historyLoading.value = false;
  }
}

function openPrescriptions() {
  if (!record.value) return;
  prescriptionDrawerApi
    .setData({ record: record.value, readonly: readonly.value })
    .open();
}

function queueStatusColor(status: MedicalOutpatientApi.QueueStatus) {
  return (
    {
      0: 'default',
      10: 'processing',
      15: 'warning',
      20: 'blue',
      30: 'success',
    } as const
  )[status];
}

onMounted(async () => {
  await Promise.all([
    loadWorkbench(false),
    getWorkbenchDiagnosisOptionsApi({ pageSize: 100 }).then(
      (items) => (diagnosisOptions.value = items),
    ),
  ]);
});

onBeforeUnmount(() => {
  if (saveTimer) clearTimeout(saveTimer);
});
</script>

<template>
  <Page auto-content-height>
    <PrescriptionDrawer @success="refreshRecord" />
    <Spin :spinning="loading">
      <div class="workbench-layout">
        <aside class="workbench-sidebar">
          <Card :bordered="false" size="small">
            <div class="mb-3 flex items-center justify-between">
              <div>
                <div class="font-semibold">{{ workbench?.doctorName }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ workbench?.doctorNo }} ·
                  {{ $t('medical.workbench.todaySchedule') }}
                </div>
              </div>
              <Button size="small" @click="loadWorkbench()">
                {{ $t('common.refresh') }}
              </Button>
            </div>
            <Empty
              v-if="!workbench?.schedules.length"
              :description="$t('medical.workbench.noSchedule')"
            />
            <div v-else class="schedule-list">
              <button
                v-for="item in workbench.schedules"
                :key="item.scheduleId"
                class="schedule-item"
                :class="{ active: selectedScheduleId === item.scheduleId }"
                type="button"
                @click="selectedScheduleId = item.scheduleId"
              >
                <div class="font-medium">{{ item.departmentName }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ item.startTime }}–{{ item.endTime }} ·
                  {{ $t('medical.workbench.queueCount', [item.queues.length]) }}
                </div>
              </button>
            </div>
          </Card>

          <Card
            class="mt-3 min-h-0 flex-1"
            :bordered="false"
            size="small"
            :title="$t('medical.workbench.waitingQueue')"
          >
            <template #extra>
              <Button
                :disabled="!selectedSchedule || hasActiveQueue"
                size="small"
                type="primary"
                @click="
                  runQueueAction(() =>
                    callNextPatientApi(selectedSchedule!.scheduleId),
                  )
                "
              >
                {{ $t('medical.workbench.callNext') }}
              </Button>
            </template>
            <Empty
              v-if="!selectedSchedule?.queues.length"
              :description="$t('medical.workbench.noQueue')"
            />
            <div v-else class="queue-list">
              <div
                v-for="item in selectedSchedule.queues"
                :key="item.queueId"
                class="queue-item"
                :class="{ selected: record?.queueId === item.queueId }"
                @dblclick="openRecord(item)"
              >
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <span class="queue-number">{{ item.queueSequence }}</span>
                    <span class="ml-2 font-medium">{{ item.patientName }}</span>
                  </div>
                  <Tag :color="queueStatusColor(item.queueStatus)">
                    {{ $t(`medical.workbench.queueStatus${item.queueStatus}`) }}
                  </Tag>
                </div>
                <div class="mt-1 text-xs text-muted-foreground">
                  {{ item.patientNo }} · {{ item.startTime }}–{{ item.endTime }}
                </div>
                <Space
                  v-if="item.queueStatus !== 0"
                  class="mt-2"
                  size="small"
                  wrap
                >
                  <Button
                    v-if="item.queueStatus === 10"
                    size="small"
                    @click="
                      runQueueAction(() => repeatCallPatientApi(item.queueId))
                    "
                  >
                    {{ $t('medical.workbench.repeatCall') }}
                  </Button>
                  <Button
                    v-if="item.queueStatus === 10"
                    danger
                    size="small"
                    @click="runQueueAction(() => passPatientApi(item.queueId))"
                  >
                    {{ $t('medical.workbench.pass') }}
                  </Button>
                  <Button
                    v-if="item.queueStatus === 15"
                    size="small"
                    @click="
                      runQueueAction(() => recallPatientApi(item.queueId))
                    "
                  >
                    {{ $t('medical.workbench.recall') }}
                  </Button>
                  <Button
                    v-if="item.queueStatus === 10"
                    size="small"
                    type="primary"
                    @click="startConsultation(item.queueId)"
                  >
                    {{ $t('medical.workbench.startConsultation') }}
                  </Button>
                  <Button
                    v-if="item.recordId && [20, 30].includes(item.queueStatus)"
                    size="small"
                    type="link"
                    @click="openRecord(item)"
                  >
                    {{ $t('medical.workbench.openRecord') }}
                  </Button>
                </Space>
              </div>
            </div>
          </Card>
        </aside>

        <main class="workbench-main">
          <Empty
            v-if="!record"
            class="record-empty"
            :description="$t('medical.workbench.selectPatientHint')"
          />
          <template v-else>
            <Card :bordered="false" size="small">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span class="text-lg font-semibold">{{
                    record.patientName
                  }}</span>
                  <span class="ml-3 text-sm text-muted-foreground">
                    {{ record.patientGender }} · {{ record.patientBirthDate }} ·
                    {{ record.patientPhone }}
                  </span>
                </div>
                <Space wrap>
                  <Tag :color="readonly ? 'success' : 'processing'">
                    {{
                      readonly
                        ? $t('medical.workbench.completed')
                        : $t('medical.workbench.consulting')
                    }}
                  </Tag>
                  <span class="text-xs text-muted-foreground">{{
                    saveStateText
                  }}</span>
                  <Button @click="openHistory">{{
                    $t('medical.workbench.history')
                  }}</Button>
                  <Button @click="openPrescriptions">{{
                    $t('medical.workbench.prescription')
                  }}</Button>
                  <Button
                    v-if="!readonly"
                    type="primary"
                    @click="completeConsultation"
                  >
                    {{ $t('medical.workbench.complete') }}
                  </Button>
                </Space>
              </div>
              <Descriptions class="mt-3" size="small" :column="4">
                <DescriptionsItem
                  :label="$t('medical.workbench.registrationNo')"
                >
                  {{ record.registrationNo }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('medical.workbench.patientNo')">
                  {{ record.patientNo }}
                </DescriptionsItem>
                <DescriptionsItem :label="$t('medical.workbench.department')">
                  {{ record.departmentName }}
                </DescriptionsItem>
                <DescriptionsItem
                  :label="$t('medical.workbench.queueSequence')"
                >
                  {{ record.queueSequence }}
                </DescriptionsItem>
              </Descriptions>
            </Card>

            <Card class="mt-3" :bordered="false" size="small">
              <div class="medical-document">
                <h2>{{ $t('medical.workbench.outpatientRecord') }}</h2>
                <p>
                  {{ $t('medical.workbench.visitType') }}：
                  <InlineField
                    v-model="record.visitType"
                    :disabled="readonly"
                    :options="visitTypeOptions"
                    :placeholder="$t('medical.workbench.clickToSelect')"
                    type="select"
                    @commit="scheduleSave"
                  />； {{ $t('medical.workbench.informant') }}：
                  <InlineField
                    v-model="record.informant"
                    :disabled="readonly"
                    :placeholder="$t('medical.workbench.clickToInput')"
                    @commit="scheduleSave"
                  />。
                </p>

                <Divider>{{ $t('medical.workbench.vitalSigns') }}</Divider>
                <p class="vital-line">
                  {{ $t('medical.workbench.temperature') }}
                  <InlineField
                    v-model="record.temperature"
                    :disabled="readonly"
                    placeholder="--"
                    unit="℃"
                    @commit="scheduleSave"
                  />，
                  {{ $t('medical.workbench.pulse') }}
                  <InlineField
                    v-model="record.pulse"
                    :disabled="readonly"
                    placeholder="--"
                    type="number"
                    :unit="$t('medical.workbench.perMinute')"
                    @commit="scheduleSave"
                  />，
                  {{ $t('medical.workbench.respiratoryRate') }}
                  <InlineField
                    v-model="record.respiratoryRate"
                    :disabled="readonly"
                    placeholder="--"
                    type="number"
                    :unit="$t('medical.workbench.perMinute')"
                    @commit="scheduleSave"
                  />，
                  {{ $t('medical.workbench.bloodPressure') }}
                  <InlineField
                    v-model="record.systolicPressure"
                    :disabled="readonly"
                    placeholder="--"
                    type="number"
                    @commit="scheduleSave"
                  />
                  /
                  <InlineField
                    v-model="record.diastolicPressure"
                    :disabled="readonly"
                    placeholder="--"
                    type="number"
                    unit="mmHg"
                    @commit="scheduleSave"
                  />，
                  {{ $t('medical.workbench.height') }}
                  <InlineField
                    v-model="record.height"
                    :disabled="readonly"
                    placeholder="--"
                    unit="cm"
                    @commit="scheduleSave"
                  />，
                  {{ $t('medical.workbench.weight') }}
                  <InlineField
                    v-model="record.weight"
                    :disabled="readonly"
                    placeholder="--"
                    unit="kg"
                    @commit="scheduleSave"
                  />。
                </p>

                <Divider>{{ $t('medical.workbench.medicalHistory') }}</Divider>
                <p
                  v-for="field in medicalHistoryFields"
                  :key="field[0]"
                  class="document-line"
                >
                  <strong>{{ $t(`medical.workbench.${field[1]}`) }}：</strong>
                  <InlineField
                    :model-value="textFieldValue(field[0])"
                    :disabled="readonly"
                    multiline
                    :placeholder="$t('medical.workbench.clickToInput')"
                    @commit="scheduleSave"
                    @update:model-value="updateTextField(field[0], $event)"
                  />
                </p>

                <Divider>{{ $t('medical.workbench.examination') }}</Divider>
                <p
                  v-for="field in examinationFields"
                  :key="field[0]"
                  class="document-line"
                >
                  <strong>{{ $t(`medical.workbench.${field[1]}`) }}：</strong>
                  <InlineField
                    :model-value="textFieldValue(field[0])"
                    :disabled="readonly"
                    multiline
                    :placeholder="$t('medical.workbench.clickToInput')"
                    @commit="scheduleSave"
                    @update:model-value="updateTextField(field[0], $event)"
                  />
                </p>

                <Divider>{{
                  $t('medical.workbench.diagnosisAndPlan')
                }}</Divider>
                <div class="mb-4">
                  <div v-if="!readonly" class="mb-2 flex gap-2">
                    <Select
                      v-model:value="selectedDiagnosisId"
                      class="min-w-80"
                      :field-names="{ label: 'icdName', value: 'diagnosisId' }"
                      :options="diagnosisOptions"
                      show-search
                      :filter-option="
                        (
                          input: string,
                          option: MedicalDiagnosisApi.Diagnosis,
                        ) =>
                          `${option.icdCode}${option.icdName}${option.namePinyin ?? ''}`
                            .toLowerCase()
                            .includes(input.toLowerCase())
                      "
                      :placeholder="$t('medical.workbench.selectDiagnosis')"
                    />
                    <Button type="primary" @click="addDiagnosis">
                      {{ $t('common.add') }}
                    </Button>
                  </div>
                  <Space wrap>
                    <Tag
                      v-for="item in record.diagnoses"
                      :key="item.diagnosisId"
                      :closable="!readonly"
                      :color="item.isPrimary ? 'blue' : 'default'"
                      @click="setPrimaryDiagnosis(item.diagnosisId)"
                      @close.prevent="removeDiagnosis(item.diagnosisId)"
                    >
                      {{ item.icdCode }} {{ item.icdName }}
                      <span v-if="item.isPrimary">
                        · {{ $t('medical.workbench.primaryDiagnosis') }}</span
                      >
                    </Tag>
                  </Space>
                </div>
                <p
                  v-for="field in treatmentFields"
                  :key="field[0]"
                  class="document-line"
                >
                  <strong>{{ $t(`medical.workbench.${field[1]}`) }}：</strong>
                  <InlineField
                    :model-value="textFieldValue(field[0])"
                    :disabled="readonly"
                    multiline
                    :placeholder="$t('medical.workbench.clickToInput')"
                    @commit="scheduleSave"
                    @update:model-value="updateTextField(field[0], $event)"
                  />
                </p>
              </div>
            </Card>
          </template>
        </main>
      </div>
    </Spin>

    <Drawer
      v-model:open="historyOpen"
      :title="$t('medical.workbench.history')"
      width="900"
    >
      <Spin :spinning="historyLoading">
        <Empty
          v-if="!history.length"
          :description="$t('medical.workbench.noHistory')"
        />
        <Card
          v-for="item in history"
          :key="item.recordId"
          class="mb-3"
          size="small"
          :title="`${item.startDate} · ${item.departmentName} · ${item.doctorName}`"
        >
          <p>
            <strong>{{ $t('medical.workbench.chiefComplaint') }}：</strong
            >{{ item.chiefComplaint || '-' }}
          </p>
          <p>
            <strong>{{ $t('medical.workbench.presentIllness') }}：</strong
            >{{ item.presentIllness || '-' }}
          </p>
          <p>
            <strong>{{ $t('medical.workbench.diagnosis') }}：</strong>
            {{
              item.diagnoses.map((diagnosis) => diagnosis.icdName).join('、') ||
              '-'
            }}
          </p>
          <p>
            <strong>{{ $t('medical.workbench.treatmentPlan') }}：</strong
            >{{ item.treatmentPlan || '-' }}
          </p>
        </Card>
      </Spin>
    </Drawer>
  </Page>
</template>

<style scoped>
.workbench-layout {
  display: grid;
  grid-template-columns: 350px minmax(0, 1fr);
  gap: 12px;
  height: calc(100vh - 150px);
  min-height: 640px;
}

.workbench-sidebar {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.schedule-list,
.queue-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.schedule-item,
.queue-item {
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.schedule-item {
  cursor: pointer;
}

.schedule-item.active,
.queue-item.selected {
  background: hsl(var(--primary) / 6%);
  border-color: hsl(var(--primary));
}

.queue-list {
  max-height: calc(100vh - 390px);
  overflow: auto;
}

.queue-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-weight: 600;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 12%);
  border-radius: 50%;
}

.workbench-main {
  min-width: 0;
  overflow: auto;
}

.record-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: hsl(var(--card));
  border-radius: 8px;
}

.medical-document {
  max-width: 1100px;
  min-height: 720px;
  padding: 20px 34px 50px;
  margin: 0 auto;
  font-family: SimSun, 'Songti SC', serif;
  font-size: 15px;
  line-height: 2.1;
  color: hsl(var(--foreground));
}

.medical-document h2 {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
}

.document-line {
  display: grid;
  grid-template-columns: 6.5rem minmax(0, 1fr);
  gap: 6px;
  align-items: start;
}

.vital-line {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

@media (max-width: 1100px) {
  .workbench-layout {
    grid-template-columns: 300px minmax(0, 1fr);
  }
}
</style>
