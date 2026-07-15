<script lang="ts" setup>
import type { WorkflowDefinitionApi } from '#/api/workflow';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button, Empty, message, Spin, Tag } from 'antdv-next';

import {
  getAllWorkflowDefinitionsApi,
  startWorkflowInstanceApi,
} from '#/api/workflow';
import { $t } from '#/locales';
import FormRenderer from '#/views/workflow/form/form-renderer.vue';
import {
  createWorkflowFormValues,
  getWorkflowFormFields,
  parseWorkflowFormSchema,
} from '#/views/workflow/form/schema';

import { getWorkflowCategoryText } from '../definition/category';

interface StartableDefinition {
  definition: WorkflowDefinitionApi.WorkflowDefinition;
  schema: WorkflowDefinitionApi.WorkflowFormSchema;
}

interface FormRendererApi {
  validate: () => Promise<void>;
}

const emit = defineEmits<{ success: [] }>();

const definitions = ref<WorkflowDefinitionApi.WorkflowDefinition[]>([]);
const formRendererRef = ref<FormRendererApi>();
const formValues = ref<Record<string, unknown>>({});
const loading = ref(false);
const selectedDefinitionId = ref<string>();

const startableDefinitions = computed<StartableDefinition[]>(() =>
  definitions.value
    .map((definition) => ({
      definition,
      schema: parseWorkflowFormSchema(definition.formSchema),
    }))
    .filter(
      (item) =>
        item.definition.definitionId &&
        getWorkflowFormFields(item.schema).length > 0,
    ),
);

const selectedDefinition = computed(() =>
  startableDefinitions.value.find(
    (item) => item.definition.definitionId === selectedDefinitionId.value,
  ),
);

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const selected = selectedDefinition.value;
    if (!selected?.definition.definitionId) {
      message.warning($t('flow.form.runtime.selectApplication'));
      return;
    }
    if (!(await validateForm())) return;
    modalApi.lock();
    try {
      await startWorkflowInstanceApi({
        definitionId: selected.definition.definitionId,
        variables: formValues.value,
      });
      message.success($t('flow.runtime.instance.startSuccess'));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(open) {
    if (!open) return;
    selectedDefinitionId.value = undefined;
    formValues.value = {};
    await loadDefinitions();
  },
  title: $t('flow.form.runtime.startApplication'),
});

/** 加载所有已发布且绑定有效表单的申请类型。 */
async function loadDefinitions() {
  loading.value = true;
  try {
    definitions.value = await getAllWorkflowDefinitionsApi({ status: '1' });
  } finally {
    loading.value = false;
  }
}

/** 选择申请类型并按字段默认值初始化申请数据。 */
function selectDefinition(item: StartableDefinition) {
  selectedDefinitionId.value = item.definition.definitionId;
  formValues.value = createWorkflowFormValues(item.schema);
}

/** 返回申请类型选择页并清空尚未提交的数据。 */
function backToApplications() {
  selectedDefinitionId.value = undefined;
  formValues.value = {};
}

/** 执行动态表单校验并将组件校验异常转换为布尔结果。 */
async function validateForm() {
  try {
    await formRendererRef.value?.validate();
    return true;
  } catch {
    return false;
  }
}
</script>

<template>
  <Modal class="w-[780px]">
    <Spin :spinning="loading">
      <div v-if="!selectedDefinition" class="application-catalog">
        <div class="catalog-heading">
          {{ $t('flow.form.runtime.chooseApplication') }}
        </div>
        <Empty
          v-if="startableDefinitions.length === 0"
          :description="$t('flow.form.runtime.noApplications')"
        />
        <div v-else class="application-grid">
          <button
            v-for="item in startableDefinitions"
            :key="item.definition.definitionId"
            class="application-item"
            type="button"
            @click="selectDefinition(item)"
          >
            <span class="application-icon">
              <IconifyIcon class="size-5" icon="lucide:file-pen-line" />
            </span>
            <span class="application-content">
              <strong>{{ item.definition.definitionName }}</strong>
              <span>{{
                item.definition.remark ||
                $t('flow.form.runtime.fillApplication')
              }}</span>
            </span>
            <Tag v-if="item.definition.category">
              {{ getWorkflowCategoryText(item.definition.category) }}
            </Tag>
            <IconifyIcon class="size-4" icon="lucide:chevron-right" />
          </button>
        </div>
      </div>

      <div v-else class="application-form">
        <div class="form-heading">
          <Button type="text" @click="backToApplications">
            <IconifyIcon class="size-4" icon="lucide:arrow-left" />
            {{ $t('flow.form.runtime.changeApplication') }}
          </Button>
          <div>
            <strong>{{ selectedDefinition.definition.definitionName }}</strong>
            <span>{{ selectedDefinition.definition.remark }}</span>
          </div>
        </div>
        <FormRenderer
          ref="formRendererRef"
          v-model="formValues"
          :schema="selectedDefinition.schema"
        />
      </div>
    </Spin>
  </Modal>
</template>

<style scoped>
.application-catalog,
.application-form {
  min-height: 360px;
}

.catalog-heading {
  margin-bottom: 14px;
  color: hsl(var(--foreground));
  font-size: 14px;
  font-weight: 600;
}

.application-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.application-item {
  display: grid;
  min-width: 0;
  min-height: 88px;
  align-items: center;
  border: 1px solid hsl(var(--border));
  border-radius: 7px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  cursor: pointer;
  gap: 10px;
  grid-template-columns: 38px minmax(0, 1fr) auto 16px;
  padding: 14px;
  text-align: left;
}

.application-item:hover {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.04);
}

.application-icon {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}

.application-content,
.form-heading > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.application-content strong,
.application-content span,
.form-heading strong,
.form-heading span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.application-content span,
.form-heading span {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.form-heading {
  display: grid;
  align-items: center;
  margin-bottom: 18px;
  border-bottom: 1px solid hsl(var(--border));
  gap: 12px;
  grid-template-columns: auto minmax(0, 1fr);
  padding-bottom: 14px;
}

.form-heading strong {
  color: hsl(var(--foreground));
  font-size: 15px;
}

@media (max-width: 640px) {
  .application-grid {
    grid-template-columns: 1fr;
  }
}
</style>
