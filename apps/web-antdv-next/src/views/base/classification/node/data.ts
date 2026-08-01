import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { BaseClassificationApi } from '#/api/base';

import { z } from '#/adapter/form';
import {
  getClassificationNodeTreeApi,
  updateClassificationNodeStatusApi,
} from '#/api/base';
import { $t } from '#/locales';

/**
 * 分类节点表单 Schema
 * @param getSystemCode 获取当前体系编码的函数，用于父节点树选择接口入参
 */
export function useClassificationNodeFormSchema(
  getSystemCode: () => string,
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { maxlength: 64 },
      fieldName: 'nodeCode',
      label: $t('base.classification.nodeCode'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'nodeName',
      label: $t('base.classification.nodeName'),
      rules: 'required',
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: () =>
          getClassificationNodeTreeApi({ systemCode: getSystemCode() }),
        childrenField: 'children',
        class: 'w-full',
        labelField: 'nodeName',
        valueField: 'classificationNodeId',
      },
      fieldName: 'parentId',
      label: $t('base.classification.parentNode'),
    },
    {
      component: 'InputNumber',
      componentProps: { min: 0, precision: 0 },
      defaultValue: 0,
      fieldName: 'sort',
      label: $t('base.classification.sort'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('base.classification.status'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 3, showCount: true },
      fieldName: 'remark',
      label: $t('base.classification.remark'),
      rules: z.string().max(512).nullish(),
    },
  ];
}

/** 分类节点搜索 Schema */
export function useClassificationNodeSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'keyword',
      label: $t('base.classification.nodeKeyword'),
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
      label: $t('base.classification.status'),
    },
  ];
}

/** 分类节点树列定义 */
export function useClassificationNodeColumns(): VxeTableGridOptions<BaseClassificationApi.ClassificationNode>['columns'] {
  return [
    {
      field: 'nodeName',
      fixed: 'left',
      minWidth: 220,
      title: $t('base.classification.nodeName'),
      treeNode: true,
    },
    {
      field: 'nodeCode',
      minWidth: 160,
      title: $t('base.classification.nodeCode'),
    },
    {
      cellRender: {
        attrs: {
          onChange: async (
            newStatus: 0 | 1,
            row: BaseClassificationApi.ClassificationNode,
          ) => {
            const updated = await updateClassificationNodeStatusApi(
              row.classificationNodeId,
              { expectedRowVersion: row.rowVersion, status: newStatus },
            );
            row.rowVersion = updated.rowVersion;
            row.updateDate = updated.updateDate;
          },
        },
        name: 'CellSwitch',
      },
      field: 'status',
      title: $t('base.classification.status'),
      width: 100,
    },
    {
      field: 'sort',
      title: $t('base.classification.sort'),
      width: 90,
    },
    {
      field: 'remark',
      minWidth: 180,
      title: $t('base.classification.remark'),
    },
    {
      field: 'updateDate',
      title: $t('base.classification.updateDate'),
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('base.classification.operation'),
      width: 240,
    },
  ];
}
