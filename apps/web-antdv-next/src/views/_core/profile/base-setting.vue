<script setup lang="ts">
import type { VbenFormSchema } from "#/adapter/form";

import { computed, onMounted, ref } from "vue";

import { ProfileBaseSetting } from "@vben/common-ui";
import { useUserStore } from "@vben/stores";

import { message } from "antdv-next";

import { z } from "#/adapter/form";
import { getProfileApi, updateProfileApi } from "#/api/auth";
import { upload_file } from "#/api/examples/upload";
import { filesToUrlString, urlStringToFiles } from "#/utils/file";

const userStore = useUserStore();

const profileBaseSettingRef = ref();

const saveLoading = ref(false);

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: "Upload",
      componentProps: {
        accept: ".png,.jpg,.jpeg",
        aspectRatio: "1:1",
        crop: true,
        customRequest: upload_file,
        listType: "picture-card",
        maxCount: 1,
        maxSize: 2,
      },
      fieldName: "avatar",
      label: "头像",
      renderComponentContent: () => ({
        default: () => "上传头像",
      }),
    },
    {
      fieldName: "realName",
      component: "Input",
      label: "真实姓名",
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: "username",
      component: "Input",
      label: "登录名",
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: "phone",
      component: "Input",
      label: "手机号",
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: "email",
      component: "Input",
      label: "邮箱",
      componentProps: {
        maxlength: 128,
        placeholder: "请输入邮箱",
      },
      rules: z
        .string()
        .email("邮箱格式不正确")
        .max(128, "邮箱不能超过128个字符")
        .optional()
        .or(z.literal("")),
    },
  ];
});

/**
 * 提交基本资料：保存头像和邮箱，成功后用最新资料刷新用户信息
 */
async function handleSubmit(values: Recordable<any>) {
  if (saveLoading.value) {
    return;
  }
  saveLoading.value = true;
  try {
    const profile = await updateProfileApi({
      // 头像文件列表转 URL 字符串；为空时提交空字符串表示清空
      avatar: filesToUrlString(values.avatar),
      email: (values.email ?? "").trim(),
    });
    // 用接口返回的最新资料刷新用户信息，左侧头像等展示即时更新
    userStore.setUserInfo(profile);
    message.success("保存成功");
  } finally {
    saveLoading.value = false;
  }
}

onMounted(async () => {
  const data = await getProfileApi();
  profileBaseSettingRef.value
    .getFormApi()
    .setValues({
      ...data,
      // 头像 URL 转为文件列表供上传组件回显
      avatar: urlStringToFiles(data.avatar ?? ""),
      email: data.email ?? "",
    });
});
</script>
<template>
  <ProfileBaseSetting
    ref="profileBaseSettingRef"
    @submit="handleSubmit"
    :form-schema="formSchema"
  />
</template>
