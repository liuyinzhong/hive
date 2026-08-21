<script setup lang="ts">
import type { BasicOption } from "@vben/types";

import type { VbenFormSchema } from "#/adapter/form";

import { computed, onMounted, ref } from "vue";

import { ProfileBaseSetting } from "@vben/common-ui";

import { getProfileApi } from "#/api/auth";

const profileBaseSettingRef = ref();

const formSchema = computed((): VbenFormSchema[] => {
  return [
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
  ];
});

async function handleSubmit(values: Recordable<any>) {}

onMounted(async () => {
  const data = await getProfileApi();
  profileBaseSettingRef.value.getFormApi().setValues(data);
});
</script>
<template>
  <ProfileBaseSetting
    ref="profileBaseSettingRef"
    @submit="handleSubmit"
    :form-schema="formSchema"
  />
</template>
