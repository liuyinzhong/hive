import { requestClient } from '#/api/request';

export namespace SystemDeptApi {
  export interface SystemDeptFace {
    [key: string]: any;
    children?: SystemDeptFace[];
    id: string;
    name: string;
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取部门列表数据
 */
export const getDeptList = async () => {
  return requestClient.get<Array<SystemDeptApi.SystemDeptFace>>(
    '/system/dept/list',
  );
};

/**
 * 创建部门
 * @param data 部门数据
 */
export const createDept = async (
  data: Omit<SystemDeptApi.SystemDeptFace, 'children' | 'id'>,
) => {
  return requestClient.post('/system/dept', data);
};

/**
 * 更新部门
 *
 * @param id 部门 ID
 * @param data 部门数据
 */
export const updateDept = async (
  id: string,
  data: Omit<SystemDeptApi.SystemDeptFace, 'children' | 'id'>,
) => {
  return requestClient.put(`/system/dept/${id}`, data);
};

/**
 * 删除部门
 * @param id 部门 ID
 */
export const deleteDept = async (id: string) => {
  return requestClient.delete(`/system/dept/${id}`);
};
