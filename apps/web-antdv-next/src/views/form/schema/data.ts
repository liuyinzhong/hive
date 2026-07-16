import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { FormSchemaApi } from '#/api/form';

import { $t } from '#/locales';

export const formSchemaStatusOptions = [
  { label: $t('form.status.disabled'), value: '0' },
  { label: $t('form.status.enabled'), value: '1' },
];

export const formSchemaLayoutOptions = [
  { label: $t('form.layout.single'), value: 'single' },
  { label: $t('form.layout.double'), value: 'double' },
  { label: $t('form.layout.triple'), value: 'triple' },
];

export function useFormSchemaBaseForm(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { allowClear: true, maxlength: 128 },
      fieldName: 'schemaName',
      label: $t('form.fields.schemaName'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        maxlength: 128,
        placeholder: 'expense_apply',
      },
      fieldName: 'schemaKey',
      label: $t('form.fields.schemaKey'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { allowClear: true, maxlength: 64 },
      fieldName: 'category',
      label: $t('form.fields.category'),
    },
    {
      component: 'Select',
      componentProps: { options: formSchemaLayoutOptions },
      defaultValue: 'single',
      fieldName: 'layout',
      label: $t('form.fields.layout'),
      rules: 'selectRequired',
    },
    {
      component: 'Select',
      componentProps: { options: formSchemaStatusOptions },
      defaultValue: '1',
      fieldName: 'status',
      label: $t('form.fields.status'),
      rules: 'selectRequired',
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 256, rows: 3, showCount: true },
      fieldName: 'remark',
      label: $t('form.fields.remark'),
    },
  ];
}

export function useFormSchemaGridForm(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'schemaName',
      label: $t('form.fields.schemaName'),
    },
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'schemaKey',
      label: $t('form.fields.schemaKey'),
    },
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'category',
      label: $t('form.fields.category'),
    },
    {
      component: 'Select',
      componentProps: { allowClear: true, options: formSchemaStatusOptions },
      fieldName: 'status',
      label: $t('form.fields.status'),
    },
  ];
}

export function useFormSchemaColumns(): VxeTableGridOptions<FormSchemaApi.FormSchemaRecord>['columns'] {
  return [
    {
      field: 'schemaName',
      minWidth: 180,
      sortable: true,
      title: $t('form.fields.schemaName'),
    },
    {
      field: 'schemaKey',
      minWidth: 180,
      sortable: true,
      title: $t('form.fields.schemaKey'),
    },
    {
      field: 'category',
      minWidth: 120,
      sortable: true,
      title: $t('form.fields.category'),
    },
    {
      cellRender: { name: 'CellTag', options: formSchemaLayoutOptions },
      field: 'layout',
      title: $t('form.fields.layout'),
      width: 110,
    },
    {
      cellRender: { name: 'CellTag', options: formSchemaStatusOptions },
      field: 'status',
      title: $t('form.fields.status'),
      width: 100,
    },
    { field: 'creatorName', title: $t('form.fields.creator'), width: 120 },
    {
      field: 'updateDate',
      sortable: true,
      title: $t('form.fields.updateDate'),
      width: 170,
    },
    {
      field: 'remark',
      minWidth: 180,
      showOverflow: true,
      title: $t('form.fields.remark'),
    },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('form.actions.operation'),
      width: 180,
    },
  ];
}
