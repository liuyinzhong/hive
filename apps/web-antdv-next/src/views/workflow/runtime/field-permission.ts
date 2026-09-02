import type { WorkflowDefinitionApi } from '#/api/workflow';
import type { VbenFormSchema } from '#/adapter/form';

/** 节点字段权限映射:字段名到权限取值。 */
export type WorkflowFieldPermissions = Record<
  string,
  WorkflowDefinitionApi.WorkflowFormFieldPermission
>;

/** 将节点字段权限应用到编译后的 Vben Schema。
 *  隐藏字段不渲染,非可编辑字段禁用并清除校验规则,未配置字段按默认权限处理。 */
export function applyFieldPermissions(
  schema: VbenFormSchema[],
  permissions: WorkflowFieldPermissions,
  defaultPermission: WorkflowDefinitionApi.WorkflowFormFieldPermission,
) {
  return schema.map((field) => {
    const permission = permissions[field.fieldName] ?? defaultPermission;
    const disabled = permission !== 'editable' || field.disabled;
    return withRichEditorEditable(
      {
        ...field,
        disabled,
        hide: permission === 'hidden' || field.hide,
        rules: permission === 'editable' ? field.rules : undefined,
      } as VbenFormSchema,
      disabled,
    );
  });
}

/** RichEditor(VbenTiptap)不响应表单 disabled,字段禁用时需同步设置 editable=false 才能真正禁用编辑。 */
export function withRichEditorEditable<T extends VbenFormSchema>(
  field: T,
  disabled: boolean,
): T {
  if (field.component !== 'RichEditor' || !disabled) return field;
  return {
    ...field,
    componentProps: {
      ...(field.componentProps as Record<string, unknown> | undefined),
      editable: false,
    },
  } as T;
}

/** 按字段权限白名单提取表单值,并保留 Vben 点路径字段生成的嵌套结构。 */
export function pickVariablesByPermission(
  values: Record<string, unknown>,
  fieldNames: string[],
  permissions: WorkflowFieldPermissions,
  allowed: readonly WorkflowDefinitionApi.WorkflowFormFieldPermission[],
  defaultPermission: WorkflowDefinitionApi.WorkflowFormFieldPermission,
) {
  const result: Record<string, unknown> = {};
  for (const fieldName of fieldNames) {
    const permission = permissions[fieldName] ?? defaultPermission;
    if (!allowed.includes(permission)) continue;
    const fieldValue = valueAtPath(values, fieldName);
    if (!fieldValue.found) continue;
    setValueAtPath(result, fieldName, fieldValue.value);
  }
  return result;
}

/** 从流程定义画布 JSON 解析发起节点字段权限,无配置或解析失败时返回空对象(视为全部可编辑)。 */
export function parseStartFieldPermissions(
  flowData?: string,
): WorkflowFieldPermissions {
  if (!flowData) return {};
  try {
    const graph = JSON.parse(flowData) as {
      nodes?: Array<{ properties?: Record<string, unknown> }>;
    };
    const startNode = graph.nodes?.find(
      (node) => node.properties?.nodeType === 'start',
    );
    const permissions = startNode?.properties?.fieldPermissions;
    if (!isRecord(permissions)) return {};
    const result: WorkflowFieldPermissions = {};
    for (const [fieldName, permission] of Object.entries(permissions)) {
      if (
        permission === 'editable' ||
        permission === 'hidden' ||
        permission === 'readonly'
      ) {
        result[fieldName] = permission;
      }
    }
    return result;
  } catch {
    return {};
  }
}

/** 读取点路径字段在嵌套值中的取值。 */
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

/** 将点路径字段写入嵌套结果对象。 */
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

/** 判断未知值是否为可读取字段的对象。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
