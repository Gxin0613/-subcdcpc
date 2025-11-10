<template>
  <div class="p-4">
    <div>检查表单中,请稍候...</div>
    <ul>
      <li v-for="(tip, index) in tips" :key="index">
        <span v-if="tip.tag" :style="tip.tagStyle">{{ tip.tag }}</span
        >{{ tip.content }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { MapFrmFool } from '../../../FrmLogic/MapData/MapFrmFool';
  import { splitAtString } from '/@/bp/tools/ParamUtils';

  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });

  interface ListItem {
    tag: string;
    tagStyle: {};
    content: string;
  }

  const tips = ref<Array<ListItem>>();
  const keywords = [
    {
      title: '信息:',
      color: '',
    },
    { title: '警告:', color: '#dada88' },
    { title: '错误:', color: 'red' },
    { title: '提示:', color: 'green' },
  ];

  function handlerResponse(rawStr: string) {
    tips.value = splitAtString(rawStr).map((item) => {
      const listItem: ListItem = {
        tag: '',
        tagStyle: {},
        content: item,
      };
      for (const kw of keywords) {
        if (item.includes(kw.title)) {
          listItem.tag = kw.title;
          listItem.tagStyle = {
            fontWeight: 'bold',
            color: kw.color,
          };
          listItem.content = item.replace(kw.title, '');
          return listItem;
        }
      }
      return listItem;
    });
  }

  async function InitPage() {
    const frm = new MapFrmFool(props.params.FrmID);
    const res = await frm.CheckFrm();
    handlerResponse(res);
  }
  InitPage();
</script>
<style lang="less" scoped>
  li {
    list-style: inside;
    padding: 4px 0;
    line-height: 22px;
    span {
      margin-right: 12px;
    }
  }
</style>
