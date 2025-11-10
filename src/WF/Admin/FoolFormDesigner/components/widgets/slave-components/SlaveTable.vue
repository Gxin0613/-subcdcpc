<template>
  <select-helper :widget="widgetInfo" :setting-url="settingUrl">
    <div class="slave-table" :style="groupBarStyle">
      <div class="title">
        <div class="name">
          <i :class="expand ? 'glyphicon glyphicon-minus' : 'glyphicon glyphicon-plus'" @click="handleFold"></i>
          {{ settings?.Name }}
        </div>
        <div class="type">
          {{ widgetInfo?.dto?.CtrlType }}
        </div>
        <div class="insert-actions">
          <div class="insert" @click="openSetting('AI', { MyPK: '' })"><i class="icon-magic-wand"></i>{{ 'AI创建' }}</div>
          <!-- <div class="insert" @click="openSetting('insertBase', { MyPK: '' })"><i class="icon-fire"></i>{{ '字段附件' }}</div> -->
          <div class="insert" @click="openSetting('insertSFTable', { MyPK: '' })"><i class="icon-home"></i>{{ '外键' }}</div>
          <div class="insert" @click="openSetting('insertEnum', { MyPK: '' })"><i class="icon-chart"></i>{{ '枚举' }}</div>

          <div class="insert" @click="openSetting('insert', { MyPK: '' })"><i class="icon-plus"></i>{{ '插入列' }}</div>
          <div class="insert" @click="openSetting('Self', { MyPK: '' })"><i class="icon-social-steam"></i>{{ '自定义控件' }}</div>
          <div class="insert" @click="openSetting('MapExt', { MyPK: '' })"><i class="icon-social-dropbox"></i>{{ '扩展控件' }}</div>
        </div>
      </div>
      <div v-show="expand" class="table-info" @mouseenter.stop.prevent>
        <n-spin :show="loading">
          <div class="content" v-if="settings.ListShowModel != 1">
            <n-table :bordered="true" :single-line="false" :theme-overrides="TableTheme">
              <thead>
                <tr ref="tableSortEl">
                  <th
                    v-for="column in columns"
                    :key="column.MyPK"
                    scope="col"
                    :class="column.MyPK != '-1' ? 'draggable-item' : 'disabled-item'"
                    :data-id="column.MyPK"
                    style="cursor: pointer; text-align: center"
                    @mouseenter="column.delButtonVisible = true"
                    @mouseleave="column.delButtonVisible = false"
                    @click="openSetting('edit', column)"
                  >
                    <div class="header-cell">
                      {{ column.Name }}
                      <n-popconfirm
                        v-if="column.canDelete && (column.delButtonVisible || column.waitConfirm)"
                        @positive-click="deleteColumn(column)"
                        :positive-button-props="{
                          color: '#d03050',
                        }"
                        @negative-click="column.waitConfirm = false"
                      >
                        <template #trigger>
                          <n-icon :component="Delete" size="16" color="#ff5555" @click.stop="column.waitConfirm = true" />
                        </template>
                        确定要删除列[ {{ column.Name }} ] 吗？
                      </n-popconfirm>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="o in 5" :key="o">
                  <td v-for="column in columns" :key="column.MyPK">
                    <template v-if="column.UIContralType === 2">
                      <n-checkbox />
                    </template>
                    <template v-else>
                      {{ getDefVal(column) }}
                    </template>
                  </td>
                </tr>
              </tbody>
            </n-table>
          </div>
          <div class="card-style" v-else>
            <div class="card" v-for="o in cardCount" :key="o">
              <div class="head">
                <div class="card-title">card{{ o }}</div>
                <div class="card-btns">
                  <div class="add" @click="addCard">{{ '新增' }}</div>
                  <div class="sub" v-if="o > 1" @click="subCard">删除</div>
                </div>
              </div>
              <div class="body">
                <template v-for="column in columns.slice(0, columns.length - 1)" :key="column.MyPK">
                  <div class="grid label">{{ column.Name }}</div>
                  <div class="grid">
                    <input class="card-input" :value="column.DefVal" :placeholder="getDefVal(column)" />
                  </div>
                </template>
              </div>
            </div>
          </div>
        </n-spin>
      </div>
    </div>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import Sortable from 'sortablejs';
  import { useContainerFold } from '../../../hooks/useContainerFold';
  export default defineComponent({
    name: 'SlaveTable',
  });
</script>

<script lang="ts" setup>
  import { ref, PropType, computed, onUnmounted, onMounted, shallowRef } from 'vue';
  import { NCheckbox, NSpin, NTable, NIcon, NPopconfirm, useMessage } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { SlaveTableItemProps } from '/@form/props/widgets/slave/SlaveTableWidget';
  import { useDesignerStore } from '/@/store/modules/form';
  import { getSlaveTableInfo, updateTableColumnsSort } from '/@form/api/FromApi';

  import Event from '/@/utils/Events';
  import Entity from '/@form/dto/Entity';
  import { EditPageMap } from '/@form/props/type-map/FormTypeMap';
  import TableTheme from '/@form/theme/overrides/TableTheme';
  import { AtPara } from '/@/bp/da/AtPara';
  import { Delete } from '@vicons/carbon';
  import { MapAttr } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import Events from '/@/utils/Events';
  import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
  import { MapAttrSFSQL } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttrSFSQL';

  const props = defineProps({
    widgetInfo: {
      type: Object as PropType<SlaveTableItemProps>,
      default: () => {},
    },
  });

  const emit = defineEmits(['update']);

  const tableSortEl = shallowRef<HTMLElement>();

  const columns = ref<Array<Recordable>>([]);
  const store = useDesignerStore();
  // const themeStore = useDesignerTheme()

  const message = useMessage();

  const openSetting = async (type: string, column: Partial<MapAttr>) => {
    const subTableId = props.widgetInfo?.dto?.CtrlID + '';
    const pk = column.MyPK;
    if (type == 'insertBase') {
      Events.emit('subTableInsertBaseCol', { formID: subTableId });
      return;
    }
    if (type === 'Self') {
      store.professionSettingUrl = `?FrmID=${subTableId}&inlayer=1&s=${Math.random()}&EnName=GPN_ComponentField&PageFrom=Dtl`;
      store.professionSettingTitle = props.widgetInfo?.title;
      store.professionSettingType = 'GPN';
      store.professionSettingVisible = true;
      return;
    }
    if (type === 'MapExt') {
      store.professionSettingUrl = `?FrmID=${subTableId}&inlayer=1&s=${Math.random()}&EnName=GPN_ComponentMapExt&PageFrom=Dtl`;
      store.professionSettingTitle = props.widgetInfo?.title;
      store.professionSettingType = 'GPN';
      store.professionSettingVisible = true;
      return;
    }
    if (type === 'insert') {
      store.professionSettingUrl = `?FrmID=${subTableId}&inlayer=1&s=${Math.random()}&EnName=GPN_DtlField`;
      store.professionSettingTitle = props.widgetInfo?.title;
      store.professionSettingType = 'GPN';
      store.professionSettingVisible = true;
      return;
    }
    if (type === 'edit' && pk !== '-1') {
      const editPage = await getSettingUrl(column);
      if (!editPage) return;
      const { title, url } = editPage;
      store.professionSettingUrl = url;
      store.professionSettingTitle = title || '';
      store.professionSettingType = 'EN';
      store.professionSettingVisible = true;
      return;
    }
    if (type === 'AI') {
      message.warning('AI功能正在开发中');
      return;
    }
    if (type === 'insertSFTable') {
      message.warning('插入外键功能正在开发中');
      return;
    }
    if (type === 'insertEnum') {
      message.warning('插入枚举功能正在开发中');
      return;
    }
  };

  const handleUIControlType = async (type: number, myPK: string) => {
    if (type === 11) {
      const imgEn = new Entity('TS.FrmUI.FrmImg', myPK);
      if ((await imgEn.RetrieveFromDBSources()) == 0) {
        const mapAttr = new Entity('BP.Sys.MapAttr', myPK);
        imgEn.setData(mapAttr.getData());
        imgEn.setVal('MyPK', myPK);
        await imgEn.Insert(); // 这个地方有问题.
      }
    }
    const editPage = EditPageMap.get(type);
    if (!editPage) {
      message.error('没有找到对应类型:' + type);
      return null;
    }
    const { title, url } = editPage;
    return {
      title,
      url: url + `${myPK}&s=${myPK}`,
    };
  };

  const getSettingUrl = (column: Partial<MapAttr>) => {
    const dataType = column.MyDataType;
    const uiType = column.UIContralType >= 0 ? column.UIContralType : -1;
    const myPK = column.MyPK || '';
    const lgType = column.LGType;

    //zhoupeng 增加.
    const ap = new AtPara(column.AtPara);
    let enName = ap.GetValStrByKey('EnName');
    if (!!enName) {
      return {
        title: column.Name,
        url: '/@/WF/Comm/En?EnName=' + enName + '&inlayer=1&PKVal=' + myPK + '&s=' + Math.random(),
      };
    }

    // 外键
    if (lgType == 2 || (lgType == 0 && dataType == 1 && uiType == 1)) {
      return {
        title: '外键字段属性',
        url: '/@/WF/Comm/En?EnName=TS.FrmUI.MapAttrSFTable&inlayer=1&PKVal=' + myPK + '&s=' + Math.random(),
      };
    }

    // 枚举值
    if (lgType == 1) {
      return {
        title: '编辑枚举字段',
        url: '/@/WF/Comm/Comm/En?EnName=TS.FrmUI.MapAttrEnum&inlayer=1&PKVal=' + myPK + '&s=' + Math.random(),
      };
    }

    // 普通字段属性
    let title = '';
    let url = '';
    switch (dataType) {
      case 1:
        return handleUIControlType(uiType, myPK);
      case 2:
      case 3:
      case 5:
      case 8:
        title = '字段Num属性';
        url = '/@/WF/Comm/Comm/En.htm?EnName=TS.FrmUI.MapAttrNum&PKVal=' + myPK + '&s=' + Math.random();
        break;
      case 6:
      case 7:
        title = '字段 date/datetime 属性';
        url = '/@/WF/Comm/Comm/En.htm?EnName=TS.FrmUI.MapAttrDT&PKVal=' + myPK + '&s=' + Math.random();
        break;
      case 4:
        title = '字段 boolean 属性';
        url = '/@/WF/Comm/Comm/En.htm?EnName=TS.FrmUI.MapAttrBoolean&PKVal=' + myPK + '&s=' + Math.random();
        break;
    }
    if (title === '' || url === '') {
      message.error(`非法字段类型: [MyDataType=${dataType}], [MyPK=${myPK}]`);
      return null;
    }
    return { title, url };
  };

  // 整个从表的设置url
  const settingUrl = computed(() => {
    return `/@/WF/Comm/En.vue?EnName=TS.Frm.MapDtlExt&FrmID=${props.widgetInfo?.dto?.FrmID}&No=${props.widgetInfo?.dto?.CtrlID}&PKVal=${props.widgetInfo?.dto?.CtrlID}`;
  });

  const fetchColumns = async () => {
    // todo Entities 实现方式
    // const columnsObj = new Entities("BP.Sys.MapAttrs")
    // await columnsObj.Retrieve("FrmID","ND101TuZhi","OrderBy","Idx")
    const ctrlID = props.widgetInfo?.dto?.CtrlID || '';
    let data: Recordable[] = await getSlaveTableInfo(ctrlID, 'Idx');
    data = data.map(async (column) => {
      const ap = new AtPara(column.AtPara);
      const classId = ap.GetValStrByKey('EnName');
      if (classId) {
        const entity = await ClassFactory.GetEn(classId);
        entity.setPKVal(column.MyPK);
        await entity.Retrieve();
        const entityRow = Object.fromEntries(entity.Row);
        return Object.assign(entityRow, column);
      }
      return column;
    });
    data = await Promise.all(data);
    const dataColumn: Recordable[] = data.filter((item) => item.UIVisible === 1 && (item.FrmID === ctrlID || item.FK_MapData === ctrlID));
    columns.value = dataColumn.map((column) => {
      return {
        ...column,
        delButtonVisible: false,
        canDelete: true,
        waitConfirm: false,
      };
    });
    columns.value.push({ Name: '操作', MyPK: '-1', delButtonVisible: false, canDelete: false, waitConfirm: false });
  };

  const deleteColumn = async (column: Recordable) => {
    try {
      //外键
      if (column.LGType === FieldTypeS.Normal && column.UIContralType === UIContralType.DDL) {
        const mapAttrSFSQL = new MapAttrSFSQL(column.MyPK);
        await mapAttrSFSQL.Retrieve();
        if (!mapAttrSFSQL.HisUAC.IsDelete) {
          message.error('您没有删除权限');
          return;
        }
        await mapAttrSFSQL.Delete();
        await updateAttr();
        return;
      }
      const mapAttr = new MapAttr(column.MyPK);
      await mapAttr.Retrieve();
      if (!mapAttr.HisUAC.IsDelete) {
        message.error('您没有删除权限');
        return;
      }

      await mapAttr.Delete();
      await updateAttr();
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      column.waitConfirm = false;
    }
  };

  const settings = ref<any>({});

  const loading = ref(false);
  const updateAttr = async () => {
    try {
      loading.value = true;
      // 初始化的时候挂在到对象上
      const slaveTable = new Entity('BP.Sys.MapDtl', props.widgetInfo.dto?.CtrlID);
      await slaveTable.Init();
      emit('update', 'entity', slaveTable);
      settings.value = slaveTable.getData();
      await fetchColumns();
    } catch (_) {
    } finally {
      loading.value = false;
    }
  };

  let tableSortInstance: Nullable<Sortable> = null;
  onMounted(async () => {
    Event.on('updateGroupField', async (id) => {
      if (props.widgetInfo?.id === id) {
        await updateAttr();
      }
    });
    await updateAttr();
    tableSortInstance = new Sortable(tableSortEl.value!, {
      draggable: '.draggable-item',
      ghostClass: 'form-drag',
      dataIdAttr: 'data-id',
      group: {
        name: 'table_sort_group',
        put: false,
        pull: false,
      },
      onChoose: (ev) => {
        document.body.style.setProperty('--sort-choose-width', ev.item.getBoundingClientRect().width + 'px');
        document.body.style.setProperty('--sort-choose-height', ev.item.getBoundingClientRect().height + 'px');
        document.body.style.setProperty('--sort-choose-display', 'table-cell');
      },
      onEnd: async (ev) => {
        const { oldDraggableIndex, newDraggableIndex } = ev;
        const ids = tableSortInstance?.toArray();
        if (Array.isArray(ids)) {
          const formData = new FormData();
          formData.append('Vals', ids.join(','));
          formData.append('0', 'ChangeMapAttrIdx');
          formData.append('1', ids.join(','));
          formData.append('Paras', ids.join(','));
          await updateTableColumnsSort(props.widgetInfo?.dto?.CtrlID || '', formData);

          const movedItem = columns.value.splice(oldDraggableIndex as number, 1)?.[0];
          if (movedItem) {
            columns.value.splice(newDraggableIndex as number, 0, movedItem);
          }
        } else {
          message.error('未能获取到id序列');
        }
      },
    });
  });

  onUnmounted(async () => {
    Event.off('updateGroupField');
    tableSortInstance?.destroy();
    tableSortInstance = null;
  });
  // 获取默认值展示
  //     [1, "text"],
  //     [2, "integer"],
  //     [8, "amount"],
  //     [3, "number"],
  //     [6, "date"],
  //     [7, "datetime"],
  //     [4, "checkbox"]
  const getDefVal = (column: Partial<MapAttr>) => {
    const { MyDataType, DefVal, UIContralType } = column;
    if (UIContralType == 1) return '[下拉框]';
    switch (MyDataType) {
      case 1:
        if (UIContralType == 0) return DefVal;
        break;
      case 2:
      case 3:
      case 5:
      case 8:
      case 4:
        return DefVal;
      case 6:
      case 7:
        switch (parseInt(column.IsSupperText)) {
          case 0:
            return 'YYYY-MM-DD';
          case 1:
            return 'YYYY-MM-DD HH';
          case 2:
            return 'YYYY-MM-DD HH:mm';
          case 3:
            return 'YYYY-MM-DD HH:mm:ss';
          case 4:
            return 'YYYY-MM';
          case 5:
            return 'HH:mm';
          case 6:
            return 'HH:mm:ss';
          case 7:
            return 'MM-DD';
          case 8:
            return 'YYYY';
          case 9:
            return 'MM';
          default:
            if (MyDataType === 6) return 'YYYY-MM-DD';
            return 'YYYY-MM-DD HH:mm:ss';
        }
    }
    return '';
  };

  const { expand, handleFold, groupBarStyle } = useContainerFold(props.widgetInfo as Recordable, '100px', '50px');

  // 默认显示两张卡片
  const cardCount = ref(2);
  const addCard = () => cardCount.value++;
  const subCard = () => (cardCount.value > 1 ? cardCount.value-- : (cardCount.value = 1));
</script>

<style lang="less" scoped>
  .slave-table {
    width: 100%;
    // 设置最小宽度方便放组件
    min-height: 100px;
    box-sizing: border-box;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    transition: all ease 0.2s;

    .title {
      height: 50px;
      background-color: #f2f5f7;
      width: 100%;
      box-sizing: border-box;
      padding: 0 20px 0 14px;
      font-size: 14px;
      line-height: 50px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .name {
        font-weight: 600;
      }

      .type {
        font-weight: normal;
      }

      .insert-actions {
        position: absolute;
        right: 80px;
        display: flex;
        align-items: center;
        z-index: 300;

        .insert {
          //font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          margin-left: 8px;

          i {
            margin-right: 6px;
          }
        }
      }
    }

    &:deep(.n-form-item-label) {
      height: 100%;
    }
  }

  .table-info {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 16px;
    border: 1px solid #eeeeee;

    .content {
      overflow-x: auto;

      .header-cell {
        width: 100%;
        height: 100%;
        position: relative;

        .n-icon {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }

    td {
      height: 25px;
      text-align: center;
    }

    .card-style {
      width: 100%;
      height: auto;

      .card {
        border: 1px solid #cccccc;
        border-radius: 6px;
        box-sizing: border-box;
        padding: 2px 4px;
        margin-top: 6px;
        margin-bottom: 6px;

        .head {
          width: 100%;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #cccccc;
          padding: 0 6px;
          box-sizing: border-box;

          .card-title {
            font-weight: 500;
            font-size: 18px;
            line-height: 25px;
          }

          .card-btns {
            display: flex;
            align-items: center;
            justify-content: flex-end;

            .add {
              color: #1890ff;
            }

            .sub {
              margin-left: 12px;
              color: #ff5555;
            }
          }
        }

        .body {
          padding: 8px 6px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-wrap: wrap;

          .grid {
            width: 25%;
            flex-shrink: 0;
            border: 1px solid #cccccc;
            height: 30px;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            //margin: 0 -1px -1px 0;

            .card-input {
              border: none;
              width: 100%;
              height: 100%;
              outline: none;
              padding: 0 6px;
            }
          }

          .label {
            padding-left: 8px;
          }
        }
      }
    }
  }

  .glyphicon {
    margin-right: 10px;
  }
</style>
