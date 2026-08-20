/** 文件预览相关工具函数 */
/** 文件预览相关工具函数 */
/** 文件预览相关工具函数 */

import { openWindow } from '@vben/utils';

/**
 * @description 通过 kkFileView 预览文件，在新窗口打开预览页面。
 * 把可访问的文件 URL 用 Base64 编码后透传给 kkFileView 的 /onlinePreview 接口，
 * 由 kkFileView 服务端 fetch 该 URL 取回文件流，再用 LibreOffice 转换后渲染。
 * @param fileUrl 文件的可访问 URL，必须是 kkFileView 服务端能直接 fetch 到的绝对 URL
 * （生产环境需保证 kkFileView 部署机器能访问到该 URL 所在主机，且该主机在 kkFileView 的 trust.host 白名单内）
 * @param fileName 文件名（含扩展名，如 "库存余额.xlsx"）；当 URL 路径不含文件扩展名时必须提供，
 * kkFileView 通过该参数识别文件类型并作为本地保存文件名；URL 路径已含扩展名时可省略
 * @throws 当 VITE_KKFILEVIEW_URL 未配置时抛出 Error，调用方应 try/catch 处理
 * @example
 * // 1. 后端返回相对预览路径，前端拼绝对 URL 后调用
 * const { previewUrl } = await getDownloadTaskPreviewUrlApi(row.id);
 * previewWithKkFileView(`${window.location.origin}${previewUrl}`, row.fileName);
 * // 2. 已有公开文件 URL 直接预览
 * previewWithKkFileView('https://cdn.example.com/report.pdf');
 */
export function previewWithKkFileView(
  fileUrl: string,
  fileName?: string,
): void {
  const kkFileViewBaseUrl = import.meta.env.VITE_KKFILEVIEW_URL;
  if (!kkFileViewBaseUrl) {
    throw new Error(
      'kkFileView 预览服务地址未配置（请在 .env.* 文件中设置 VITE_KKFILEVIEW_URL）',
    );
  }

  // 附加 fullfilename 参数让 kkFileView 识别文件类型（保存到本地时也用该名称）
  let absoluteUrl = fileUrl;
  if (fileName) {
    const separator = fileUrl.includes('?') ? '&' : '?';
    absoluteUrl = `${fileUrl}${separator}fullfilename=${encodeURIComponent(fileName)}`;
  }

  // kkFileView 的 /onlinePreview 接口要求 url 参数为 Base64 编码后的原始 URL
  const base64Url = window.btoa(absoluteUrl);
  const previewPageUrl = `${kkFileViewBaseUrl}/onlinePreview?url=${encodeURIComponent(base64Url)}`;

  openWindow(previewPageUrl);
}
