import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { BaseEnterpriseApi } from '#/api/base';

import { z } from '#/adapter/form';
import { updateEnterpriseStatusApi } from '#/api/base';
import { $t } from '#/locales';

export const enterpriseTypeOptions = () => [
  { label: $t('base.enterprise.typeEnterprise'), value: 'ENTERPRISE' },
  { label: $t('base.enterprise.typeMedicalOrg'), value: 'MEDICAL_ORG' },
  { label: $t('base.enterprise.typeIndividual'), value: 'INDIVIDUAL' },
  {
    label: $t('base.enterprise.typePublicInstitution'),
    value: 'PUBLIC_INSTITUTION',
  },
  { label: $t('base.enterprise.typeOther'), value: 'OTHER' },
];

export const enterpriseRoleOptions = () => [
  { label: $t('base.enterprise.roleManufacturer'), value: 'MANUFACTURER' },
  { label: $t('base.enterprise.roleMah'), value: 'MAH' },
  { label: $t('base.enterprise.roleRegistrant'), value: 'REGISTRANT' },
  { label: $t('base.enterprise.roleFiler'), value: 'FILER' },
  { label: $t('base.enterprise.roleImportAgent'), value: 'IMPORT_AGENT' },
  { label: $t('base.enterprise.roleSupplier'), value: 'SUPPLIER' },
  { label: $t('base.enterprise.roleDistributor'), value: 'DISTRIBUTOR' },
  { label: $t('base.enterprise.roleDealer'), value: 'DEALER' },
  { label: $t('base.enterprise.roleCustomer'), value: 'CUSTOMER' },
];

export function enterpriseTypeLabel(type?: string) {
  return (
    enterpriseTypeOptions().find((item) => item.value === type)?.label ||
    type ||
    '-'
  );
}

export function enterpriseRoleLabel(role?: string) {
  return (
    enterpriseRoleOptions().find((item) => item.value === role)?.label ||
    role ||
    '-'
  );
}

export function useEnterpriseFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'enterpriseName',
      label: $t('base.enterprise.enterpriseName'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 64 },
      fieldName: 'shortName',
      label: $t('base.enterprise.shortName'),
    },
    {
      component: 'Select',
      componentProps: { options: enterpriseTypeOptions() },
      defaultValue: 'ENTERPRISE',
      fieldName: 'enterpriseType',
      label: $t('base.enterprise.enterpriseType'),
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 32 },
      fieldName: 'unifiedCreditCode',
      label: $t('base.enterprise.unifiedCreditCode'),
    },
    {
      component: 'Select',
      componentProps: {
        maxTagCount: 4,
        mode: 'multiple',
        options: enterpriseRoleOptions(),
      },
      fieldName: 'roles',
      formItemClass: 'md:col-span-2',
      label: $t('base.enterprise.roles'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 64 },
      fieldName: 'contactName',
      label: $t('base.enterprise.contactName'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 32 },
      fieldName: 'contactPhone',
      label: $t('base.enterprise.contactPhone'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 512 },
      fieldName: 'address',
      formItemClass: 'md:col-span-2',
      label: $t('base.enterprise.address'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('base.enterprise.status'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 3, showCount: true },
      fieldName: 'remark',
      formItemClass: 'md:col-span-2',
      label: $t('base.enterprise.remark'),
      rules: z.string().max(512).nullish(),
    },
  ];
}

export function useEnterpriseSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: $t('base.enterprise.keyword'),
      },
      fieldName: 'keyword',
      label: '关键字',
    },
    {
      component: 'Select',
      componentProps: { allowClear: true, options: enterpriseTypeOptions() },
      fieldName: 'enterpriseType',
      label: $t('base.enterprise.enterpriseType'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        maxTagCount: 2,
        mode: 'multiple',
        options: enterpriseRoleOptions(),
      },
      fieldName: 'roleTypes',
      label: $t('base.enterprise.roles'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      fieldName: 'status',
      label: $t('base.enterprise.status'),
    },
  ];
}

export function useEnterpriseColumns(): VxeTableGridOptions<BaseEnterpriseApi.Enterprise>['columns'] {
  return [
    {
      field: 'enterpriseCode',
      fixed: 'left',
      sortable: true,
      title: $t('base.enterprise.enterpriseCode'),
      width: 130,
    },
    {
      field: 'enterpriseName',
      fixed: 'left',
      minWidth: 180,
      sortable: true,
      title: $t('base.enterprise.enterpriseName'),
    },
    {
      field: 'shortName',
      minWidth: 120,
      title: $t('base.enterprise.shortName'),
    },
    {
      field: 'enterpriseType',
      formatter: ({ cellValue }) => enterpriseTypeLabel(cellValue),
      minWidth: 130,
      sortable: true,
      title: $t('base.enterprise.enterpriseType'),
    },
    {
      field: 'roles',
      minWidth: 260,
      slots: { default: 'roles' },
      title: $t('base.enterprise.roles'),
    },
    {
      field: 'unifiedCreditCode',
      minWidth: 180,
      title: $t('base.enterprise.unifiedCreditCode'),
    },
    {
      field: 'contactName',
      minWidth: 120,
      title: $t('base.enterprise.contactName'),
    },
    {
      field: 'contactPhone',
      minWidth: 140,
      title: $t('base.enterprise.contactPhone'),
    },
    {
      cellRender: {
        attrs: {
          onChange: async (
            newStatus: 0 | 1,
            row: BaseEnterpriseApi.Enterprise,
          ) => {
            const updated = await updateEnterpriseStatusApi(row.enterpriseId, {
              expectedRowVersion: row.rowVersion,
              status: newStatus,
            });
            row.rowVersion = updated.rowVersion;
            row.updateDate = updated.updateDate;
          },
        },
        name: 'CellSwitch',
      },
      field: 'status',
      sortable: true,
      title: $t('base.enterprise.status'),
      width: 100,
    },
    {
      field: 'updateDate',
      sortable: true,
      title: $t('base.enterprise.updateDate'),
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('base.enterprise.operation'),
      width: 120,
    },
  ];
}
