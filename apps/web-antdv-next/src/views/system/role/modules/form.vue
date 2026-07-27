<script lang="ts" setup>
import type { DataNode } from "antdv-next/dist/tree/index";

import type { Recordable } from "@vben/types";

import type { SystemRoleApi } from "#/api/system";

import { ref } from "vue";

import { Tree, useVbenDrawer } from "@vben/common-ui";
import { IconifyIcon } from "@vben/icons";

import { Spin } from "antdv-next";

import { useVbenForm } from "#/adapter/form";
import { createRoleApi, getMenuListApi, updateRoleApi, getRoleDetailApi } from "#/api/system";
import { $t } from "#/locales";

import { useFormSchema } from "../data";

const emits = defineEmits(["success"]);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const permissions = ref<DataNode[]>([]);
const loadingPermissions = ref(false);

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    (values.roleId ? updateRoleApi(values.roleId, values) : createRoleApi(values))
      .then(() => {
        emits("success");
        drawerApi.close();
      })
      .catch(() => {})
      .finally(() => {
        drawerApi.unlock();
      });
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      let data = drawerApi.getData<SystemRoleApi.SystemRoleFace>() || {};
      if (data.roleId) {
        data = await getRoleDetailApi(data.roleId);
        formApi.setValues(data);
        drawerApi.setState({
          title: $t("ui.actionTitle.edit", [$t("system.role.name")]),
        });
      } else {
        drawerApi.setState({
          title: $t("ui.actionTitle.create", [$t("system.role.name")]),
        });
        formApi.reset();
      }

      if (permissions.value.length === 0) {
        loadPermissions();
      }
    }
  },
});

async function loadPermissions() {
  loadingPermissions.value = true;
  try {
    const res = await getMenuListApi({ status: 1, hasButton: 1 });
    permissions.value = res as unknown as DataNode[];
  } finally {
    loadingPermissions.value = false;
  }
}

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === "button") {
    classes.push("permission-button-node");
    if (node.index % 5 === 0) {
      classes.push("permission-button-node--row-start");
    }
  }

  return classes.join(" ");
}
</script>
<template>
  <Drawer class="w-[800px]">
    <Form>
      <template #permissions="slotProps">
        <Spin :spinning="loadingPermissions" wrapper-class-name="w-full">
          <Tree
            class="permission-tree"
            :tree-data="permissions"
            multiple
            bordered
            :default-expanded-level="3"
            :get-node-class="getNodeClass"
            v-bind="slotProps"
            value-field="id"
            label-field="meta.title"
            icon-field="meta.icon"
          >
            <template #node="{ value }">
              <IconifyIcon v-if="value.meta.icon" :icon="value.meta.icon" />
              <IconifyIcon v-if="value.type == 'button'" icon="carbon:security" />
              {{ $t(value.meta.title) }}
            </template>
          </Tree>
        </Spin>
      </template>
    </Form>
  </Drawer>
</template>
<style lang="css" scoped>
:deep(.permission-tree) {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

:deep(.permission-tree > :not(.permission-button-node)) {
  grid-column: 1 / -1;
}

:deep(.permission-button-node) {
  min-width: 0;
  margin-left: 0 !important;
}

:deep(.permission-button-node--row-start) {
  padding-left: 2rem;
}

:deep(.permission-button-node .item-checkbox) {
  min-width: 0;
  overflow-wrap: anywhere;
}

:deep(.ant-tree-title) {
  .tree-actions {
    display: none;
    margin-left: 20px;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    display: flex;
    flex: auto;
    justify-content: flex-end;
    margin-left: 20px;
  }
}
</style>
