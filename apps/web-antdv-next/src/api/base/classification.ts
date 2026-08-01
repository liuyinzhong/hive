import type { Recordable } from '@vben/types';

import { objectOmit } from '@vueuse/core';

import { requestClient } from '#/api/request';

export namespace BaseClassificationApi {
  /** 启停状态：0停用 1启用（仅节点使用） */
  export type Status = 0 | 1;

  /** 分类体系 */
  export interface ClassificationSystem {
    classificationSystemId: string;
    createDate?: null | string;
    remark?: null | string;
    rowVersion: number;
    sort: number;
    systemCode: string;
    systemName: string;
    updateDate?: null | string;
  }

  /** 分类体系保存请求 */
  export type SaveClassificationSystem = Partial<ClassificationSystem> & {
    expectedRowVersion?: number;
    systemCode: string;
    systemName: string;
  };

  /** 分类节点 */
  export interface ClassificationNode {
    children?: ClassificationNode[];
    classificationNodeId: string;
    classificationSystemId: string;
    createDate?: null | string;
    nodeCode: string;
    nodeName: string;
    parentId?: null | string;
    remark?: null | string;
    rowVersion: number;
    sort: number;
    status: Status;
    updateDate?: null | string;
  }

  /** 分类节点保存请求 */
  export type SaveClassificationNode = Partial<ClassificationNode> & {
    classificationSystemId: string;
    expectedRowVersion?: number;
    nodeCode: string;
    nodeName: string;
    status: Status;
  };

  /** 分类节点启停请求 */
  export interface UpdateClassificationNodeStatus {
    expectedRowVersion: number;
    status: Status;
  }
}

/** 全量查询分类体系列表 */
export function getClassificationSystemListApi() {
  return requestClient.get<BaseClassificationApi.ClassificationSystem[]>(
    '/base/classificationSystems',
  );
}

/** 获取分类体系详情 */
export function getClassificationSystemDetailApi(systemId: string) {
  return requestClient.get<BaseClassificationApi.ClassificationSystem>(
    `/base/classificationSystems/${systemId}`,
  );
}

/** 新增分类体系 */
export function createClassificationSystemApi(
  data: BaseClassificationApi.SaveClassificationSystem,
) {
  const newData = objectOmit(data, [
    'classificationSystemId',
    'createDate',
    'rowVersion',
    'updateDate',
  ]);
  return requestClient.post<BaseClassificationApi.ClassificationSystem>(
    '/base/classificationSystems',
    newData,
  );
}

/** 修改分类体系 */
export function updateClassificationSystemApi(
  systemId: string,
  data: BaseClassificationApi.SaveClassificationSystem,
) {
  const newData = objectOmit(data, [
    'classificationSystemId',
    'createDate',
    'rowVersion',
    'updateDate',
  ]);
  return requestClient.put<BaseClassificationApi.ClassificationSystem>(
    `/base/classificationSystems/${systemId}`,
    newData,
  );
}

/** 单条删除分类体系 */
export function deleteClassificationSystemApi(systemId: string) {
  return requestClient.delete(`/base/classificationSystems/${systemId}`);
}

/** 按体系编码查询分类节点树 */
export function getClassificationNodeTreeApi(
  params: Recordable<unknown>,
) {
  return requestClient.get<BaseClassificationApi.ClassificationNode[]>(
    '/base/classificationSystems/nodes',
    { params },
  );
}

/** 按体系编码查询启用的分类节点公共选项 */
export function getClassificationNodeOptionsApi(
  params: Recordable<unknown>,
) {
  return requestClient.get<BaseClassificationApi.ClassificationNode[]>(
    '/base/classificationSystems/options',
    { params },
  );
}

/** 获取分类节点详情 */
export function getClassificationNodeDetailApi(nodeId: string) {
  return requestClient.get<BaseClassificationApi.ClassificationNode>(
    `/base/classificationSystems/nodes/${nodeId}`,
  );
}

/** 新增分类节点 */
export function createClassificationNodeApi(
  data: BaseClassificationApi.SaveClassificationNode,
) {
  const newData = objectOmit(data, [
    'children',
    'classificationNodeId',
    'createDate',
    'rowVersion',
    'updateDate',
  ]);
  return requestClient.post<BaseClassificationApi.ClassificationNode>(
    '/base/classificationSystems/nodes',
    newData,
  );
}

/** 修改分类节点（含移动父级） */
export function updateClassificationNodeApi(
  nodeId: string,
  data: BaseClassificationApi.SaveClassificationNode,
) {
  const newData = objectOmit(data, [
    'children',
    'classificationNodeId',
    'createDate',
    'rowVersion',
    'updateDate',
  ]);
  return requestClient.put<BaseClassificationApi.ClassificationNode>(
    `/base/classificationSystems/nodes/${nodeId}`,
    newData,
  );
}

/** 修改分类节点启停状态 */
export function updateClassificationNodeStatusApi(
  nodeId: string,
  data: BaseClassificationApi.UpdateClassificationNodeStatus,
) {
  return requestClient.put<BaseClassificationApi.ClassificationNode>(
    `/base/classificationSystems/nodes/${nodeId}/status`,
    data,
  );
}

/** 单条删除分类节点 */
export function deleteClassificationNodeApi(nodeId: string) {
  return requestClient.delete(`/base/classificationSystems/nodes/${nodeId}`);
}
