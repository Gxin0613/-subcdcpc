<template>
  <NConfigProvider :theme-overrides="GlobalThemeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <ThemeWrapper>
      <Card class="card-of-head" style="background-color: #f9f9f9">
        <div class="search-container flex">
          <slot name="title"></slot>
          <div class="search-buttons" v-if="Array.isArray(buttonList) && buttonList.length > 0">
            <div>
              <AntButton
                v-for="button in buttonListLeft"
                :key="button.key"
                :style="button.style"
                :class="btn_style(button.key)"
                :type="button.type"
                :shape="button.shape"
                @click="button.onClick"
              >
                <template v-if="button.key === 'New'">
                  <PlusOutlined />
                  {{ button.name }}
                </template>
                <template v-else-if="button.key === 'Save'">
                  <FileOutlined />
                  {{ button.name }}
                </template>
                <template v-else>
                  {{ button.name }}
                </template>
              </AntButton>
            </div>
            <div class="right_toolbar">
              <!-- <AntButton type="primary" style="margin-right: 15px; background-color: #f27140; border-color: #f27140" @click="openSingleDesign">单记录设计</AntButton> -->
              <Tag :color="tag?.color" style="padding: 5px">{{ tag?.name }}</Tag>
              <ToolbarStyle class="style_btn" :frmID="params.FrmID" />
              <div>
                <Popconfirm
                  v-if="delBtnList.length > 0"
                  placement="bottom"
                  :ok-text="'确定'"
                  :cancel-text="'取消'"
                  @confirm="
                    () => {
                      if (typeof delBtnList[0].onClick == 'function') {
                        delBtnList[0].onClick();
                      }
                    }
                  "
                >
                  <template #title>
                    <p>您确定要删除实体: {{ props.params.No }} 吗？</p>
                  </template>
                  <AntButton v-for="button in delBtnList" :key="button.key" :style="button.style" :type="button.type" :shape="button.shape">
                    <DeleteOutlined />
                    {{ button.name }}
                  </AntButton>
                </Popconfirm>
                <AntButton v-for="button in buttonListPrint" :key="button.key" :style="button.style" :type="button.type" :shape="button.shape" @click="button.onClick">
                  {{ button.name }}
                </AntButton>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </ThemeWrapper>
  </NConfigProvider>
</template>

<script lang="ts" setup>
  import { Button as AntButton, Card, Popconfirm, Tag } from 'ant-design-vue';
  import { NConfigProvider, zhCN, dateZhCN } from 'naive-ui';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import type { ToolbarButtonDef } from '/@/components/SearchComponent/src/types';
  import GlobalThemeOverrides from '/@/theme/naive-ui/GlobalThemeOverrides';
  import { FileOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import ToolbarStyle from '/@/WF/CCForm/ToolbarStyle.vue';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import { computed, ref } from 'vue';
  // import { FrmDictBtn } from '/@/CCFast/CCBill/FrmDictBtn';
  // import { ref } from 'vue';
  const props = defineProps({
    buttonList: {
      type: Array as PropType<ToolbarButtonDef[]>,
      default: () => [],
    },
    params: {
      type: Object,
      default: () => ({}),
    },
    EntityState: {
      type: Number,
      default: 0,
    },
  });
  interface TagExt {
    name: string;
    color: string;
  }
  // Events 定义
  const emit = defineEmits(['open-single-page']);
  const buttonListLeft = props.buttonList.filter((btn) => btn.key != 'Delete' && !btn.key.includes('Print') && btn.key != 'ExpZip');
  const delBtnList = props.buttonList.filter((item) => item.key == 'Delete');
  const buttonListPrint = props.buttonList.filter((print) => print.key.includes('Print') || print.key === 'ExpZip');
  const tag = ref<TagExt>();
  const btn_style = computed(() => {
    return (btn: string) => {
      if (btn === 'New') {
        return 'btn_style btn_add';
      } else if (btn === 'Save') {
        return 'btn_style btn_save';
      } else if (btn === 'Delete') {
        return 'btn_style btn_del';
      } else if (btn === 'FilingDone' || btn === 'FilingUn') {
        return 'btn_style btn_Done';
      } else {
        return 'btn_style';
      }
    };
  });

  const openSingleDesign = () => {
    emit('open-single-page');
  };
  /**
   * 状态获取
   * @param WFState
   */
  const getState = (EntityState: number) => {
    let state = '';
    if (!!props.params.PageFrom && props.params.PageFrom === 'AskFrm') {
      switch (EntityState) {
        case -1:
          state = '@下发=orange';
        case 0:
        case 1:
          state = '@草稿=yellow';
          break;
        case 2:
          state = '@提交=green';
          break;
        case 3:
          state = '@运行中=green';
          break;
        case 8:
        case 9:
          state = '@结束=red';
          break;
      }
      GetTextTags(state);
      return;
    }
    switch (EntityState) {
      case -1:
        state = '@作废(不可编辑)=red';
      case 0:
        state = '@空白=orange';
        break;
      case 1:
        state = '@草稿=blue';
        break;
      case 2:
        state = '@編輯=yellow';
        break;
      case 3:
        state = '@归档=green';
        break;
      case 4:
      case 7:
        state = '@作废(可编辑)=red';
        break;
    }
    GetTextTags(state);
  };

  /**
   * 获取标签表示的内容
   * @param State
   * @constructor
   */
  const GetTextTags = (State) => {
    if (typeof State == 'string') {
      splitAtString(State).forEach((item) => {
        tag.value = {
          name: item.split('=')[0],
          color: item.split('=')[1],
        };
      });
      return tag.value;
    } else return [];
  };
  getState(props.EntityState);
</script>

<style lang="less" scoped>
  :deep(.ant-card-body) {
    padding: 5px;
    background-color: #fff;
  }
  .card-of-head {
    border-radius: 0;
    background-color: #fff;
  }
  .card-of-table {
    border-radius: 0;
  }

  .search-container {
    // justify-content: space-between;
    justify-content: space-between;
    align-items: baseline;

    .search-keys {
      // flex: 3;
      display: flex;
      align-items: center;
      flex-wrap: wrap;

      .search-key {
        align-items: center;
        width: 25%;
        margin-top: 6px;
        margin-bottom: 6px;
        margin-left: 6px;
        min-width: 200px;

        .label {
          min-width: 80px;
          text-align: center;
          height: 32px;
          line-height: 32px;
        }
      }

      .select-key {
        align-items: center;
        width: 130px;
        margin-top: 6px;
        margin-bottom: 6px;
        margin-left: 6px;
      }
    }

    .search-buttons {
      // flex: 1;
      display: flex;
      align-items: center;
      // justify-content: center;
      justify-content: space-between;
      width: 100%;
      margin-left: 20px;
      .right_toolbar {
        display: flex;
        .style_btn {
          margin-right: 15px;
        }
      }
    }
  }
  .select-group-label {
    color: #1890ff;
    border-bottom: 1px solid #1890ff;
    font-size: 14px;
    padding-bottom: 12px;
    font-weight: 600;
  }
  .btn_del {
    background-color: #fff2f0 !important;
    border: 1px solid #ffadd2 !important;
    color: #ff6666 !important;
  }
  .btn_Done {
    background-color: #f56c6c !important;
    border-color: #f56c6c !important;
    color: #fff;
  }
</style>
