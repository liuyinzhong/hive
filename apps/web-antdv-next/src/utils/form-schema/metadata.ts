import type { FormComponentMeta } from './types';

import { $t } from '#/locales';

/** Hive 当前 Form Adapter 中已注册组件的设计元数据。 */
const componentMetadata: FormComponentMeta[] = [
  {
    component: 'Input',
    group: 'basic',
    supportsRules: true,
    title: $t('form.components.input'),
    valueType: 'string',
    defaultProps: { allowClear: true },
  },
  {
    component: 'Textarea',
    group: 'basic',
    supportsRules: true,
    title: $t('form.components.textarea'),
    valueType: 'string',
    defaultProps: { allowClear: true, rows: 3 },
  },
  {
    component: 'InputNumber',
    group: 'basic',
    supportsRules: true,
    title: $t('form.components.inputNumber'),
    valueType: 'number',
  },
  {
    component: 'InputPassword',
    group: 'basic',
    supportsRules: true,
    title: $t('form.components.inputPassword'),
    valueType: 'string',
  },
  {
    component: 'Select',
    group: 'choice',
    optionProp: 'options',
    supportsRules: true,
    title: $t('form.components.select'),
    valueType: 'unknown',
  },
  {
    component: 'ApiSelect',
    group: 'choice',
    supportsRules: true,
    title: $t('form.components.apiSelect'),
    valueType: 'unknown',
  },
  {
    component: 'RadioGroup',
    group: 'choice',
    optionProp: 'options',
    supportsRules: true,
    title: $t('form.components.radioGroup'),
    valueType: 'string',
  },
  {
    component: 'Checkbox',
    group: 'choice',
    supportsRules: true,
    title: $t('form.components.checkbox'),
    valueType: 'boolean',
  },
  {
    component: 'CheckboxGroup',
    group: 'choice',
    optionProp: 'options',
    supportsRules: true,
    title: $t('form.components.checkboxGroup'),
    valueType: 'array',
    defaultValue: [],
  },
  {
    component: 'Switch',
    group: 'choice',
    supportsRules: true,
    title: $t('form.components.switch'),
    valueType: 'boolean',
    defaultValue: false,
  },
  {
    component: 'DatePicker',
    group: 'date',
    supportsRules: true,
    title: $t('form.components.datePicker'),
    valueType: 'date',
  },
  {
    component: 'RangePicker',
    group: 'date',
    supportsRules: true,
    title: $t('form.components.rangePicker'),
    valueType: 'array',
  },
  {
    component: 'TimePicker',
    group: 'date',
    supportsRules: true,
    title: $t('form.components.timePicker'),
    valueType: 'date',
  },
  {
    component: 'Upload',
    group: 'extended',
    supportsRules: true,
    title: $t('form.components.upload'),
    valueType: 'array',
    defaultValue: [],
  },
  {
    component: 'RichEditor',
    group: 'extended',
    supportsRules: true,
    title: $t('form.components.richEditor'),
    valueType: 'string',
  },
];

const componentMetadataMap = new Map(
  componentMetadata.map((item) => [item.component, item]),
);

export function getFormComponentMetadata() {
  return componentMetadata;
}

export function getFormComponentMeta(component: string) {
  return componentMetadataMap.get(component as FormComponentMeta['component']);
}
