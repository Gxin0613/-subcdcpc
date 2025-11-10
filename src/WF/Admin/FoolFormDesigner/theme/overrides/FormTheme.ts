import { useDesignerStore } from '/@/store/modules/form';
import { computed } from 'vue';

const designerStore = useDesignerStore();

const FormTheme = computed(() => {
  return {
    // 应要求删除这两个自定义属性, 从数据库获取
    '--cus-form-label-text-color': designerStore.globalFormConfig.labelTextColor,
    '--cus-form-label-background-color': designerStore.globalFormConfig.labelBgColor,
  };
});

export default FormTheme;
