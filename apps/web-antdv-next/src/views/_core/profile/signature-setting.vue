<script setup lang="ts">
import { onMounted, ref } from "vue";

import { Button, message } from "antdv-next";

import { useVbenForm } from "#/adapter/form";
import { getProfileApi, updateProfileApi } from "#/api/auth";
import { filesToUrlString, urlStringToFiles } from "#/utils/file";

const saveLoading = ref(false);

const [Form, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 130,
    // 所有表单项
    componentProps: {
      class: "w-full",
    },
  },
  layout: "horizontal",
  schema: [
    {
      component: "Upload",
      componentProps: {
        accept: ".png,.jpg,.jpeg",
        listType: "picture-card",
        maxCount: 1,
        maxSize: 2,
      },
      fieldName: "signature",
      label: "签名图片",
      renderComponentContent: () => ({
        default: () => "上传签名",
      }),
    },
  ],
  showDefaultActions: false,
});

/**
 * 提交签名：上传后的文件列表转 URL 字符串保存，为空时提交空字符串表示清空
 */
async function handleSubmit() {
  if (saveLoading.value) {
    return;
  }
  const { valid } = await formApi.validate();
  if (!valid) {
    return;
  }
  const values = await formApi.getValues();
  saveLoading.value = true;
  try {
    await updateProfileApi({
      signature: filesToUrlString(values.signature),
    });
    message.success("保存成功");
  } finally {
    saveLoading.value = false;
  }
}

onMounted(async () => {
  const data = await getProfileApi();
  formApi.setValues({
    // 签名 URL 转为文件列表供上传组件回显
    signature: urlStringToFiles(data.signature ?? ""),
  });
});
</script>
<template>
  <div class="w-1/3 min-w-80">
    <Form />
    <Button type="primary" class="mt-4" :loading="saveLoading" @click="handleSubmit">
      保存
    </Button>
  </div>
</template>
