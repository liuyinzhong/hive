import { requestClient } from '#/api/request';

export namespace SystemDeptApi {
  export interface SystemDeptFace {
    [key: string]: any;
    children?: SystemDeptFace[];
    deptId: string;
    deptTitle: string;
    pid?: string;
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取部门列表数据
 */
export const getDeptListApi = async () => {
  return requestClient.get<Array<SystemDeptApi.SystemDeptFace>>(
    '/system/depts',
  );
};

/**
 * 创建部门
 * @param data 部门数据
 */
export const createDeptApi = async (
  data: Omit<SystemDeptApi.SystemDeptFace, 'children' | 'deptId'>,
) => {
  return requestClient.post('/system/depts', data);
};

/**
 * 更新部门
 * @param data 部门数据
 */
export const updateDeptApi = async (
  deptId: string,
  data: Omit<SystemDeptApi.SystemDeptFace, 'children' | 'deptId'>,
) => {
  return requestClient.put(`/system/depts/${deptId}`, data);
};

/**
 * 删除部门
 * @param deptIds 部门ID数组
 */
export const deleteDeptApi = async (deptIds: string[]) => {
  return requestClient.delete('/system/depts', {
    data: deptIds,
  });
};

/**
 * 获取所有启用的部门列表
 */
export const getAllDeptListApi = async () => {
  return requestClient.get<Array<SystemDeptApi.SystemDeptFace>>(
    '/system/depts/all',
  );
};
