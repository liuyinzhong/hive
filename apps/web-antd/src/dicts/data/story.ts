import type { DictFace } from '../index';
/* 需求状态 */
export const STORY_STATUS: DictFace[] = [
  {
    label: '待评审',
    value: '0',
    type: 'STORY_STATUS',
    remark: '已规划出需求,未评审',
    disabled: false,
    color: '',
  },
  {
    label: '开发中',
    value: '10',
    type: 'STORY_STATUS',
    remark: '已加入迭代,开发中',
    disabled: false,
    color: '',
  },
  {
    label: '测试中',
    value: '20',
    type: 'STORY_STATUS',
    remark: '开发完成,测试中',
    disabled: false,
    color: '',
  },
  {
    label: '产品验收中',
    value: '30',
    type: 'STORY_STATUS',
    remark: '测试完毕,产品验收中',
    disabled: false,
    color: '',
  },
  {
    label: '业务验收中',
    value: '31',
    type: 'STORY_STATUS',
    remark: '产品验收完成,业务验收中',
    disabled: false,
    color: '',
  },
  {
    label: '已关闭',
    value: '99',
    type: 'STORY_STATUS',
    remark: '需求关闭',
    disabled: false,
    color: '',
  },
];

/* 需求来源 */
export const STORY_SOURCE: DictFace[] = [
  {
    label: '产品规划',
    value: '0',
    type: 'STORY_SOURCE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '用户反馈',
    value: '1',
    type: 'STORY_SOURCE',
    remark: '',
    disabled: false,
    color: '',
  },
];

/* 需求等级 */
export const STORY_LEVEL: DictFace[] = [
  {
    label: '低',
    value: '0',
    type: 'STORY_LEVEL',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '中',
    value: '1',
    type: 'STORY_LEVEL',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '高',
    value: '2',
    type: 'STORY_LEVEL',
    remark: '',
    disabled: false,
    color: '',
  },
];

/* 需求类型 */
export const STORY_TYPE: DictFace[] = [
  {
    label: '新功能',
    value: '0',
    type: 'STORY_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '功能优化',
    value: '1',
    type: 'STORY_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: 'Bug修复',
    value: '2',
    type: 'STORY_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '技术债务',
    value: '3',
    type: 'STORY_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: 'UI/UX改进',
    value: '4',
    type: 'STORY_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '性能优化',
    value: '5',
    type: 'STORY_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '安全相关',
    value: '6',
    type: 'STORY_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '合规性需求',
    value: '7',
    type: 'STORY_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '运维需求',
    value: '8',
    type: 'STORY_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '技术调研',
    value: '9',
    type: 'STORY_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
  {
    label: '文档编写',
    value: '10',
    type: 'STORY_TYPE',
    remark: '',
    disabled: false,
    color: '',
  },
];
