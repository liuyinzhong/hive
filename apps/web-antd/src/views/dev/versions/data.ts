import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { VbenFormSchema } from '#/adapter/form';
import { getDictList } from '#/dicts';
import { $t } from '#/locales';
import type { SystemVersionApi } from '#/api/dev/versions';
import type { OnActionClickFn } from '#/adapter/vxe-table';
/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 */
export function useSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'version',
      label: '版本号',
    },
    {
      component: 'ApiSelect',
      fieldName: 'releaseStatus',
      label: '发布状态',
      componentProps: {
        allowClear: true,
        filterOption: true,
        showSearch: true,
        api: () => getDictList('RELEASE_STATUS'),
      },
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 */
export function useColumns(
  onActionClick?: OnActionClickFn<SystemVersionApi.SystemVersion>,
): VxeTableGridOptions<SystemVersionApi.SystemVersion>['columns'] {
  return [
    {
      field: 'version',
      title: '版本号',
    },
    {
      field: 'remark',
      title: '备注',
    },
    {
      field: 'versionType',
      title: '更新类型',
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'VERSION_TYPE',
        },
      },
    },
    {
      field: 'releaseStatus',
      title: '发布状态',
      cellRender: {
        name: 'DictTag',
        props: {
          type: 'RELEASE_STATUS',
        },
      },
    },
    {
      field: 'startTime',
      title: '预计开始时间',
    },
    {
      field: 'endTime',
      title: '预计结束时间',
    },
    {
      field: 'releaseDate',
      title: '发布时间',
    },
    {
      field: 'creatorName',
      title: '创建人',
    },
    /* {
      field: 'createTime',
      title: '创建时间',
    }, */
    {
      align: 'right',
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.dept.operation'),
      width: 110,
      cellRender: {
        attrs: {
          nameField: 'version',
          nameTitle: '版本号',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit', // 默认的编辑按钮
          {
            code: 'delete', // 默认的删除按钮
          },
        ],
      },
    },
  ];
}
