<!-- eslint-disable vue/require-default-prop -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';

import { usePreferences } from '@vben/preferences';

import { AiEditor } from 'aieditor';

import { upload_file } from '#/api/examples/upload';
import { getUserListAll } from '#/api/system';

import 'aieditor/dist/style.css';
const {
  modelValue,
  defaultHtml,
  width = '100%',
  height = '600px',
  placeholder = '', // 新增占位符属性
  showToolbar = true, // 新增工具栏按钮属性
} = defineProps({
  modelValue: String, // 双向绑定的值
  defaultHtml: String, // 默认的 html 内容
  width: String, // 宽度
  height: String, // 高度
  placeholder: String, // 新增占位符属性
  showToolbar: Boolean, // 新增工具栏按钮属性
});
const emit = defineEmits(['update:modelValue', 'update:text']); // 用于触发 v-model 更新

const { isDark } = usePreferences();
const divRef = ref();

let aiEditor: AiEditor | null = null;

onMounted(() => {
  aiEditor = new AiEditor({
    element: divRef.value as Element,
    onMentionQuery: _getUserListAll,
    placeholder: placeholder || '点击输入内容...', // 使用传入的占位符
    theme: isDark.value ? 'dark' : 'light',
    /* 编辑的内容 */
    content: modelValue || '', // 初始化内容
    /* 初始化的内容，是否是 markdown 内容 */
    contentIsMarkdown: false,
    /* 是否自动保存（缓存）当前编辑的内容 */
    contentRetention: false,
    /* 自动保存（缓存）到 localStorage 的 key 值 */
    contentRetentionKey: 'ai-editor-content',
    /* 是否可以通过在右下角拖动调整编辑器的大小 */
    draggable: true,
    toolbarKeys: showToolbar ? undefined : [], // 根据 showToolbar 动态设置工具栏按钮
    toolbarExcludeKeys: ['video', 'attachment'], // 排除的工具栏按钮
    image: {
      uploader: (
        file: File,
        uploadUrl: string,
        headers: Record<string, any>,
        formName: string,
      ): Promise<Record<string, any>> => {
        return new Promise((resolve, reject) => {
          upload_file({
            file,
            onSuccess: (data: any, _file: File) => {
              resolve({
                errorCode: 0,
                data: {
                  src: data.url,
                  alt: formName || '',
                },
              });
            },
            onError: (error: Error) => {
              reject(error);
            },
          });

          /* requestClient.upload('/upload', { file })
            .then((resp) => resp.json())
            .then((json) => {
              resolve(json);
            })
            .catch((error) => {
              reject(error);
            }); */
        });
      },
    },
    /* 用于设置工具栏按钮尺寸 默认 small，可选 'small' | 'medium' | 'large' */
    toolbarSize: 'small',
    htmlPasteConfig: {
      /* 移除所有的非文本内容以及 html 标签 */
      pasteAsText: false,
      /* 移除所有的内容样式，以及 'a', 'span', 'strong', 'b', 'em', 'i', 'u' 标签的修饰。 */
      pasteClean: false,
    },
    textCounter: (text: string) => text.length,
    ai: {
      models: {
        wenxin: {
          access_token: '****',
          protocol: '****',
          version: '****',
        },
      },
    },
    onChange: (aiEditor: AiEditor) => {
      // 监听到用编辑器内容发生变化了，控制台打印编辑器的 html 内容...
      emit('update:modelValue', aiEditor.getHtml());
      emit('update:text', aiEditor.getText());
    },
  });
  aiEditor.setContent(defaultHtml || '');
});

onUnmounted(() => {
  aiEditor && aiEditor.destroy();
});

// 监听父组件传递的 modelValue 变化，更新编辑器内容
watch(
  () => modelValue,
  (newValue) => {
    if (aiEditor && newValue !== aiEditor.getHtml()) {
      aiEditor.setContent(newValue || '');
    }
  },
);

/* 获取用户列表 */
const _getUserListAll = async (query: string) => {
  const a = await getUserListAll({ realName: query });
  // return a;
  return a.map((item) => ({
    label: item.realName,
    id: item.userId,
    avatar: item.avatar,
  }));
};

// 暴露方法
defineExpose({
  aiEditor: () => aiEditor,
});
</script>

<template>
  <div class="aiEditorBox" :style="{ width, height }">
    <div ref="divRef" class="h-full w-full"></div>
  </div>
</template>

<style>
.aiEditorBox .tippy-box .tippy-content {
  max-height: 200px;
  overflow-y: auto;
}
</style>
