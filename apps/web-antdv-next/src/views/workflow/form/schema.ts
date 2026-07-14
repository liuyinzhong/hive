import type { WorkflowDefinitionApi } from '#/api/workflow';

/** 创建空的流程表单结构。 */
export function createEmptyWorkflowFormSchema(): WorkflowDefinitionApi.WorkflowFormSchema {
  return { fields: [], version: 1 };
}

/** 解析后端返回的流程表单结构，失败时返回空表单。 */
export function parseWorkflowFormSchema(
  value?: null | string,
): WorkflowDefinitionApi.WorkflowFormSchema {
  if (!value) return createEmptyWorkflowFormSchema();
  try {
    const parsed: unknown = JSON.parse(value);
    if (isWorkflowFormSchema(parsed)) return parsed;
  } catch {
    // 由调用页面决定是否提示，解析函数仅提供稳定兜底值。
  }
  return createEmptyWorkflowFormSchema();
}

/** 判断未知值是否符合当前流程表单结构。 */
export function isWorkflowFormSchema(
  value: unknown,
): value is WorkflowDefinitionApi.WorkflowFormSchema {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.fields)) {
    return false;
  }
  return value.fields.every(
    (field) =>
      isRecord(field) &&
      typeof field.id === 'string' &&
      typeof field.key === 'string' &&
      typeof field.label === 'string' &&
      typeof field.required === 'boolean' &&
      typeof field.type === 'string',
  );
}

/** 根据表单字段默认值创建一份新的申请数据。 */
export function createWorkflowFormValues(
  schema: WorkflowDefinitionApi.WorkflowFormSchema,
) {
  return Object.fromEntries(
    schema.fields.map((field) => [
      field.key,
      field.defaultValue ?? defaultValueForField(field.type),
    ]),
  );
}

/** 返回指定表单字段类型的空值。 */
function defaultValueForField(
  type: WorkflowDefinitionApi.WorkflowFormFieldType,
) {
  if (type === 'checkbox') return [];
  if (type === 'switch') return false;
  return undefined;
}

/** 判断未知值是否为普通对象。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
