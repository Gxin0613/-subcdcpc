<template>
  <select-helper :widget="widgetInfo" :setting-url="settingUrl">
    <div class="universal-iframe" :style="groupBarStyle">
      <div class="title">
        <div class="name">
          <i :class="expand ? 'glyphicon glyphicon-minus' : 'glyphicon glyphicon-plus'" @click="handleFold"></i>
          {{ widgetInfo?.title }}
        </div>
        <div class="type">
          {{ widgetInfo?.dto?.CtrlType }}
        </div>
      </div>
      <div v-show="expand" class="content">
        <iframe :src="widgetInfo.url" class="iframe"></iframe>
      </div>
    </div>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType } from 'vue';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { UniversalFieldItemProps } from '/@form/props/widgets/universal/UniversalNormalWidget';
  import { useRoute } from 'vue-router';
  import { useContainerFold } from '../../../hooks/useContainerFold';

  // 金额，数字，整数等都是这个组件
  export default defineComponent({
    name: 'UniversalIframe',
    components: {
      SelectHelper,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<UniversalFieldItemProps>,
        default: () => {},
      },
    },
    setup(props) {
      const label = ref<String>(props.widgetInfo.title);
      const route = useRoute();
      const mapData = route.query.FrmID;

      const { expand, handleFold, groupBarStyle } = useContainerFold(props.widgetInfo as Recordable, '100px', '50px');
      return {
        label,
        InputTheme,
        expand,
        handleFold,
        groupBarStyle,
        settingUrl: `../../Comm/En.htm?EnName=TS.FrmUI.MapFrameExt&FrmID=${mapData}&MyPK=${props.widgetInfo?.dto?.CtrlID}`,
      };
    },
  });
</script>

<style lang="less" scoped>
  .universal-iframe {
    width: 100%;
    // 设置最小宽度方便放组件
    min-height: 100px;
    box-sizing: border-box;
    border: 1px solid #e5e5e5;
    border-radius: 4px;

    .title {
      height: 50px;
      background-color: #f2f5f7;
      width: 100%;
      box-sizing: border-box;
      padding: 0 20px 0 14px;
      font-size: 14px;
      line-height: 50px;
      font-weight: 600;

      display: flex;
      align-items: center;
      justify-content: space-between;

      .type {
        font-weight: normal;
      }
    }

    .content {
      width: 100%;
      height: 300px;
    }

    .iframe {
      width: 100%;
      height: 300px;
      outline: none;
      border: 1px solid #eeeeee;
    }
  }
</style>
