/** 文件预览相关工具函数 */

import { h, ref, render } from 'vue';

import { openWindow } from '@vben/utils';

import { Image, message } from 'antdv-next';

import { getFileNameFromUrl } from './file';

// 图片扩展名集合（含点号小写形式），命中时走 antd-vue Image 函数式预览
const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.bmp',
  '.webp',
  '.svg',
]);

/**
 * 当前正在挂载的图片预览容器，用于切换前清理上一个预览
 */
let imagePreviewContainer: null | HTMLDivElement = null;

/**
 * 将后端相对 URL 拼接为同源绝对 URL
 * @param url 后端返回的相对路径或绝对 URL
 * @returns kkFileView 服务端可 fetch / 浏览器可加载的绝对 URL
 */
function resolveAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url)) return url;
  return `${window.location.origin}${url}`;
}

/**
 * 函数式调用 antd-vue Image 组件预览图片。
 * 动态挂载一个隐藏的 Image 组件到 body，通过 preview.open 控制预览浮层显示，
 * 关闭时延迟清理 DOM 节点，避免内存泄漏。
 * @param url 图片绝对 URL
 */
function previewImageFunctionally(url: string): void {
  // 切换前清理上一次的预览容器，避免重复挂载
  if (imagePreviewContainer) {
    render(null, imagePreviewContainer);
    imagePreviewContainer.remove();
    imagePreviewContainer = null;
  }

  const container = document.createElement('div');
  document.body.append(container);
  imagePreviewContainer = container;

  // 预览浮层开关状态
  const open = ref(true);
  let isUnmounted = false;

  const PreviewWrapper = {
    name: 'KkImagePreview',
    setup() {
      return () => {
        if (isUnmounted) return null;
        return h(Image, {
          src: url,
          // 隐藏 Image 本体，仅借助其 preview 浮层能力
          style: { display: 'none' },
          preview: {
            open: open.value,
            onOpenChange: (value: boolean) => {
              open.value = value;
              if (!value) {
                // 等待过渡动画结束再卸载，避免闪烁
                setTimeout(() => {
                  if (isUnmounted) return;
                  isUnmounted = true;
                  render(null, container);
                  container.remove();
                  if (imagePreviewContainer === container) {
                    imagePreviewContainer = null;
                  }
                }, 300);
              }
            },
          },
        });
      };
    },
  };

  render(h(PreviewWrapper), container);
}

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

/**
 * @description 统一文件预览入口。
 * 根据传入 URL 的扩展名判断：
 * - 图片类型（jpg/jpeg/png/gif/bmp/webp/svg）使用 antd-vue Image 函数式预览（不离开当前页面）；
 * - 其他类型调用 previewWithKkFileView 在新窗口通过 kkFileView 渲染。
 * 相对 URL 会自动用 window.location.origin 拼接为同源绝对 URL；错误统一以 message.error 提示。
 * @param url 文件可访问 URL（相对或绝对）
 * @example
 * onPreview('/uploads/xxx.jpg');       // 图片 → antd Image 预览
 * onPreview('/uploads/xxx.pdf');       // 非图片 → kkFileView 预览
 */
export function onPreview(url: string): void {
  if (!url) {
    message.error('预览失败：文件 URL 为空');
    return;
  }

  const absoluteUrl = resolveAbsoluteUrl(url);
  // 复用 getFileNameFromUrl 取文件名（已处理 query/hash 与路径前缀），再切片得扩展名
  const fileName = getFileNameFromUrl(url);
  const dotIdx = fileName.lastIndexOf('.');
  const ext = (dotIdx === -1 ? '' : fileName.slice(dotIdx)).toLowerCase();

  if (IMAGE_EXTENSIONS.has(ext)) {
    previewImageFunctionally(absoluteUrl);
    return;
  }

  try {
    previewWithKkFileView(absoluteUrl);
  } catch (error) {
    message.error((error as Error).message || '预览失败');
  }
}
