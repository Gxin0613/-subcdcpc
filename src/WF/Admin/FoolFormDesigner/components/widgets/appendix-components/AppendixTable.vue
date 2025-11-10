<template>
  <select-helper :widget="widgetInfo" class="appendix-write" :setting-url="settingUrl">
    <div class="appendix-table" :style="groupBarStyle">
      <div class="title">
        <div class="name">
          <i :class="expand ? 'glyphicon glyphicon-minus' : 'glyphicon glyphicon-plus'" @click="handleFold"></i>
          {{ widgetInfo?.title }}
        </div>
        <div class="type">
          {{ widgetInfo?.dto?.CtrlType }}
        </div>
      </div>
      <div v-show="expand">
        <div v-if="widgetInfo.fileType === '0'" class="upload-table">
          <div class="content">
            <n-table :bordered="false" :single-line="false">
              <thead>
                <tr>
                  <th>{{ '序' }}</th>
                  <th>
                    <span>{{ '文件名' }}</span>
                    <!--                  <n-button style="margin-left: 30px">{{'上传文件'}}</n-button>-->
                  </th>
                  <th>{{ '上传时间' }}</th>
                  <th>{{ '上传人' }}</th>
                  <th>{{ '操作' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1.</td>
                  <td>
                    <div class="file"> <img src="/src/assets/form/word.png" :alt="'word图标'" /><span style="color: #1890ff">CCFlow开发手册.doc</span> </div>
                  </td>
                  <td>2024-03-04 19:42:02</td>
                  <td>{{ VITE_GLOB_SX_TITLE }}工作流</td>
                  <td class="flex-center">
                    <div class="op-icon"
                      ><span role="img" aria-label="download" class="anticon anticon-download"
                        ><svg focusable="false" class="" data-icon="download" width="1em" height="1em" fill="currentColor" aria-hidden="true" viewBox="64 64 896 896">
                          <path
                            d="M505.7 661a8 8 0 0012.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"
                          /></svg></span
                    ></div>
                    <div class="op-icon"><i class="icon-note"></i></div>
                    <div class="op-icon"><i class="icon-close"></i></div
                  ></td>
                </tr>
                <tr>
                  <td>2.</td>
                  <td>
                    <div class="file">
                      <img src="/src/assets/form/pdf.png" :alt="'pdf图标'" /><span style="color: #1890ff">{{ VITE_GLOB_SX_TITLE }}工作流介绍.pdf</span>
                    </div>
                  </td>
                  <td>2024-03-04 19:42:03</td>
                  <td>{{ VITE_GLOB_SX_TITLE }}工作流</td>
                  <td class="flex-center">
                    <div class="op-icon"
                      ><span role="img" aria-label="download" class="anticon anticon-download"
                        ><svg focusable="false" class="" data-icon="download" width="1em" height="1em" fill="currentColor" aria-hidden="true" viewBox="64 64 896 896">
                          <path
                            d="M505.7 661a8 8 0 0012.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"
                          /></svg></span
                    ></div>
                    <div class="op-icon"><i class="icon-note"></i></div>
                    <div class="op-icon"><i class="icon-close"></i></div>
                  </td>
                </tr>
              </tbody>
            </n-table>
          </div>
        </div>
        <div v-else class="image-attachment">
          <n-upload :default-file-list="widgetInfo.fileList" list-type="image-card" :show-preview-button="false" @before-upload="handleUpload" :max="widgetInfo.maxFiles" />
        </div>
      </div>
    </div>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType } from 'vue';
  import { NUpload, NTable, useMessage } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { AppendixTableItemProps } from '/@form/props/widgets/appendix/AppendixTableWidget';
  import { useRoute } from 'vue-router';
  import { useContainerFold } from '../../../hooks/useContainerFold';
  import { getAppEnvConfig } from '/@/utils/env';

  // 金额，数字，整数等都是这个组件
  export default defineComponent({
    name: 'AppendixTable',
    components: {
      NUpload,
      SelectHelper,
      NTable,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<AppendixTableItemProps>,
        default: () => {},
      },
    },
    setup(props) {
      const label = ref<String>(props.widgetInfo.title);
      const route = useRoute();
      const mapData = route.query.FrmID;
      const message = useMessage();
      const { VITE_GLOB_SX_TITLE } = getAppEnvConfig();
      const { expand, handleFold, groupBarStyle } = useContainerFold(props.widgetInfo as Recordable, '100px', '50px');
      return {
        label,
        InputTheme,
        expand,
        handleFold,
        groupBarStyle,
        handleUpload: () => {
          message.info('选择了文件');
          return Promise.resolve();
        },
        settingUrl: `../../Comm/En.htm?EnName=TS.FrmUI.FrmAttachmentExt&FrmID=${mapData}&PKVal=${props.widgetInfo?.dto?.CtrlID}`,
        VITE_GLOB_SX_TITLE,
      };
    },
  });
</script>

<style lang="less" scoped>
  .op-icon {
    margin: 0 10px;
    cursor: pointer;
  }
  .appendix-table {
    width: 100%;
    // 设置最小宽度方便放组件
    min-height: 100px;
    border: 1px solid #e5e5e5;
    box-sizing: border-box;
    border-radius: 4px;
    transition: all ease 0.2s;

    .title {
      height: 50px;
      background-color: #f2f5f7;
      width: 100%;
      box-sizing: border-box;
      line-height: 50px;
      padding: 0 14px;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .type {
        font-weight: normal;
      }
    }
  }
  .image-attachment {
    padding: 20px 10px;
    box-sizing: border-box;
    border: 1px solid #eeeeee;
    width: 100%;
  }
  .upload-table {
    width: 100%;
    box-sizing: border-box;
    padding: 6px 8px;
    border: 1px solid #eeeeee;

    th,
    td {
      text-align: center;

      .file {
        display: flex;
        align-items: center;

        span {
          text-decoration: underline;
        }

        img {
          line-height: 20px;
          width: 20px;
          height: auto;
          object-fit: cover;
          margin-right: 10px;
        }
      }
    }
  }
  .glyphicon {
    margin-right: 10px;
  }
</style>
