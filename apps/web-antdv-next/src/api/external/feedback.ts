import { requestClient } from '#/api/request';

/**
 * 外部反馈工单公开接口。
 * 不携带登录态，调用 /public/feedback 与 /public/upload 两个匿名端点。
 */
export namespace ExternalFeedbackApi {
  /** 工单类型：story=需求，bug=缺陷 */
  export type FeedbackType = 'bug' | 'story';

  /** 提交外部反馈工单请求体 */
  export interface CreateFeedbackRequest {
    /** 工单类型 */
    type: FeedbackType;
    /** 工单标题 */
    title: string;
    /** 工单描述(富文本)，可选 */
    richText?: string;
    /** 附件ID数组，由 /public/upload 公开上传产生 */
    fileIds?: string[];
  }

  /** 提交外部反馈工单响应体 */
  export interface CreateFeedbackResponse {
    /** 工单编号，对应 storyNum/bugNum */
    num: number;
    /** 工单类型，回显请求 type */
    type: FeedbackType;
  }
}

/**
 * 提交外部反馈工单。
 * 调用公开端点 /public/feedback，根据 type 写入 dev_story 或 dev_bug，source 固定为 10。
 */
export async function createFeedbackApi(
  data: ExternalFeedbackApi.CreateFeedbackRequest,
) {
  return requestClient.post<ExternalFeedbackApi.CreateFeedbackResponse>(
    '/public/feedback',
    data,
  );
}
