import type { DictFace } from '../index';

/* 版本状态 */
export const VERSION_STATUS: DictFace[] = [
  {
    label: '未开始',
    value: '0',
    type: 'VERSION_STATUS',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '进行中',
    value: '10',
    type: 'VERSION_STATUS',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '已发布',
    value: '99',
    type: 'VERSION_STATUS',
    remark: '',
    disabled: false,
    color: '',
  },
];

/* 行为 */
export const BEHAVIOR_TYPE: DictFace[] = [
  {
    label: '流转',
    value: '0',
    type: 'BEHAVIOR_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '评论',
    value: '1',
    type: 'BEHAVIOR_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '创建',
    value: '2',
    type: 'BEHAVIOR_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
];

/* 变更类型 */
export const CHANGE_TYPE: DictFace[] = [
  {
    label: '需求',
    value: 'story',
    type: 'CHANGE_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '任务',
    value: 'task',
    type: 'CHANGE_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '缺陷',
    value: 'bug',
    type: 'CHANGE_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '版本',
    value: 'version',
    type: 'CHANGE_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
];
