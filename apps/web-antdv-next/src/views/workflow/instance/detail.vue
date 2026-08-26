<script lang="ts" setup>
import type { WorkflowRuntimeApi } from '#/api/workflow';
import type { VbenFormSchema } from '#/adapter/form';

import { computed, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { preferences } from '@vben/preferences';
import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Empty,
  message,
  Row,
  Spin,
  TabPane,
  Tabs,
  Tag,
} from 'antdv-next';

import { getUserListAllApi } from '#/api/system';
import { getWorkflowInstanceDetailApi } from '#/api/workflow';
import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import UserAvatar from '#/components/UserAvatar/index.vue';
import UserAvatarGroup from '#/components/UserAvatarGroup/index.vue';
import { $t } from '#/locales';
import {
  compileVbenFormSchema,
  FORM_SCHEMA_WRAPPER_CLASS,
  getFormSchemaWrapperClass,
} from '#/utils/form-schema';
import {
  getCopyStatusOptions,
  getInstanceStatusOptions,
  getStatusText,
  getTaskStatusOptions,
  useCopyDetailColumns,
  useTaskDetailColumns,
} from '#/views/workflow/runtime/data';

defineOptions({ name: 'WorkflowInstanceDetail' });

interface NodePerson {
  id: string;
  name: string;
  tooltip: string;
}

const route = useRoute();
const router = useRouter();
const detail = ref<WorkflowRuntimeApi.WorkflowInstanceDetail>();
const loading = ref(false);
const userAvatarMap = ref(new Map<string, string>());
const hasApplicationFields = ref(false);

/** 关联业务摘要文案:业务类型中文名 + 业务标题;标题缺失时(业务已删等降级场景)回退业务ID。 */
const businessSummaryText = computed(() => {
  const business = detail.value?.business;
  if (!business) return '';
  const title = business.businessTitle || business.businessId;
  return business.businessLabel ? `${business.businessLabel} · ${title}` : title;
});

const [ApplicationForm, applicationFormApi] = useVbenForm({
  schema: [],
  showDefaultActions: false,
  wrapperClass: FORM_SCHEMA_WRAPPER_CLASS,
});

const [TaskGrid] = useVbenVxeGrid<WorkflowRuntimeApi.WorkflowTask>({
  class: 'h-auto',
  showSearchForm: false,
  gridOptions: {
    columns: useTaskDetailColumns(),
    height: 'auto',
    minHeight: 400,
    pagerConfig: {
      enabled: false,
    },
    rowConfig: { keyField: 'taskId' },
    scrollY: {
      enabled: false,
    },
  },
});

const [CopyGrid] = useVbenVxeGrid<WorkflowRuntimeApi.WorkflowCopy>({
  class: 'h-auto',
  showSearchForm: false,
  gridOptions: {
    columns: useCopyDetailColumns(),
    height: 'auto',
    minHeight: 400,
    pagerConfig: {
      enabled: false,
    },
    rowConfig: { keyField: 'copyId' },
    scrollY: {
      enabled: false,
    },
  },
});

const progressNodes = computed(() => detail.value?.nodes ?? []);
const progressItemCount = computed(() => progressNodes.value.length);
const allTasks = computed(() =>
  progressNodes.value.flatMap((node) => node.tasks),
);
const allCopies = computed(() =>
  progressNodes.value.flatMap((node) => node.copies),
);

function currentInstanceId() {
  const value = route.params.instanceId;
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

async function loadDetail() {
  const instanceId = currentInstanceId();
  if (!instanceId) return;
  loading.value = true;
  hasApplicationFields.value = false;
  applicationFormApi.setState({ schema: [] });
  try {
    const [workflowDetail] = await Promise.all([
      getWorkflowInstanceDetailApi(instanceId),
      loadUserAvatars(),
    ]);
    detail.value = workflowDetail;
    await renderApplicationForm(workflowDetail);
  } catch {
    message.error($t('flow.runtime.message.loadFailed'));
  } finally {
    loading.value = false;
  }
}

/** 使用实例中的 Schema 快照渲染只读申请表单。 */
async function renderApplicationForm(
  workflowDetail: WorkflowRuntimeApi.WorkflowInstanceDetail,
) {
  const schema = compileVbenFormSchema(
    workflowDetail.instance.formSchema ?? [],
  ).map(
    (field) =>
      ({
        ...field,
        disabled: true,
        rules: undefined,
      }) as VbenFormSchema,
  );
  hasApplicationFields.value = schema.length > 0;
  // 空表单(未绑定表单 Schema 的流程实例)跳过 setState/setValues,避免空 schema 触发表单组件异常导致 await 挂起
  if (schema.length === 0) return;
  await nextTick();
  applicationFormApi.setState({
    schema,
    wrapperClass: getFormSchemaWrapperClass(workflowDetail.instance.formLayout),
  });
  await nextTick();
  await applicationFormApi.setValues(workflowDetail.instance.variables ?? {});
}

async function loadUserAvatars() {
  try {
    const users = await getUserListAllApi();
    userAvatarMap.value = new Map(
      users.map((user) => [user.userId, user.avatar ?? '']),
    );
  } catch {
    userAvatarMap.value = new Map();
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
    'planned',
    'approve',
    'autoApprove',
    'addSign',
    'branch',
    'cancel',
    'complete',
    'copy',
    'pending',
    'removeSign',
    'reject',
    'start',
    'transfer',
    'return',
  ]);
  return knownActions.has(action)
    ? $t(`flow.runtime.detail.action.${action}`)
    : action;
}

function recordIcon(action: string) {
  const icons: Record<string, string> = {
    approve: 'lucide:check',
    autoApprove: 'lucide:badge-check',
    addSign: 'lucide:user-round-plus',
    branch: 'lucide:git-branch',
    cancel: 'lucide:ban',
    complete: 'lucide:flag',
    copy: 'lucide:mail',
    pending: 'lucide:clock-3',
    removeSign: 'lucide:user-round-minus',
    reject: 'lucide:x',
    start: 'lucide:play',
    transfer: 'lucide:send',
    return: 'lucide:undo-2',
  };
  return icons[action] ?? 'lucide:circle';
}

function nodeIcon(node: WorkflowRuntimeApi.WorkflowNodeInstance) {
  if (node.status !== '0') return recordIcon(node.action);
  const icons: Record<WorkflowRuntimeApi.NodeType, string> = {
    approve: 'lucide:circle-dashed',
    condition: 'lucide:git-branch',
    copy: 'lucide:mail',
    end: 'lucide:flag',
    start: 'lucide:play',
  };
  return icons[node.nodeType];
}

function nodeTone(node: WorkflowRuntimeApi.WorkflowNodeInstance) {
  if (node.status === '0') return 'upcoming';
  if (node.status === '1') return 'warning';
  if (node.status === '2') return 'success';
  return node.action === 'cancel' ? 'neutral' : 'danger';
}

function recordComment(record: WorkflowRuntimeApi.WorkflowRecord) {
  if (record.action === 'branch') return '';
  return record.comment?.trim() ?? '';
}

function approvalModeText(mode?: null | WorkflowRuntimeApi.ApprovalMode) {
  return mode === 'all'
    ? $t('flow.runtime.task.approvalAll')
    : $t('flow.runtime.task.approvalAny');
}

function userAvatar(userId: string) {
  return userAvatarMap.value.get(userId) || undefined;
}

function userAvatarWithFallback(userId: string) {
  return userAvatar(userId) || preferences.app.defaultAvatar;
}

function nodePeople(
  node: WorkflowRuntimeApi.WorkflowNodeInstance,
): NodePerson[] {
  if (node.nodeType === 'approve' && node.tasks.length > 0) {
    return node.tasks.map((task) => ({
      id: task.assigneeId,
      name: task.assigneeName,
      tooltip: `${task.assigneeName} · ${getStatusText(
        getTaskStatusOptions(),
        task.status,
      )}`,
    }));
  }
  if (node.nodeType === 'copy' && node.copies.length > 0) {
    return node.copies.map((copy) => ({
      id: copy.receiverId,
      name: copy.receiverName,
      tooltip: `${copy.receiverName} · ${getStatusText(
        getCopyStatusOptions(),
        copy.status,
      )}`,
    }));
  }
  return node.actors.map((actor) => ({
    id: actor.userId,
    name: actor.userName,
    tooltip: actor.userName,
  }));
}

function nodeAvatarUsers(node: WorkflowRuntimeApi.WorkflowNodeInstance) {
  return nodePeople(node).map((person) => ({
    avatar: userAvatar(person.id) ?? '',
    realName: person.tooltip,
    userId: person.id,
  }));
}

watch(() => route.params.instanceId, loadDetail, { immediate: true });
</script>

<template>
  <Page>
    <template #title>
      <div class="page-heading">
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
                statusColor(getInstanceStatusOptions(), detail.instance.status)
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
      </div>
    </template>

    <Spin :spinning="loading">
      <div class="detail-page">
        <template v-if="detail">
          <Card
            class="detail-card"
            size="small"
            :title="$t('flow.runtime.detail.basic')"
          >
            <Descriptions
              class="basic-descriptions"
              :column="{ lg: 4, md: 3, sm: 2, xs: 1 }"
              bordered
              size="small"
            >
              <DescriptionsItem :label="$t('flow.runtime.common.starter')">
                {{ detail.instance.starterName }}
              </DescriptionsItem>
              <DescriptionsItem :label="$t('flow.runtime.detail.instanceNo')">
                {{ detail.instance.instanceNo }}
              </DescriptionsItem>
              <DescriptionsItem :label="$t('flow.runtime.common.definition')">
                {{ detail.instance.definitionName }}
              </DescriptionsItem>
              <DescriptionsItem
                :label="$t('flow.runtime.detail.definitionVersion')"
              >
                v{{ detail.instance.definitionVersion }}
              </DescriptionsItem>
              <DescriptionsItem :label="$t('flow.runtime.detail.startDate')">
                {{ detail.instance.startDate || '-' }}
              </DescriptionsItem>
              <DescriptionsItem :label="$t('flow.runtime.detail.endDate')">
                {{ detail.instance.endDate || '-' }}
              </DescriptionsItem>
              <DescriptionsItem
                :label="$t('flow.runtime.instance.business')"
              >
                <Button
                  v-if="detail.business?.detailPath"
                  type="link"
                  size="small"
                  class="business-link"
                  @click="router.push(detail.business.detailPath)"
                >
                  {{ businessSummaryText }}
                </Button>
                <span v-else-if="detail.business">
                  {{ businessSummaryText }}
                </span>
                <template v-else>-</template>
              </DescriptionsItem>
            </Descriptions>
          </Card>

          <Row class="detail-workspace" :gutter="[16, 16]">
            <Col :lg="16" :xs="24">
              <Card class="detail-card h-full" size="small">
                <template #title>
                  <div class="card-heading">
                    <h2>{{ $t('flow.runtime.detail.history') }}</h2>
                  </div>
                </template>
                <template #extra>
                  <span class="section-count">{{ progressItemCount }}</span>
                </template>

                <div v-if="progressItemCount" class="timeline-list">
                  <article
                    v-for="(node, index) in progressNodes"
                    :key="node.nodeInstanceId"
                    class="timeline-item"
                    :class="{ 'timeline-item--upcoming': node.status === '0' }"
                  >
                    <div
                      v-if="index < progressNodes.length - 1"
                      class="timeline-rail"
                      :class="{
                        'timeline-rail--upcoming': node.status === '0',
                      }"
                    ></div>
                    <div
                      class="timeline-marker"
                      :class="`timeline-marker--${nodeTone(node)}`"
                    >
                      <IconifyIcon :icon="nodeIcon(node)" />
                    </div>
                    <div class="timeline-content">
                      <div
                        class="timeline-primary flex flex-col items-start justify-between gap-1 sm:flex-row sm:gap-4"
                      >
                        <div class="flex min-w-0 flex-wrap items-center gap-2">
                          <strong>{{ recordActionText(node.action) }}</strong>
                          <Tag color="default">{{ node.nodeName }}</Tag>
                          <Tag v-if="node.approvalMode" color="blue">
                            {{ approvalModeText(node.approvalMode) }}
                          </Tag>
                          <span
                            v-if="node.durationSeconds != null"
                            class="timeline-duration"
                          >
                            <IconifyIcon icon="lucide:clock-3" />
                            {{
                              $t('flow.runtime.detail.durationSeconds', [
                                node.durationSeconds,
                              ])
                            }}
                          </span>
                        </div>
                        <div
                          class="timeline-timing flex shrink-0 flex-col items-start gap-1 sm:items-end"
                        >
                          <time>{{ node.startDate || '-' }}</time>
                        </div>
                      </div>
                      <div
                        v-if="
                          node.nodeType === 'approve' && node.records.length
                        "
                        class="mt-3 flex flex-col gap-3"
                      >
                        <div
                          v-for="operation in node.records"
                          :key="operation.recordId"
                          class="grid min-w-0 grid-cols-[95px_minmax(0,1fr)] items-center gap-3"
                        >
                          <UserAvatar
                            :avatar="
                              userAvatarWithFallback(operation.operatorId ?? '')
                            "
                            :name="operation.operatorName ?? '-'"
                          />
                          <div
                            class="flex min-w-0 items-center justify-between gap-4 border-l pl-3"
                          >
                            <div class="min-w-0 break-words text-sm">
                              {{ recordComment(operation) || '-' }}
                            </div>
                            <time
                              class="text-muted-foreground shrink-0 whitespace-nowrap text-xs"
                            >
                              {{ operation.createDate || '-' }}
                            </time>
                          </div>
                        </div>
                      </div>
                      <div
                        v-else-if="nodePeople(node).length"
                        class="approver-display"
                        :class="{
                          'approver-display--upcoming': node.status === '0',
                        }"
                      >
                        <template v-if="nodePeople(node).length === 1">
                          <UserAvatar
                            :avatar="
                              userAvatarWithFallback(nodePeople(node)[0]!.id)
                            "
                            :name="nodePeople(node)[0]!.name"
                          />
                          <Tag
                            v-if="node.nodeType === 'copy' && node.copies[0]"
                            :color="
                              statusColor(
                                getCopyStatusOptions(),
                                node.copies[0].status,
                              )
                            "
                          >
                            {{
                              getStatusText(
                                getCopyStatusOptions(),
                                node.copies[0].status,
                              )
                            }}
                          </Tag>
                        </template>
                        <UserAvatarGroup
                          v-else
                          :max-count="nodePeople(node).length"
                          :user-list="nodeAvatarUsers(node)"
                        />
                      </div>
                      <div v-else class="timeline-meta">
                        <span>
                          <IconifyIcon icon="lucide:settings" />
                          {{ $t('flow.runtime.detail.systemOperator') }}
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
              </Card>
            </Col>

            <Col :lg="8" :xs="24">
              <Card class="detail-card h-full" size="small">
                <template #title>
                  <div class="card-heading">
                    <h2>{{ $t('flow.runtime.detail.application') }}</h2>
                  </div>
                </template>

                <ApplicationForm v-if="hasApplicationFields" />
                <div v-else class="variables-empty">
                  <IconifyIcon icon="lucide:braces" />
                  <span>{{ $t('flow.runtime.detail.noVariables') }}</span>
                </div>
              </Card>
            </Col>
          </Row>

          <Card class="detail-card detail-table-card" size="small">
            <Tabs>
              <TabPane
                key="tasks"
                :tab="`${$t('flow.runtime.detail.tasks')} (${allTasks.length})`"
              >
                <TaskGrid :table-data="allTasks" />
              </TabPane>
              <TabPane
                key="copies"
                :tab="`${$t('flow.runtime.detail.copies')} (${allCopies.length})`"
              >
                <CopyGrid :table-data="allCopies" />
              </TabPane>
            </Tabs>
          </Card>
        </template>
      </div>
    </Spin>
  </Page>
</template>

<style scoped>
.detail-page {
  min-height: 100%;
}

/* 修正 link 按钮在 Descriptions 单元格内的默认内边距 */
.business-link {
  padding: 0;
}

.page-heading {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.detail-back {
  flex: none;
  width: 36px;
  height: 36px;
  padding: 0;
}

.detail-title {
  margin: 0;
  font-size: 20px;
  font-weight: 650;
  line-height: 30px;
  overflow-wrap: anywhere;
}

.detail-subtitle {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 2px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.detail-dot {
  width: 3px;
  height: 3px;
  background: hsl(var(--muted-foreground));
  border-radius: 50%;
}

.basic-descriptions :deep(.ant-descriptions-item-content) {
  min-width: 0;
  overflow-wrap: anywhere;
}

.detail-workspace {
  margin-top: 16px;
}

.detail-card {
  min-width: 0;
}

.detail-table-card {
  margin-top: 16px;
}

.card-heading h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
}

.card-heading p {
  margin: 3px 0 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.section-count {
  min-width: 24px;
  height: 24px;
  font-size: 12px;
  line-height: 24px;
  color: hsl(var(--muted-foreground));
  text-align: center;
  background: hsl(var(--muted));
  border-radius: 12px;
}

.timeline-list {
  max-width: 900px;
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  gap: 14px;
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
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid;
  border-radius: 50%;
}

.timeline-marker > svg {
  width: 15px;
  height: 15px;
}

.timeline-marker--success {
  color: hsl(142deg 71% 35%);
  background: hsl(138deg 76% 97%);
  border-color: hsl(142deg 69% 58%);
}

.timeline-marker--warning {
  color: hsl(32deg 95% 44%);
  background: hsl(48deg 100% 96%);
  border-color: hsl(43deg 96% 56%);
}

.timeline-marker--danger {
  color: hsl(0deg 72% 51%);
  background: hsl(0deg 86% 97%);
  border-color: hsl(0deg 91% 71%);
}

.timeline-marker--neutral {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted));
  border-color: hsl(var(--border));
}

.timeline-marker--upcoming {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--background));
  border-color: hsl(var(--border));
  border-style: dashed;
}

.timeline-rail--upcoming {
  background: repeating-linear-gradient(
    to bottom,
    hsl(var(--border)) 0,
    hsl(var(--border)) 4px,
    transparent 4px,
    transparent 8px
  );
}

.timeline-item--upcoming .timeline-content {
  color: hsl(var(--muted-foreground));
}

.timeline-content {
  min-width: 0;
  padding: 10px 0;
  border-bottom: 1px dashed hsl(var(--border));
}

.timeline-item:last-child .timeline-content {
  padding-bottom: 2px;
  border-bottom: 0;
}

.timeline-primary strong {
  font-size: 14px;
  font-weight: 600;
}

.timeline-timing time {
  flex: none;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.timeline-duration {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  color: hsl(221deg 83% 53%);
}

.timeline-duration svg {
  width: 13px;
  height: 13px;
}

.timeline-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  margin-top: 7px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.timeline-meta span {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
}

.timeline-meta svg {
  flex: none;
  width: 14px;
  height: 14px;
}

.approver-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 9px;
}

.approver-display--upcoming {
  opacity: 0.78;
}

.variables-empty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 96px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  border: 1px dashed hsl(var(--border));
  border-radius: 6px;
}

.variables-empty svg {
  width: 24px;
  height: 24px;
}

:global(.dark) .timeline-marker--success {
  color: hsl(142deg 69% 68%);
  background: hsl(142deg 71% 45% / 12%);
  border-color: hsl(142deg 71% 45% / 55%);
}

:global(.dark) .timeline-marker--warning {
  color: hsl(43deg 96% 66%);
  background: hsl(38deg 92% 50% / 12%);
  border-color: hsl(38deg 92% 50% / 55%);
}

:global(.dark) .timeline-marker--danger {
  color: hsl(0deg 91% 76%);
  background: hsl(0deg 72% 51% / 12%);
  border-color: hsl(0deg 72% 51% / 55%);
}
</style>
