import type {
  CellAddress,
  EditContext,
  IEditor,
  RectProps,
  ValidateEnum,
} from '@visactor/vtable-editors';

import type { ComponentPublicInstance } from 'vue';

import { createApp, ref } from 'vue';

import { DatePicker } from 'ant-design-vue';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import dayjs from 'dayjs';

// 文档地址：https://visactor.io/vtable/guide/edit/edit_cell
// 自定义日期编辑组件  请按照编辑器中定义的IEditor接口来实现
export class DateEditor implements IEditor {
  /** Vue 应用实例 */
  app: any = null;
  /** 容器元素 */
  container: HTMLElement | null = null;
  /** DatePicker 组件实例 */
  datePickerInstance: ComponentPublicInstance | null = null;
  /** 编辑器配置 */
  editorConfig: any;
  /** 选择的日期值 */
  selectedDate: string = '';
  /** 结束编辑回调函数 */
  successCallback: ((result?: any) => void) | null = null;
  /** 编辑器包装元素 */
  wrapperElement: HTMLDivElement | null = null;

  /**
   * 构造函数
   * @param editorConfig 编辑器配置
   */
  constructor(editorConfig?: any) {
    this.editorConfig = editorConfig;
  }

  /**
   * 调整编辑器位置
   * @param rect 参考位置信息
   */
  adjustPosition(rect: RectProps) {
    if (!this.wrapperElement) return;

    this.wrapperElement.style.top = `${rect.top}px`;
    this.wrapperElement.style.left = `${rect.left}px`;
    this.wrapperElement.style.width = `${rect.width}px`;
    this.wrapperElement.style.height = `${rect.height}px`;
    this.wrapperElement.style.minHeight = 'px';
    this.wrapperElement.style.lineHeight = `${rect.height}px`;
    this.wrapperElement.style.position = 'absolute';
    this.wrapperElement.style.backgroundColor = '#ffffff';
    this.wrapperElement.style.zIndex = '1000';
    this.wrapperElement.style.boxSizing = 'border-box';
    this.wrapperElement.style.textAlign = 'center';
  }

  /**
   * 获取编辑器当前值。将在 `onEnd` 调用后调用。
   * @returns 当前选择的日期字符串
   */
  getValue(): string {
    return this.selectedDate;
  }

  /**
   * 检查目标元素是否属于编辑器
   * @param target 目标元素
   * @returns 是否属于编辑器元素
   */
  isEditorElement(target: HTMLElement): boolean {
    if (!this.wrapperElement) {
      return false;
    }

    // 检查目标元素是否在编辑器包装元素内
    return (
      this.wrapperElement === target || this.wrapperElement.contains(target)
    );
  }

  /**
   * 单元格退出编辑状态时调用
   */
  onEnd() {
    // 卸载 Vue 应用
    if (this.app) {
      this.app.unmount();
      this.app = null;
    }

    // 移除 DOM 元素
    if (
      this.wrapperElement &&
      this.container &&
      this.container.contains(this.wrapperElement)
    ) {
      this.wrapperElement.remove();
    }

    this.wrapperElement = null;
    this.container = null;
    this.datePickerInstance = null;
    this.successCallback = null;
  }

  /**
   * 单元格进入编辑状态时调用
   * @param context 编辑上下文
   */
  onStart({ container, value, referencePosition, endEdit }: EditContext) {
    this.container = container;
    this.successCallback = endEdit;
    this.selectedDate = value || '';
    // 创建包装元素
    this.wrapperElement = document.createElement('div');

    // 处理日期格式转换
    let dateValue = null;
    if (this.selectedDate) {
      const parsedDate = dayjs(this.selectedDate);
      if (parsedDate.isValid()) {
        dateValue = parsedDate;
      }
    }

    // 保存 this 引用
    const that = this;

    // 创建 Vue 应用并挂载 DatePicker 组件
    this.app = createApp({
      components: {
        DatePicker,
      },
      setup() {
        // 使用 ref 创建响应式日期值
        const date = ref(dateValue);
        const isOpen = ref(false);

        const getPopupContainer = () => that.container as HTMLElement;

        const handleDateChange = (dateValue: any, dateString: string) => {
          that.selectedDate = dateString || ''; // 更新选择的日期
        };

        const handleOpenChange = (open: boolean) => {
          isOpen.value = open;
          // 当日期选择器关闭时，结束编辑
          if (!open && that.successCallback) {
            that.successCallback && that.successCallback();
          }
        };

        return {
          date,
          locale,
          getPopupContainer,
          handleDateChange,
          handleOpenChange,
          isOpen,
        };
      },
      mounted() {
        this.isOpen = true;
      },
      template: `
        <DatePicker
          :locale="locale"
          :open="isOpen"
          v-model:value="date"
          :show-time="{ format: 'HH:mm' }"
          :autofocus="true"
          format="YYYY-MM-DD HH:mm:ss"
          valueFormat="YYYY-MM-DD HH:mm:ss"
          :bordered="false"
          @change="handleDateChange"
          @openChange="handleOpenChange"
          :getPopupContainer="getPopupContainer"
        />
      `,
    });

    this.datePickerInstance = this.app.mount(this.wrapperElement);

    // 将包装元素添加到容器
    container.append(this.wrapperElement);

    // 调整位置
    if (referencePosition?.rect) {
      this.adjustPosition(referencePosition.rect);
    }
  }

  /**
   * 可选：验证值
   */
  validateValue?(
    newValue?: any,
    oldValue?: any,
    position?: CellAddress,
    table?: any,
  ): boolean | ValidateEnum {
    // 这里可以添加日期验证逻辑
    if (newValue && !dayjs(newValue).isValid()) {
      return false; // 日期无效
    }
    return true; // 验证通过
  }
}
