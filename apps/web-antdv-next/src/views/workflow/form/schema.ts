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
  return value.fields.every(isWorkflowFormElement);
}

/** 判断表单元素是否为栅格布局。 */
export function isWorkflowFormGrid(
  element: WorkflowDefinitionApi.WorkflowFormElement,
): element is WorkflowDefinitionApi.WorkflowFormGrid {
  return element.type === 'grid';
}

/** 按表单顺序返回所有真实业务字段，排除布局容器。 */
export function getWorkflowFormFields(
  schema: WorkflowDefinitionApi.WorkflowFormSchema,
) {
  return schema.fields.flatMap((element) =>
    isWorkflowFormGrid(element)
      ? element.columns.flatMap((column) => column.fields)
      : [element],
  );
}

/** 根据表单字段默认值创建一份新的申请数据。 */
export function createWorkflowFormValues(
  schema: WorkflowDefinitionApi.WorkflowFormSchema,
) {
  return Object.fromEntries(
    getWorkflowFormFields(schema).map((field) => [
      field.key,
      field.defaultValue ?? defaultValueForField(field.type),
    ]),
  );
}

/** 判断未知值是否符合表单元素结构。 */
function isWorkflowFormElement(
  value: unknown,
): value is WorkflowDefinitionApi.WorkflowFormElement {
  if (!isRecord(value) || typeof value.id !== 'string') return false;
  if (value.type === 'grid') {
    return (
      Array.isArray(value.columns) &&
      value.columns.every(
        (column) =>
          isRecord(column) &&
          typeof column.id === 'string' &&
          typeof column.span === 'number' &&
          Array.isArray(column.fields) &&
          column.fields.every(isWorkflowFormField),
      )
    );
  }
  return isWorkflowFormField(value);
}

/** 判断未知值是否符合业务字段结构。 */
function isWorkflowFormField(
  value: unknown,
): value is WorkflowDefinitionApi.WorkflowFormField {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.key === 'string' &&
    typeof value.label === 'string' &&
    typeof value.required === 'boolean' &&
    typeof value.type === 'string' &&
    value.type !== 'grid'
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
