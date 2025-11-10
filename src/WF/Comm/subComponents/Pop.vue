<template>
  <Spin :spinning="loading" :tip="loadingTips">
    <ThemeWrapper>
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else-if="isload == true" class="content contentStyle" :style="contentStyle">
        <PopTreeEns
          v-if="curMapExt?.ExtType === 'PopTreeEns'"
          ref="treeEns"
          :list-sql="listSql"
          :tree-sql="curMapExt.Tag1 || undefined"
          :parent-no="curMapExt.Tag5 || undefined"
          :search-sql="curMapExt.Tag4 || ''"
          :is-have-upper-level="curMapExt.Tag6 === '0' ? false : true"
          :isLazily="isLazily"
          :is-multi-select="isMultiSelect"
          :is-show-search="isShowSearch"
          :selected-items="cacheSelectedData"
          :selected-item-names="selectNameVal"
        />
        <PopDisableTreeEns
          v-if="curMapExt?.ExtType === 'PopDisableTreeEns'"
          ref="DisabletreeEns"
          :list-sql="listSql"
          :tree-sql="curMapExt.Tag1 || undefined"
          :parent-no="curMapExt.Tag5 || undefined"
          :search-sql="curMapExt.Tag4 || ''"
          :is-have-upper-level="curMapExt.Tag6 === '0' ? false : true"
          :is-multi-select="isMultiSelect"
          :is-show-search="isShowSearch"
          :selected-items="cacheSelectedData"
          :selected-item-names="selectNameVal"
        />
        <PopTree
          ref="tree"
          v-else-if="curMapExt?.ExtType === 'PopTree'"
          :tree-sql="listSql"
          :parent-no="curMapExt.Tag5 || undefined"
          :isLazily="isLazily"
          :is-multi-select="isMultiSelect"
          :is-show-search="isShowSearch"
          :selected-items="cacheSelectedData"
        />
        <PopList
          ref="list"
          v-else-if="curMapExt?.ExtType === 'PopList'"
          :list-sql="listSql"
          :is-multi-select="isMultiSelect"
          :is-show-search="isShowSearch"
          :selected-items="cacheSelectedData"
          :rowData="rowData"
        />
        <PopGroupList
          v-else-if="curMapExt?.ExtType === 'PopGroupList'"
          ref="groupList"
          :list-sql="listSql"
          :group-list-sql="groupListSql || undefined"
          :is-multi-select="isMultiSelect"
          :is-show-search="isShowSearch"
          :selected-items="cacheSelectedData"
          :selected-item-names="selectNameVal"
        />
        <PopTable
          v-else-if="curMapExt?.ExtType === 'PopTable'"
          ref="popTable"
          :list-sql="listSql"
          :group-list-sql="curMapExt.Tag1 || undefined"
          :is-multi-select="isMultiSelect"
          :is-show-search="isShowSearch"
          :selected-items="cacheSelectedData"
          :search-keys="curMapExt.Tag3 || ''"
        />
        <PopDtlBatch
          v-else-if="curMapExt?.ExtType === 'PopDtlBatch'"
          ref="popDtlBatch"
          :height="getDtlBatchHeight(curMapExt)"
          :params="getDtlBatchParams(curMapExt)"
          :main-table-info="rowData"
          :ref-text-name="curMapExt.Tag5 || 'Name'"
        />
      </div>
    </ThemeWrapper>
  </Spin>
</template>

<script lang="ts" setup>
  import { Spin } from 'ant-design-vue';
  import { computed, onMounted, PropType, reactive, ref, shallowRef } from 'vue';
  import PopTreeEns from '/@/WF/Comm/subComponents/PopTreeEns.vue';
  import PopDisableTreeEns from '/@/WF/Comm/subComponents/PopDisableTreeEns.vue';
  import PopTree from '/@/WF/Comm/subComponents/PopTree.vue';
  import PopList from '/@/WF/Comm/subComponents/PopList.vue';
  import PopGroupList from '/@/WF/Comm/subComponents/PopGroupList.vue';
  import PopTable from '/@/WF/Comm/subComponents/SelectByTable.vue';
  import WebUser from '/@/bp/web/WebUser';
  import { EnMapExt } from '/@/bp/en/Map/EnMapExt';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import { Key } from 'ant-design-vue/es/_util/type';
  import { Entity } from '/@/bp/en/Entity';
  import PopDtlBatch from '/@/WF/Comm/Dtl/DtlBatch.vue';

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mapExt: {
      type: Object as PropType<EnMapExt>,
      default: () => {
        return new EnMapExt();
      },
    },
    nameKey: {
      type: String,
      default: 'Name',
    },
    rowData: {
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
        return { height: '400px' };
      },
    },
    entityRef: {
      type: Object as PropType<Nullable<Entity>>,
      default: () => null,
    },
  });
  const loading = ref(false);
  const loadingTips = ref<string>('loading...');
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });

  const getDtlBatchHeight = (mapExt: EnMapExt) => {
    let height = 400;
    if (typeof mapExt.H === 'string' && mapExt.H.endsWith('px')) {
      height = parseFloat(mapExt.H.replace('px', ''));
    } else if (typeof mapExt.H === 'number') {
      height = mapExt.H;
    }
    return height - 230;
  };

  const getDtlBatchParams = (mapExt: EnMapExt) => {
    return {
      EnName: mapExt.Tag2 || '',
      RefPK: mapExt.Tag3 || '',
      PKVal: mapExt.Tag4 || '',
    };
  };

  //获取选择的值
  const cacheSelectedData = ref<string>('');
  const curMapExt = computed(() => props.mapExt);
  const isMultiSelect = ref(true);
  const isShowSearch = ref(false);
  const isLazily = ref(false);
  const getHeight = () => {
    let height = 400;
    if (typeof props.popHeight?.height === 'string' && props.popHeight.height.endsWith('px')) height = parseFloat(props.popHeight.height.replace('px', ''));
    else if (typeof props.popHeight?.height === 'number') height = props.popHeight.height;
    if (height > window.innerHeight * 0.7) height = window.innerHeight * 0.7;
    return height;
  };
  const contentStyle = reactive({
    height: getHeight() - 53 + 'px',
    overflowY: 'auto',
  });
  const listSql = ref('');

  const groupListSql = ref('');
  const isload = ref(false);

  const replaceExp = (sql: string) => {
    const matches = sql.match(/@\w+/g);
    let finalSrc = sql;
    if (matches) {
      for (const m of matches) {
        const key = m.substring(1);
        if (props.rowData[key]) {
          finalSrc = finalSrc.replace(m, props.rowData[key]);
        }
      }
    }
    return finalSrc;
  };

  const listSql1 = async () => {
    let sql: any = '';
    const type = curMapExt.value?.ExtType;
    if (!type) return sql;
    if (['PopTreeEns', 'PopDisableTreeEns'].includes(type)) sql = curMapExt.value?.Tag3 || '';
    else sql = curMapExt.value.Tag2 || '';
    if (!sql && typeof curMapExt.value?.Doc === 'function') {
      sql = await curMapExt.value.Doc(props.rowData);
    }
    let finalSrc = replaceExp(sql);
    if (finalSrc.trim().toLowerCase().startsWith('select') || finalSrc.startsWith('SQL_') || finalSrc.startsWith('DBSrc.')) return finalSrc;
    if (props.entityRef === null || typeof props.entityRef[sql] === 'undefined') return finalSrc;
    const calledMethod = props.entityRef != null ? props.entityRef[sql].bind(props.rowData) : null;
    if (!calledMethod) {
      return finalSrc;
    }
    const methodSQL = await calledMethod(props.entityRef?.GetAllPageParam()?.RefPKVal);
    return replaceExp(methodSQL);
  };
  const groupListSql2 = async () => {
    const sql: string = curMapExt.value.Tag1 || '';
    if (!sql) return sql;
    const matches = sql.match(/@\w+/g);
    let finalSrc = sql;
    if (matches) {
      for (const m of matches) {
        const key = m.substring(1);
        if (props.rowData[key]) {
          finalSrc = finalSrc.replace(m, props.rowData[key]);
        }
      }
    }
    if (finalSrc.trim().toLowerCase().startsWith('select') || finalSrc.startsWith('SQL_') || finalSrc.startsWith('DBSrc.')) return finalSrc;
    if (props.entityRef === null || typeof props.entityRef[sql] === 'undefined') return finalSrc;

    const calledMethod = props.entityRef != null ? props.entityRef[sql].bind(props.rowData) : null;
    if (!calledMethod) {
      return finalSrc;
    }
    return await calledMethod();
  };
  // 初始化页面
  async function InitPage() {
    try {
      loading.value = true;
      const atPara = curMapExt.value?.AtPara;
      isMultiSelect.value = atPara?.GetValIntByKey('IsMultipleChoice') !== 0;
      isShowSearch.value = atPara?.GetValIntByKey('IsShowSearch') !== 0;
      isLazily.value = atPara?.GetValBooleanByKey('IsLazily') || false;
      if (!isLazily.value) {
        if (curMapExt.value?.ExtType === 'PopTreeEns') {
          isLazily.value = !!curMapExt.value.Tag1?.includes('@Key');
        } else {
          isLazily.value = !!curMapExt.value.Tag2?.includes('@Key');
        }
      }
      // console.log(GetPara(curMapExt.value?.AtPara, 'IsMultipleChoice'));
      cacheSelectedData.value = props.selectVal;
      if (props.mapExt.ExtType === 'PopTreeEns' || props.mapExt.ExtType === 'PopTree' || props.mapExt.ExtType === 'PopDisableTreeEns') {
        let rootNo = curMapExt.value.Tag5 || '0';

        if (rootNo == '') {
          if (WebUser.OrgNo == '') curMapExt.value.Tag5 = '0';
          else curMapExt.value.Tag5 = WebUser.OrgNo || null;
        }
        if (rootNo == '@WebUser.DeptNo') curMapExt.value.Tag5 = WebUser.DeptNo || null;
        if (rootNo == '@WebUser.OrgNo') curMapExt.value.Tag5 = WebUser.OrgNo || null;
      }
      listSql.value = await listSql1();
      groupListSql.value = await groupListSql2();
      isload.value = true;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.error(e);
    } finally {
      loading.value = false;
    }
  }
  onMounted(() => {
    InitPage();
  });

  // 特殊组件
  const treeEns = shallowRef<InstanceType<typeof PopTreeEns>>();
  const disableTreeEns = shallowRef<InstanceType<typeof PopDisableTreeEns>>();
  const tree = shallowRef<InstanceType<typeof PopTree>>();
  const list = shallowRef<InstanceType<typeof PopList>>();
  const groupList = shallowRef<InstanceType<typeof PopGroupList>>();
  const popTable = shallowRef<InstanceType<typeof PopTable>>();
  const popDtlBatch = shallowRef<InstanceType<typeof PopDtlBatch>>();

  const handlerPopOK = () => {
    let checkedList: Key[] = [];
    let checkedNames: string[] = [];
    if (curMapExt.value.ExtType === 'PopTreeEns') {
      checkedList = treeEns.value?.allCheckList || [];
      checkedNames = treeEns.value?.checkedNames || [];
    }
    if (curMapExt.value.ExtType === 'PopDisableTreeEns') {
      checkedList = disableTreeEns.value?.allCheckList || [];
      checkedNames = disableTreeEns.value?.checkedNames || [];
    }
    if (curMapExt.value.ExtType === 'PopTree') {
      checkedList = tree.value?.checkedList || [];
      checkedNames = tree.value?.checkedNames || [];
    }
    /* if (curMapExt.value.ExtType === 'PopTableList') {
      checkedList = list.value?.checkedList || [];
      checkedNames = list.value?.checkedNames || [];
    }*/
    if (curMapExt.value.ExtType === 'PopGroupList') {
      checkedList = groupList.value?.checkedList || [];
      checkedNames = groupList.value?.checkedNames || [];
    }
    if (curMapExt.value.ExtType === 'PopList') {
      checkedList = list.value?.checkedList || [];
      checkedNames = list.value?.checkedNames || [];
    }
    if (curMapExt.value.ExtType === 'PopTable') {
      checkedList = (popTable.value?.checkedList as string[]) || [];
      checkedNames = popTable.value?.checkedNames || [];
    }
    if (curMapExt.value.ExtType === 'PopDtlBatch') {
      return new Promise((resolve) => {
        popDtlBatch.value?.Save().then(() => {
          checkedList = popDtlBatch.value?.checkedList || [];
          checkedNames = popDtlBatch.value?.checkedNames || [];
          resolve([checkedList, checkedNames]);
        });
      });
    }
    return [checkedList, checkedNames];
  };
  defineExpose({ handlerPopOK });
</script>

<style lang="less" scoped>
  .content {
    background-color: white;
  }
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
