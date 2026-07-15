<script lang="ts" setup>
import type { WorkflowDefinitionApi, WorkflowRuntimeApi } from '#/api/workflow';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { message, Spin, TextArea } from 'antdv-next';

import {
  approveWorkflowTaskApi,
  getWorkflowInstanceDetailApi,
  rejectWorkflowTaskApi,
} from '#/api/workflow';
import { $t } from '#/locales';
import FormRenderer from '#/views/workflow/form/form-renderer.vue';
import { parseWorkflowFormSchema } from '#/views/workflow/form/schema';

interface ModalData {
  action: 'approve' | 'reject';
  task: WorkflowRuntimeApi.WorkflowTask;
}

interface FormRendererApi {
  getEditableValues: () => Record<string, unknown>;
  validate: () => Promise<void>;
}

const emit = defineEmits<{ success: [] }>();
const comment = ref('');
const fieldPermissions = ref<
  Record<string, WorkflowDefinitionApi.WorkflowFormFieldPermission>
>({});
const formRendererRef = ref<FormRendererApi>();
const formSchema = ref<WorkflowDefinitionApi.WorkflowFormSchema>({
  fields: [],
  version: 1,
});
const formValues = ref<Record<string, unknown>>({});
const loading = ref(false);
const modalData = ref<ModalData>();

const rendererPermissions = computed(() => {
  if (modalData.value?.action === 'approve') return fieldPermissions.value;
  return Object.fromEntries(
    Object.entries(fieldPermissions.value).map(([key, permission]) => [
      key,
      permission === 'hidden' ? 'hidden' : 'readonly',
    ]),
  ) as Record<string, WorkflowDefinitionApi.WorkflowFormFieldPermission>;
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const data = modalData.value;
    if (!data || loading.value) return;
    modalApi.lock();
    try {
      const request: WorkflowRuntimeApi.WorkflowTaskActionRequest = {
        comment: comment.value.trim() || undefined,
      };
      if (data.action === 'approve') {
        await formRendererRef.value?.validate();
        const variables = formRendererRef.value?.getEditableValues() ?? {};
        if (Object.keys(variables).length > 0) request.variables = variables;
        await approveWorkflowTaskApi(data.task.taskId, request);
        message.success($t('flow.runtime.task.approveSuccess'));
      } else {
        await rejectWorkflowTaskApi(data.task.taskId, request);
        message.success($t('flow.runtime.task.rejectSuccess'));
      }
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
    formSchema.value = { fields: [], version: 1 };
    formValues.value = {};
    fieldPermissions.value = {};
    modalApi.setState({
      title:
        modalData.value?.action === 'reject'
          ? $t('flow.runtime.task.reject')
          : $t('flow.runtime.task.approve'),
    });
    await loadApplication();
  },
});

/** 加载实例表单快照及当前审批节点字段权限。 */
async function loadApplication() {
  const data = modalData.value;
  if (!data) return;
  loading.value = true;
  try {
    const detail = await getWorkflowInstanceDetailApi(data.task.instanceId);
    formSchema.value = parseWorkflowFormSchema(detail.instance.formSchema);
    formValues.value = { ...detail.instance.variables };
    const node = detail.nodes.find(
      (item) => item.nodeInstanceId === data.task.nodeInstanceId,
    );
    if (!node) throw new Error('Workflow node instance not found');
    fieldPermissions.value = node.fieldPermissions;
  } catch {
    message.error($t('flow.runtime.message.loadFailed'));
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Modal class="w-[720px]">
    <Spin :spinning="loading">
      <div class="task-action-content">
        <section v-if="formSchema.fields.length" class="application-section">
          <div class="section-title">
            {{ $t('flow.form.runtime.applicationContent') }}
          </div>
          <FormRenderer
            ref="formRendererRef"
            :field-permissions="rendererPermissions"
            :model-value="formValues"
            :schema="formSchema"
            @update:model-value="formValues = $event"
          />
        </section>
        <label class="comment-field">
          <span>{{ $t('flow.runtime.common.comment') }}</span>
          <TextArea
            v-model:value="comment"
            :maxlength="512"
            :placeholder="$t('flow.runtime.task.commentPlaceholder')"
            :rows="4"
            show-count
          />
        </label>
      </div>
    </Spin>
  </Modal>
</template>

<style scoped></style>
