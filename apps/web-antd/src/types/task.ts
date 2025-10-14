export interface TaskFace {
  /** 实际耗时（小时）,; */
  actualHours?: number;
  /** 创建时间,; */
  createTime?: string;
  /** 创建人id,; */
  creatorId?: string;
  /** 创建人名称,; */
  creatorName?: string;
  /** 逻辑删除 0:正常  1:删除,; */
  delFlag?: number;
  /** 预计结束时间,; */
  endTime?: string;
  /** 执行人id,; */
  executeId?: string;
  /** 执行人name,; */
  executeName?: string;
  /** 关联模块名称; */
  module?: string;
  /** 关联模块id; */
  moduleId?: string;
  /** 计划工时（小时）,; */
  planHours?: number;
  /** 预计开始时间,; */
  startTime?: string;
  /** 关联需求id,; */
  storyId?: string;
  /** 关联需求名称; */
  storyTitle?: string;
  /** 任务id,UUID格式,; */
  taskId?: string;
  /** 任务编号,; */
  taskNum?: number;
  /** 任务描述,富文本格式,; */
  taskRichText?: string;
  /** 任务状态,字典,; */
  taskStatus?: string;
  /** 任务名称,; */
  taskTitle?: string;
  /** 任务类型,字典,; */
  taskType?: string;
  /** 关联版本名称; */
  version?: string;
  /** 关联版本id; */
  versionId?: string;
}
