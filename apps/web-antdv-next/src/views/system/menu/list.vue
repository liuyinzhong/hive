<script lang="ts" setup>
import { ref } from "vue";

import { Page } from "@vben/common-ui";
import { $t } from "@vben/locales";

import { TabPane, Tabs } from "antdv-next";

import ExternalPageList from "./externalMenu/index.vue";

import RootMenuList from "./rootMenu/index.vue";

const activeTab = ref<"external" | "system">("system");
</script>
<template>
  <Page auto-content-height>
    <Tabs v-model:active-key="activeTab" class="h-full">
      <TabPane
        v-access:code="['system:menu:list']"
        key="system"
        :tab="$t('system.menu.systemMenuTab')"
        class="h-full"
      >
        <RootMenuList />
      </TabPane>
      <TabPane
        v-access:code="['system:externalPage:list']"
        key="external"
        :tab="$t('system.menu.externalPageTab')"
      >
        <ExternalPageList />
      </TabPane>
    </Tabs>
  </Page>
</template>
<style lang="scss" scoped></style>
