<script lang="ts">
  import { useDesignerStore } from '/@/store/modules/form';
  import GroupField from './GroupField.vue';
  import GroupDir from './GroupDir.vue';

  import { h, defineComponent } from 'vue';
  const store = useDesignerStore();

  const DynamicInputSettings = new Map<string, any>([
    ['groupfield', GroupField],
    ['dir', GroupDir],
  ]);

  export default defineComponent({
    name: 'ContainerOptions',
    setup() {
      return () => h(DynamicInputSettings.get(store.selectedWidget?.key + ''));
    },
  });
</script>
