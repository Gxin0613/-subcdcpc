<script lang="ts">
  import { useDesignerStore } from '/@/store/modules/form';
  import Text from './Text.vue';
  import Date from './Date.vue';
  import Number from './Number.vue';
  import Enums from './Enums.vue';

  import { h, defineComponent } from 'vue';
  const store = useDesignerStore();

  const DynamicInputSettings = new Map<string, any>([
    ['text', Text],
    ['date', Date],
    ['datetime', Date],
    ['amount', Number],
    ['number', Number],
    ['integer', Number],
    ['checkbox', Enums],
    ['select', Enums],
    ['enums', Enums],
  ]);

  export default defineComponent({
    name: 'InputOptions',
    setup() {
      return () => h(DynamicInputSettings.get(store.selectedWidget?.key + ''));
    },
  });
</script>
