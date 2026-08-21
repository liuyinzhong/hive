/** 文件相关工具函数 */
/** 文件相关工具函数 */
/** 文件相关工具函数 */

/**
 * @description 将文件数组转换为逗号分隔的字符串
 * @param files 文件数组
 * @param key 要提取的文件属性（url或fileId）
 * @default 'url'
 * @param returnType 返回类型（string或array）
 * @default 'string'
 * @returns 转换后的字符串或数组
 */
export function filesToUrlString(
  fileList: any,
  key: 'url' | 'fileId' = 'url',
  returnType: 'string' | 'array' = 'string',
) {
  if (!fileList?.length) return returnType === 'string' ? '' : [];
  const result = fileList
    .filter((file: any) => file.status === 'done')
    .map((file: any) => file.response?.[key] || file[key]);

  return returnType === 'string' ? result.join(',') : result;
}

/**
 * @description 将逗号分隔的字符串转换为文件数组
 * @param urlString 逗号分隔的字符串
 * @returns 文件数组
 */
export function urlStringToFiles(urlString: string): any {
  if (!urlString) return [];

  if (Array.isArray(urlString)) return urlString;

  return urlString.split(',').map((a) => {
    return {
      name: getFileNameFromUrl(a),
      status: 'done',
      uid: '-1',
      url: a,
    };
  });
}

/**
 * @description 根据url链接，获取文件名称（兼容带参数/锚点的URL）
 * @param url 链接（支持带?参数或#锚点的URL）
 * @returns 文件名称
 */
export function getFileNameFromUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';

  // 先去除URL中的参数和锚点（例如：https://xxx.png?a=1#b → https://xxx.png）
  const pureUrl: any = url.split(/[?#]/)[0];
  // 提取最后一个/后的部分作为文件名
  return pureUrl.split('/').pop() || '';
}

/**
 * 将字节数格式化为可读的文件大小字符串
 * @param bytes 字节数
 * @returns 格式化后的字符串（如 1.5 MB）
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${units[i]}`;
}
