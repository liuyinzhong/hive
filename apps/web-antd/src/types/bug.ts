/** bug信息 */

export interface BugFace {
  /** bugID,UUID格式,; */
  bugId?: string;
  /** bug名称,; */
  bugTitle?: string;
  /** bug编号,; */
  bugNum?: number;
  /** bug描述,富文本格式,; */
  bugRichText?: string;
  /** bug状态,; */
  bugStatus?: string;
  /** bug级别,; */
  bugLevel?: string;
  /** bug确认状态,; */
  bugConfirmStatus?: string;
  /** bug环境,; */
  bugEnv?: string;
  /** bug来源,; */
  bugSource?: string;
  /** bug类型,; */
  bugType?: string;
  /* 用户头像 */
  avatar?: string;
  /** 修复人id,; */
  fixUserId?: string;
  /** 修复人名称,; */
  fixUserName?: string;
  /** 创建人id,; */
  creatorId?: string;
  /** 创建人名称,; */
  creatorName?: string;
  /** 创建时间,; */
  createDate?: string;
  /** 浏览器信息 navigator.userAgent,; */
  bugUa?: string;
  /** 关联版本id,; */
  versionId?: string;
  /** 关联版本,; */
  version?: string;
  /** 关联模块id,; */
  moduleId?: string;
  /** 关联模块,; */
  moduleTitle?: string;
}
