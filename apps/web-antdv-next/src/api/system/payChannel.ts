import { requestClient } from '#/api/request';

/**
 * 支付渠道配置 API
 */
export namespace PayChannelApi {
  /** 渠道类型 */
  export type ChannelType = 'alipay' | 'wechat';

  /** 环境模式 */
  export type EnvMode =
    | 'development'
    | 'production'
    | 'staging'
    | 'testing';

  /** 微信渠道差异化配置 */
  export interface WechatExtraConfig {
    /** 商户号 */
    mchId?: string;
    /** API 密钥 */
    apiKey?: string;
    /** 证书文件路径 */
    certPath?: string;
    /** 证书密码 */
    certPassword?: string;
    [key: string]: any;
  }

  /** 支付宝渠道差异化配置 */
  export interface AlipayExtraConfig {
    /** 应用私钥 */
    privateKey?: string;
    /** 支付宝公钥 */
    publicKey?: string;
    /** 签名类型 */
    signType?: 'RSA' | 'RSA2';
    [key: string]: any;
  }

  /** 支付渠道对象 */
  export interface PayChannelFace {
    [key: string]: any;
    /** 渠道配置ID */
    id?: string;
    /** 渠道配置名称 */
    channelName?: string;
    /** 渠道类型 wechat/alipay */
    channelType?: ChannelType;
    /** 环境模式 */
    envMode?: EnvMode;
    /** 应用ID */
    appId?: string;
    /** 渠道差异化配置 JSON 字符串 */
    extraConfig?: string;
    /** 支付回调地址 */
    notifyUrl?: string;
    /** 启用状态 0=禁用 1=启用 */
    status?: 0 | 1;
    /** 是否默认 0=否 1=是 */
    isDefault?: 0 | 1;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createDate?: string;
    /** 更新时间 */
    updateDate?: string;
  }

  /** 分页列表查询参数 */
  export interface PayChannelListParams {
    page?: number;
    pageSize?: number;
    channelName?: string;
    channelType?: ChannelType;
    envMode?: EnvMode;
    status?: 0 | 1;
    isDefault?: 0 | 1;
    sorts?: string;
  }

  /** 创建/更新请求体(extraConfig 已序列化为字符串) */
  export interface PayChannelMutation {
    channelName: string;
    channelType: ChannelType;
    envMode: EnvMode;
    appId: string;
    extraConfig: string;
    notifyUrl?: string;
    status: 0 | 1;
    isDefault: 0 | 1;
    remark?: string;
  }
}

/**
 * 分页查询支付渠道列表
 * @param params 查询参数
 */
export const getPayChannelListApi = async (
  params: PayChannelApi.PayChannelListParams,
) => {
  return requestClient.get<{
    items: PayChannelApi.PayChannelFace[];
    total: number;
  }>('/system/payChannels', { params });
};

/**
 * 创建支付渠道
 * @param data 渠道信息
 */
export const createPayChannelApi = async (
  data: PayChannelApi.PayChannelMutation,
) => {
  return requestClient.post('/system/payChannels', data);
};

/**
 * 查询支付渠道详情
 * @param id 渠道ID
 */
export const getPayChannelDetailApi = async (id: string) => {
  return requestClient.get<PayChannelApi.PayChannelFace>(
    `/system/payChannels/${id}`,
  );
};

/**
 * 更新支付渠道
 * @param id 渠道ID
 * @param data 渠道信息
 */
export const updatePayChannelApi = async (
  id: string,
  data: PayChannelApi.PayChannelMutation,
) => {
  return requestClient.put(`/system/payChannels/${id}`, data);
};

/**
 * 批量删除支付渠道
 * @param ids 渠道ID列表
 */
export const deletePayChannelApi = async (ids: string[]) => {
  return requestClient.delete('/system/payChannels', { data: ids });
};

/**
 * 修改支付渠道启用状态
 * @param id 渠道ID
 * @param status 启用状态 0=禁用 1=启用
 */
export const updatePayChannelStatusApi = async (
  id: string,
  status: 0 | 1,
) => {
  return requestClient.put(`/system/payChannels/${id}/status`, { status });
};

/**
 * 修改支付渠道默认标记
 * @param id 渠道ID
 * @param isDefault 是否默认 0=否 1=是
 */
export const updatePayChannelDefaultApi = async (
  id: string,
  isDefault: 0 | 1,
) => {
  return requestClient.put(`/system/payChannels/${id}/default`, {
    isDefault,
  });
};
