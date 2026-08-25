import type { Recordable } from "@vben/types";

import { requestClient } from "#/api/request";

export namespace SystemFileApi {
  export interface SystemFileFace {
    /** 文件ID (UUID) */
    fileId: string;
    /** 文件访问URL */
    url: string;
    /** 存储文件名 */
    name: string;
    /** MIME类型 */
    type: string;
    /** 文件大小（字节） */
    size: number;
    /** 文件扩展名 */
    fileExt: string;
    /** 原始文件名 */
    originalName: string;
    /** 存储路径 */
    path: string;
    /** 完整路径 */
    fullPath: string;
    /** 缩略图路径 */
    thumbnailPath: string;
    /** 缩略图URL */
    thumbnailUrl: string;
    /** 创建人ID */
    creatorId: string;
    /** 创建人姓名 */
    creatorName: string;
    /** 使用状态；0=已使用，1=未使用 */
    status: number;
    /** 创建日期 */
    createDate: string;
  }
}

/**
 * 获取文件列表（分页）
 * @param params 查询参数（page, pageSize, originalName, type, fileExt, status, sorts）
 */
export async function getFileListApi(params: Recordable<any>) {
  return requestClient.get<{
    items: SystemFileApi.SystemFileFace[];
    total: number;
  }>("/system/files", { params });
}

/**
 * 上传文件
 * @param data 包含 file 字段的 FormData
 */
export async function uploadFileApi(data: { file: File }) {
  return requestClient.upload<SystemFileApi.SystemFileFace>("/system/upload", data);
}
