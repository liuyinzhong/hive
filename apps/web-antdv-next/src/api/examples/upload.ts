import { uploadFileApi } from '#/api/system';
import { requestClient } from '#/api/request';
import type { SystemFileApi } from '#/api/system';
interface UploadFileParams {
  file: File;
  onError?: (error: Error) => void;
  onProgress?: (progress: { percent: number }) => void;
  onSuccess?: (data: any, file: File) => void;
}
export async function upload_file({
  file,
  onError,
  onProgress,
  onSuccess,
}: UploadFileParams) {
  try {
    onProgress?.({ percent: 0 });
    const data = await uploadFileApi({ file });

    onProgress?.({ percent: 100 });
    onSuccess?.(data, file);
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * 公开上传外部反馈附件 customRequest。
 * 调用公开端点 /public/upload，文件元数据 creator_id 写入固定占位标记 external-feedback。
 */
export async function upload_file_external({
  file,
  onError,
  onProgress,
  onSuccess,
}: {
  file: File;
  onError?: (error: Error) => void;
  onProgress?: (progress: { percent: number }) => void;
  onSuccess?: (data: any, file: File) => void;
}) {
  try {
    onProgress?.({ percent: 0 });
    const data = await requestClient.upload<SystemFileApi.SystemFileFace>(
      '/public/upload',
      { file },
    );
    onProgress?.({ percent: 100 });
    onSuccess?.(data, file);
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error(String(error)));
  }
}
