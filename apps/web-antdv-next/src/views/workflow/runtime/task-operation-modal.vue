<script lang="ts" setup>
import type { WorkflowRuntimeApi } from '#/api/workflow';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { message, Select, Spin, TextArea } from 'antdv-next';

import { getUserListAllApi } from '#/api/system';
import {
  addWorkflowTaskSignApi,
  getWorkflowInstanceDetailApi,
  getWorkflowTaskReturnTargetsApi,
  removeWorkflowTaskSignApi,
  returnWorkflowTaskApi,
  transferWorkflowTaskApi,
} from '#/api/workflow';
import { $t } from '#/locales';

type TaskOperation =
  | 'addSign'
  | 'removeSign'
  | 'returnNode'
  | 'returnPrevious'
  | 'transfer';

interface ModalData {
  action: TaskOperation;
  task: WorkflowRuntimeApi.WorkflowTask;
}

interface SelectOption {
  label: string;
  value: string;
}

const emit = defineEmits<{ success: [] }>();
const comment = ref('');
const loading = ref(false);
const options = ref<SelectOption[]>([]);
const selectedIds = ref<string[]>([]);
const selectedValue = ref<string>();
const modalData = ref<ModalData>();

const isMultiple = computed(() =>
  ['addSign', 'removeSign'].includes(modalData.value?.action ?? ''),
);
const operationLabel = computed(() =>
  modalData.value
    ? $t(`flow.runtime.task.operation.${modalData.value.action}`)
    : '',
);
const selectPlaceholder = computed(() =>
  modalData.value
    ? $t(`flow.runtime.task.operation.${modalData.value.action}Placeholder`)
    : '',
);

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const data = modalData.value;
    if (!data || loading.value) return;
    if (
      (isMultiple.value && selectedIds.value.length === 0) ||
      (!isMultiple.value && !selectedValue.value)
    ) {
      message.warning(selectPlaceholder.value);
      return;
    }
    modalApi.lock();
    try {
      const request: WorkflowRuntimeApi.WorkflowTaskOperationRequest = {
        comment: comment.value.trim() || undefined,
      };
      switch (data.action) {
        case 'transfer': {
          request.targetUserId = selectedValue.value;
          await transferWorkflowTaskApi(data.task.taskId, request);
          break;
        }
        case 'addSign': {
          request.userIds = selectedIds.value;
          await addWorkflowTaskSignApi(data.task.taskId, request);
          break;
        }
        case 'removeSign': {
          request.taskIds = selectedIds.value;
          await removeWorkflowTaskSignApi(data.task.taskId, request);
          break;
        }
        case 'returnNode':
        case 'returnPrevious': {
          request.targetNodeId = selectedValue.value;
          await returnWorkflowTaskApi(data.task.taskId, request);
          break;
        }
      }
      message.success($t(`flow.runtime.task.operation.${data.action}Success`));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(open) {
    if (!open) return;
    modalData.value = modalApi.getData<ModalData>();
    comment.value = '';
    options.value = [];
    selectedIds.value = [];
    selectedValue.value = undefined;
    modalApi.setState({ title: operationLabel.value });
    await loadOptions();
  },
});

/** 根据操作加载候选用户、同组任务或历史退回节点。 */
async function loadOptions() {
  const data = modalData.value;
  if (!data) return;
  loading.value = true;
  try {
    if (data.action === 'returnNode' || data.action === 'returnPrevious') {
      const targets = await getWorkflowTaskReturnTargetsApi(data.task.taskId);
      options.value = targets.map((target) => ({
        label: target.nodeName,
        value: target.nodeId,
      }));
      if (data.action === 'returnPrevious') {
        selectedValue.value = options.value[0]?.value;
      }
      return;
    }

    const detail = await getWorkflowInstanceDetailApi(data.task.instanceId);
    const groupTasks = detail.nodes
      .flatMap((node) => node.tasks)
      .filter((task) => task.taskGroupId === data.task.taskGroupId);
    if (data.action === 'removeSign') {
      options.value = groupTasks
        .filter(
          (task) => task.status === '0' && task.taskId !== data.task.taskId,
        )
        .map((task) => ({
          label: task.assigneeName,
          value: task.taskId,
        }));
      return;
    }

    const existingUserIds = new Set(
      groupTasks
        .filter((task) => task.status === '0' || task.status === '1')
        .map((task) => task.assigneeId),
    );
    const users = await getUserListAllApi();
    options.value = (users ?? [])
      .filter((user) => !existingUserIds.has(String(user.userId)))
      .map((user) => ({
        label: user.realName || user.username,
        value: String(user.userId),
      }));
  } catch {
    message.error($t('flow.runtime.message.loadFailed'));
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Modal class="w-[560px]">
    <Spin :spinning="loading">
      <div class="operation-form">
        <label class="operation-field">
          <span>{{ operationLabel }}</span>
          <Select
            v-if="isMultiple"
            v-model:value="selectedIds"
            allow-clear
            mode="multiple"
            :options="options"
            option-filter-prop="label"
            :placeholder="selectPlaceholder"
            show-search
          />
          <Select
            v-else
            v-model:value="selectedValue"
            allow-clear
            :disabled="modalData?.action === 'returnPrevious'"
            :options="options"
            option-filter-prop="label"
            :placeholder="selectPlaceholder"
            show-search
          />
          <small v-if="options.length === 0 && !loading">
            {{ $t('flow.runtime.task.operation.noOptions') }}
          </small>
        </label>

        <label class="operation-field">
          <span>{{ $t('flow.runtime.task.operation.note') }}</span>
          <TextArea
            v-model:value="comment"
            :maxlength="512"
            :placeholder="$t('flow.runtime.task.operation.notePlaceholder')"
            :rows="4"
            show-count
          />
        </label>
      </div>
    </Spin>
  </Modal>
</template>

<style scoped>
.operation-form,
.operation-field {
  display: flex;
  flex-direction: column;
}

.operation-form {
  gap: 16px;
}

.operation-field {
  gap: 8px;
  color: hsl(var(--foreground));
  font-size: 13px;
  font-weight: 500;
}

.operation-field small {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  font-weight: 400;
}
</style>
