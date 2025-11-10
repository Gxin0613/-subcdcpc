<template>
  <Spin :spinning="loading" :tip="loadingTips">
    <div v-if="errorObj.hasError" class="ant-tag-red">
      {{ errorObj.tips }}
    </div>
    <div v-else class="content contentStyle" :style="contentStyle">
      <PopTreeEns
        v-if="curMapExt?.ExtType === 'PopTreeEns'"
        ref="treeEns"
        :list-sql="curMapExt.Tag3 || undefined"
        :tree-sql="curMapExt.Tag1 || undefined"
        :parent-no="curMapExt.Tag5 || undefined"
        :search-sql="curMapExt.Tag4 || ''"
        :is-have-upper-level="curMapExt.Tag6 === '0' ? false : true"
        :is-multi-select="isMultiSelect"
        :is-show-search="isShowSearch"
        :selected-items="cacheSelectedData"
        :selected-item-names="selectNameVal"
        :isLazily="isLazily"
        :mapExt="curMapExt"
        :rowData="rowData"
      />
      <PopTree
        ref="tree"
        v-else-if="curMapExt?.ExtType === 'PopTree'"
        :tree-sql="curMapExt.Tag2 || undefined"
        :parent-no="curMapExt.Tag5 || undefined"
        :is-multi-select="isMultiSelect"
        :is-show-search="isShowSearch"
        :selected-items="cacheSelectedData"
        :selected-item-names="selectNameVal"
        :isLazily="isLazily"
        :mapExt="curMapExt"
        :rowData="rowData"
      />
      <PopList
        ref="list"
        v-else-if="curMapExt?.ExtType === 'PopList'"
        :list-sql="curMapExt.Tag2 || undefined"
        :is-multi-select="isMultiSelect"
        :is-show-search="isShowSearch"
        :selected-items="cacheSelectedData"
        :rowData="rowData"
        :mapExt="curMapExt"
      />
      <PopGroupList
        v-else-if="curMapExt?.ExtType === 'PopGroupList'"
        ref="groupList"
        :list-sql="curMapExt.Tag2 || undefined"
        :group-list-sql="curMapExt.Tag1 || undefined"
        :is-multi-select="isMultiSelect"
        :is-show-search="isShowSearch"
        :selected-items="cacheSelectedData"
        :mapExt="curMapExt"
        :rowData="rowData"
      />
      <PopTableSearch
        v-else-if="curMapExt?.ExtType === 'PopTable'"
        ref="tableSearch"
        :refPKVal="refPKVal"
        :cond-sql="curMapExt.Tag1 || undefined"
        :list-sql="curMapExt.Tag2 || undefined"
        :field-text="curMapExt.Tag || undefined"
        :is-multi-select="isMultiSelect"
        :selected-items="cacheSelectedData"
        :mypk="curMapExt.RefPKVal || undefined"
        :mapExt="curMapExt"
        :rowData="rowData"
      />
      <PopTableSimple
        v-else-if="curMapExt?.ExtType === 'PopTableSimple'"
        ref="tableSimple"
        :refPKVal="refPKVal"
        :cond-sql="curMapExt.Tag1 || undefined"
        :list-sql="curMapExt.Tag2 || undefined"
        :field-text="curMapExt.Tag || undefined"
        :is-multi-select="isMultiSelect"
        :selected-items="cacheSelectedData"
        :mypk="curMapExt.RefPKVal || undefined"
        :mapExt="curMapExt"
        :rowData="rowData"
      />
      <PopSelfUrl
        v-else-if="curMapExt?.ExtType === 'PopSelfUrl'"
        ref="selfUrl"
        :url="curMapExt.Tag || undefined"
        :is-multi-select="isMultiSelect"
        :mypk="curMapExt.RefPKVal || undefined"
      />
    </div>
  </Spin>
</template>

<script lang="ts" setup>
  import { Spin } from 'ant-design-vue';
  import { reactive, ref, shallowRef, UnwrapRef } from 'vue';
  import PopTreeEns from '/@/CCMobile/CCForm/Pop/PopTreeEns.vue';
  import PopTree from '/@/CCMobile/CCForm/Pop/PopTree.vue';
  import PopList from '/@/CCMobile/CCForm/Pop/PopList.vue';
  import PopGroupList from '/@/CCMobile/CCForm/Pop/PopGroupList.vue';
  import PopTableSearch from '/@/CCMobile/CCForm/Pop/PopTableSearch.vue';
  import PopTableSimple from '/@/CCMobile/CCForm/Pop/PopTableSimple.vue';
  import PopSelfUrl from '/@/CCMobile/CCForm/Pop/PopSelfUrl.vue';
  import WebUser from '/@/bp/web/WebUser';
  import { EnMapExt } from '/@/bp/en/Map/EnMapExt';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import { Key } from 'ant-design-vue/es/_util/type';
  import { AtPara } from '/@/bp/da/AtPara';

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
      type: Object as PropType<EnMapExt>,
      default: () => {
        return new EnMapExt();
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
    popHeight: {
      type: Object,
      default: () => {
        return { height: 'auto' };
      },
    },
    refPKVal: {
      type: [Number, String],
      default: 0,
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
  const curMapExt = ref<UnwrapRef<EnMapExt>>(props.mapExt as EnMapExt);
  const isMultiSelect = ref(true);
  const isShowSearch = ref(false);
  const contentStyle = reactive({
    height: parseFloat(props.popHeight?.height.replace('px', '')) - 53 + 'px',
    overflowY: 'auto',
  });
  const isLazily = ref(false);
  // 初始化页面
  async function InitPage() {
    try {
      loading.value = true;
      const atPara = curMapExt.value?.AtPara ;
      cacheSelectedData.value = props.selectVal;
      isMultiSelect.value = atPara?.GetValBooleanByKey('IsMultipleChoice') || false;
      isShowSearch.value = atPara?.GetValBooleanByKey('IsShowSearch') || false;
      cacheSelectedData.value = props.selectVal;
      isLazily.value =atPara?.GetValBooleanByKey('IsLazily') || false;
      if (isLazily.value == false)
        isLazily.value = (curMapExt.value?.ExtType === 'PopTreeEns')?curMapExt.value.Tag1?.includes('@Key'): curMapExt.value.Tag2?.includes('@Key') || false;
      if (props.mapExt.ExtType === 'PopTreeEns' || props.mapExt.ExtType === 'PopTree') {
        let rootNo = curMapExt.value.Tag5 || '0';

        if (rootNo == '') {
          if (WebUser.OrgNo == '') curMapExt.value.Tag5 = '0';
          else curMapExt.value.Tag5 = WebUser.OrgNo || null;
        }
        if (rootNo == '@WebUser.DeptNo') curMapExt.value.Tag5 = WebUser.DeptNo || null;
        if (rootNo == '@WebUser.OrgNo') curMapExt.value.Tag5 = WebUser.OrgNo || null;
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
  const tableSearch = shallowRef<InstanceType<typeof PopTableSearch>>();
  const tableSimple = shallowRef<InstanceType<typeof PopTableSimple>>();
  const selfUrl = shallowRef<InstanceType<typeof PopSelfUrl>>();
  //const emit = defineEmits(['TextPopOK']);
  const handlerPopOK = () => {
    let checkedList: Key[] = [];
    let checkedNames: string[] = [];
    if (curMapExt.value.ExtType === 'PopTreeEns') {
      checkedList = treeEns.value?.allCheckList || [];
      checkedNames = treeEns.value?.checkedNames || [];
    }
    if (curMapExt.value.ExtType === 'PopTree') {
      checkedList = tree.value?.checkedList || [];
      checkedNames = tree.value?.checkedNames || [];
    }
    if (curMapExt.value.ExtType === 'PopList') {
      checkedList = list.value?.checkedList || [];
      checkedNames = list.value?.checkedNames || [];
    }
    if (curMapExt.value.ExtType === 'PopGroupList') {
      checkedList = groupList.value?.checkedList || [];
      checkedNames = groupList.value?.checkedNames || [];
    }
    if (curMapExt.value.ExtType === 'PopTable') {
      checkedList = tableSearch.value?.checkedList || [];
      checkedNames = tableSearch.value?.checkedNames || [];
    }
    if (curMapExt.value.ExtType === 'PopTableSimple') {
      checkedList = tableSimple.value?.checkedList || [];
      checkedNames = tableSimple.value?.checkedNames || [];
    }

    if (curMapExt.value.ExtType === 'PopSelfUrl') {
      checkedList = selfUrl.value?.checkedList || [];
      checkedNames = selfUrl.value?.checkedNames || [];
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
