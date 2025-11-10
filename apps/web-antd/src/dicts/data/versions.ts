import type { DictFace } from '../index';

/* 发布状态 */
export const RELEASE_STATUS: DictFace[] = [
  {
    label: '待开发',
    value: '0',
    type: 'RELEASE_STATUS',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '开发中',
    value: '10',
    type: 'RELEASE_STATUS',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '已发布',
    value: '20',
    type: 'RELEASE_STATUS',
    remark: '',
    disabled: false,
    color: '',
  },
];

/* 更新类型 */
export const VERSION_TYPE: DictFace[] = [
  {
    label: '主版本号',
    value: '0',
    type: 'VERSION_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '次版本号',
    value: '10',
    type: 'VERSION_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '修订补丁',
    value: '20',
    type: 'VERSION_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
];
