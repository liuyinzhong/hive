import {
  VERSION_STATUS,
  STORY_STATUS,
  STORY_SOURCE,
  STORY_LEVEL,
  STORY_TYPE,
  TASK_TYPE,
  TASK_STATUS,
  BUG_STATUS,
  BUG_LEVEL,
  BUG_CONFIRM_STATUS,
  BUG_TYPE,
  BUG_SOURCE,
  BUG_ENV,
} from './data/index';

export interface DictFace {
  /** 字典id,; */
  id?: string | number;
  /** 字典父id,; */
  pid?: string | number | null;
  /** 字典标题,; */
  label: string;
  /** 字典值,; */
  value: string;
  /** 字典类型,; */
  type?: string;
  /** 禁用状态 */
  disabled?: any;
  /** 备注,; */
  remark?: string;
  /** 颜色 */
  color?: string;
  /** 子字典 */
  children?: DictFace[];
  /** 创建时间 */
  createTime?: string;
}

const dictionaryData: Record<string, DictFace[]> = {
  VERSION_STATUS,
  STORY_STATUS,
  STORY_SOURCE,
  STORY_LEVEL,
  STORY_TYPE,
  TASK_TYPE,
  TASK_STATUS,
  BUG_STATUS,
  BUG_LEVEL,
  BUG_CONFIRM_STATUS,
  BUG_TYPE,
  BUG_SOURCE,
  BUG_ENV,
};

/** 获取字典列表 */
export const getDictList = (type: string): DictFace[] => {
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
