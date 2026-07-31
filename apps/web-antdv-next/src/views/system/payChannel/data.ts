import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { PayChannelApi } from '#/api/system';

import { $t } from '#/locales';

/** 渠道类型选项 */
const channelTypeOptions = [
  { label: $t('system.payChannel.wechat'), value: 'wechat' },
  { label: $t('system.payChannel.alipay'), value: 'alipay' },
];

/** 环境模式选项 */
const envModeOptions = [
  { label: $t('system.payChannel.development'), value: 'development' },
  { label: $t('system.payChannel.testing'), value: 'testing' },
  { label: $t('system.payChannel.staging'), value: 'staging' },
  { label: $t('system.payChannel.production'), value: 'production' },
];

/**
 * 新增/编辑表单配置
 * 通用字段固定展示;extraConfig 子字段按 channelType 联动展示
 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: '渠道ID',
      dependencies: {
        triggerFields: ['id'],
        show() {
          return false;
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'channelName',
      label: $t('system.payChannel.channelName'),
      rules: 'required',
      defaultValue: '',
    },
    {
      component: 'Select',
      fieldName: 'channelType',
      label: $t('system.payChannel.channelType'),
      rules: 'required',
      defaultValue: 'wechat',
      componentProps: {
        options: channelTypeOptions,
      },
    },
    {
      component: 'Select',
      fieldName: 'envMode',
      label: $t('system.payChannel.envMode'),
      rules: 'required',
      defaultValue: 'production',
      componentProps: {
        options: envModeOptions,
      },
    },
    {
      component: 'Input',
      fieldName: 'appId',
      label: $t('system.payChannel.appId'),
      rules: 'required',
      defaultValue: '',
    },
    {
      component: 'Input',
      fieldName: 'notifyUrl',
      label: $t('system.payChannel.notifyUrl'),
      defaultValue: '',
    },
    // ===== 微信渠道 extraConfig 子字段 =====
    {
      component: 'Input',
      fieldName: 'mchId',
      label: $t('system.payChannel.mchId'),
      defaultValue: '',
      dependencies: {
        triggerFields: ['channelType'],
        show(values) {
          return values.channelType === 'wechat';
        },
      },
    },
    {
      component: 'InputPassword',
      fieldName: 'apiKey',
      label: $t('system.payChannel.apiKey'),
      defaultValue: '',
      dependencies: {
        triggerFields: ['channelType'],
        show(values) {
          return values.channelType === 'wechat';
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'certPath',
      label: $t('system.payChannel.certPath'),
      defaultValue: '',
      componentProps: {
        placeholder: '证书文件路径,如 /uploads/pay/wx/prod.p12',
      },
      dependencies: {
        triggerFields: ['channelType'],
        show(values) {
          return values.channelType === 'wechat';
        },
      },
    },
    {
      component: 'InputPassword',
      fieldName: 'certPassword',
      label: $t('system.payChannel.certPassword'),
      defaultValue: '',
      dependencies: {
        triggerFields: ['channelType'],
        show(values) {
          return values.channelType === 'wechat';
        },
      },
    },
    // ===== 支付宝渠道 extraConfig 子字段 =====
    {
      component: 'Textarea',
      fieldName: 'privateKey',
      label: $t('system.payChannel.privateKey'),
      defaultValue: '',
      componentProps: {
        autoSize: { minRows: 3, maxRows: 6 },
        placeholder: '应用私钥',
      },
      dependencies: {
        triggerFields: ['channelType'],
        show(values) {
          return values.channelType === 'alipay';
        },
      },
    },
    {
      component: 'Textarea',
      fieldName: 'publicKey',
      label: $t('system.payChannel.publicKey'),
      defaultValue: '',
      componentProps: {
        autoSize: { minRows: 3, maxRows: 6 },
        placeholder: '支付宝公钥',
      },
      dependencies: {
        triggerFields: ['channelType'],
        show(values) {
          return values.channelType === 'alipay';
        },
      },
    },
    {
      component: 'Select',
      fieldName: 'signType',
      label: $t('system.payChannel.signType'),
      defaultValue: 'RSA2',
      componentProps: {
        options: [
          { label: 'RSA2', value: 'RSA2' },
          { label: 'RSA', value: 'RSA' },
        ],
      },
      dependencies: {
        triggerFields: ['channelType'],
        show(values) {
          return values.channelType === 'alipay';
        },
      },
    },
    // ===== 公共字段 =====
    {
      component: 'RadioGroup',
      fieldName: 'status',
      label: $t('system.payChannel.status'),
      defaultValue: 0,
      rules: 'required',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('system.payChannel.enabled'), value: 1 },
          { label: $t('system.payChannel.disabled'), value: 0 },
        ],
        optionType: 'button',
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'isDefault',
      label: $t('system.payChannel.isDefault'),
      defaultValue: 0,
      rules: 'required',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('system.payChannel.yes'), value: 1 },
          { label: $t('system.payChannel.no'), value: 0 },
        ],
        optionType: 'button',
      },
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.payChannel.remark'),
      defaultValue: '',
      componentProps: {
        autoSize: { minRows: 2, maxRows: 4 },
      },
    },
  ];
}

/** 表格查询表单配置 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'channelName',
      label: $t('system.payChannel.channelName'),
      componentProps: {
        allowClear: true,
        placeholder: '模糊搜索',
      },
    },
    {
      component: 'Select',
      defaultValue: undefined,
      fieldName: 'channelType',
      label: $t('system.payChannel.channelType'),
      componentProps: {
        allowClear: true,
        options: channelTypeOptions,
      },
    },
    {
      component: 'Select',
      defaultValue: undefined,
      fieldName: 'envMode',
      label: $t('system.payChannel.envMode'),
      componentProps: {
        allowClear: true,
        options: envModeOptions,
      },
    },
    {
      component: 'Select',
      defaultValue: undefined,
      fieldName: 'status',
      label: $t('system.payChannel.status'),
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('system.payChannel.enabled'), value: 1 },
          { label: $t('system.payChannel.disabled'), value: 0 },
        ],
      },
    },
  ];
}

/**
 * 获取表格列配置
 * @description 使用函数形式返回,响应语言切换重新翻译表头
 */
export function useColumns(): VxeTableGridOptions<PayChannelApi.PayChannelFace>['columns'] {
  return [
    {
      field: 'channelName',
      title: $t('system.payChannel.channelName'),
      align: 'left',
      minWidth: 160,
      sortable: true,
      sortBy: 'channelName',
    },
    {
      field: 'channelType',
      title: $t('system.payChannel.channelType'),
      align: 'left',
      width: 110,
      sortable: true,
      sortBy: 'channelType',
      slots: { default: 'channelType' },
    },
    {
      field: 'envMode',
      title: $t('system.payChannel.envMode'),
      align: 'left',
      width: 120,
      sortable: true,
      sortBy: 'envMode',
      slots: { default: 'envMode' },
    },
    {
      field: 'appId',
      title: $t('system.payChannel.appId'),
      align: 'left',
      minWidth: 160,
    },
    {
      field: 'status',
      title: $t('system.payChannel.status'),
      align: 'center',
      width: 100,
      sortable: true,
      sortBy: 'status',
      slots: { default: 'status' },
    },
    {
      field: 'isDefault',
      title: $t('system.payChannel.isDefault'),
      align: 'center',
      width: 100,
      sortable: true,
      sortBy: 'isDefault',
      slots: { default: 'isDefault' },
    },
    {
      field: 'updateDate',
      title: $t('system.payChannel.updateDate'),
      width: 180,
      sortable: true,
      sortBy: 'updateDate',
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('system.payChannel.operation'),
      width: 200,
    },
  ];
}

/**
 * 将 extraConfig JSON 字符串展开到表单扁平字段
 * @param extraConfig JSON 字符串
 * @param channelType 渠道类型,决定展开哪些字段
 */
export function flattenExtraConfig(
  extraConfig: string | undefined,
  channelType: PayChannelApi.ChannelType | undefined,
): Record<string, any> {
  const result: Record<string, any> = {};
  if (!extraConfig) return result;
  try {
    const obj = JSON.parse(extraConfig);
    if (channelType === 'wechat') {
      result.mchId = obj.mchId ?? '';
      result.apiKey = obj.apiKey ?? '';
      result.certPath = obj.certPath ?? '';
      result.certPassword = obj.certPassword ?? '';
    } else if (channelType === 'alipay') {
      result.privateKey = obj.privateKey ?? '';
      result.publicKey = obj.publicKey ?? '';
      result.signType = obj.signType ?? 'RSA2';
    }
  } catch {
    // JSON 解析失败时忽略,返回空对象
  }
  return result;
}

/**
 * 将表单扁平字段收集为 extraConfig JSON 字符串
 * @param values 表单值
 */
export function collectExtraConfig(values: Record<string, any>): string {
  const channelType = values.channelType as PayChannelApi.ChannelType;
  let config: Record<string, any> = {};
  if (channelType === 'wechat') {
    config = {
      mchId: values.mchId ?? '',
      apiKey: values.apiKey ?? '',
      certPath: values.certPath ?? '',
      certPassword: values.certPassword ?? '',
    };
  } else if (channelType === 'alipay') {
    config = {
      privateKey: values.privateKey ?? '',
      publicKey: values.publicKey ?? '',
      signType: values.signType ?? 'RSA2',
    };
  }
  return JSON.stringify(config);
}
