<script lang="ts" setup>
import { ref } from 'vue';

import { LanguageToggle } from '@vben/layouts';

import { useVbenForm } from '#/adapter/form';
import {
  createFeedbackApi,
  upload_file_external,
} from '#/api/external/feedback';
import type { ExternalFeedbackApi } from '#/api/external/feedback';
import { filesToUrlString } from '#/utils';
import { $t } from '#/locales';
import { message } from 'antdv-next';

/** 反馈表单 Schema，字段对齐后端 CreateStoryFeedbackRequest */
function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'RadioGroup',
      fieldName: 'type',
      label: $t('external.story.fieldType'),
      defaultValue: 'story',
      rules: 'required',
      formItemClass: 'col-span-2',
      componentProps: {
        options: [
          { label: $t('external.story.typeStory'), value: 'story' },
          { label: $t('external.story.typeBug'), value: 'bug' },
        ],
      },
    },
    {
      component: 'Input',
      fieldName: 'title',
      label: $t('external.story.fieldTitle'),
      rules: 'required',
      formItemClass: 'col-span-2',
      componentProps: {
        maxlength: 128,
        showCount: true,
        placeholder: $t('external.story.fieldTitlePlaceholder'),
      },
    },
    {
      component: 'RichEditor',
      fieldName: 'richText',
      label: $t('external.story.fieldRichText'),
      labelWidth: 0,
      formItemClass: 'col-span-2',
      componentProps: {
        editable: true,
        minHeight: 260,
        maxHeight: 460,
        // 外部页面无登录态，富文本内嵌图片改走公开上传 /public/upload
        imageUpload: {
          accept: 'image/*',
          maxSize: 5 * 1024 * 1024, // 5MB
          upload: (file: File, onProgress: (percent: number) => void) => {
            return new Promise<string>((resolve, reject) => {
              upload_file_external({
                file,
                onProgress({ percent }) {
                  onProgress?.(percent);
                },
                onSuccess(data) {
                  // 公开上传返回 FeedbackFileFace，取 url 供编辑器嵌入
                  resolve(data?.url ?? '');
                },
                onError() {
                  reject(new Error($t('ui.tiptap.upload.uploadFailed')));
                },
              });
            });
          },
        },
      },
    },
    {
      component: 'Upload',
      fieldName: 'fileIds',
      label: $t('external.story.fieldFiles'),
      formItemClass: 'col-span-2',
      componentProps: {
        customRequest: upload_file_external,
        maxCount: 10,
        multiple: true,
        showUploadList: true,
        listType: 'text',
      },
    },
  ];
}

/** 表单实例，提交时调用 createFeedbackApi */
const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  wrapperClass: 'grid-cols-2',
  schema: useFormSchema(),
  showDefaultActions: false,
});

/** 提交中标记，控制按钮 loading */
const submitting = ref(false);
/** 提交成功后回显的工单编号与类型 */
const submittedNum = ref<number | null>(null);
const submittedType = ref<ExternalFeedbackApi.FeedbackType | null>(null);

/** 提交外部反馈工单：fileIds 由上传文件列表转为字符串数组后调用公开接口 */
async function onSubmit(values: Record<string, any>) {
  submitting.value = true;
  try {
    const fileIds = filesToUrlString(
      values.fileIds,
      'fileId',
      'array',
    ) as string[];
    const resp = await createFeedbackApi({
      type: values.type,
      title: values.title,
      richText: values.richText,
      fileIds,
    });
    submittedNum.value = resp.num;
    submittedType.value = resp.type;
    message.success($t('external.story.submitSuccess'));
  } catch {
    // 错误提示由统一响应拦截器处理
  } finally {
    submitting.value = false;
  }
}

/** 重新提交：清空表单与成功状态 */
function resetForm() {
  submittedNum.value = null;
  submittedType.value = null;
  formApi.resetForm();
}
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white"
  >
    <div
      class="dark fixed right-6 top-6 z-10 rounded-xl border border-white/10 bg-white/10 p-1 shadow-lg backdrop-blur"
    >
      <LanguageToggle />
    </div>

    <!-- 提交成功回执 -->
    <section
      v-if="submittedNum !== null"
      class="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur md:p-12"
    >
      <div
        class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/10 text-3xl text-emerald-200"
      >
        ✓
      </div>
      <h2 class="text-2xl font-semibold tracking-tight md:text-3xl">
        {{ $t('external.story.successTitle') }}
      </h2>
      <p class="mt-4 text-base leading-7 text-slate-300">
        {{ $t('external.story.successDesc') }}
      </p>
      <div
        class="mt-6 inline-flex items-center rounded-full border border-white/10 bg-black/10 px-5 py-2 text-lg font-medium"
      >
        #{{ submittedNum }}
        <span class="ml-2 text-sm text-slate-400">
          ({{
            submittedType === 'bug'
              ? $t('external.story.typeBug')
              : $t('external.story.typeStory')
          }})
        </span>
      </div>
      <div class="mt-8">
        <button
          class="rounded-xl bg-white px-5 py-3 font-medium text-slate-900 transition hover:bg-slate-200"
          type="button"
          @click="resetForm"
        >
          {{ $t('external.story.submitAnother') }}
        </button>
      </div>
    </section>

    <!-- 反馈表单 -->
    <section
      v-else
      class="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur md:p-10"
    >
      <div
        class="mb-6 inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200"
      >
        {{ $t('external.story.badge') }}
      </div>
      <h1 class="text-2xl font-semibold tracking-tight md:text-3xl">
        {{ $t('external.story.formTitle') }}
      </h1>
      <p class="mt-3 text-sm leading-6 text-slate-300">
        {{ $t('external.story.formDesc') }}
      </p>

      <div
        class="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 md:p-6"
      >
        <Form />
        <div class="mt-6 flex justify-end">
          <button
            class="rounded-xl bg-white px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="submitting"
            type="button"
            @click="formApi.validateAndSubmitForm()"
          >
            {{
              submitting
                ? $t('external.story.submitting')
                : $t('external.story.submit')
            }}
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
