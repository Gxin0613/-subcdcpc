<template>
  <div class="new-menu-container">
    <div class="main">
      <div v-if="list.length > 0" class="section frequent-section">
        <div class="section-header">
          <div class="section-icon star-icon">
            <IconStar />
          </div>
          <div class="section-title">
            <span class="title-text">{{ list[0].Name }}</span>
            <span class="help-doc">{{ list[0].Help }}</span>
          </div>
        </div>
        <div class="frequent-items">
          <div v-for="item in list[0].children" :key="item.No" class="menu-item" @click="onSelectNode(list[0].No, item.No, item.Name)">
            <i :class="item.Icon" style="margin-right: 10px"></i>
            <div class="item-name">{{ item.Name }}</div>
            <div class="help">
              <div class="btn" @click.stop="openHelpDocs(item)">{{ '帮助' }}</div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="list.length > 1" class="main-categories-grid">
        <div v-for="(category, idx) in list.slice(1, list.length)" :key="category.No" class="section">
          <div class="section-header">
            <div class="section-icon" :style="({ 'background-color': colorList[idx % colorList.length] } as any)">
              <i v-if="category.Icon" :class="category.Icon"></i>
              <component v-else :is="defaultIconList[idx % defaultIconList.length]" style="color: white" />
            </div>
            <div class="section-title">
              <span class="title-text">{{ category.Name }}</span>
              <span class="help-doc">{{ category.Help }}</span>
            </div>
          </div>
          <div class="menu-items">
            <div v-for="item in category.children" :key="item.No" class="menu-item" @click="onSelectNode(category.No, item.No, item.Name)">
              <i :class="item.Icon" style="margin-right: 10px"></i>
              <div class="item-name">{{ item.Name }}</div>
              <div class="help">
                <div class="btn" @click.stop="openHelpDocs(item)">{{ '帮助' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Transition name="right-fade">
      <div class="modal-wrapper" v-if="stepFormInfo.visible">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <div class="header-title">
              <span>新建 - {{ stepFormInfo.title }} </span>
            </div>
            <button class="close-button" @click="closeModal"> ✕ </button>
          </div>
          <div class="form-modal-content">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
    <Transition name="slide-fade">
      <div class="modal-wrapper help-modal-wrapper" v-if="helpModal.visible" @click="helpModal.visible = false">
        <div class="modal help-modal" @click.stop>
          <div class="modal-header">
            <div class="header-title"> 帮助 - {{ helpModal.title }} </div>
            <button class="close-button" @click="helpModal.visible = false"> ✕ </button>
          </div>
          <div class="modal-content help-modal-content">
            <v-md-preview :text="appTitleHelper(helpModal.content)" preview-class="vuepress-markdown-body" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, defineProps, defineEmits, PropType } from 'vue';
  import { BaseListData } from './typing';
  import { defaultIconList, IconStar } from './baseIcon';
  import VMdPreview from '@kangc/v-md-editor/lib/preview';
  import '@kangc/v-md-editor/lib/style/preview.css';
  import { appTitleHelper } from '/@/utils/helper/appTitleHelper';
  const colorList = ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#13c2c2', '#eb2f96'];

  defineProps({
    list: {
      type: Array as PropType<BaseListData[]>,
      default: () => [],
    },
  });
  const emit = defineEmits(['pick-node']);

  const helpModal = reactive({ visible: false, content: '', title: '' });
  const stepFormInfo = reactive({ visible: false, title: '' });

  const onSelectNode = (groupId: string | number, nodeId: string | number, title: string) => {
    emit('pick-node', groupId, nodeId);
    stepFormInfo.title = title;
    stepFormInfo.visible = true;
  };

  const openHelpDocs = (item: any) => {
    helpModal.visible = true;
    helpModal.title = item.Name;
    helpModal.content = item.HelpDocs || '暂无帮助文档';
  };

  const closeModal = () => {
    stepFormInfo.visible = false;
  };

  defineExpose({
    closeModal,
  });
</script>

<style lang="less" scoped>
  .slide-fade-enter-active {
    transition: all 0.2s ease;
  }
  .slide-fade-leave-active {
    transition: all 0.2s ease;
  }
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateY(-30px);
    opacity: 0;
  }
  .right-fade-enter-active {
    transition: all 0.2s ease-out;
  }
  .right-fade-leave-active {
    transition: all 0.2s ease-in;
  }
  .right-fade-enter-from,
  .right-fade-leave-to {
    transform: translateX(50px);
    opacity: 0;
  }

  .new-menu-container {
    position: relative;
    width: 100%;
    height: calc(var(--viewport-height) - 57px);
    background-color: #f2f5f7;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .main {
    flex-grow: 1;
    padding: 24px;
    overflow-y: auto;
  }
  .section {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    padding: 20px;
    margin-bottom: 16px;
    transition: all 0.2s ease;
    &:hover {
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.09);
      transform: translateY(-1px);
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
  }

  .section-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    border-radius: 8px;
    color: white;
    flex-shrink: 0;
    i {
      font-size: 18px;
    }
  }

  .section-title {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 1.4;
    overflow: hidden;

    .title-text {
      font-size: 16px;
      font-weight: 500;
      color: #1a1a1a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 10px;
      flex-grow: 1;
      min-width: 0;
    }
    .help-doc {
      font-size: 13px;
      color: #a1a1a1;
      flex-shrink: 0;
      max-width: 70%;
    }
  }

  .frequent-section {
    margin-bottom: 24px;
  }
  .frequent-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* 响应式列 */
    gap: 12px;
  }

  .main-categories-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .menu-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }

  .menu-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    position: relative;
    background-color: #fff;
    border: 1px solid transparent;

    &:hover {
      background: color-mix(in srgb, var(--system-bg-color) 10%, white);
      border-color: color-mix(in srgb, var(--system-bg-color) 30%, transparent);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      .item-name {
        color: var(--system-bg-color);
      }
      .help {
        display: block;
      }
    }

    .item-name {
      font-size: 14px;
      color: #333;
      transition: color 0.2s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    i {
      margin-right: 8px;
      color: #666;
      font-size: 16px;
      flex-shrink: 0;
    }

    .help {
      display: none;
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      .btn {
        color: var(--system-bg-color);
        border: 1px solid var(--system-bg-color);
        padding: 3px 6px;
        border-radius: 4px;
        font-size: 12px;
        background-color: #fff;
        transition: all 0.2s;
        &:hover {
          background-color: var(--system-bg-color);
          color: white;
        }
      }
    }
  }
  .star-icon {
    background-color: #faad14;
  }

  .modal-wrapper {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    // padding: 40px;
    box-sizing: border-box;
  }
  .modal {
    background-color: white;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    min-width: 1000px;
    width: 70%;
    // height: 700px;
    height: 75%; //分辨率过低容易导致按钮被遮挡
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 14px 20px;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;
    background-color: #fafafa;
    border-radius: 8px 8px 0 0;
    .close-button {
      cursor: pointer;
      color: #8c8c8c;
      background: none;
      border: none;
      font-size: 20px;
      padding: 0;
      line-height: 1;
      &:hover {
        color: #333;
      }
    }
    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }
  .form-modal-content {
    flex-grow: 1;
    overflow-y: hidden;
    padding: 0;
    background-color: #f2f5f7;
    border-radius: 0 0 8px 8px;
  }
  .help-modal-wrapper {
    z-index: 1001;
  }
  .help-modal {
    width: 700px;
    max-height: 70vh;
    height: auto;
  }
  .help-modal-content {
    padding: 20px;
    overflow-y: auto;
    flex-grow: 1;
  }
  .help-modal-content :deep(.vuepress-markdown-body) {
    padding: 0;
  }

  @media (max-width: 1200px) {
    .main-categories-grid {
      grid-template-columns: 1fr 1fr;
    }
    .frequent-items {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }
    .menu-items {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }
  }
  @media (max-width: 992px) {
    .modal {
      width: 90%;
      max-width: 700px;
    }
    .main {
      padding: 16px;
    }
    .main-categories-grid {
      grid-template-columns: 1fr;
    }
    .frequent-items {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
    .menu-items {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
  }
  @media (max-width: 768px) {
    .modal {
      width: 100%;
      max-width: 100%;
      height: 100%;
      max-height: 100%;
      border-radius: 0;
    }
    .modal-wrapper {
      padding: 0;
    }
    .main {
      padding: 12px;
    }
    .frequent-items {
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    }
    .menu-items {
      grid-template-columns: 1fr;
    }
  }
</style>
