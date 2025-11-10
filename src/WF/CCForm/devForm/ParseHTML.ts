import { Input, Select, SelectOption } from 'ant-design-vue';
import { ref } from 'vue';

export default {
  props: {
    dataModel: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    AntInput: Input,
    AntSelect: Select,
    AntSelectOption: SelectOption,
  },
  setup(props) {
    const modelVal = ref(props.dataModel);
    return {
      modelVal,
    };
  },
  template: '#form-html-content',
};
