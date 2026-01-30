import { type SystemDictApi } from '#/api/system';

const dictionaryData: Record<string, SystemDictApi.SystemDict[]> = {};

/** 获取字典列表 */
export const getDictList = (type: string): SystemDictApi.SystemDict[] => {
  const list = dictionaryData[type];
  return list || [];
};

/** 静态获取 根据字典值，获取字典名称
 * @param type 字典类型
 * @param value 字典值
 * @param key 以字典哪个字段读取值，默认为 value 字段
 */
export const getDictText = (type: string, value: any, key?: string): string => {
  if (['', null, undefined].includes(value)) {
    return '';
  }
  const list: any = dictionaryData[type];
  const item: any = list?.find((a: any) => a[key || 'value'] == value);
  return item?.label || '';
};

/** 静态获取 根据字典值，获取字典标签颜色
 * @param type 字典类型
 * @param value 字典值
 * @param key 以字典哪个字段读取值，默认为 value 字段
 */
export const getDictColor = (
  type: string,
  value: any,
  key?: string,
): string => {
  if (['', null, undefined].includes(value)) {
    return '';
  }
  const list: any = dictionaryData[type];
  const item: any = list?.find((a: any) => a[key || 'value'] == value);
  return item?.color || '';
};
