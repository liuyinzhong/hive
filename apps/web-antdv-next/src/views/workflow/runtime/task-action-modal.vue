<script lang="ts" setup>
import type { WorkflowRuntimeApi } from '#/api/workflow';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { message, TextArea } from 'antdv-next';

import { approveWorkflowTaskApi, rejectWorkflowTaskApi } from '#/api/workflow';
import { $t } from '#/locales';

interface ModalData {
  action: 'approve' | 'reject';
  task: WorkflowRuntimeApi.WorkflowTask;
}

const emit = defineEmits<{ success: [] }>();
const comment = ref('');
let modalData: ModalData | undefined;

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    if (!modalData) return;
    modalApi.lock();
    try {
      const request = { comment: comment.value.trim() || undefined };
      if (modalData.action === 'approve') {
        await approveWorkflowTaskApi(modalData.task.taskId, request);
        message.success($t('flow.runtime.task.approveSuccess'));
      } else {
        await rejectWorkflowTaskApi(modalData.task.taskId, request);
        message.success($t('flow.runtime.task.rejectSuccess'));
      }
      modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  onOpenChange(open) {
    if (!open) return;
    modalData = modalApi.getData<ModalData>();
    comment.value = '';
    modalApi.setState({
      title:
        modalData?.action === 'reject'
          ? $t('flow.runtime.task.reject')
          : $t('flow.runtime.task.approve'),
    });
  },
});
</script>

<template>
  <Modal class="w-[520px]">
    <TextArea
      v-model:value="comment"
      :maxlength="512"
      :placeholder="$t('flow.runtime.task.commentPlaceholder')"
      :rows="5"
      show-count
    />
  </Modal>
</template>
