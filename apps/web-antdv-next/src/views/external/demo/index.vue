<script lang="ts" setup>
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { LanguageToggle } from '@vben/layouts';

import { $t } from '#/locales';

const router = useRouter();
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

    <section
      class="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur md:p-12"
    >
      <div
        class="mb-6 inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200"
      >
        {{ $t('page.externalDemo.badge') }}
      </div>

      <h1 class="text-3xl font-semibold tracking-tight md:text-5xl">
        {{ $t('page.externalDemo.title') }}
      </h1>
      <p class="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
        {{ $t('page.externalDemo.description') }}
      </p>

      <div class="mt-8 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
        <div class="rounded-2xl border border-white/10 bg-black/10 p-4">
          {{ $t('page.externalDemo.noLayout') }}
        </div>
        <div class="rounded-2xl border border-white/10 bg-black/10 p-4">
          {{ $t('page.externalDemo.noLogin') }}
        </div>
      </div>

      <button
        class="mt-8 rounded-xl bg-white px-5 py-3 font-medium text-slate-900 transition hover:bg-slate-200"
        type="button"
        @click="router.push(LOGIN_PATH)"
      >
        {{ $t('page.externalDemo.goToLogin') }}
      </button>
    </section>
  </main>
</template>
