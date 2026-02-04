<template>
  <div class="aiEditorBox">
    <div ref="divRef" style="height: 600px"></div>
  </div>
</template>

<script setup lang="ts">
import { AiEditor } from 'aieditor';
import 'aieditor/dist/style.css';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { usePreferences } from '@vben/preferences';
import { getUserListAll, type SystemUserApi } from '#/api/system';

const emit = defineEmits(['update:modelValue', 'update:text']); // 用于触发 v-model 更新

const { isDark } = usePreferences();
const divRef = ref();

let aiEditor: AiEditor | null = null;

const { modelValue, defaultHtml } = defineProps({
  modelValue: String, // 双向绑定的值
  defaultHtml: String, // 默认的 html 内容
});
onMounted(() => {
  aiEditor = new AiEditor({
    element: divRef.value as Element,
    onMentionQuery: _getUserListAll,
    placeholder: '点击输入内容...', // 使用传入的占位符
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
    toolbarExcludeKeys: ['video', 'attachment'], // 排除的工具栏按钮
    image: {
      uploadUrl: 'https://your-domain/image/upload',
      uploadHeaders: {
        jwt: 'xxxxx',
        other: 'xxxx',
      },
      uploader: (
        file: File,
        uploadUrl: string,
        headers: Record<string, any>,
        formName: string,
      ): Promise<Record<string, any>> => {
        const formData = new FormData();
        formData.append(formName, file);
        return new Promise((resolve, reject) => {
          fetch(uploadUrl, {
            method: 'post',
            headers: { Accept: 'application/json', ...headers },
            body: formData,
          })
            .then((resp) => resp.json())
            .then((json) => {
              resolve(json);
            })
            .catch((error) => {
              reject(error);
            });
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
  let a = await getUserListAll({ realName: query });
  // return a;
  return a.map((item) => ({
    label: item.realName,
    id: item.userId,
    avatar: item.avatar,
  }));
};
</script>

<style>
.aiEditorBox .tippy-box {
  background-color: transparent !important;
}

.aiEditorBox .tippy-box .tippy-content {
  max-height: 200px;
  padding: 5px;
  overflow-y: auto;
}
</style>
