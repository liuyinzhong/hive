import type { VbenFormSchema } from '#/adapter/form';

import dayjs from 'dayjs';

/** 表单内部以单个 dayjs 对象承值的日期组件。 */
const DAYJS_VALUE_COMPONENTS = new Set(['DatePicker', 'TimePicker']);

/** 表单内部以 dayjs 数组承值的日期区间组件。 */
const DAYJS_RANGE_COMPONENTS = new Set(['RangePicker']);

/**
 * 将持久化的表单变量按 Schema 还原为表单运行时值。
 *
 * 日期类组件(DatePicker/TimePicker/RangePicker)在表单内以 dayjs 对象承值,
 * 发起流程时经 JSON 序列化存成 ISO 字符串;回显时直接把字符串 setValues 进
 * 表单,会让日期组件内部调用 date.hour() 抛出 TypeError,需要先还原为 dayjs。
 * componentProps.valueFormat 为字符串时组件本身即以字符串承值,跳过还原。
 */
export function hydrateFormValues(
  schema: VbenFormSchema[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const restored = { ...values };
  for (const field of schema) {
    const fieldName = field.fieldName;
    const component =
      typeof field.component === 'string' ? field.component : '';
    const isRange = DAYJS_RANGE_COMPONENTS.has(component);
    if (!isRange && !DAYJS_VALUE_COMPONENTS.has(component)) continue;
    const props = (field as { componentProps?: Record<string, unknown> })
      .componentProps;
    if (typeof props === 'object' && typeof props.valueFormat === 'string') {
      continue;
    }
    if (!fieldName) continue;
    const keys = fieldName.split('.');
    const current = getPathValue(restored, keys);
    if (current === null || current === undefined) continue;
    if (!isRange && isPlainDateValue(current)) {
      setPathValue(restored, keys, dayjs(current));
    } else if (isRange && Array.isArray(current)) {
      setPathValue(
        restored,
        keys,
        current.map((item) => (isPlainDateValue(item) ? dayjs(item) : item)),
      );
    }
  }
  return restored;
}

function isPlainDateValue(value: unknown): value is number | string {
  return typeof value === 'number' || typeof value === 'string';
}

function getPathValue(values: Record<string, unknown>, keys: string[]) {
  let current: unknown = values;
  for (const key of keys) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/** 沿字段路径写入值,途中对经过的对象做浅拷贝,避免改动原始变量数据。 */
function setPathValue(
  values: Record<string, unknown>,
  keys: string[],
  value: unknown,
) {
  let current = values;
  for (const key of keys.slice(0, -1)) {
    const next = current[key];
    if (typeof next !== 'object' || next === null || Array.isArray(next)) {
      return;
    }
    const cloned = { ...next };
    current[key] = cloned;
    current = cloned;
  }
  current[keys[keys.length - 1]!] = value;
}
