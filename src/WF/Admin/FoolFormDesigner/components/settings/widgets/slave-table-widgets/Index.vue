<script lang="ts">
  import { useDesignerStore } from '/@/store/modules/form';
  import SlaveTable from './SlaveTable.vue';
  import { h, defineComponent } from 'vue';
  const store = useDesignerStore();

  const DynamicInputSettings = new Map<string, any>([['table', SlaveTable]]);

  export default defineComponent({
    name: 'SlavaTableOptions',
    setup() {
      return () => h(DynamicInputSettings.get(store.selectedWidget?.key + ''));
    },
  });
</script>
