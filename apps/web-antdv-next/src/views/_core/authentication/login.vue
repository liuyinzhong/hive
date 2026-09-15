<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, markRaw, ref, useTemplateRef } from 'vue';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { issueCaptchaApi } from '#/api/auth';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

/** 失败触发标记：后端以 HTTP 428 要求滑块验证后置为 true，表单随之展示滑块 */
const captchaRequired = ref(false);
/** 滑块挑战票据：触发滑块验证时领取，每次提交消费一枚，失败后重领 */
const captchaId = ref('');

async function refreshCaptcha() {
  try {
    captchaId.value = (await issueCaptchaApi()).captchaId;
  } catch {
    // 领取失败保留空票据；提交后后端会再次以 428 提示重试
    captchaId.value = '';
  }
}

/** 首次触发滑块验证：展示滑块并领取票据 */
function enableCaptcha() {
  captchaRequired.value = true;
  loginRef.value?.getFormApi()?.setFieldValue('captchaRequired', true, false);
  void refreshCaptcha();
}

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    {
      component: 'Input',
      fieldName: 'captchaRequired',
      dependencies: {
        triggerFields: ['captchaRequired'],
        show: false,
      },
    },
    {
      component: markRaw(SliderCaptcha),
      fieldName: 'captcha',
      dependencies: {
        triggerFields: ['captchaRequired'],
        if: (values) => !!values.captchaRequired,
      },
      rules: z.boolean().refine((value) => value, {
        message: $t('authentication.verifyRequiredTip'),
      }),
    },
  ];
});

const loginRef =
  useTemplateRef<InstanceType<typeof AuthenticationLogin>>('loginRef');

async function onSubmit(params: Recordable<any>) {
  authStore
    .authLogin({
      ...params,
      captchaId: captchaId.value,
    })
    .catch((error: any) => {
      // 后端以 428 要求滑块验证：首次触发时展示滑块并领取票据
      if (error?.response?.status === 428 && !captchaRequired.value) {
        enableCaptcha();
        return;
      }
      // 其余失败：已展示滑块时重置滑块并重领票据（票据已随本次提交被服务端消费）
      if (captchaRequired.value) {
        const formApi = loginRef.value?.getFormApi();
        // 重置验证码组件的值
        formApi?.setFieldValue('captcha', false, false);
        // 使用表单API获取验证码组件实例，并调用其resume方法来重置验证码
        formApi
          ?.getFieldComponentRef<InstanceType<typeof SliderCaptcha>>('captcha')
          ?.resume();
        void refreshCaptcha();
      }
    });
}
</script>

<template>
  <AuthenticationLogin
    ref="loginRef"
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="onSubmit"
  />
</template>
