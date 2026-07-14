<script lang="ts" setup>
import type { WorkflowRuntimeApi } from '#/api/workflow';

import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import {
  Button,
  Empty,
  message,
  Spin,
  Table,
  TabPane,
  Tabs,
  Tag,
} from 'antdv-next';

import { getWorkflowInstanceDetailApi } from '#/api/workflow';
import { $t } from '#/locales';
import {
  getCopyStatusOptions,
  getInstanceStatusOptions,
  getStatusText,
  getTaskStatusOptions,
} from '#/views/workflow/runtime/data';

defineOptions({ name: 'WorkflowInstanceDetail' });

interface VariableEntry {
  key: string;
  value: string;
}

const actionOrder: Record<string, number> = {
  start: 10,
  branch: 20,
  pending: 30,
  approve: 40,
  reject: 40,
  rejected: 50,
  copy: 60,
  complete: 70,
  completed: 80,
  cancel: 90,
};

const route = useRoute();
const router = useRouter();
const detail = ref<WorkflowRuntimeApi.WorkflowInstanceDetail>();
const loading = ref(false);

const taskColumns = computed(() => [
  {
    dataIndex: 'nodeName',
    key: 'nodeName',
    title: $t('flow.runtime.common.node'),
    width: 180,
  },
  {
    dataIndex: 'assigneeName',
    key: 'assigneeName',
    title: $t('flow.runtime.detail.assignee'),
    width: 130,
  },
  {
    dataIndex: 'approvalMode',
    key: 'approvalMode',
    title: $t('flow.runtime.task.approvalMode'),
    width: 110,
  },
  {
    dataIndex: 'status',
    key: 'status',
    title: $t('flow.runtime.common.status'),
    width: 100,
  },
  {
    dataIndex: 'comment',
    key: 'comment',
    title: $t('flow.runtime.common.comment'),
    minWidth: 180,
  },
  {
    dataIndex: 'createDate',
    key: 'createDate',
    title: $t('flow.runtime.common.createDate'),
    width: 170,
  },
  {
    dataIndex: 'finishDate',
    key: 'finishDate',
    title: $t('flow.runtime.common.finishDate'),
    width: 170,
  },
]);

const copyColumns = computed(() => [
  {
    dataIndex: 'nodeName',
    key: 'nodeName',
    title: $t('flow.runtime.common.node'),
    width: 180,
  },
  {
    dataIndex: 'receiverName',
    key: 'receiverName',
    title: $t('flow.runtime.detail.receiver'),
    width: 130,
  },
  {
    dataIndex: 'status',
    key: 'status',
    title: $t('flow.runtime.common.status'),
    width: 100,
  },
  {
    dataIndex: 'createDate',
    key: 'createDate',
    title: $t('flow.runtime.common.createDate'),
    width: 170,
  },
  {
    dataIndex: 'readDate',
    key: 'readDate',
    title: $t('flow.runtime.common.readDate'),
    width: 170,
  },
]);

const orderedRecords = computed(() => {
  const records = detail.value?.records ?? [];
  return records
    .map((record, index) => ({ index, record }))
    .sort((left, right) => {
      const dateCompare = (left.record.createDate ?? '').localeCompare(
        right.record.createDate ?? '',
      );
      if (dateCompare !== 0) return dateCompare;
      const actionCompare =
        (actionOrder[left.record.action] ?? 999) -
        (actionOrder[right.record.action] ?? 999);
      return actionCompare === 0 ? left.index - right.index : actionCompare;
    })
    .map(({ record }) => record);
});

const variableEntries = computed<VariableEntry[]>(() =>
  Object.entries(detail.value?.instance.variables ?? {}).map(
    ([key, value]) => ({
      key,
      value: formatVariableValue(value),
    }),
  ),
);

function currentInstanceId() {
  const value = route.params.instanceId;
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

async function loadDetail() {
  const instanceId = currentInstanceId();
  if (!instanceId) return;
  loading.value = true;
  try {
    detail.value = await getWorkflowInstanceDetailApi(instanceId);
  } catch {
    message.error($t('flow.runtime.message.loadFailed'));
  } finally {
    loading.value = false;
  }
}

function statusColor(
  options: Array<{ color: string; value: string }>,
  status?: string,
) {
  return options.find((item) => item.value === status)?.color ?? 'default';
}

function recordActionText(action: string) {
  const knownActions = new Set([
    'approve',
    'branch',
    'cancel',
    'complete',
    'completed',
    'copy',
    'pending',
    'reject',
    'rejected',
    'start',
  ]);
  return knownActions.has(action)
    ? $t(`flow.runtime.detail.action.${action}`)
    : action;
}

function recordIcon(action: string) {
  const icons: Record<string, string> = {
    approve: 'lucide:check',
    branch: 'lucide:git-branch',
    cancel: 'lucide:ban',
    complete: 'lucide:flag',
    completed: 'lucide:circle-check-big',
    copy: 'lucide:mail',
    pending: 'lucide:clock-3',
    reject: 'lucide:x',
    rejected: 'lucide:circle-x',
    start: 'lucide:play',
  };
  return icons[action] ?? 'lucide:circle';
}

function recordTone(action: string) {
  if (['approve', 'complete', 'completed', 'copy'].includes(action)) {
    return 'success';
  }
  if (['reject', 'rejected'].includes(action)) return 'danger';
  if (action === 'pending') return 'warning';
  if (action === 'cancel') return 'neutral';
  return 'info';
}

function recordComment(record: WorkflowRuntimeApi.WorkflowRecord) {
  if (record.action === 'branch') return '';
  return record.comment?.trim() ?? '';
}

function formatVariableValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

watch(() => route.params.instanceId, loadDetail, { immediate: true });
</script>

<template>
  <Page>
    <Spin :spinning="loading">
      <div class="detail-page">
        <header class="detail-header">
          <Button
            class="detail-back"
            :title="$t('flow.runtime.detail.back')"
            @click="router.back()"
          >
            <IconifyIcon class="size-4" icon="lucide:arrow-left" />
          </Button>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="detail-title">
                {{ detail?.instance.title ?? $t('flow.runtime.detail.title') }}
              </h1>
              <Tag
                v-if="detail"
                :color="
                  statusColor(
                    getInstanceStatusOptions(),
                    detail.instance.status,
                  )
                "
              >
                {{
                  getStatusText(
                    getInstanceStatusOptions(),
                    detail.instance.status,
                  )
                }}
              </Tag>
            </div>
            <div v-if="detail" class="detail-subtitle">
              <span>{{ detail.instance.definitionName }}</span>
              <span class="detail-dot"></span>
              <span>v{{ detail.instance.definitionVersion }}</span>
            </div>
          </div>
        </header>

        <template v-if="detail">
          <section class="overview-band">
            <div class="overview-item">
              <IconifyIcon icon="lucide:user-round" />
              <div>
                <div class="overview-label">
                  {{ $t('flow.runtime.common.starter') }}
                </div>
                <div class="overview-value">
                  {{ detail.instance.starterName }}
                </div>
              </div>
            </div>
            <div class="overview-item">
              <IconifyIcon icon="lucide:calendar-play" />
              <div>
                <div class="overview-label">
                  {{ $t('flow.runtime.detail.startDate') }}
                </div>
                <div class="overview-value">
                  {{ detail.instance.startDate || '-' }}
                </div>
              </div>
            </div>
            <div class="overview-item">
              <IconifyIcon icon="lucide:calendar-check" />
              <div>
                <div class="overview-label">
                  {{ $t('flow.runtime.detail.endDate') }}
                </div>
                <div class="overview-value">
                  {{ detail.instance.endDate || '-' }}
                </div>
              </div>
            </div>
            <div class="overview-item">
              <IconifyIcon icon="lucide:briefcase-business" />
              <div class="min-w-0">
                <div class="overview-label">
                  {{ $t('flow.runtime.instance.businessKey') }}
                </div>
                <div class="overview-value break-all">
                  {{ detail.instance.businessKey || '-' }}
                </div>
              </div>
            </div>
          </section>

          <div class="detail-workspace">
            <section class="history-panel">
              <div class="section-heading">
                <div>
                  <h2>{{ $t('flow.runtime.detail.history') }}</h2>
                  <p>{{ detail.instance.definitionName }}</p>
                </div>
                <span class="section-count">{{ orderedRecords.length }}</span>
              </div>

              <div v-if="orderedRecords.length" class="timeline-list">
                <article
                  v-for="(record, index) in orderedRecords"
                  :key="record.recordId"
                  class="timeline-item"
                >
                  <div
                    v-if="index < orderedRecords.length - 1"
                    class="timeline-rail"
                  ></div>
                  <div
                    class="timeline-marker"
                    :class="`timeline-marker--${recordTone(record.action)}`"
                  >
                    <IconifyIcon :icon="recordIcon(record.action)" />
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-primary">
                      <div class="flex min-w-0 flex-wrap items-center gap-2">
                        <strong>{{ recordActionText(record.action) }}</strong>
                        <Tag v-if="record.nodeName" color="default">
                          {{ record.nodeName }}
                        </Tag>
                      </div>
                      <time>{{ record.createDate || '-' }}</time>
                    </div>
                    <div class="timeline-meta">
                      <span>
                        <IconifyIcon icon="lucide:user-round" />
                        {{
                          record.operatorName ||
                          $t('flow.runtime.detail.systemOperator')
                        }}
                      </span>
                      <span
                        v-if="recordComment(record)"
                        class="timeline-comment"
                      >
                        <IconifyIcon icon="lucide:message-square-text" />
                        {{ recordComment(record) }}
                      </span>
                    </div>
                  </div>
                </article>
              </div>
              <Empty
                v-else
                :description="$t('flow.runtime.detail.noRecords')"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
              />
            </section>

            <aside class="application-panel">
              <div class="section-heading">
                <div>
                  <h2>{{ $t('flow.runtime.detail.application') }}</h2>
                  <p>{{ $t('flow.runtime.detail.basic') }}</p>
                </div>
              </div>

              <dl class="info-list">
                <div class="info-row">
                  <dt>{{ $t('flow.runtime.common.definition') }}</dt>
                  <dd>{{ detail.instance.definitionName }}</dd>
                </div>
                <div class="info-row">
                  <dt>{{ $t('flow.runtime.detail.definitionVersion') }}</dt>
                  <dd>v{{ detail.instance.definitionVersion }}</dd>
                </div>
                <div class="info-row">
                  <dt>{{ $t('flow.runtime.detail.instanceId') }}</dt>
                  <dd class="break-all font-mono text-xs">
                    {{ detail.instance.instanceId }}
                  </dd>
                </div>
              </dl>

              <div class="variables-heading">
                <IconifyIcon icon="lucide:braces" />
                <h3>{{ $t('flow.runtime.detail.variables') }}</h3>
              </div>
              <dl v-if="variableEntries.length" class="variable-list">
                <div
                  v-for="variable in variableEntries"
                  :key="variable.key"
                  class="variable-row"
                >
                  <dt>{{ variable.key }}</dt>
                  <dd>{{ variable.value }}</dd>
                </div>
              </dl>
              <div v-else class="variables-empty">
                <IconifyIcon icon="lucide:braces" />
                <span>{{ $t('flow.runtime.detail.noVariables') }}</span>
              </div>
            </aside>
          </div>

          <section class="detail-table-section">
            <Tabs>
              <TabPane
                key="tasks"
                :tab="`${$t('flow.runtime.detail.tasks')} (${detail.tasks.length})`"
              >
                <Table
                  :columns="taskColumns"
                  :data-source="detail.tasks"
                  :pagination="false"
                  row-key="taskId"
                  :scroll="{ x: 1150 }"
                  size="small"
                >
                  <template #bodyCell="{ column, record }">
                    <span v-if="column.key === 'approvalMode'">
                      {{
                        record.approvalMode === 'all'
                          ? $t('flow.runtime.task.approvalAll')
                          : $t('flow.runtime.task.approvalAny')
                      }}
                    </span>
                    <Tag
                      v-else-if="column.key === 'status'"
                      :color="
                        statusColor(getTaskStatusOptions(), record.status)
                      "
                    >
                      {{ getStatusText(getTaskStatusOptions(), record.status) }}
                    </Tag>
                  </template>
                </Table>
              </TabPane>
              <TabPane
                key="copies"
                :tab="`${$t('flow.runtime.detail.copies')} (${detail.copies.length})`"
              >
                <Table
                  :columns="copyColumns"
                  :data-source="detail.copies"
                  :pagination="false"
                  row-key="copyId"
                  :scroll="{ x: 760 }"
                  size="small"
                >
                  <template #bodyCell="{ column, record }">
                    <Tag
                      v-if="column.key === 'status'"
                      :color="
                        statusColor(getCopyStatusOptions(), record.status)
                      "
                    >
                      {{ getStatusText(getCopyStatusOptions(), record.status) }}
                    </Tag>
                  </template>
                </Table>
              </TabPane>
            </Tabs>
          </section>
        </template>
      </div>
    </Spin>
  </Page>
</template>

<style scoped>
.detail-page {
  min-height: 100%;
  padding: 16px;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 0 0 16px;
}

.detail-back {
  width: 36px;
  height: 36px;
  flex: none;
  padding: 0;
}

.detail-title {
  overflow-wrap: anywhere;
  margin: 0;
  font-size: 20px;
  font-weight: 650;
  line-height: 30px;
}

.detail-subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.detail-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: hsl(var(--muted-foreground));
}

.overview-band {
  display: grid;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.overview-item {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  padding: 15px 18px;
}

.overview-item + .overview-item {
  border-left: 1px solid hsl(var(--border));
}

.overview-item > svg {
  width: 18px;
  height: 18px;
  flex: none;
  color: hsl(var(--primary));
}

.overview-label {
  margin-bottom: 3px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.overview-value {
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 550;
}

.detail-workspace {
  display: grid;
  overflow: hidden;
  margin-top: 16px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.85fr);
}

.history-panel,
.application-panel {
  min-width: 0;
  padding: 20px;
}

.application-panel {
  border-left: 1px solid hsl(var(--border));
  background: hsl(var(--muted) / 18%);
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.section-heading h2,
.variables-heading h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
}

.section-heading p {
  margin: 3px 0 0;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.section-count {
  min-width: 24px;
  height: 24px;
  border-radius: 12px;
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  line-height: 24px;
  text-align: center;
}

.timeline-list {
  max-width: 900px;
}

.timeline-item {
  position: relative;
  display: grid;
  gap: 14px;
  grid-template-columns: 32px minmax(0, 1fr);
}

.timeline-rail {
  position: absolute;
  top: 32px;
  bottom: 0;
  left: 15px;
  width: 1px;
  background: hsl(var(--border));
}

.timeline-marker {
  z-index: 1;
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  border-radius: 50%;
}

.timeline-marker > svg {
  width: 15px;
  height: 15px;
}

.timeline-marker--info {
  border-color: hsl(213 94% 68%);
  background: hsl(214 100% 97%);
  color: hsl(221 83% 53%);
}

.timeline-marker--success {
  border-color: hsl(142 69% 58%);
  background: hsl(138 76% 97%);
  color: hsl(142 71% 35%);
}

.timeline-marker--warning {
  border-color: hsl(43 96% 56%);
  background: hsl(48 100% 96%);
  color: hsl(32 95% 44%);
}

.timeline-marker--danger {
  border-color: hsl(0 91% 71%);
  background: hsl(0 86% 97%);
  color: hsl(0 72% 51%);
}

.timeline-marker--neutral {
  border-color: hsl(var(--border));
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
}

.timeline-content {
  min-width: 0;
  padding: 2px 0 20px;
  border-bottom: 1px solid hsl(var(--border));
}

.timeline-item:last-child .timeline-content {
  padding-bottom: 2px;
  border-bottom: 0;
}

.timeline-primary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.timeline-primary strong {
  font-size: 14px;
  font-weight: 600;
}

.timeline-primary time {
  flex: none;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.timeline-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  margin-top: 7px;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.timeline-meta span {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
}

.timeline-meta svg {
  width: 14px;
  height: 14px;
  flex: none;
}

.timeline-comment {
  overflow-wrap: anywhere;
  color: hsl(var(--foreground));
}

.info-list,
.variable-list {
  margin: 0;
}

.info-row,
.variable-row {
  display: grid;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid hsl(var(--border));
  grid-template-columns: minmax(88px, 0.7fr) minmax(0, 1.3fr);
}

.info-row dt,
.variable-row dt {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.info-row dd,
.variable-row dd {
  overflow-wrap: anywhere;
  margin: 0;
  font-size: 13px;
}

.variables-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 22px 0 8px;
}

.variables-heading svg {
  width: 16px;
  height: 16px;
  color: hsl(var(--muted-foreground));
}

.variable-row:last-child {
  border-bottom: 0;
}

.variable-row dt {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.variables-empty {
  display: flex;
  min-height: 96px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  border: 1px dashed hsl(var(--border));
  border-radius: 6px;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.variables-empty svg {
  width: 24px;
  height: 24px;
}

.detail-table-section {
  margin-top: 16px;
  padding: 0 16px 16px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
}

@media (max-width: 1024px) {
  .overview-band {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .overview-item:nth-child(3) {
    border-left: 0;
  }

  .overview-item:nth-child(n + 3) {
    border-top: 1px solid hsl(var(--border));
  }

  .detail-workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .application-panel {
    border-top: 1px solid hsl(var(--border));
    border-left: 0;
  }
}

@media (max-width: 640px) {
  .detail-page {
    padding: 12px;
  }

  .overview-band {
    grid-template-columns: minmax(0, 1fr);
  }

  .overview-item + .overview-item {
    border-top: 1px solid hsl(var(--border));
    border-left: 0;
  }

  .history-panel,
  .application-panel {
    padding: 16px;
  }

  .timeline-primary {
    flex-direction: column;
    gap: 5px;
  }

  .timeline-primary time {
    white-space: normal;
  }
}

:global(.dark) .timeline-marker--info {
  border-color: hsl(217 91% 60% / 55%);
  background: hsl(217 91% 60% / 12%);
  color: hsl(213 94% 75%);
}

:global(.dark) .timeline-marker--success {
  border-color: hsl(142 71% 45% / 55%);
  background: hsl(142 71% 45% / 12%);
  color: hsl(142 69% 68%);
}

:global(.dark) .timeline-marker--warning {
  border-color: hsl(38 92% 50% / 55%);
  background: hsl(38 92% 50% / 12%);
  color: hsl(43 96% 66%);
}

:global(.dark) .timeline-marker--danger {
  border-color: hsl(0 72% 51% / 55%);
  background: hsl(0 72% 51% / 12%);
  color: hsl(0 91% 76%);
}
</style>
