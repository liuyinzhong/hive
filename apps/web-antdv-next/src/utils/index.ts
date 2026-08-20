export * from './file';
export * from './preview';
export * from './enumUtils';
export * from './versionUtils';
export * from './vxe-table';

/**
 * @description 等待指定毫秒数
 * @param ms 等待时间（毫秒）
 * @returns Promise<void>
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @description 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 深拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}
