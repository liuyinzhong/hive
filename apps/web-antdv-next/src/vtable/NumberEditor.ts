import type {
  CellAddress,
  EditContext,
  IEditor,
  RectProps,
  ValidateEnum,
} from '@visactor/vtable-editors';

import type { ComponentPublicInstance } from 'vue';

import { createApp, h, ref } from 'vue';

import { InputNumber } from 'antdv-next';

// 文档地址：https://visactor.io/vtable/guide/edit/edit_cell
// 自定义数字编辑组件,基于 antd InputNumber 实现,请按照编辑器中定义的IEditor接口来实现
export class NumberEditor implements IEditor {
  /** Vue 应用实例 */
  app: any = null;
  /** 容器元素 */
  container: HTMLElement | null = null;
  /** InputNumber 组件实例 */
  inputNumberInstance: ComponentPublicInstance | null = null;
  /** 编辑器配置,支持 min/max/precision/step */
  editorConfig: any;
  /** 当前数值,未填写时为空字符串 */
  numberValue: number | '' = '';
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
   * @returns 当前数值
   */
  getValue(): number | '' {
    return this.numberValue;
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
    this.inputNumberInstance = null;
    this.successCallback = null;
  }

  /**
   * 单元格进入编辑状态时调用
   * @param context 编辑上下文
   */
  onStart({ container, value, referencePosition, endEdit }: EditContext) {
    this.container = container;
    this.successCallback = endEdit;
    this.numberValue =
      value === '' || value === null || value === undefined
        ? ''
        : Number(value);

    // 创建包装元素
    this.wrapperElement = document.createElement('div');

    // 保存 this 引用
    // eslint-disable-next-line unicorn/no-this-assignment, @typescript-eslint/no-this-alias
    const that = this;

    const { min, max, precision, step } = this.editorConfig || {};

    // 创建 Vue 应用并挂载 InputNumber 组件
    // 注意:必须使用 h() 渲染函数,项目 vue 为运行时构建,不支持 template 字符串编译
    this.app = createApp({
      setup: () => {
        const number = ref<number | ''>(that.numberValue);

        const handleChange = (value: number | null) => {
          that.numberValue = value ?? '';
        };

        /** 回车或失焦时结束编辑,getValue 的返回值写回单元格 */
        const endEdit = () => {
          if (that.successCallback) {
            const callback = that.successCallback;
            that.successCallback = null;
            callback();
          }
        };

        return () =>
          h('div', { class: 'number-editor-container' }, [
            h(InputNumber as any, {
              value: number.value,
              'onUpdate:value': (val: number | null) => {
                number.value = val ?? '';
              },
              autofocus: true,
              changeOnWheel: true,
              suffix: '小时',
              bordered: false,
              controls: false,
              min: min ?? 0,
              max,
              precision,
              step: step ?? 1,
              style: { width: '100%' },
              onChange: handleChange,
              onPressEnter: endEdit,
              onBlur: endEdit,
            }),
          ]);
      },
    });

    this.inputNumberInstance = this.app.mount(this.wrapperElement);

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
    _oldValue?: any,
    _position?: CellAddress,
    _table?: any,
  ): boolean | ValidateEnum {
    // 空值或数值有效
    if (newValue === '' || newValue === null || newValue === undefined) {
      return true;
    }
    return typeof newValue === 'number' && !Number.isNaN(newValue);
  }
}
