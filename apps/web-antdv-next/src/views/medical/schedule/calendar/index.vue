<script lang="ts" setup>
import type {
  MedicalDepartmentApi,
  MedicalDoctorApi,
  MedicalScheduleApi,
} from '#/api/medical';
import type { Dayjs } from 'dayjs';

import { computed, onMounted, ref, watch } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Empty,
  message,
  Modal,
  Progress,
  Select,
  Spin,
  Tag,
} from 'antdv-next';
import dayjs from 'dayjs';

import {
  deleteDraftSchedulesApi,
  getAllDoctorsApi,
  getAllMedicalDepartmentsApi,
  getScheduleListApi,
  publishSchedulesApi,
} from '#/api/medical';
import { getLocalDictList } from '#/dicts';
import { $t } from '#/locales';

import FormDrawerComponent from './form-drawer.vue';
import GenerateDrawerComponent from './generate-drawer.vue';
import StopModalComponent from './stop-modal.vue';

type ViewMode = 'month' | 'week';
interface SelectOption {
  label: string;
  value: number | string;
}

const { hasAccessByCodes } = useAccess();
const viewMode = ref<ViewMode>('week');
const anchorDate = ref<Dayjs>(dayjs());
const schedules = ref<MedicalScheduleApi.Schedule[]>([]);
const loading = ref(false);
const doctorId = ref<string>();
const departmentId = ref<string>();
const status = ref<number>();
const doctors = ref<MedicalDoctorApi.DoctorOption[]>([]);
const departments = ref<SelectOption[]>([]);
const registrationTypes = ref<SelectOption[]>([]);
const selectedDraftIds = ref<string[]>([]);
const selectedDate = ref<string>();
let requestSequence = 0;

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: FormDrawerComponent,
  destroyOnClose: true,
});
const [GenerateDrawer, generateDrawerApi] = useVbenDrawer({
  connectedComponent: GenerateDrawerComponent,
  destroyOnClose: true,
});
const [StopModal, stopModalApi] = useVbenModal({
  connectedComponent: StopModalComponent,
  destroyOnClose: true,
});

function weekStart(value: Dayjs) {
  const day = value.day();
  return value.subtract((day + 6) % 7, 'day').startOf('day');
}

const range = computed(() => {
  if (viewMode.value === 'week') {
    const start = weekStart(anchorDate.value);
    return { end: start.add(6, 'day'), start };
  }
  const monthStart = anchorDate.value.startOf('month');
  const start = weekStart(monthStart);
  return { end: start.add(41, 'day'), start };
});

const displayDays = computed(() => {
  const count = viewMode.value === 'week' ? 7 : 42;
  return Array.from({ length: count }, (_, index) =>
    range.value.start.add(index, 'day'),
  );
});

const schedulesByDate = computed(() => {
  const result = new Map<string, MedicalScheduleApi.Schedule[]>();
  for (const schedule of schedules.value) {
    const items = result.get(schedule.scheduleDate) ?? [];
    items.push(schedule);
    result.set(schedule.scheduleDate, items);
  }
  for (const items of result.values()) {
    items.sort((left, right) => left.startTime.localeCompare(right.startTime));
  }
  return result;
});

const selectedDaySchedules = computed(() =>
  selectedDate.value
    ? (schedulesByDate.value.get(selectedDate.value) ?? [])
    : [],
);

const doctorOptions = computed(() =>
  doctors.value.map((item) => ({
    label: `${item.name} (${item.doctorNo})`,
    value: item.doctorId,
  })),
);

const statusOptions = computed(() =>
  [0, 1, 2, 3].map((value) => ({
    label: $t(`medical.schedule.status${value}`),
    value,
  })),
);

const rangeTitle = computed(() => {
  if (viewMode.value === 'month') {
    return $t('medical.schedule.monthTitle', [
      anchorDate.value.format('YYYY-MM'),
    ]);
  }
  return `${range.value.start.format('YYYY-MM-DD')} ~ ${range.value.end.format('YYYY-MM-DD')}`;
});

function flattenDepartments(
  values: MedicalDepartmentApi.Department[],
  depth = 0,
): SelectOption[] {
  return values.flatMap((item) => [
    {
      label: `${'　'.repeat(depth)}${item.departmentName}`,
      value: item.departmentId,
    },
    ...flattenDepartments(item.children ?? [], depth + 1),
  ]);
}

async function fetchSchedules() {
  const sequence = ++requestSequence;
  loading.value = true;
  try {
    const items: MedicalScheduleApi.Schedule[] = [];
    let page = 1;
    let total = 0;
    do {
      const result = await getScheduleListApi({
        departmentId: departmentId.value,
        doctorId: doctorId.value,
        endDate: range.value.end.format('YYYY-MM-DD'),
        page,
        pageSize: 200,
        startDate: range.value.start.format('YYYY-MM-DD'),
        status: status.value,
      });
      if (sequence !== requestSequence) return;
      items.push(...result.items);
      total = result.total;
      page += 1;
      if (result.items.length === 0) break;
    } while (items.length < total);

    schedules.value = items;
    selectedDraftIds.value = selectedDraftIds.value.filter((id) =>
      items.some((item) => item.scheduleId === id && item.status === 0),
    );
  } finally {
    if (sequence === requestSequence) loading.value = false;
  }
}

onMounted(async () => {
  const [doctorItems, departmentItems, dictItems] = await Promise.all([
    getAllDoctorsApi(),
    getAllMedicalDepartmentsApi(),
    getLocalDictList('MED_REGISTRATION_TYPE'),
  ]);
  doctors.value = doctorItems;
  departments.value = flattenDepartments(departmentItems);
  registrationTypes.value = dictItems as SelectOption[];
  await fetchSchedules();
});

watch([viewMode, doctorId, departmentId, status], fetchSchedules);

function shiftRange(amount: number) {
  anchorDate.value = anchorDate.value.add(
    amount,
    viewMode.value === 'week' ? 'week' : 'month',
  );
  fetchSchedules();
}

function goToday() {
  anchorDate.value = dayjs();
  fetchSchedules();
}

function changeAnchor(value: Dayjs | Dayjs[] | null) {
  if (!value || Array.isArray(value)) return;
  anchorDate.value = value;
  fetchSchedules();
}

function scheduleStatusColor(statusValue: number) {
  return (
    ['default', 'processing', 'error', 'success'][statusValue] ?? 'default'
  );
}

function registrationTypeName(value: string) {
  return (
    registrationTypes.value.find((item) => item.value === value)?.label ?? value
  );
}

function quotaPercent(schedule: MedicalScheduleApi.Schedule) {
  if (schedule.totalQuota === 0) return 0;
  return Math.round((schedule.bookedQuota / schedule.totalQuota) * 100);
}

function openCreate(date?: string) {
  formDrawerApi
    .setData({ scheduleDate: date ?? anchorDate.value.format('YYYY-MM-DD') })
    .open();
}

function openEdit(schedule: MedicalScheduleApi.Schedule) {
  formDrawerApi.setData(schedule).open();
}

function openGenerate() {
  generateDrawerApi
    .setData({ anchorDate: anchorDate.value.format('YYYY-MM-DD') })
    .open();
}

function openStop(schedule: MedicalScheduleApi.Schedule) {
  stopModalApi.setData(schedule).open();
}

function openDay(date: string) {
  selectedDate.value = date;
}

function toggleDraft(scheduleId: string, checked: boolean) {
  selectedDraftIds.value = checked
    ? [...new Set([...selectedDraftIds.value, scheduleId])]
    : selectedDraftIds.value.filter((id) => id !== scheduleId);
}

function publish(ids: string[]) {
  Modal.confirm({
    content: $t('medical.schedule.publishConfirm', [ids.length]),
    async onOk() {
      await publishSchedulesApi(ids);
      message.success($t('medical.schedule.publishSuccess'));
      await fetchSchedules();
    },
  });
}

function removeDraft(schedule: MedicalScheduleApi.Schedule) {
  Modal.confirm({
    content: $t('medical.schedule.deleteConfirm'),
    async onOk() {
      await deleteDraftSchedulesApi([schedule.scheduleId]);
      message.success($t('medical.common.deleteSuccess'));
      await fetchSchedules();
    },
  });
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="fetchSchedules" />
    <GenerateDrawer @success="fetchSchedules" />
    <StopModal @success="fetchSchedules" />

    <div class="flex h-full flex-col gap-3">
      <Card size="small">
        <div class="flex flex-wrap items-center gap-2">
          <Select
            v-model:value="departmentId"
            allow-clear
            class="w-48"
            :options="departments"
            :placeholder="$t('medical.schedule.department')"
            show-search
          />
          <Select
            v-model:value="doctorId"
            allow-clear
            class="w-48"
            :options="doctorOptions"
            :placeholder="$t('medical.schedule.doctor')"
            show-search
          />
          <Select
            v-model:value="status"
            allow-clear
            class="w-36"
            :options="statusOptions"
            :placeholder="$t('medical.schedule.status')"
          />
          <div class="ml-auto flex flex-wrap gap-2">
            <Button
              v-if="
                selectedDraftIds.length > 0 &&
                hasAccessByCodes(['medical:schedule:publish'])
              "
              @click="publish(selectedDraftIds)"
            >
              {{
                $t('medical.schedule.publishSelected', [
                  selectedDraftIds.length,
                ])
              }}
            </Button>
            <Button
              v-if="hasAccessByCodes(['medical:schedule:generate'])"
              @click="openGenerate"
            >
              {{ $t('medical.schedule.generate') }}
            </Button>
            <Button
              v-if="hasAccessByCodes(['medical:schedule:create'])"
              type="primary"
              @click="openCreate()"
            >
              <Plus class="size-5" />
              {{ $t('medical.schedule.createSchedule') }}
            </Button>
          </div>
        </div>
      </Card>

      <Card class="min-h-0 flex-1" size="small">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <Button @click="shiftRange(-1)">‹</Button>
          <Button @click="goToday">{{ $t('medical.schedule.today') }}</Button>
          <Button @click="shiftRange(1)">›</Button>
          <DatePicker
            :value="anchorDate"
            :picker="viewMode === 'month' ? 'month' : 'date'"
            @change="changeAnchor"
          />
          <strong class="text-base">{{ rangeTitle }}</strong>
          <div class="ml-auto flex gap-1">
            <Button
              :type="viewMode === 'week' ? 'primary' : 'default'"
              @click="viewMode = 'week'"
            >
              {{ $t('medical.schedule.weekView') }}
            </Button>
            <Button
              :type="viewMode === 'month' ? 'primary' : 'default'"
              @click="viewMode = 'month'"
            >
              {{ $t('medical.schedule.monthView') }}
            </Button>
          </div>
        </div>

        <Spin :spinning="loading">
          <div
            v-if="viewMode === 'week'"
            class="grid min-w-[1120px] grid-cols-7 gap-2 overflow-auto"
          >
            <section
              v-for="day in displayDays"
              :key="day.format('YYYY-MM-DD')"
              class="min-h-[560px] rounded border bg-muted/20 p-2"
            >
              <header class="mb-2 flex items-center justify-between">
                <div>
                  <div class="font-medium">
                    {{ $t(`medical.schedule.weekday${day.day() || 7}`) }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ day.format('MM-DD') }}
                  </div>
                </div>
                <Button
                  v-if="hasAccessByCodes(['medical:schedule:create'])"
                  size="small"
                  type="text"
                  @click="openCreate(day.format('YYYY-MM-DD'))"
                >
                  <Plus class="size-4" />
                </Button>
              </header>

              <div class="space-y-2">
                <Card
                  v-for="schedule in schedulesByDate.get(
                    day.format('YYYY-MM-DD'),
                  ) ?? []"
                  :key="schedule.scheduleId"
                  size="small"
                >
                  <div class="mb-1 flex items-start gap-1">
                    <Checkbox
                      v-if="schedule.status === 0"
                      :checked="selectedDraftIds.includes(schedule.scheduleId)"
                      @change="
                        toggleDraft(schedule.scheduleId, $event.target.checked)
                      "
                    />
                    <strong class="min-w-0 flex-1 truncate">{{
                      schedule.doctorName
                    }}</strong>
                    <Tag :color="scheduleStatusColor(schedule.status)">
                      {{ $t(`medical.schedule.status${schedule.status}`) }}
                    </Tag>
                  </div>
                  <div class="text-sm">
                    {{ schedule.startTime.slice(0, 5) }}–{{
                      schedule.endTime.slice(0, 5)
                    }}
                  </div>
                  <div class="truncate text-xs text-muted-foreground">
                    {{ schedule.departmentName }} ·
                    {{ registrationTypeName(schedule.registrationType) }}
                  </div>
                  <div class="mt-2 flex items-center justify-between text-xs">
                    <span>
                      {{
                        $t('medical.schedule.quotaSummary', [
                          schedule.remainingQuota,
                          schedule.totalQuota,
                        ])
                      }}
                    </span>
                    <span>
                      {{
                        schedule.feeAmount
                          ? `¥${schedule.feeAmount}`
                          : $t('medical.schedule.feePending')
                      }}
                    </span>
                  </div>
                  <Progress
                    :percent="quotaPercent(schedule)"
                    :show-info="false"
                    size="small"
                  />
                  <div class="mt-1 flex flex-wrap justify-end gap-1">
                    <Button
                      v-if="
                        schedule.status === 0 &&
                        hasAccessByCodes(['medical:schedule:update'])
                      "
                      size="small"
                      type="link"
                      @click="openEdit(schedule)"
                    >
                      {{ $t('common.edit') }}
                    </Button>
                    <Button
                      v-if="
                        schedule.status === 0 &&
                        hasAccessByCodes(['medical:schedule:publish'])
                      "
                      size="small"
                      type="link"
                      @click="publish([schedule.scheduleId])"
                    >
                      {{ $t('medical.schedule.publish') }}
                    </Button>
                    <Button
                      v-if="
                        schedule.status === 0 &&
                        hasAccessByCodes(['medical:schedule:delete'])
                      "
                      danger
                      size="small"
                      type="link"
                      @click="removeDraft(schedule)"
                    >
                      {{ $t('common.delete') }}
                    </Button>
                    <Button
                      v-if="
                        schedule.status === 1 &&
                        hasAccessByCodes(['medical:schedule:stop'])
                      "
                      danger
                      size="small"
                      type="link"
                      @click="openStop(schedule)"
                    >
                      {{ $t('medical.schedule.stop') }}
                    </Button>
                  </div>
                </Card>
                <Empty
                  v-if="!schedulesByDate.get(day.format('YYYY-MM-DD'))?.length"
                  :description="$t('medical.schedule.noSchedule')"
                  :image="Empty.PRESENTED_IMAGE_SIMPLE"
                />
              </div>
            </section>
          </div>

          <div v-else class="grid grid-cols-7 overflow-hidden rounded border">
            <div
              v-for="index in 7"
              :key="index"
              class="border-b bg-muted/40 p-2 text-center text-sm font-medium"
            >
              {{ $t(`medical.schedule.weekday${index}`) }}
            </div>
            <button
              v-for="day in displayDays"
              :key="day.format('YYYY-MM-DD')"
              class="min-h-28 border-b border-r p-2 text-left hover:bg-muted/30"
              :class="{ 'opacity-50': day.month() !== anchorDate.month() }"
              type="button"
              @click="openDay(day.format('YYYY-MM-DD'))"
            >
              <div class="mb-1 font-medium">{{ day.date() }}</div>
              <div
                v-for="schedule in (
                  schedulesByDate.get(day.format('YYYY-MM-DD')) ?? []
                ).slice(0, 3)"
                :key="schedule.scheduleId"
                class="mb-1 truncate rounded bg-primary/10 px-1 py-0.5 text-xs"
              >
                {{ schedule.startTime.slice(0, 5) }} {{ schedule.doctorName }}
              </div>
              <div
                v-if="
                  (schedulesByDate.get(day.format('YYYY-MM-DD'))?.length ?? 0) >
                  3
                "
                class="text-xs text-primary"
              >
                +{{
                  (schedulesByDate.get(day.format('YYYY-MM-DD'))?.length ?? 0) -
                  3
                }}
              </div>
            </button>
          </div>
        </Spin>
      </Card>
    </div>

    <Modal
      :footer="null"
      :open="Boolean(selectedDate)"
      :title="selectedDate"
      width="720px"
      @cancel="selectedDate = undefined"
    >
      <div class="space-y-2">
        <Card
          v-for="schedule in selectedDaySchedules"
          :key="schedule.scheduleId"
          size="small"
        >
          <div class="flex flex-wrap items-center gap-2">
            <strong>{{ schedule.doctorName }}</strong>
            <span>{{ schedule.departmentName }}</span>
            <span
              >{{ schedule.startTime.slice(0, 5) }}–{{
                schedule.endTime.slice(0, 5)
              }}</span
            >
            <Tag :color="scheduleStatusColor(schedule.status)">
              {{ $t(`medical.schedule.status${schedule.status}`) }}
            </Tag>
            <span class="ml-auto">
              {{
                $t('medical.schedule.quotaSummary', [
                  schedule.remainingQuota,
                  schedule.totalQuota,
                ])
              }}
            </span>
          </div>
        </Card>
        <Empty v-if="selectedDaySchedules.length === 0" />
      </div>
    </Modal>
  </Page>
</template>
