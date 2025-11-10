<template>
  <select-helper :widget="widgetInfo" :setting-url="settingUrl">
    <div class="item">
      <n-spin :show="loading">
        <div class="inner-html" v-html="htmlVal"></div>
      </n-spin>
    </div>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType, onMounted } from 'vue';
  import { useMessage, NSpin } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { UniversalFieldItemProps } from '/@form/props/widgets/universal/UniversalNormalWidget';
  import { useRoute } from 'vue-router';
  import { useDesignerStore } from '/@/store/modules/form';
  import Event from '/@/utils/Events';
  import BSEntity from '/@/utils/gener/BSEntity';

  // 金额，数字，整数等都是这个组件
  export default defineComponent({
    name: 'UniversalHtml',
    components: {
      SelectHelper,
      NSpin,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<UniversalFieldItemProps>,
        default: () => {},
      },
    },
    setup(props) {
      const label = ref<String>(props.widgetInfo.title);
      const htmlVal = ref('');
      const store = useDesignerStore();
      const loading = ref(false);
      const message = useMessage();

      const fetch = async () => {
        try {
          loading.value = true;
          const ext = store.mapExtList.find((ext) => ext.MyPK === `${ext.ExtType}_${props.widgetInfo?.id}`);
          if (!ext) {
            htmlVal.value = '没有找到此文本块';
            return;
          }
          const entity = new BSEntity('BP.Sys.MapExt');
          entity.setPK(ext.MyPK);
          entity.setVal('MyPK', ext.MyPK);
          htmlVal.value = await entity.DoMethodReturnString('ReadBigNoteHtmlText');
          loading.value = false;
        } catch (e) {
          message.error(e as string);
        } finally {
          loading.value = false;
        }
      };

      onMounted(async () => {
        Event.on('updateHtml', async (id) => {
          if (id === props.widgetInfo?.id) await fetch();
        });
        await fetch();
      });
      const route = useRoute();
      const mapData = route.query.FrmID;
      return {
        loading,
        label,
        htmlVal,
        InputTheme,
        settingUrl: `./EditFExtContral/60.BigNoteHtmlText.htm?EnName=BP.Sys.MapAttr&FrmID=${mapData}&KeyOfEn=${props.widgetInfo?.dto?.KeyOfEn}`,
      };
    },
  });
</script>

<style lang="less" scoped>
  .item {
    width: 100%;
    height: 100%;
    min-height: 60px;
    border: 1px solid #eeeeee;
    box-sizing: border-box;

    .inner-html {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding: 10px 6px;
    }
  }
</style>
