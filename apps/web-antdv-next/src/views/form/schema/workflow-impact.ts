import type { FormSchemaApi } from '#/api/form';

import { h } from 'vue';

import { Modal } from 'antdv-next';

import { getFormSchemaWorkflowsApi } from '#/api/form';
import { $t } from '#/locales';

type WorkflowImpactSnapshot = {
  layout?: null | string;
  schema?: FormSchemaApi.FormSchemaRecord['schema'];
  status?: null | string;
};

// 与后端 UpdateFormSchema 的退草稿判定保持一致：仅 schema/layout/status 变化触发，
// 名称、分类、备注不触发（FORM-LINK-001/002）。
export function willRepublishWorkflows(
  original: WorkflowImpactSnapshot,
  next: WorkflowImpactSnapshot,
): boolean {
  return (
    JSON.stringify(original.schema ?? []) !==
      JSON.stringify(next.schema ?? []) ||
    original.layout !== next.layout ||
    original.status !== next.status
  );
}

function workflowStatusText(status: number) {
  const keys: Record<number, string> = {
    0: 'form.workflowStatus.draft',
    1: 'form.workflowStatus.published',
    2: 'form.workflowStatus.disabled',
  };
  return $t(keys[status] ?? 'form.workflowStatus.draft');
}

// 保存前查询引用该表单的流程并弹二次确认；返回是否继续保存。
export async function confirmWorkflowImpact(
  formSchemaId: string,
): Promise<boolean> {
  const workflows = await getFormSchemaWorkflowsApi(formSchemaId);
  if (workflows.length === 0) {
    return true;
  }
  return new Promise((resolve) => {
    Modal.confirm({
      content: () =>
        h('div', [
          h(
            'div',
            { style: 'margin-bottom: 8px' },
            $t('form.messages.workflowImpactTip', [workflows.length]),
          ),
          h(
            'div',
            { style: 'max-height: 240px; overflow: auto; padding-left: 2px' },
            workflows.map((workflow) =>
              h(
                'div',
                { key: workflow.definitionId },
                `${workflow.definitionKey}：${workflow.definitionName}·${workflowStatusText(workflow.status)}`,
              ),
            ),
          ),
        ]),
      okText: $t('form.actions.confirmSave'),
      okType: 'primary',
      cancelText: $t('form.actions.cancel'),
      onCancel: () => resolve(false),
      onOk: () => resolve(true),
      title: $t('form.messages.workflowImpactTitle'),
    });
  });
}
