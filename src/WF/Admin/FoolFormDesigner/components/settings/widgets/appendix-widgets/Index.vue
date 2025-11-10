<script lang="ts">
  import { useDesignerStore } from '/@/store/modules/form';
  import Field from './Field.vue';
  import Table from './Table.vue';
  import Image from './Image.vue';
  import Office from './Office.vue';
  import Write from './Write.vue';

  import { h, defineComponent } from 'vue';
  const store = useDesignerStore();

  const DynamicInputSettings = new Map<string, any>([
    ['field', Field],
    ['table', Table],
    ['image', Image],
    ['office', Office],
    ['write', Write],
  ]);

  export default defineComponent({
    name: 'AppendixOptions',
    setup() {
      return () => h(DynamicInputSettings.get(store.selectedWidget?.key + ''));
    },
  });
</script>
