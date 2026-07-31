import { requestClient } from '#/api/request';

/**
 * 系统参数 API
 */
export namespace SystemParamApi {
  /** 参数类型枚举 */
  export type ParamType = 'boolean' | 'json' | 'number' | 'string';

  /** 系统参数对象 */
  export interface SystemParamFace {
    [key: string]: any;
    /** 参数ID */
    id?: string;
    /** 参数键(点分命名,全局唯一) */
    paramKey?: string;
    /** 参数值(字符串存储,按 paramType 解释) */
    paramValue?: string;
    /** 参数类型 string/number/boolean/json */
    paramType?: ParamType;
    /** 是否公开 0=否 1=是 */
    isPublic?: 0 | 1;
    /** 备注 */
    remark?: string;
    /** 创建时间 */
    createDate?: string;
    /** 更新时间 */
    updateDate?: string;
  }

  /** 分页列表查询参数 */
  export interface ParamListParams {
    page?: number;
    pageSize?: number;
    paramKey?: string;
    paramType?: ParamType;
    isPublic?: 0 | 1;
    sorts?: string;
  }
}

/**
 * 分页查询参数列表
 * @param params 查询参数(含分页、筛选、排序)
 */
export const getParamListApi = async (
  params: SystemParamApi.ParamListParams,
) => {
  return requestClient.get<{
    items: SystemParamApi.SystemParamFace[];
    total: number;
  }>('/system/params', { params });
};

/**
 * 创建参数
 * @param data 参数信息
 */
export const createParamApi = async (
  data: Omit<SystemParamApi.SystemParamFace, 'id'>,
) => {
  return requestClient.post('/system/params', data);
};

/**
 * 查询参数详情
 * @param id 参数ID
 */
export const getParamDetailApi = async (id: string) => {
  return requestClient.get<SystemParamApi.SystemParamFace>(
    `/system/params/${id}`,
  );
};

/**
 * 更新参数
 * @param id 参数ID
 * @param data 参数信息
 */
export const updateParamApi = async (
  id: string,
  data: Omit<SystemParamApi.SystemParamFace, 'id'>,
) => {
  return requestClient.put(`/system/params/${id}`, data);
};

/**
 * 批量删除参数
 * @param ids 参数ID列表
 */
export const deleteParamApi = async (ids: string[]) => {
  return requestClient.delete('/system/params', { data: ids });
};

/**
 * 公共参数批量查询(需登录,无接口权限)
 * @param keys 参数键数组,为空时返回全部公开参数
 * @returns key -> value 映射,值按 paramType 格式化:number->number, boolean->boolean, json->object, string->string
 */
export const getParamValuesApi = async (keys?: string[]) => {
  return requestClient.post<Record<string, any>>('/system/params/values', {
    keys: keys ?? [],
  });
};
