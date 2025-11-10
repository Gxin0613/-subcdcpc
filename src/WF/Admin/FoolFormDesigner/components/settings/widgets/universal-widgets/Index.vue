<script lang="ts">
  import Common from './Comm.vue';
  import { h, defineComponent } from 'vue';

  // const DynamicInputSettings = new Map<string, any>([
  //   ['table',Common],
  // ])

  // 这里类型都是一样的，没有做区分，直接render 通用的设置就能满足要求
  export default defineComponent({
    name: 'UniversalOptions',
    setup() {
      // return () => h(DynamicInputSettings.get(store.selectedWidget?.key+''))
      return () => h(Common);
    },
  });
</script>
