/** 需求信息 */

export interface StoryFace {
  /** 需求id,UUID格式,; */
  storyId?: string;
  /** 父级需求id,; */
  pid?: string;
  /** 需求名称,; */
  storyTitle?: string;
  /** 需求编号,; */
  storyNum?: number;
  /** 创建人姓名,; */
  creatorName?: string;
  /** 创建人id,; */
  creatorId?: string;
  /** 需求描述,富文本格式,; */
  storyRichText?: string;
  /** 需求附件URL地址,逗号分隔,; */
  files?: string[];
  /** 需求类别,; */
  storyType?: string;
  /** 需求状态,; */
  storyStatus?: string;
  /** 需求优先级,; */
  storyLevel?: string;
  /** 需求最后修改时间,; */
  updateDate?: string;
  /** 需求创建时间,; */
  createDate?: string;
  /** 需求关联版本表id,; */
  versionId?: string;
  /** 需求关联版本名称,; */
  version?: string;
  /** 需求关联模块表,; */
  moduleId?: string;
  /** 需求关联模块名称,; */
  moduleTitle?: string;
  /** 需求来源,字典,; */
  source?: string;
  /* 参与人员 */
  userIds?: string[];
}
