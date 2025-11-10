<template>
  <Spin :spinning="loading" :tip="loadingTips">
    <div v-if="errorObj.hasError" class="ant-tag-red">
      {{ errorObj.tips }}
    </div>
    <div v-else class="content contentStyle" :style="contentStyle">
      <PopTreeEns
        v-if="curMapExt?.DoWay === 'PopBranchesAndLeaf'"
        ref="treeEns"
        :parent-no="curMapExt.Doc"
        :mapExt="curMapExt"
        :refPKVal="refPKVal"
        :rowData="props.rowData"
        :mainData="props.mainData"
        :is-multi-select="curMapExt.AtPara.includes('@PopSelectType=1')"
        :selected-items="cacheSelectedData"
        :selected-item-names="selectNameVal"
      />
      <PopTree
        ref="tree"
        v-else-if="curMapExt?.DoWay === 'PopBranches'"
        :parent-no="curMapExt.Doc"
        :mapExt="curMapExt"
        :refPKVal="refPKVal"
        :is-multi-select="curMapExt.AtPara.includes('@PopSelectType=1')"
        :selected-items="cacheSelectedData"
        :rowData="props.rowData"
        :mainData="props.mainData"
        :selected-item-names="selectNameVal"
      />
      <PopList
        ref="list"
        v-else-if="curMapExt?.DoWay === 'PopTableList'"
        :refPKVal="refPKVal"
        :rowData="props.rowData"
        :mainData="props.mainData"
        :mapExt="curMapExt"
        :is-multi-select="curMapExt.AtPara.includes('@PopSelectType=1')"
        :selected-items="cacheSelectedData"
      />
      <PopGroupList
        v-else-if="curMapExt?.DoWay === 'PopGroupList'"
        ref="groupList"
        :refPKVal="refPKVal"
        :rowData="props.rowData"
        :mainData="props.mainData"
        :is-multi-select="curMapExt.AtPara.includes('@PopSelectType=1')"
        :selected-items="cacheSelectedData"
        :mapExt="curMapExt"
      />
      <PopTableSearch
        v-else-if="curMapExt?.DoWay === 'PopTable'"
        ref="tableSearch"
        :refPKVal="refPKVal"
        :rowData="props.rowData"
        :mainData="props.mainData"
        :mapExt="curMapExt"
        :cond-sql="curMapExt.Tag1"
        :field-text="curMapExt.Tag"
        :is-multi-select="curMapExt.AtPara.includes('@PopSelectType=1')"
        :selected-items="cacheSelectedData"
        :mypk="curMapExt.MyPK"
        :pop-height="getHeight()"
      />
      <PopTableSimple
        v-else-if="curMapExt?.DoWay === 'PopTableSimple'"
        ref="tableSimple"
        :refPKVal="refPKVal"
        :rowData="props.rowData"
        :mainData="props.mainData"
        :mapExt="curMapExt"
        :init-sql="curMapExt.Tag1"
        :list-sql="curMapExt.Tag2"
        :field-text="curMapExt.Tag"
        :is-multi-select="curMapExt.AtPara.includes('@PopSelectType=1')"
        :selected-items="cacheSelectedData"
        :mypk="curMapExt.MyPK"
      />
      <PopSelfUrl
        v-else-if="curMapExt?.DoWay === 'PopSelfUrl'"
        ref="selfUrl"
        :url="curMapExt.Tag"
        :is-multi-select="curMapExt.AtPara.includes('@PopSelectType=1')"
        :mypk="curMapExt.MyPK"
        :refPKVal="refPKVal"
        :rowData="props.rowData"
        :mainData="props.mainData"
        :mapExt="curMapExt"
      />
    </div>
  </Spin>
</template>

<script lang="ts" setup>
  import { Spin } from 'ant-design-vue';
  import { reactive, ref, shallowRef } from 'vue';
  import PopTreeEns from '/@/WF/CCForm/Pop/PopTreeEns.vue';
  import PopTree from '/@/WF/CCForm/Pop/PopTree.vue';
  import PopList from '/@/WF/CCForm/Pop/PopList.vue';
  import PopGroupList from '/@/WF/CCForm/Pop/PopGroupList.vue';
  import PopTableSearch from '/@/WF/CCForm/Pop/PopTableSearch.vue';
  import PopTableSimple from '/@/WF/CCForm/Pop/PopTableSimple.vue';

  import PopTreeEns2025 from '/@/WF/CCForm/Pop/PopTreeEns2025.vue';
  import PopTree2025 from '/@/WF/CCForm/Pop/PopTree2025.vue';
  import PopList2025 from '/@/WF/CCForm/Pop/PopList2025.vue';
  import PopGroupList2025 from '/@/WF/CCForm/Pop/PopGroupList2025.vue';
  import PopTableSearch2025 from '/@/WF/CCForm/Pop/PopTableSearch2025.vue';
  import PopTableSimple2025 from '/@/WF/CCForm/Pop/PopTableSimple2025.vue';

  import PopSelfUrl from '/@/WF/CCForm/Pop/PopSelfUrl.vue';
  import WebUser from '/@/bp/web/WebUser';
  import { DealExp } from '/@/utils/gener/StringUtils';

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mapExt: {
      type: Object,
      default: () => {
        return {};
      },
    },
    rowData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mainData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    selectVal: {
      type: String,
      default: '',
    },
    selectNameVal: {
      type: String,
      default: '',
    },
    refPKVal: {
      type: String,
      default: '0',
    },
    popHeight: {
      type: Object,
      default: () => {
        return { height: '400px' };
      },
    },
  });
  const loading = ref(false);
  const loadingTips = ref<string>('loading...');
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  //获取选择的值
  const cacheSelectedData = ref<string>('');
  const curMapExt = ref(props.mapExt);
  // 初始化页面
  async function InitPage() {
    try {
      loading.value = true;
      cacheSelectedData.value = props.selectVal;
      if (props.mapExt?.DoWay === 'PopBranchesAndLeaf' || props.mapExt?.DoWay === 'PopBranches') {
        let rootNo = curMapExt.value.Doc;
        rootNo = DealExp(rootNo, props.rowData);
        if (rootNo.includes('@')) rootNo = DealExp(rootNo, props.mainData);
        if (rootNo == '') {
          if (WebUser.OrgNo == '') curMapExt.value.Doc = '0';
          else curMapExt.value.Doc = WebUser.OrgNo;
        } else {
          curMapExt.value.Doc = rootNo;
        }
      }
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.error(e);
    } finally {
      loading.value = false;
    }
  }
  InitPage();
  const getHeight = () => {
    let height = 400;
    if (typeof props.popHeight?.height === 'string' && props.popHeight.height.endsWith('px')) height = parseFloat(props.popHeight.height.replace('px', ''));
    else if (typeof props.popHeight?.height === 'number') height = props.popHeight.height;
    if (height > window.innerHeight * 0.75) height = window.innerHeight * 0.75;
    return height;
  };
  const contentStyle = reactive({
    height: getHeight() - 53 + 'px',
    overflowY: 'auto',
  });
  // 特殊组件
  const treeEns = shallowRef<InstanceType<typeof PopTreeEns>>();
  const tree = shallowRef<InstanceType<typeof PopTree>>();
  const list = shallowRef<InstanceType<typeof PopList>>();
  const groupList = shallowRef<InstanceType<typeof PopGroupList>>();
  const tableSearch = shallowRef<InstanceType<typeof PopTableSearch>>();
  const tableSimple = shallowRef<InstanceType<typeof PopTableSimple>>();
  const selfUrl = shallowRef<InstanceType<typeof PopSelfUrl>>();

  const handlerPopOK = () => {
    let checkedList, checkedNames;
    if (curMapExt.value.DoWay === 'PopBranchesAndLeaf') {
      checkedList = treeEns.value?.allCheckList;
      checkedNames = treeEns.value?.checkedNames;
    }
    if (curMapExt.value.DoWay === 'PopBranches') {
      checkedList = tree.value?.checkedList;
      checkedNames = tree.value?.checkedNames;
    }
    if (curMapExt.value.DoWay === 'PopTableList') {
      checkedList = list.value?.checkedList;
      checkedNames = list.value?.checkedNames;
    }
    if (curMapExt.value.DoWay === 'PopGroupList') {
      checkedList = groupList.value?.checkedList;
      checkedNames = groupList.value?.checkedNames;
    }
    if (curMapExt.value.DoWay === 'PopTable') {
      checkedList = tableSearch.value?.checkedList;
      checkedNames = tableSearch.value?.getSelectedName();
    }
    if (curMapExt.value.DoWay === 'PopTableSimple') {
      checkedList = tableSimple.value?.checkedList;
      checkedNames = tableSimple.value?.checkedNames;
    }
    if (curMapExt.value.DoWay === 'PopSelfUrl') {
      checkedList = selfUrl.value?.checkedList;
      checkedNames = selfUrl.value?.checkedNames;
    }
    return [checkedList, checkedNames];
  };
  defineExpose({ handlerPopOK });
</script>

<style lang="less" scoped>
  //选择接受人  滚动条
  .contentStyle::-webkit-scrollbar {
    width: 8px;
    height: 5px;
    opacity: 0.4;
  }
  .contentStyle::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background-color: #cccccc;
    opacity: 0.4;
  }
  .contentStyle::-webkit-scrollbar-track {
    background-color: white;
    border-radius: 5px;
    opacity: 0.4;
  }
  .contentStyle::-webkit-scrollbar-track-piece {
    width: 4px;
  }
</style>
