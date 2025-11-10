<template>
  <div class="content" style="overflow-y: auto; margin-top: 46px">
    <PopTreeEns
      v-if="curMapExt?.DoWay === 'PopBranchesAndLeaf'"
      ref="treeEns"
      :list-sql="curMapExt.Tag3"
      :tree-sql="curMapExt.Tag2"
      :parent-no="curMapExt.Doc"
      :is-multi-select="curMapExt.AtPara.includes('@PopSelectType=1')"
      :selected-items="cacheSelectedData"
      :selected-item-names="selectNameVal"
      :mapExt="curMapExt"
      :rowData="rowData"
      :mainData="props.mainData"
    />
    <PopTree
      ref="tree"
      v-else-if="curMapExt?.DoWay === 'PopBranches'"
      :tree-sql="curMapExt.Tag2"
      :parent-no="curMapExt.Doc"
      :is-multi-select="curMapExt.AtPara.includes('@PopSelectType=1')"
      :selected-items="cacheSelectedData"
      :selected-item-names="selectNameVal"
      :mainData="props.mainData"
      :mapExt="curMapExt"
      :rowData="rowData"
    />
    <PopList
      ref="list"
      v-else-if="curMapExt?.DoWay === 'PopTableList'"
      :list-sql="curMapExt.Tag2"
      :is-multi-select="curMapExt.AtPara.includes('@PopSelectType=1')"
      :selected-items="cacheSelectedData"
      :rowData="props.rowData"
      :mainData="props.mainData"
      :refPKVal="refPKVal"
      :mapExt="curMapExt"
    />
    <PopGroupList
      v-else-if="curMapExt?.DoWay === 'PopGroupList'"
      ref="groupList"
      :list-sql="curMapExt.Tag2"
      :group-list-sql="curMapExt.Tag1"
      :is-multi-select="curMapExt.AtPara.includes('@PopSelectType=1')"
      :selected-items="cacheSelectedData"
      :rowData="props.rowData"
      :mainData="props.mainData"
      :refPKVal="refPKVal"
      :mapExt="curMapExt"
    />
    <PopTableSearch
      v-else-if="curMapExt?.DoWay === 'PopTable'"
      ref="tableSearch"
      :rowData="props.rowData"
      :mainData="props.mainData"
      :refPKVal="refPKVal"
      :mapExt="curMapExt"
      :cond-sql="curMapExt.Tag1"
      :list-sql="curMapExt.Tag2"
      :field-text="curMapExt.Tag"
      :is-multi-select="curMapExt.AtPara.includes('@PopSelectType=1')"
      :selected-items="cacheSelectedData"
      :mypk="curMapExt.MyPK"
    />
    <PopTableSimple
      v-else-if="curMapExt?.DoWay === 'PopTableSimple'"
      ref="tableSimple"
      :rowData="props.rowData"
      :mainData="props.mainData"
      :refPKVal="refPKVal"
      :init-sql="curMapExt.Tag1"
      :list-sql="curMapExt.Tag2"
      :field-text="curMapExt.Tag"
      :is-multi-select="curMapExt.AtPara.includes('@PopSelectType=1')"
      :selected-items="cacheSelectedData"
      :mypk="curMapExt.MyPK"
      :mapExt="curMapExt"
    />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, shallowRef } from 'vue';
  import PopTreeEns from '/@/CCMobile/CCForm/PopMobile/PopTreeEns.vue';
  import PopTree from '/@/CCMobile/CCForm/PopMobile/PopTree.vue';
  import PopList from '/@/CCMobile/CCForm/PopMobile/PopList.vue';
  import PopGroupList from '/@/CCMobile/CCForm/PopMobile/PopGroupList.vue';
  import PopTableSearch from '/@/CCMobile/CCForm/PopMobile/PopTableSearch.vue';
  import PopTableSimple from '/@/CCMobile/CCForm/PopMobile/PopTableSimple.vue';
  import WebUser from '/@/bp/web/WebUser';
  import { DealExp } from '/@/utils/gener/StringUtils';

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    title: {
      type: String,
      default: '',
    },
    mapExt: {
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
      type: [Number, String],
      default: '0',
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
  });
  const loading = ref(false);
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
        rootNo = DealExp(rootNo, null);
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

  // 特殊组件
  const treeEns = shallowRef<InstanceType<typeof PopTreeEns>>();
  const tree = shallowRef<InstanceType<typeof PopTree>>();
  const list = shallowRef<InstanceType<typeof PopList>>();
  const groupList = shallowRef<InstanceType<typeof PopGroupList>>();
  //const emit = defineEmits(['TextPopOK']);
  const tableSearch = shallowRef<InstanceType<typeof PopTableSearch>>();
  const tableSimple = shallowRef<InstanceType<typeof PopTableSimple>>();
  const handlerPopOK = async () => {
    let checkedList, checkedNames;
    if (curMapExt.value.DoWay === 'PopBranchesAndLeaf') {
      checkedList = await treeEns.value?.allCheckList;
      checkedNames = await treeEns.value?.checkedNames;
    }
    if (curMapExt.value.DoWay === 'PopBranches') {
      checkedList = await tree.value?.allCheckList;
      checkedNames = await tree.value?.checkedNames;
    }
    if (curMapExt.value.DoWay === 'PopTableList') {
      checkedList = await list.value?.checkedList;
      checkedNames = await list.value?.checkedNames;
    }
    if (curMapExt.value.DoWay === 'PopGroupList') {
      checkedList = await groupList.value?.checkedList;
      checkedNames = await groupList.value?.checkedNames;
    }
    if (curMapExt.value.DoWay === 'PopTable') {
      checkedList = await tableSearch.value?.checkedList;
      checkedNames = await tableSearch.value?.checkedNames;
    }
    if (curMapExt.value.DoWay === 'PopTableSimple') {
      checkedList = (await tableSimple.value?.checkedList) || [];
      checkedNames = (await tableSimple.value?.checkedNames) || [];
    }
    return [checkedList, checkedNames];
  };
  defineExpose({ handlerPopOK });
</script>

<style scoped></style>
