<script lang="ts" setup>
import { ref } from 'vue';
import {
  storyRichTemplateText,
  bugRichTemplateText,
} from '#/template/richText';
import { IconifyIcon } from '@vben/icons';
import { LanguageToggle, ThemeToggle } from '@vben/layouts';
import { Page } from '@vben/common-ui';

import { Button, Card, message } from 'antdv-next';

import type { VbenFormSchema } from '#/adapter/form';
import { useVbenForm } from '#/adapter/form';
import { createFeedbackApi } from '#/api/external/feedback';
import { upload_file_public } from '#/api/examples/upload';
import type { ExternalFeedbackApi } from '#/api/external/feedback';
import { $t } from '#/locales';
import { filesToUrlString } from '#/utils';

/** 反馈表单 Schema，字段对齐后端 CreateStoryFeedbackRequest */
function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'RadioGroup',
      fieldName: 'type',
      label: $t('public.feedback.fieldType'),
      defaultValue: 'story',
      rules: 'required',
      componentProps: {
        optionType: 'button',
        buttonStyle: 'solid',
        options: [
          { label: $t('public.feedback.typeStory'), value: 'story' },
          { label: $t('public.feedback.typeBug'), value: 'bug' },
        ],
      },
    },
    {
      component: 'Input',
      fieldName: 'title',
      label: $t('public.feedback.fieldTitle'),
      rules: 'required',
      componentProps: {
        maxlength: 128,
        showCount: true,
        placeholder: $t('public.feedback.fieldTitlePlaceholder'),
      },
    },
    {
      component: 'RichEditor',
      fieldName: 'richText',
      label: $t('public.feedback.fieldRichText'),
      rules: 'required',
      defaultValue: storyRichTemplateText,
      dependencies: {
        triggerFields: ['type'],
        // 切换反馈类型时同步切换富文本模板：story 走需求模板，bug 走 bug 模板，直接覆盖当前内容
        componentProps: (values: Record<string, any>, formApi: any) => {
          const tpl =
            values.type === 'bug' ? bugRichTemplateText : storyRichTemplateText;
          formApi.setFieldValue('richText', tpl);
          return {};
        },
      },
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
              upload_file_public({
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
      label: $t('public.feedback.fieldFiles'),
      componentProps: {
        customRequest: upload_file_public,
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
  layout: 'vertical',
  schema: useFormSchema(),
});

/** 提交成功后回显的工单编号与类型 */
const submittedNum = ref<number | null>(null);
const submittedType = ref<ExternalFeedbackApi.FeedbackType | null>(null);

/** 提交外部反馈工单：fileIds 由上传文件列表转为字符串数组后调用公开接口 */
async function onSubmit(values: Record<string, any>) {
  try {
    const fileIds = filesToUrlString(
      values.fileIds,
      'fileId',
      'array',
    ) as string[];

    formApi.setState({
      submitButtonOptions: { loading: true },
      resetButtonOptions: { disabled: true },
    });

    const resp = await createFeedbackApi({
      type: values.type,
      title: values.title,
      richText: values.richText,
      fileIds,
    });
    submittedNum.value = resp.num;
    submittedType.value = resp.type;
    message.success($t('public.feedback.submitSuccess'));
  } catch {
    formApi.setState({
      submitButtonOptions: { loading: false },
      resetButtonOptions: { disabled: false },
    });
  }
}

/** 重新提交：清空表单与成功状态 */
function resetForm() {
  submittedNum.value = null;
  submittedType.value = null;
  formApi.reset();
  formApi.setState({
    submitButtonOptions: { loading: false },
    resetButtonOptions: { disabled: false },
  });
}
</script>

<template>
  <Page>
    <div
      class="border-border bg-card fixed right-4 top-4 z-10 flex items-center rounded-lg border p-1 shadow-sm"
    >
      <LanguageToggle />
      <ThemeToggle />
    </div>

    <!-- 提交成功回执 -->
    <Card v-if="submittedNum !== null" class="mx-auto w-full max-w-2xl">
      <div class="flex flex-col items-center py-8 text-center">
        <IconifyIcon
          class="text-primary mb-4 size-14"
          icon="lucide:circle-check-big"
        />
        <h2 class="text-xl font-semibold">
          {{ $t('public.feedback.successTitle') }}
        </h2>
        <p class="text-muted-foreground mt-2 text-sm">
          {{ $t('public.feedback.successDesc') }}
        </p>
        <div class="mt-4 text-2xl font-semibold">
          #{{ submittedNum }}
          <span
            class="text-muted-foreground ml-1 align-middle text-sm font-normal"
          >
            ({{
              submittedType === 'bug'
                ? $t('public.feedback.typeBug')
                : $t('public.feedback.typeStory')
            }})
          </span>
        </div>
        <Button class="mt-6" type="primary" @click="resetForm">
          {{ $t('public.feedback.submitAnother') }}
        </Button>
      </div>
    </Card>

    <!-- 反馈表单 -->
    <Card
      v-else
      :title="$t('public.feedback.formTitle')"
      class="mx-auto w-full max-w-2xl"
    >
      <p class="text-muted-foreground mb-6 text-sm">
        {{ $t('public.feedback.formDesc') }}
      </p>
      <Form />
    </Card>
  </Page>
</template>
