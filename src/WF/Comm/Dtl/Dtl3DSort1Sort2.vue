<template>
  <BaseComponent ref="baseComp" class="dtl-search">
    <div ref="dtlSearchRef" class="dtl-search-wrapper">
      <div style="padding: 6px; border-radius: 2px; background-color: var(--component-background-color); height: calc(100vh - 80px)">
        <div v-if="!readonly" class="dtl-header">
          <div class="search-container">
            <Input v-model:value="searchKey" :placeholder="'请输入关键字'" @change="Search" allow-clear class="search-input">
              <template #prefix>
                <SearchOutlined class="search-icon" />
              </template>
            </Input>
          </div>
          <div style="display: flex; justify-content: flex-start; align-items: center">
            <Button v-for="btn in enActions" style="margin-right: 12px" :key="btn.label" type="primary" :class="btn_style(btn.label)" @click="execEnActions(btn)">{{
              btn.label
            }}</Button>
            <Button style="margin-left: 12px" type="primary" v-for="btn in getTopButtons()" :key="btn.label" @click="btn.onClick" :ghost="btn.ghost" :class="btn_style(btn.label!)"
              >{{ btn.label }}
            </Button>
          </div>
        </div>
        <Table v-if="loadingEnd" :columns="Columns" :data-source="tableData" bordered size="small" :pagination="false" :scroll="{ y: 'calc(100vh - 160px)' }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.edit == false">
              {{ record[column.key] }}
            </template>
            <template v-if="column.edit == true">
              <template v-if="column.precision === 0">
                <InputNumber v-model:value="record[column.key]" />
              </template>
              <!--浮点类型-->
              <template v-else>
                <InputNumber v-model:value="record[column.key]" :precision="column.precision" />
              </template>
            </template>
          </template>
        </Table>
      </div>
      <div v-if="disabled" class="dtl-search-mask">
        <Alert :message="'提示'" :description="'此从表需要与主表id关联, 请先保存主表'" type="info">
          <template #action>
            <Space direction="vertical">
              <Button size="small" type="primary" @click="$emit('save-main-table')">{{ '保存并使用' }}</Button>
            </Space>
          </template>
        </Alert>
      </div>
    </div>
  </BaseComponent>
</template>
<script lang="ts" setup>
  import { computed, onMounted, reactive, ref, shallowRef, toRaw } from 'vue';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { Alert, Space, Button, message, Table, Input, InputNumber } from 'ant-design-vue';
  import { WF_Comm_Dtl } from '/@/DataUser/OverrideFiles/WF_Comm_Dtl';
  import { ActionItem } from '/@/components/Table';
  import { cloneDeep, debounce } from 'lodash-es';
  import { Entity } from '/@/bp/en/Entity';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import type { Component } from 'vue';
  import { GPNReturnObj } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { WaiGuaBaseEntity } from '../../../bp/UIEntity/WaiGuaBaseEntity';
  import { ClassFactoryOfWaiGuaEntity } from '../UIEntity/ClassFactoryOfWaiGuaEntity';
  import { UserRegedit } from '/@/bp/sys/UserRegedit';
  import webUser from '/@/bp/web/WebUser';
  import { useDtlQueryCondition } from '/@/hooks/ens/useDtlQueryCondition';
  import { Attrs } from '/@/bp/en/Map/Attrs';
  import useFieldType from '/@/hooks/ens/useFieldType';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { SearchOutlined } from '@ant-design/icons-vue';

  const btn_style = computed(() => {
    return (btn: string) => {
      if (btn.includes('新增') || btn.includes('新建')) {
        return 'btn_style btn_add';
      } else if (btn.includes('保存')) {
        return 'btn_style btn_save';
      } else if (btn.includes('删除')) {
        return 'btn_style btn_del';
      } else {
        return 'btn_style';
      }
    };
  });

  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();

  const Columns: any = ref([]);
  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mainTableInfo: {
      type: Object,
      default: () => {
        return {
          row: {},
          classId: '',
        };
      },
    },
    height: {
      type: Number,
      default: window.innerHeight * 0.75,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  });

  const bodyStyle = computed(() => {
    return {
      padding: 0,
    };
  });
  //搜索
  const searchKey = ref('');
  const { EnName, PKVal, RefPKVal, RefPK, ButsTableTop, Sort1, Sort2, Sort3, Sort12RefKey, AttrKeyNum } = toRaw(props.params);
  const { isFloat, isInt, isNumber, isMoney } = useFieldType();

  const dtlSearchRef = shallowRef<HTMLElement>();

  // }
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const HisUAC: any = ref({});
  const selectedIds = ref<any>([]);
  const currentId = ref('');
  interface DrawerParams {
    visible: boolean;
    component: Component;
    title: string;
    params: Recordable;
  }
  const rightDrawer = reactive<DrawerParams>({
    visible: false,
    component: {},
    title: '',
    params: {},
  });
  let entity: Nullable<Entity> = null;
  const isShowSummary = ref(false);

  const enActions = ref<Array<{ label: string; onClick: Function }>>([]);
  const execEnActions = async (btn) => {
    const res = await btn.onClick(PKVal, selectedIds.value.join(','), {
      ...props.params,
      RefPKVal: props.params.PKVal,
    });
    if (res instanceof GPNReturnObj) {
      baseComp.value?.handleGPNCallback(res);
    }
  };

  const entityWG = ref<Nullable<WaiGuaBaseEntity>>();

  const ur = reactive(new UserRegedit());
  const urMyPK = webUser.No + '_' + EnName + '_SearchAttrs';
  const { getQueryArgs } = useDtlQueryCondition();

  const checkUserRegedit = async () => {
    ur.setPKVal(urMyPK);
    await ur.RetrieveFromDBSources();
    ur.Vals = '';
    const queryArgs = getQueryArgs(props.params, {}, entity!);
    for (let i = 0; i < queryArgs.length; i += 2) {
      if (queryArgs[i] == 'Sort1' || queryArgs[i] == 'Sort2' || queryArgs[i] == 'Sort3' || queryArgs[i] == 'Sort12RefKey') continue;
      ur.Vals += `@${queryArgs[i]}=${queryArgs[i + 1]}`;
    }
    const { enable, key } = entity!.LogicDelConfig;
    if (enable) {
      ur.Vals += `@${key}=0`;
    }
    await ur.Update();
  };
  const tableData = ref<any[]>([]);
  const Sort1Options = ref<any[]>([]);
  const Sort2Options = ref<any[]>([]);
  const Sort3Options = ref<any[]>([]);
  const sort1Color = ref('');
  const sort2Color = ref('');
  const sort3Color = ref('');
  const isSort2ColorKey = ref(false);
  const numKey = ref('');
  const isEdit = ref(false);
  const entityPK = ref('');

  // end
  const InitPage = async () => {
    try {
      if (!EnName) {
        errorObj.hasError = true;
        errorObj.tips = '缺少参数 [ EnName ]';
        return;
      }
      entityWG.value = await ClassFactoryOfWaiGuaEntity.GetEn(('WGEntity_' + EnName.substring(EnName.lastIndexOf('.') + 1)) as string);
      const ens = await ClassFactory.GetEns(EnName);
      entity = ens.GetNewEntity;
      if (!entity) {
        message.error('获取实体失败');
        return;
      }
      entityPK.value = entity.PK;
      isShowSummary.value = entity._enMap.ShowSummary;
      //处理查询条件.
      await ens.Init();
      enActions.value = ens.enActions;
      const attrs: Attrs = entity._enMap.attrs;

      HisUAC.value = await entity.GenerUAC();
      if (HisUAC.value.IsInsert || HisUAC.value.IsUpdate) {
        isEdit.value = true;
      }
      currentId.value = entity._enMap.PKs as string;
      Columns.value = [];
      numKey.value = AttrKeyNum;
      if (numKey.value === '') {
        message.error('获取实体数值型字段失败');
        return;
      }
      const numberAttr = attrs.GetAttrByKey(AttrKeyNum);
      //获取列的内容
      const attr = attrs.GetAttrByKey(Sort3);
      if (attr == null) {
        message.error('获取实体第三维字段失败');
        return;
      }

      const sort1Attr = attrs.GetAttrByKey(Sort1);
      if (sort1Attr == null) {
        message.error('获取实体第一维字段失败');
        return;
      }
      const sort2Attr = attrs.GetAttrByKey(Sort2);
      if (sort2Attr == null) {
        message.error('获取实体第二维字段失败');
        return;
      }
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
      handler.AddPara('EnName', EnName);
      handler.AddPara('Sort1', Sort1);
      handler.AddPara('Sort2', Sort2);
      handler.AddPara('Sort3', Sort3);
      handler.AddPara('Sort12RefKey', Sort12RefKey);
      const result = await handler.DoMethodReturnString('Sort1Sort2D3_Init');

      //获取一维的数据
      Sort1Options.value = result['Sort1'];
      //获取二维的数据
      Sort2Options.value = result['Sort2'];

      sort1Color.value = props.params.Sort1Color || 'Bisque';
      sort2Color.value = props.params.Sort2Color;
      sort3Color.value = props.params.Sort3Color || 'yellow';

      const object = Sort2Options.value[0];
      const keys = Object.keys(object) || [];
      isSort2ColorKey.value = keys.includes(sort2Color.value);

      //增加两列Sort1,Sort2
      Columns.value.push({
        key: Sort1,
        title: '',
        dataIndex: Sort1,
        edit: false,
        width: Math.max(sort1Attr.UIWidth, 150),
        customCell: (record) => ({ rowSpan: record.rowSpan, style: { backgroundColor: sort1Color.value, border: '1px solid #d9d9d9' } }),
        customHeaderCell: () => ({ style: { border: '1px solid #d9d9d9' } }),
      });
      Columns.value.push({
        key: Sort2,
        title: '',
        dataIndex: Sort2,
        edit: false,
        width: Math.max(sort2Attr.UIWidth, 150),
        customCell: (record) => ({
          style: { backgroundColor: record['Color'] || '#ffff', border: '1px solid #d9d9d9' },
        }),
        customHeaderCell: () => ({ style: { border: '1px solid #d9d9d9' } }),
      });
      //获取列表数
      Sort3Options.value = result['Sort3'];
      Sort3Options.value.forEach((item) => {
        Columns.value.push({
          key: item.No || item.no || item.NO,
          title: item.Name || item.name || item.NAME,
          dataIndex: item.No || item.no || item.NO,
          align: 'center',
          edit: isEdit.value,
          precision: isInt(numberAttr) ? 0 : numberAttr?.Precision || 2,
          width: Math.max(numberAttr?.UIWidth, isEdit.value ? 130 : 80),
          customCell: (record) => ({ style: { backgroundColor: record['Color'] || '' } }),
          customHeaderCell: () => ({ style: { backgroundColor: sort3Color.value || '', border: '1px solid #d9d9d9' } }),
        });
      });
    } catch (e) {
      message.error(e);
    } finally {
    }
  };

  const getTopButtons = () => {
    const arr = ButsTableTop || [];
    const actions: Array<ActionItem> = [];
    if (HisUAC.value.IsUpdate || HisUAC.value.IsInsert) {
      actions.push({
        label: '保存',
        ghost: true,
        onClick: async () => {
          await batchSave();
        },
      });
    }
    if (arr.length !== 0) {
      arr?.split(',').forEach((btnName) => {
        actions.push({
          label: btnName,
          onClick: async () => {
            const res = await WF_Comm_Dtl.TableTopBtnClick(btnName, EnName, RefPKVal, selectedIds.value.join(), props.params);
            if (res instanceof GPNReturnObj) {
              baseComp.value?.handleGPNCallback(res);
            }
          },
        });
      });
    }
    return actions;
  };

  const batchSave = async () => {
    try {
      const ens = await ClassFactory.GetEns(EnName);
      const { RefPK, PKVal } = props.params;
      const updateQueue: Promise<string | number | boolean>[] = [];
      tableData.value.forEach((dataItem) => {
        Sort3Options.value.forEach((sort3Item) => {
          const en = ens.GetNewEntity;
          en.SetValByKey(RefPK, PKVal);
          en.SetValByKey(Sort1, dataItem[Sort1 + 'Key']);
          en.SetValByKey(Sort2, dataItem[Sort2 + 'Key']);
          en.SetValByKey(Sort3, sort3Item.No);
          if (!!dataItem[sort3Item.No] || dataItem[sort3Item.No] === 0) {
            en.SetValByKey(numKey.value, dataItem[sort3Item.No]);
            const val = dataItem[sort3Item.No + entityPK.value];
            if (!!val) {
              en.setPKVal(val);
              updateQueue.push(en.Update());
            } else updateQueue.push(en.Insert());
          }
        });
      });
      await Promise.all(updateQueue);
      message.info('保存成功');
      await SearchAndDealData();
    } catch (e) {
      console.trace(e);
      message.error(e.toString());
    }
  };

  const loadingEnd = ref(false);
  const SearchAndDealData = async () => {
    loadingEnd.value = false;
    //查询集合
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    handler.AddPara('EnsName', EnName);
    handler.AddPara('PageIdx', 0);
    handler.AddPara('PageSize', 9999);
    const data = await handler.DoMethodReturnJson<Recordable>('Search_SearchIt');
    await ur.Retrieve();
    tableData.value = [];
    const result = data.DT;
    Sort1Options.value.forEach((sort1Item) => {
      const curSort2Options = Sort2Options.value.filter((item) => item[Sort12RefKey] === sort1Item.No);
      curSort2Options.forEach((sort2Item, index) => {
        const item = {};
        item[Sort1] = sort1Item.Name;
        item[Sort1 + 'Key'] = sort1Item.No;
        item[Sort2] = sort2Item.Name;
        item[Sort2 + 'Key'] = sort2Item.No;
        item['Color'] = isSort2ColorKey.value ? sort2Item[sort2Color.value] : sort2Color.value;
        Sort3Options.value.forEach((sort3Item) => {
          const itemData = GetData(result, sort1Item.No, sort2Item.No, sort3Item.No);
          if (itemData === null) {
            item[sort3Item.No] = isEdit.value ? '' : '-';
            item[sort3Item.No + entityPK.value] = '';
          } else {
            item[sort3Item.No] = itemData[numKey.value];
            item[sort3Item.No + entityPK.value] = itemData[entityPK.value];
          }
        });
        if (index == 0) item['rowSpan'] = curSort2Options.length;
        else item['rowSpan'] = 0;
        tableData.value.push(item);
      });
    });
    loadingEnd.value = true;
  };
  const GetData = (tableData, sort1Val, sort2Val, sort3Val) => {
    const result = tableData.find((item) => item[Sort1] == sort1Val && item[Sort2] == sort2Val && item[Sort3] == sort3Val);
    if (result == null) return null;
    return result;
  };
  //搜索
  const Search = debounce(async () => {
    ur.SearchKey = searchKey.value;
    await ur.Update();
    await SearchAndDealData();
  }, 300);
  onMounted(async () => {
    await InitPage();
    await checkUserRegedit();
    await SearchAndDealData();
    searchKey.value = ur.SearchKey;
  });

  defineEmits(['save-main-table']);
</script>
<style lang="less" scoped>
  .vben-basic-table-form-container {
    overflow: hidden;
    box-sizing: border-box;
  }

  .vben-basic-table-action.center {
    justify-content: right;
  }

  .dtl-search {
    :deep(.vben-basic-table-form-container .ant-form) {
      margin-bottom: 6px;
      padding: 6px 10px 0;
    }

    :deep(.ant-btn-dangerous) {
      color: #ff6666;
      background-color: #ff6666;
      border-color: #ff6666;
    }
    :deep(.ant-btn-background-ghost + .ant-btn-primary:focus) {
      color: #1677ff !important;
    }
  }

  .dtl-search-wrapper {
    position: relative;

    .dtl-search-mask {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.08);
      z-index: 999;
      backdrop-filter: blur(1px);
    }

    .td-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 0;
    }
  }

  .search-container {
    margin-right: 15px;
  }

  //搜索图标动画
  :deep(.ant-input-prefix) {
    margin-left: -5px;
    margin-right: 5px;
  }

  .search-input {
    width: 180px;
    overflow: hidden;
    transition: width 0.3s;
  }

  .dtl-header {
    display: flex;
    justify-content: flex-start;
    //height: 100%;
    margin-bottom: 5px;
    flex: 1;

    .title {
      display: flex;
      align-items: center;
      justify-content: center;

      span {
        margin-right: 6px;
        font-size: 14px;
      }
    }
  }

  .btn_style {
    height: 30px;
    border-radius: 5px;
  }

  .btn_add {
    background-color: #f6ffed !important;
    color: #52c41a !important;
    border: 1px solid #b7eb8f !important;
  }

  .btn_save {
    background-color: #e6f7ff !important;
    color: #1890ff !important;
    border: 1px solid #91d5ff !important;
  }

  .btn_del {
    background-color: #fff2f0 !important;
    border: 1px solid #ffadd2 !important;
    color: #ff6666 !important;
  }
</style>
