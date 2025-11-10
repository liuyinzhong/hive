import type {
  CellAddress,
  EditContext,
  IEditor,
  RectProps,
  ValidateEnum,
} from '@visactor/vtable-editors';

import type { ComponentPublicInstance } from 'vue';

import { createApp, ref } from 'vue';

import { Select } from 'ant-design-vue';

/**
 * 选择编辑器配置接口
 */
interface SelectEditorConfig {
  /** 下拉选项数组 */
  options: {
    label: string;
    value: string;
    [key: string]: any;
  }[];
  /** 选项变化时的回调函数 */
  change: (rowData: any, option: any) => void;
}

/**
 * 自定义选择编辑器组件
 * 实现 VTable 的 IEditor 接口，提供基于 Ant Design Vue Select 的下拉选择功能
 * 文档地址：https://visactor.io/vtable/guide/edit/edit_cell
 */
export class SelectEditor implements IEditor {
  /** Vue 应用实例 */
  app: any = null;
  /** 选项变化回调函数 */
  changeCallback: (rowData: any, option: any) => void;
  /** 容器元素 */
  container: HTMLElement | null = null;
  // ==================== 属性声明 ====================
  /** 编辑器配置 */
  editorConfig: SelectEditorConfig;
  /** 当前列绑定的字段名 */
  field: string = '';
  /** 选项数据源 */
  options: any[] = [];
  /** 表格当前行数据对象 */
  rowData: any = {};
  /** 当前选中的显示文本 */
  selectedLabel: string = '';
  /** 当前选中的完整选项对象 */
  selectedOption: any = {};
  /** Select 组件实例 */
  selectInstance: ComponentPublicInstance | null = null;
  /** 结束编辑回调函数 */
  successCallback: ((result?: any) => void) | null = null;
  /** 编辑器包装元素 */
  wrapperElement: HTMLDivElement | null = null;

  // ==================== 构造函数 ====================
  /**
   * 创建选择编辑器实例
   * @param editorConfig 编辑器配置选项
   */
  constructor(editorConfig?: SelectEditorConfig) {
    this.editorConfig = editorConfig || { options: [], change: () => {} };
    this.options = this.editorConfig.options;
    this.changeCallback = this.editorConfig.change;
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
    return this.selectedLabel;
  }

  /**
   * 检查目标元素是否属于编辑器的一部分
   * 用于确定点击事件是否应该关闭编辑器
   * @param target 目标DOM元素
   * @returns 是否属于编辑器元素
   */
  isEditorElement(target: HTMLElement): boolean {
    return (
      !!this.wrapperElement &&
      (this.wrapperElement === target || this.wrapperElement.contains(target))
    );
  }

  /**
   * 单元格退出编辑状态时调用
   * 执行清理操作并触发回调
   */
  onEnd() {
    // 触发用户定义的变化回调
    this.changeCallback(this.rowData, this.selectedOption);

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
    this.selectedLabel = value || '';
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

    // 空值验证通过
    if (!newValue) {
      this.changeCallback(this.rowData, { label: '', value: '' });
      return true;
    }

    // 查找匹配的选项
    const activeOption = this.options.find(
      (option: any) => option.label === newValue,
    );

    // 未找到匹配选项则验证失败
    if (!activeOption) {
      return false;
    }

    // 更新选中选项并触发回调
    this.selectedOption = activeOption;
    this.changeCallback(this.rowData, this.selectedOption);

    return true;
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
      this.selectInstance = null;
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
      components: { Select },
      setup() {
        // 查找当前选中的选项
        const activeOption = that.options.find(
          (item: any) => item.label === that.selectedLabel,
        );

        // 响应式数据
        const selectValue = ref(activeOption?.value || '');
        const options = ref(that.options);

        /**
         * 获取下拉菜单的容器
         * 确保下拉菜单在表格内正确显示
         */
        const getPopupContainer = () => that.container as HTMLElement;

        /**
         * 处理选择变化事件
         * @param value 选中的值
         * @param option 选中的完整选项对象
         */
        const handleSelectChange = (value: string, option: any) => {
          that.selectedLabel = option?.label || '';
          that.selectedOption = option || { label: '', value: '' };
          that.successCallback?.(that.selectedLabel);
        };

        return { selectValue, options, getPopupContainer, handleSelectChange };
      },
      template: `
        <div class="select-editor-container">
          <Select
            :options="options"
            v-model:value="selectValue"
            :getPopupContainer="getPopupContainer"
            :dropdownMatchSelectWidth="false"
            :showSearch="true"
            :allowClear="true"
            :bordered="false"
            :autofocus="true"
            :defaultOpen="true"
            @change="handleSelectChange"
            style="width: 100%;"
          />
        </div>
      `,
    });

    // 挂载到包装元素
    this.selectInstance = this.app.mount(this.wrapperElement);

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
