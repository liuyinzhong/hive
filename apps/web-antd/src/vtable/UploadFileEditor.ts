import type {
  CellAddress,
  EditContext,
  IEditor,
  RectProps,
  ValidateEnum,
} from '@visactor/vtable-editors';
import type {
  UploadChangeParam,
  UploadProps,
  UploadFile,
} from 'ant-design-vue';

import { message, Upload } from 'ant-design-vue';

import type { ComponentPublicInstance } from 'vue';

import { createApp, onMounted, ref } from 'vue';

import { UploadDragger } from 'ant-design-vue';
import { useVbenDrawer } from '@vben/common-ui';
import { upload_file } from '#/api/examples/upload';
import { filesToUrlString, urlStringToFiles } from '#/utils';
/**
 * 选择编辑器配置接口
 */
interface UploadEditorConfig {
  maxCount?: number;
}

/**
 * 自定义上传文件组件
 * 实现 VTable 的 IEditor 接口，提供基于 Ant Design Vue Select 的下拉选择功能
 * 文档地址：https://visactor.io/vtable/guide/edit/edit_cell
 */
export class UploadFileEditor implements IEditor {
  /** Vue 应用实例 */
  app: any = null;
  /** 容器元素 */
  container: HTMLElement | null = null;
  // ==================== 属性声明 ====================
  /** 编辑器配置 */
  editorConfig: UploadEditorConfig;
  /** 当前列绑定的字段名 */
  field: string = '';
  /** 表格当前行数据对象 */
  rowData: any = {};
  /** 组件实例 */
  uploadFileInstance: ComponentPublicInstance | null = null;
  /** 结束编辑回调函数 */
  successCallback: Function | null = null;
  /** 编辑器包装元素 */
  wrapperElement: HTMLDivElement | null = null;
  /** 已上传的文件Url地址 */
  fileUrls: UploadProps['fileList'] = [];

  // ==================== 构造函数 ====================
  /**
   * 创建选择编辑器实例
   * @param editorConfig 编辑器配置选项
   */
  constructor(editorConfig?: UploadEditorConfig) {
    this.editorConfig = editorConfig || {
      maxCount: 1,
    };
  }

  /**
   * 调整编辑器位置和尺寸
   * @param rect 参考位置信息
   */
  adjustPosition(rect: RectProps) {
    if (!this.wrapperElement) return;

    // 设置位置和尺寸
    this.wrapperElement.style.top = `${rect.top}px`;
    this.wrapperElement.style.left = `${rect.left}px`;
    this.wrapperElement.style.width = `${rect.width}px`;
    this.wrapperElement.style.height = `${rect.height}px`;
    this.wrapperElement.style.minHeight = `${rect.height}px`;

    // 设置样式属性
    this.wrapperElement.style.position = 'absolute';
    this.wrapperElement.style.backgroundColor = '#ffffff';
    this.wrapperElement.style.zIndex = '1000';
  }

  /**
   * 获取编辑器当前值
   * 在 onEnd 调用后由 VTable 调用获取最终值
   * @returns 当前选中的显示文本
   */
  getValue(): string {
    return filesToUrlString(this.fileUrls || []);
  }

  /**
   * 检查目标元素是否属于编辑器的一部分
   * 用于确定点击事件是否应该关闭编辑器
   * @param target 目标DOM元素
   * @returns 是否属于编辑器元素
   */
  isEditorElement(target: HTMLElement): boolean {
    return true;
    /* return (
      !!this.wrapperElement &&
      (this.wrapperElement === target || this.wrapperElement.contains(target))
    ); */
  }

  /**
   * 单元格退出编辑状态时调用
   * 执行清理操作并触发回调
   */
  onEnd() {
    // 清理Vue应用
    this.cleanupVueApp();

    // 移除DOM元素
    this.removeWrapperElement();

    // 重置引用
    this.resetReferences();
  }

  // ==================== 核心方法实现 ====================
  /**
   * 单元格进入编辑状态时调用
   * 初始化编辑器UI并挂载到指定容器
   * @param context 编辑上下文信息
   */
  onStart(context: EditContext) {
    const { container, value, referencePosition, endEdit, table, col, row } =
      context;

    // 初始化基本属性
    this.container = container;
    this.successCallback = endEdit;
    if (value) {
      this.fileUrls = urlStringToFiles(value);
    } else {
      this.fileUrls = [];
    }
    this.rowData = table.records[row - 1] || {};
    this.field = table.options.columns[col]?.field || '';

    // 创建编辑器容器
    this.createWrapperElement();

    // 创建并挂载Vue应用
    this.mountVueApp();

    // 调整编辑器位置
    this.adjustEditorPosition(referencePosition?.rect);
  }

  /**
   * 验证输入值的有效性
   * 支持通过 label 验证选项，解决复制粘贴时的验证问题
   */
  validateValue?(
    newValue?: any,
    oldValue?: any,
    position?: CellAddress,
    table?: any,
  ): boolean | ValidateEnum {
    // 更新行数据引用
    if (position?.row !== undefined) {
      this.rowData = table.records[position.row - 1] || {};
    }

    if (!newValue) {
      return true;
    }

    // 检查是否以 http:// 或 https:// 开头
    const isValidUrl =
      newValue.startsWith('http://') || newValue.startsWith('https://');

    return isValidUrl;
  }

  /**
   * 调整编辑器位置
   */
  private adjustEditorPosition(rect?: RectProps) {
    if (rect) {
      this.adjustPosition(rect);
    }
  }

  /**
   * 清理Vue应用资源
   */
  private cleanupVueApp() {
    if (this.app) {
      this.app.unmount();
      this.app = null;
      this.uploadFileInstance = null;
    }
  }

  // ==================== 辅助方法 ====================
  /**
   * 创建编辑器包装元素
   */
  private createWrapperElement() {
    this.wrapperElement = document.createElement('div');
    this.wrapperElement.style.boxSizing = 'border-box';
  }

  /**
   * 创建并挂载Vue应用
   */
  private mountVueApp() {
    const that = this;

    this.app = createApp({
      components: { UploadDragger },
      setup() {
        const headers = {
          authorization: 'authorization-text',
        };

        // 响应式数据
        const fileList = ref<any>(that.fileUrls);

        const [Drawer, drawerApi] = useVbenDrawer({
          title: '上传',
          class: 'w-[800px]',
          onConfirm() {
            let successNum = fileList.value?.filter(
              (item: any) => item.status === 'done',
            ).length;

            /* 上传成功的数量 === 本次选择的数量时，才允许回调 */
            if (successNum === fileList.value?.length) {
              that.fileUrls = fileList.value;
              drawerApi.close();
            } else {
              message.error('请检查文件上传状态');
            }
          },
          onClosed() {
            /* 关闭弹窗时，触发单元格编辑回调 */
            that.successCallback?.();
          },
        });

        const handleChange = (info: UploadChangeParam) => {};

        const beforeUpload = (file: UploadFile, files: UploadFile[]) => {
          if (file.size && file.size > 1024 * 1024 * 100) {
            message.error('文件大小不能超过100MB');
            return Upload.LIST_IGNORE;
          }

          /* 最多不超过 maxCount 个文件 */
          if (
            (files.length + fileList.value?.length || 0) >
            (that.editorConfig.maxCount as number)
          ) {
            message.error(`最多上传${that.editorConfig.maxCount}个文件`);
            return Upload.LIST_IGNORE;
          }
        };

        onMounted(() => {
          // 自动打开抽屉
          setTimeout(() => {
            drawerApi.open();
          }, 0);
        });

        return {
          fileList,
          handleChange,
          headers,
          maxCount: that.editorConfig.maxCount,
          uploadFile: upload_file,
          beforeUpload,
          Drawer,
        };
      },
      template: `
        <component :is="Drawer">
          <div class="w-full h-[300px]">
            <UploadDragger
              v-model:file-list="fileList"
              name="file"
              :max-count="maxCount"
              :headers="headers"
              :custom-request="uploadFile"
              :multiple="true"
              :before-upload="beforeUpload"
              @change="handleChange"
              style="width:100%"
            >
              <p class="ant-upload-drag-icon" style="margin-top: 50px;">
                <span class="icon-[lucide--hard-drive-upload] size-10 text-primary"></span>
              </p>
              <p class="ant-upload-text">单击或拖动文件到此区域以上传,最多{{maxCount}}个文件</p>
              <p class="ant-upload-hint">
                支持单个或批量上传。严格禁止上传敏感文件
              </p>
            </UploadDragger>
          </div>

        </component>
      `,
    });

    // 挂载到包装元素
    this.uploadFileInstance = this.app.mount(this.wrapperElement);

    // 添加到容器
    this.container?.append(this.wrapperElement as Node);
  }

  /**
   * 移除包装元素
   */
  private removeWrapperElement() {
    if (this.wrapperElement && this.container?.contains(this.wrapperElement)) {
      this.wrapperElement.remove();
    }
    this.wrapperElement = null;
  }

  /**
   * 重置对象引用
   */
  private resetReferences() {
    this.container = null;
    this.successCallback = null;
  }
}
