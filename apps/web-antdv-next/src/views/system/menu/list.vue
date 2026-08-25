<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { TabPane, Tabs, Segmented } from 'antdv-next';

import ExternalPageList from './externalMenu/index.vue';

import RootMenuList from './rootMenu/index.vue';

const activeTab = ref<'系统菜单' | '外部页面'>('系统菜单');
const tabOptions = ref([
  {
    value: '系统菜单',
    tooltip: '系统内部菜单',
  },
  {
    value: '外部页面',
    tooltip:
      '外部页面,用于向别人系统对接时提供一个可直接打开的链接，或者是业务反馈页面。全屏无布局',
  },
]);
</script>
<template>
  <Page auto-content-height>
    <div class="bg-card rounded-md p-2 h-full">
      <Segmented v-model:value="activeTab" :options="tabOptions">
        <template #labelRender="{ value }">
          <div>{{ value }}</div>
        </template>
      </Segmented>

      <RootMenuList
        v-access:code="['system:menu:list']"
        v-if="activeTab == '系统菜单'"
      />

      <ExternalPageList
        v-access:code="['system:externalPage:list']"
        v-if="activeTab == '外部页面'"
      />
    </div>
  </Page>
</template>
<style lang="scss" scoped></style>
