<template>
  <BaseComponent ref="baseComp" class="dtl-search" :closeDrawerFunc="InitPage">
    <div ref="dtlSearchRef">
      <div class="vant-content">
        <div style="padding: 10px; background-color: white">
          <Button v-for="btn in getTopButtons()" style="margin-right: 12px" type="primary" size="small" class="btn_style" @click="btn.onClick">{{ btn.label }}</Button>
        </div>
        <Empty v-show="tableData.length === 0" :description="'暂无数据'" style="margin-top: 150px" />
        <div v-if="tableData.length != 0">
          <template v-for="(child, idx) in tableData" :key="idx">
            <div class="vant-address-item" @click="LinkFieldClick(child)" style="margin: 10px">
              <div class="vant-cell vant-cell--borderless">
                <div class="vant-cell__value vant-cell__value--alone">
                  <span v-for="column in Columns" :key="column.key">
                    <div class="vant-gl-text">
                      <span style="color: #808399"> {{ column.title }}</span>
                      <span>{{ child[column.key] || child[column.key + 'Text'] || child[column.key + 'T'] }}</span>
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <Popup v-model:show="rightDrawer.visible" position="bottom" style="height: 100%">
      <NavBar v-if="rightDrawer.visible" :fixed="true" :title="rightDrawer.title" @click-left="rightDrawer.visible = false" style="background-color: #fafafa !important">
        <template #left>
          <Icon name="arrow-down" size="18" />
        </template>
      </NavBar>
      <component
        v-if="rightDrawer.visible"
        :is="rightDrawer.component"
        :params="rightDrawer.params"
        :EnName="rightDrawer.params?.EnName"
        :PKVal="rightDrawer.params?.PKVal"
        @close-self="editClosed(true)"
      />
    </Popup>
  </BaseComponent>
</template>
<script lang="ts" setup>
    import { computed, markRaw, nextTick, onMounted, onUnmounted, reactive, ref, shallowRef, toRaw } from 'vue';
  import { NavBar, Icon, Popup, Button, Empty, showFailToast, showSuccessToast, Collapse, CollapseItem } from 'vant';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { Modal, TableSummary, TableSummaryCell, TableSummaryRow, message, Drawer, Input } from 'ant-design-vue';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import { WF_Comm_Dtl } from '/@/DataUser/OverrideFiles/WF_Comm_Dtl';
  import { useTable, BasicTable, ActionItem } from '/@/components/Table';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { FieldType, UIContralType } from '/@/bp/en/EnumLab';
  import { cloneDeep } from 'lodash-es';
  import { Attr } from '/@/bp/en/Map/Attr';
  import { AtPara } from '/@/bp/da/AtPara';
  import { ClassFactoryOfGroupPageNew } from '/@/WF/Comm/UIEntity/ClassFactoryOfGroupPageNew';
  import { Entity } from '/@/bp/en/Entity';
  import { useDtlQueryCondition } from '/@/hooks/ens/useDtlQueryCondition';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';

  import type { Component, StyleValue } from 'vue';
  import { GPNReturnObj } from '/@/bp/UIEntity/PageBaseGroupNew';
  import useFieldType from '/@/hooks/ens/useFieldType';

  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();

  const Columns: any = ref([]);
  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });
  const bodyStyle = computed(() => {
    return {
      padding: 0,
    };
  });

  const loading = ref(false);
  const { EnName, PKVal, RefPKVal, RefPK, ButsTableTop, ButsItem } = toRaw(props.params);
  let ShowAttrs = props.params.ShowAttrs || '';

  const dtlSearchRef = shallowRef<HTMLElement>();

  // }
  const Data = ref<any>([]);
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const currentRecord = ref({});
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
  const tableData = ref<Recordable[]>([]);
  const isShowSummary = ref(false);
  // 多选
  const handleChange = (selectedItems) => {
    selectedIds.value = selectedItems;
  };

  const tableInitFunc = ref<Function | null>(null);

  const InitPage = async () => {
    try {
      loading.value = true;
      //获得数据 NodeStations select MyPK,FK_Node,FK_Station FROM WF_NodeStation
      if (!EnName) {
        errorObj.hasError = true;
        errorObj.tips = '缺少参数 [ EnName ]';
        return;
      }
      const ens = await ClassFactory.GetEns(EnName);
      entity = ens.GetNewEntity;
      if (!entity) {
        message.error('获取实体失败');
        return;
      }
      isShowSummary.value = entity._enMap.ShowSummary;
      const { getQueryArgs } = useDtlQueryCondition();
      const queryArgs = getQueryArgs(props.params, {}, entity);
      //处理查询条件.
      await ens.Init();
      const attrs: Attr[] = entity._enMap.attrs;
      const hasIdx = !!attrs.find((attr) => attr.Key === 'Idx');
      if (hasIdx) {
        await ens.Retrieve(...queryArgs, 'Idx');
      } else {
        await ens.Retrieve(...queryArgs);
      }
      HisUAC.value = entity.HisUAC;
      currentId.value = entity._enMap.PKs as string;
      Columns.value = [];
      const mapExts = entity._enMap.enMapExts;
      const columns: Recordable[] = [];
      //特殊处理.
      if (ShowAttrs == '' || ShowAttrs == 'null' || ShowAttrs == null) ShowAttrs = '';
      else ShowAttrs = ShowAttrs + ',';
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (ShowAttrs === '' || (ShowAttrs != '' && ShowAttrs.indexOf(attr.Key + ',') > -1)) {
          if (ShowAttrs != '' && ShowAttrs.indexOf(attr.Key) < 0) continue;
          if (ShowAttrs === '' && attr.UIVisible === false) continue;
          attr['binddata'] = [];
          //获得外部数据源实
          if ((attr.UIContralType == UIContralType.DDL && attr.MyFieldType === FieldType.Normal) || mapExts.find((m) => m.AttrOfOper === attr.Key)) {
            // attr['binddata'] = await getDDLData(attr);
            const newAttr = attrs.find((oldAttr) => oldAttr.Key === attr.Key + 'T');
            if (newAttr) {
              columns.push({
                key: newAttr.Key,
                title: attr.Desc,
                dataIndex: newAttr.Key,
                params: newAttr,
                slots: { customRender: newAttr.Key },
                width: attr.UIWidth,
                align: 'center',
              });
            }
          } else if (attr.MyFieldType === FieldType.Enum || attr.MyFieldType === FieldType.FK) {
            const newAttr = attrs.find((oldAttr) => oldAttr.Key === attr.Key + 'Text');
            if (newAttr) {
              columns.push({
                key: newAttr.Key,
                title: attr.Desc,
                dataIndex: newAttr.Key,
                params: newAttr,
                slots: { customRender: newAttr.Key },
                width: attr.UIWidth,
                align: (attr.MyDataType == 2 || attr.MyDataType == 3) && attr.UIContralType === UIContralType.TB ? 'right' : 'left',
              });
            }
          } else {
            if (Columns.value.find((column) => column.key === attr.Key)) continue;
            columns.push({
              key: attr.Key,
              title: attr.Desc,
              dataIndex: attr.Key,
              params: attr,
              slots: { customRender: attr.Key },
              width: attr.UIWidth,
              align: 'center',
            });
          }
        }
      }

      Columns.value = columns;
      // const tableData: Recordable[] = [];
      tableData.value = [];
      Data.value = [];
      ens.forEach((entity, k) => {
        currentRecord.value = {};
        entity._enMap.attrs.forEach((attr: any) => {
          if (attr.UIContralType == 1) {
            if (attr.UIBindKey?.substring(0, 6).toLowerCase() === 'select') {
              currentRecord.value[attr['Key']] = entity.GetValByKey(attr['Key'] + 'T');
            } else {
              currentRecord.value[attr['Key']] = entity.GetValByKey(attr['Key'] + 'Text');
            }
          } else {
            currentRecord.value[attr['Key']] =
              attr.MyDataType == 4
                ? entity.GetValByKey(attr['Key']) == true
                  ? '是'
                  : '否'
                : entity.GetValByKey(attr['Key']);
          }
        });
        currentRecord.value['key'] = k;
        tableData.value.push(currentRecord.value);
      });
      Data.value = tableData.value;
      let primaryKey = entity?.PK;
      if (!primaryKey) {
        alert('缺少主键,请检查实体设置');
        return;
      }
      // 添加Key，并求和
      Columns.value = Columns.value.map((col) => {
        let summary: string | number = '';
        if (isNumber(col.params) || isMoney(col.params)) {
          let count = 0;
          for (const item of Data.value) {
            count += parseFloat(item[col.key]);
          }
          summary = count;
        }
        return {
          ...col,
          Key: col.key,
          summary,
        };
      });
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };
  const getTopButtons = () => {
    const actions: Array<ActionItem> = [];
    const arr = ButsTableTop || [];
    if (HisUAC.value.IsInsert) {
      actions.push({
        label: '新增',
        onClick: () => add(),
      });
    }
    if (HisUAC.value.IsDelete) {
      actions.push({
        label: '删除',
        onClick: () => onDeletes(),
      });
    }
    if (arr.length !== 0) {
      arr?.split(',').forEach((btnName) => {
        actions.push({
          label: btnName,
          onClick: async () => {
            const res = await WF_Comm_Dtl.TableTopBtnClick(btnName, EnName, RefPKVal, selectedIds.value.join());
            if (res instanceof GPNReturnObj) {
              baseComp.value?.handleGPNCallback(res);
            }
          },
        });
      });
    }
    return actions;
  };

  const getItemButtons = (item, index) => {
    const arr = ButsItem;
    const actions: Array<ActionItem> = [];
    if (HisUAC.value.IsUpdate) {
      actions.push({
        // icon: GloComm.GenerBtnICON('修改'),  这个不生效暂时注释掉
        icon: 'icon-note',
        label: '',
        onClick: (record: Record<string, any>) => {
          rowDoubleClick(record);
        },
      });
    }
    if (HisUAC.value.IsDelete) {
      actions.push({
        // icon: GloComm.GenerBtnICON('删除'),
        icon: 'icon-close',
        label: '',
        onClick: onDelete.bind(null, index, item[currentId.value]),
      });
    }
    arr?.split(',').forEach((btnName: string) => {
      actions.push({
        label: btnName,
        icon: GloComm.GenerBtnICON(btnName),
        onClick: () => {
          WF_Comm_Dtl.TableTopBtnClick(btnName, EnName, PKVal, item[currentId.value]);
        },
      });
    });
    return actions;
  };
  const onDelete = async (index, id) => {
    if (!id) {
      return;
    }
    Modal.confirm({
      title: () => '提示',
      content: () => '确定要删除吗?',
      async onOk() {
        const record = await ClassFactory.GetEn(EnName);
        await record.Init();
        record.setPKVal(id);
        await record.Retrieve();
        await record.Delete();
        if (Array.isArray(Data.value) && Data.value.length > 0) {
          loading.value = true;
          InitPage();
          setTimeout(() => {
            loading.value = false;
          }, 200);
          return;
        }
        message.error('未知错误，删除失败');
      },
      // eslint-disable-next-currentRecord @typescript-eslint/no-empty-function
      onCancel() {},
    });
  };

  const editClosed = async (reload = true) => {
    rightDrawer.visible = false;
    if (reload) {
      await nextTick();
      await InitPage();
    }
  };
  const add = async () => {
    const enGPN = await ClassFactoryOfGroupPageNew.GetEnByEntityClassID(entity?.classID || '');
    if (enGPN != null) {
      rightDrawer.component = markRaw(
        createAsyncComponent(() => import('/@/WF/Comm/UIEntity/GroupPageNew.vue'), {
          loading: true,
        }),
      );
      const subComponentParams = cloneDeep(props.params || {});
      delete subComponentParams['EnName'];
      delete subComponentParams['PKVal'];
      rightDrawer.params = { EnName: enGPN.classID, RefPKVal: PKVal, RefDtlEnName: EnName, ...subComponentParams };
      rightDrawer.title = enGPN.PageTitle || 'GPN-Page-Insert';
      rightDrawer.visible = true;
      return;
    }
    rightDrawer.component = markRaw(
      createAsyncComponent(() => import('/@/WF/Comm/En.vue'), {
        loading: true,
      }),
    );
    const subComponentParams = cloneDeep(props.params || {});
    delete subComponentParams['EnName'];
    delete subComponentParams['PKVal'];
    rightDrawer.params = { EnName, ...subComponentParams, [RefPK]: PKVal };
    rightDrawer.title = '新增';
    rightDrawer.visible = true;
  };
  const onDeletes = async () => {
    if (selectedIds.value.length == 0) {
      message.info('请选择删除项');
      return;
    }
    Modal.confirm({
      title: () => '提示',
      content: () => '确定要删除吗？',
      async onOk() {
        try {
          loading.value = true;
          const queue = selectedIds.value.map(async (item) => {
            const enMyPK = await ClassFactory.GetEn(EnName);
            enMyPK.setPKVal(item);
            await enMyPK.RetrieveFromDBSources();
            return enMyPK.Delete();
          });
          await Promise.all(queue);
          setTimeout(() => {
            InitPage();
          });
        } catch (e: any) {
          message.error(e.toString());
          console.error(e);
        } finally {
          loading.value = false;
        }
      },
    });
  };

  const rowDoubleClick = (record: Record<string, any>) => {
    const atPara = new AtPara(record.AtPara || '');
    rightDrawer.component = markRaw(
      createAsyncComponent(() => import('/@/WF/Comm/En.vue'), {
        loading: true,
      }),
    );
    const subComponentParams = cloneDeep(props.params || {});
    delete subComponentParams['EnName'];
    delete subComponentParams['PKVal'];
    let atParaEnName = atPara.GetValStrByKey('EnName');
    if (atParaEnName == 'None') {
      message.warn('此类权限无需编辑');
      return;
    } //如果是none 就是不需要打开编辑.
    //获取存储的主键值,如果有EnPKVal,就使用EnPKVal.
    const enPKVal = atPara.GetValStrByKey('EnPKVal');

    rightDrawer.params = { EnName: atParaEnName || EnName, RefPK: RefPK, PKVal: record[currentId.value], RefPKVal: enPKVal || PKVal, ...subComponentParams };
    rightDrawer.title = subComponentParams.Title;
    rightDrawer.visible = true;
  };

  onMounted(() => {
    InitPage();
  });
  const { isNumber, isMoney } = useFieldType();
  defineExpose({ editClosed });
</script>
<style lang="less" scoped>
  .vant-content {
    box-sizing: border-box;
    height: var(--viewport-height);
    background-color: #f2f4f7;
  }
  .vant-address-item {
    padding: 10px;
    box-shadow: 0px 0px 4px 0px #cccccc57;
    margin-bottom: 10px;
    background-color: #fff;
    border-radius: 10px;
  }
  .vant-collapse-item__title {
    background: #fafafa !important;
  }
  .vant-collapse-item__content {
    background: #fafafa !important;
  }
  .vant-gl-link-text {
    display: flex;
    align-items: center;
    margin-bottom: var(--van-padding-xs);
    font-size: var(--van-font-size-mg);
    line-height: var(--van-line-height-lg);
    font-weight: bold;
  }
  .vant-gl-tag {
    width: 15%;
    display: flex;
    justify-content: center;
    margin-left: auto;
  }
  .vant-gl-text {
    color: var(--van-address-list-item-text-color);
    font-size: 14px;
    line-height: 24px;
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
  }
  .vant-cell__value {
    position: relative;
    overflow: hidden;
    color: var(--van-cell-value-color);
    text-align: left;
    vertical-align: middle;
    word-wrap: break-word;
  }
  .vant-doc-card {
    margin-bottom: 24px;
    padding: 24px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 8px 12px #ebedf0;
    overflow: auto;
  }
  .van-doc-card {
    margin-bottom: 12px;
    padding: 12px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 8px 12px #ebedf0;
    overflow: auto;
  }
  .van-h5 {
    padding: 15px 0 10px;
    margin-bottom: 0;
    font-size: 17px;
    font-weight: 500;
  }
  .van-h5::before {
    content: '';
    position: absolute;
    top: 30%;
    left: 0px;
    width: 5px;
    height: 18px;
    border-radius: 10px;
    background-color: transparent;
  }
  .vant-h5 {
    color: #9ca3af;
  }
</style>
