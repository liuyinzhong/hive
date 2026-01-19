/**
 * @description 等待指定毫秒数
 * @param ms 等待时间（毫秒）
 * @returns Promise<void>
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @description 将文件数组转换为逗号分隔的字符串
 * @param files 文件数组
 * @returns 逗号分隔的字符串
 */
export function filesToUrlString(fileList: any) {
  if (!fileList?.length) return '';
  return fileList
    .filter((file: any) => file.status == 'done')
    .map((file: any) => file.response?.url || file.url)
    .join(',');
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
 * @description 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 深拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
