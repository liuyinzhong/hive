import type { VbenFormSchema } from '#/adapter/form';

import { z } from '#/adapter/form';

import { getFormComponentMeta } from './metadata';
import {
  resolveFormDataSource,
  resolveFormFormatter,
  resolveFormHandler,
  resolveFormRenderer,
} from './registry';
import type {
  FormConditionSpec,
  PersistentDynamicRules,
  PersistentFormDependencies,
  PersistentFormRule,
  PersistentFormSchema,
} from './types';

export function compileVbenFormSchema(
  schema: PersistentFormSchema[],
): VbenFormSchema[] {
  const fieldNames = new Set<string>();
  return schema.map((item) => {
    const fieldName = item.fieldName?.trim();
    if (
      !fieldName ||
      !/^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)*$/.test(fieldName)
    ) {
      throw new Error(`表单字段名称“${item.fieldName}”无效`);
    }
    if (fieldNames.has(fieldName)) {
      throw new Error(`表单字段“${fieldName}”不能重复`);
    }
    fieldNames.add(fieldName);
    return compileSchemaItem({ ...item, fieldName });
  });
}

function compileSchemaItem(item: PersistentFormSchema): VbenFormSchema {
  if (!item.fieldName?.trim()) throw new Error('表单字段名称不能为空');
  if (!getFormComponentMeta(item.component)) {
    throw new Error(`表单组件“${item.component}”未在组件元数据中注册`);
  }

  const {
    descriptionRendererKey,
    dependencies,
    formItemClassResolverKey,
    helpRendererKey,
    labelRendererKey,
    propsResolverKey,
    renderComponentContentKey,
    rules,
    suffixRendererKey,
    valueFormatterKey,
    ...plainSchema
  } = item;
  const componentProps = compileComponentProps(
    item.componentProps,
    propsResolverKey,
  );
  const compiledRules = compileRules(rules, item.label ?? item.fieldName);
  const compiledDependencies = compileDependencies(
    dependencies,
    item.label ?? item.fieldName,
  );
  const descriptionRenderer = resolveRenderer(descriptionRendererKey, '描述');
  const formItemClassResolver = resolveRenderer(
    formItemClassResolverKey,
    '表单项样式',
  );
  const helpRenderer = resolveRenderer(helpRendererKey, '帮助信息');
  const labelRenderer = resolveRenderer(labelRendererKey, '标签');
  const renderComponentContent = resolveRenderer(
    renderComponentContentKey,
    '组件内容',
  );
  const suffixRenderer = resolveRenderer(suffixRendererKey, '后缀');
  const formatter = valueFormatterKey
    ? resolveFormFormatter(valueFormatterKey)
    : undefined;

  if (valueFormatterKey && !formatter) {
    throw new Error(`表单格式化器“${valueFormatterKey}”未注册`);
  }

  return {
    ...plainSchema,
    componentProps,
    description: descriptionRenderer ?? item.description,
    dependencies: compiledDependencies,
    formItemClass: formItemClassResolver ?? item.formItemClass,
    help: helpRenderer ?? item.help,
    label: labelRenderer ?? item.label,
    renderComponentContent,
    rules: compiledRules,
    suffix: suffixRenderer ?? item.suffix,
    valueFormat: formatter,
  } as VbenFormSchema;
}

function resolveRenderer(key: string | undefined, name: string) {
  if (!key) return undefined;
  const renderer = resolveFormRenderer(key);
  if (!renderer) throw new Error(`表单${name}渲染器“${key}”未注册`);
  return renderer;
}

function compileComponentProps(
  props: Record<string, unknown> | undefined,
  resolverKey: string | undefined,
) {
  const normalized = { ...props };
  const dataSourceId = normalized.dataSourceId;
  delete normalized.dataSourceId;
  if (typeof dataSourceId === 'string') {
    const api = resolveFormDataSource(dataSourceId);
    if (!api) throw new Error(`表单数据源“${dataSourceId}”未注册`);
    normalized.api = api;
  }
  if (!resolverKey) return normalized;
  const resolver = resolveFormHandler(resolverKey);
  if (!resolver) throw new Error(`表单属性解析器“${resolverKey}”未注册`);
  return (values: Record<string, unknown>, actions: unknown) => ({
    ...normalized,
    ...(resolver(values, actions) as Record<string, unknown>),
  });
}

function compileDependencies(
  dependencies: PersistentFormDependencies | undefined,
  label: string,
) {
  if (!dependencies) return undefined;
  const compiled: Record<string, unknown> = {
    triggerFields: dependencies.triggerFields,
  };
  for (const key of ['disabled', 'if', 'required', 'show'] as const) {
    const value = dependencies[key];
    if (value === undefined) continue;
    compiled[key] =
      typeof value === 'boolean'
        ? () => value
        : (values: Record<string, unknown>) => evaluateCondition(value, values);
  }
  if (dependencies.componentProps) {
    compiled.componentProps = (values: Record<string, unknown>) => {
      const matched = dependencies.componentProps?.cases.find((item) =>
        evaluateCondition(item.condition, values),
      );
      return matched?.props ?? dependencies.componentProps?.default ?? {};
    };
  }
  if (dependencies.rules) {
    const dynamicRules = dependencies.rules;
    compiled.rules = (values: Record<string, unknown>) =>
      compileRules(resolveDynamicRules(dynamicRules, values), label);
  }
  if (dependencies.trigger) {
    const handler = resolveFormHandler(dependencies.trigger);
    if (!handler) {
      throw new Error(`表单联动处理器“${dependencies.trigger}”未注册`);
    }
    compiled.trigger = handler;
  }
  return compiled;
}

function resolveDynamicRules(
  dynamicRules: PersistentDynamicRules,
  values: Record<string, unknown>,
) {
  return (
    dynamicRules.cases.find((item) => evaluateCondition(item.condition, values))
      ?.rules ?? dynamicRules.default
  );
}

function compileRules(rules: PersistentFormRule[] | undefined, label: string) {
  if (!rules?.length) return undefined;
  return z.any().superRefine((value, context) => {
    for (const rule of rules) {
      const message = validateRule(rule, value, label);
      if (message) context.addIssue({ code: 'custom', message });
    }
  });
}

function validateRule(rule: PersistentFormRule, value: unknown, label: string) {
  const empty = isEmpty(value);
  if (rule.type === 'required' || rule.type === 'selectRequired') {
    return empty ? (rule.message ?? `请填写${label}`) : undefined;
  }
  if (empty) return undefined;
  if (rule.type === 'string' && typeof value !== 'string') {
    return rule.message ?? `${label}必须是文本`;
  }
  if (rule.type === 'number' && typeof value !== 'number') {
    return rule.message ?? `${label}必须是数字`;
  }
  if (rule.type === 'array' && !Array.isArray(value)) {
    return rule.message ?? `${label}必须是数组`;
  }
  if (rule.type === 'boolean' && typeof value !== 'boolean') {
    return rule.message ?? `${label}必须是布尔值`;
  }
  if (rule.type === 'date') {
    const validDate =
      value instanceof Date ||
      (typeof value === 'string' && !Number.isNaN(Date.parse(value))) ||
      (typeof value === 'object' && value !== null && 'isValid' in value);
    if (!validDate) return rule.message ?? `${label}必须是日期`;
  }

  const length =
    typeof value === 'string' || Array.isArray(value)
      ? value.length
      : undefined;
  if (rule.length !== undefined && length !== rule.length) {
    return rule.message ?? `${label}长度必须为${rule.length}`;
  }
  if (rule.min !== undefined) {
    const actual = typeof value === 'number' ? value : length;
    if (actual !== undefined && actual < rule.min) {
      return rule.message ?? `${label}不能小于${rule.min}`;
    }
  }
  if (rule.max !== undefined) {
    const actual = typeof value === 'number' ? value : length;
    if (actual !== undefined && actual > rule.max) {
      return rule.message ?? `${label}不能大于${rule.max}`;
    }
  }
  if (rule.integer && typeof value === 'number' && !Number.isInteger(value)) {
    return rule.message ?? `${label}必须是整数`;
  }
  if (rule.pattern && typeof value === 'string') {
    try {
      if (!new RegExp(rule.pattern).test(value)) {
        return rule.message ?? `${label}格式不正确`;
      }
    } catch {
      return rule.message ?? `${label}的正则表达式无效`;
    }
  }
  if (
    rule.type === 'email' &&
    typeof value === 'string' &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ) {
    return rule.message ?? `${label}格式不正确`;
  }
  if (
    rule.type === 'url' &&
    typeof value === 'string' &&
    !URL.canParse(value)
  ) {
    return rule.message ?? `${label}格式不正确`;
  }
  if (rule.type === 'enum' && rule.values && !rule.values.includes(value)) {
    return rule.message ?? `${label}不在允许范围内`;
  }
  if (rule.type === 'custom' && rule.handlerKey) {
    const handler = resolveFormHandler(rule.handlerKey);
    if (!handler) throw new Error(`表单校验处理器“${rule.handlerKey}”未注册`);
    const result = handler(value, rule);
    if (result !== true && result !== undefined) {
      return typeof result === 'string'
        ? result
        : (rule.message ?? `${label}校验不通过`);
    }
  }
  return undefined;
}

function evaluateCondition(
  condition: FormConditionSpec,
  values: Record<string, unknown>,
): boolean {
  if ('conditions' in condition) {
    return condition.logic === 'and'
      ? condition.conditions.every((item) => evaluateCondition(item, values))
      : condition.conditions.some((item) => evaluateCondition(item, values));
  }
  const actual = getFieldValue(values, condition.fieldName);
  const expected = condition.value;
  switch (condition.operator) {
    case 'contains': {
      return Array.isArray(actual)
        ? actual.includes(expected)
        : String(actual ?? '').includes(String(expected ?? ''));
    }
    case 'empty': {
      return isEmpty(actual);
    }
    case 'eq': {
      return actual === expected;
    }
    case 'gt': {
      return Number(actual) > Number(expected);
    }
    case 'gte': {
      return Number(actual) >= Number(expected);
    }
    case 'in': {
      return Array.isArray(expected) && expected.includes(actual);
    }
    case 'lt': {
      return Number(actual) < Number(expected);
    }
    case 'lte': {
      return Number(actual) <= Number(expected);
    }
    case 'notEmpty': {
      return !isEmpty(actual);
    }
    case 'notIn': {
      return Array.isArray(expected) && !expected.includes(actual);
    }
    case 'neq': {
      return actual !== expected;
    }
  }
}

function getFieldValue(values: Record<string, unknown>, fieldName: string) {
  let value: unknown = values;
  for (const key of fieldName.split('.')) {
    if (typeof value !== 'object' || value === null) return undefined;
    value = (value as Record<string, unknown>)[key];
  }
  return value;
}

function isEmpty(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
}
