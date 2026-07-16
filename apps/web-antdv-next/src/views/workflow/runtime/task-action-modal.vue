<script lang="ts" setup>
import type { WorkflowDefinitionApi, WorkflowRuntimeApi } from '#/api/workflow';
import type { VbenFormSchema } from '#/adapter/form';

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

interface ModalData {
  action: 'approve' | 'reject';
  task: WorkflowRuntimeApi.WorkflowTask;
}

const emit = defineEmits<{ success: [] }>();
const comment = ref('');
const fieldPermissions = ref<
  Record<string, WorkflowDefinitionApi.WorkflowFormFieldPermission>
>({});
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
        const { valid } = await applicationFormApi.validate();
        if (!valid) return;
        const values = await applicationFormApi.getValues();
        const variables = pickEditableVariables(values, fieldPermissions.value);
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
    const runtimeSchema = applyFieldPermissions(
      schema,
      node.fieldPermissions,
      data.action,
    );
    hasApplicationFields.value = runtimeSchema.length > 0;
    await nextTick();
    applicationFormApi.setState({
      schema: runtimeSchema,
      wrapperClass: getFormSchemaWrapperClass(detail.instance.formLayout),
    });
    await nextTick();
    await applicationFormApi.setValues(detail.instance.variables);
  } catch {
    message.error($t('flow.runtime.message.loadFailed'));
  } finally {
    loading.value = false;
  }
}

/** 按字段权限提取可编辑值，并保留 Vben 点路径生成的嵌套结构。 */
function pickEditableVariables(
  values: Record<string, unknown>,
  permissions: Record<
    string,
    WorkflowDefinitionApi.WorkflowFormFieldPermission
  >,
) {
  const result: Record<string, unknown> = {};
  for (const [fieldName, permission] of Object.entries(permissions)) {
    if (permission !== 'editable') continue;
    const fieldValue = valueAtPath(values, fieldName);
    if (!fieldValue.found) continue;
    setValueAtPath(result, fieldName, fieldValue.value);
  }
  return result;
}

function valueAtPath(values: Record<string, unknown>, fieldName: string) {
  let current: unknown = values;
  for (const part of fieldName.split('.')) {
    if (!isRecord(current) || !(part in current)) {
      return { found: false, value: undefined };
    }
    current = current[part];
  }
  return { found: true, value: current };
}

function setValueAtPath(
  values: Record<string, unknown>,
  fieldName: string,
  value: unknown,
) {
  const parts = fieldName.split('.');
  let current = values;
  for (const part of parts.slice(0, -1)) {
    const next = current[part];
    if (isRecord(next)) {
      current = next;
    } else {
      const nested: Record<string, unknown> = {};
      current[part] = nested;
      current = nested;
    }
  }
  const lastPart = parts.at(-1);
  if (lastPart) current[lastPart] = value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** 将审批节点字段权限应用到编译后的 Vben Schema。 */
function applyFieldPermissions(
  schema: VbenFormSchema[],
  permissions: Record<
    string,
    WorkflowDefinitionApi.WorkflowFormFieldPermission
  >,
  action: ModalData['action'],
) {
  return schema.map((field) => {
    const configured = permissions[field.fieldName] ?? 'readonly';
    const permission =
      action === 'reject' && configured !== 'hidden' ? 'readonly' : configured;
    return {
      ...field,
      disabled: permission !== 'editable' || field.disabled,
      hide: permission === 'hidden' || field.hide,
      rules: permission === 'editable' ? field.rules : undefined,
    } as VbenFormSchema;
  });
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
