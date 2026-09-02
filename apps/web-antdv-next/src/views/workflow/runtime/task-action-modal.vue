<script lang="ts" setup>
import type { WorkflowRuntimeApi } from '#/api/workflow';

import { nextTick, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { message, Spin, TextArea } from 'antdv-next';

import {
  approveWorkflowTaskApi,
  getWorkflowInstanceDetailApi,
  rejectWorkflowTaskApi,
} from '#/api/workflow';
import { useVbenForm } from '#/adapter/form';
import { $t } from '#/locales';
import {
  compileVbenFormSchema,
  FORM_SCHEMA_WRAPPER_CLASS,
  getFormSchemaWrapperClass,
} from '#/utils/form-schema';

import {
  applyFieldPermissions,
  pickVariablesByPermission,
  type WorkflowFieldPermissions,
} from './field-permission';

interface ModalData {
  action: 'approve' | 'reject';
  task: WorkflowRuntimeApi.WorkflowTask;
}

const emit = defineEmits<{ success: [] }>();
const comment = ref('');
const fieldPermissions = ref<WorkflowFieldPermissions>({});
const hasApplicationFields = ref(false);
const loading = ref(false);
const modalData = ref<ModalData>();

const [ApplicationForm, applicationFormApi] = useVbenForm({
  schema: [],
  showDefaultActions: false,
  wrapperClass: FORM_SCHEMA_WRAPPER_CLASS,
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
        // 空表单(无字段权限或未绑定表单)跳过表单校验/取值,直接提交审批,避免空 schema 导致 validate 挂起
        if (hasApplicationFields.value) {
          const { valid } = await applicationFormApi.validate();
          if (!valid) return;
          const values = await applicationFormApi.getValues();
          const variables = pickVariablesByPermission(
            values,
            Object.keys(fieldPermissions.value),
            fieldPermissions.value,
            ['editable'],
            'readonly',
          );
          if (Object.keys(variables).length > 0) request.variables = variables;
        }
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
    hasApplicationFields.value = false;
    applicationFormApi.setState({ schema: [] });
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
    const node = detail.nodes.find(
      (item) => item.nodeInstanceId === data.task.nodeInstanceId,
    );
    if (!node) throw new Error('Workflow node instance not found');
    fieldPermissions.value = node.fieldPermissions;
    const schema = compileVbenFormSchema(detail.instance.formSchema ?? []);
    // 拒绝时非隐藏字段退化为只读,防止拒绝操作误改表单值
    const permissions =
      data.action === 'reject'
        ? degradeRejectPermissions(node.fieldPermissions)
        : node.fieldPermissions;
    const runtimeSchema = applyFieldPermissions(schema, permissions, 'readonly');
    hasApplicationFields.value = runtimeSchema.length > 0;
    // 空表单(未绑定表单 Schema 或字段权限全隐藏)跳过 setState/setValues,避免空 schema 触发表单组件异常导致 await 挂起
    if (runtimeSchema.length === 0) return;
    await nextTick();
    applicationFormApi.setState({
      schema: runtimeSchema,
      wrapperClass: getFormSchemaWrapperClass(detail.instance.formLayout),
    });
    await nextTick();
    await applicationFormApi.setValues(detail.instance.variables ?? {});
  } catch {
    message.error($t('flow.runtime.message.loadFailed'));
  } finally {
    loading.value = false;
  }
}

/** 拒绝时将非隐藏字段权限退化为只读,保留隐藏字段不渲染。 */
function degradeRejectPermissions(
  permissions: WorkflowFieldPermissions,
): WorkflowFieldPermissions {
  return Object.fromEntries(
    Object.entries(permissions).map(([fieldName, permission]) => [
      fieldName,
      permission === 'hidden' ? 'hidden' : 'readonly',
    ]),
  );
}
</script>

<template>
  <Modal class="w-[720px]">
    <Spin :spinning="loading">
      <div class="task-action-content">
        <section v-if="hasApplicationFields" class="application-section">
          <div class="section-title">
            {{ $t('flow.form.runtime.applicationContent') }}
          </div>
          <ApplicationForm />
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
