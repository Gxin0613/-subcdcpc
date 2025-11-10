<script lang="ts">
  import { useDesignerStore } from '/@/store/modules/form';
  import Field from './Field.vue';

  import { h, defineComponent } from 'vue';
  const store = useDesignerStore();

  const DynamicInputSettings = new Map<string, any>([
    ['field', Field],
    ['ext', Field],
  ]);

  export default defineComponent({
    name: 'CustomizeOptions',
    setup() {
      return () => h(DynamicInputSettings.get(store.selectedWidget?.key + ''));
    },
  });
</script>
