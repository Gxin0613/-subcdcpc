<template>
  <BaseComponent ref="baseComp">
    <div class="en-wrapper">
      <Spin :spinning="loading">
        <div v-if="errorObj.hasError" class="ant-tag-red">
          {{ errorObj.tips }}
        </div>
        <div class="p-1" v-else>
          <div class="p-4" style="box-sizing: border-box; text-align: right">
            <!-- <Button type="primary" style="margin-right: 20px" v-if="HisUAC.IsInsert" @click="add">{{'新增'}}</Button> -->
            <Button type="primary" @click="saves" v-if="HisUAC.IsUpdate">{{'保存'}}</Button>
          </div>
          <BasicTable @register="registerTable" @row-dbClick="(item) => onDetailClick(item)">
            <template v-for="col in TableColumn" :key="col.key" #[col.key]="{ record }">
              <div v-if="col.params != null" style="width: 100%">
                <div
                  v-if="col.enMapExt"
                  @click="PopModalShow(col.enMapExt, record[col.key], record['No'])"
                  style="
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: rgb(245 245 245);
                    border-color: rgb(215 213 213);
                    border-width: 1px;
                    width: 20em;
                  "
                >
                  <div style="color: rgb(200 200 200); margin-left: 5px; width: 18em; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{
                    ` ${record[`${col.key}T`]} `
                  }}</div>
                  <SettingOutlined
                    @click="PopModalShow(col.enMapExt, record[col.key], record['No'])"
                    style="background-color: white; height: 2em; width: 2em; align-items: center; display: flex; justify-content: center"
                  />
                </div>
                <div v-else-if="col.params.UIContralType === UIContralType.DDL">
                  <Select ref="select" v-model:value="record[col.key]" :disabled="isReadOnly(col.params)" :style="'width:' + (col.width - 20) + 'px'">
                    <SelectOption :key="index" v-for="(item, index) in col.params.binddata" :value="item.value">{{ item.label }}</SelectOption>
                  </Select>
                </div>
                <div v-else-if="col.params.UIContralType === UIContralType.RadioBtn">
                  <RadioGroup v-model:value="record[col.key]" :disabled="isReadOnly(col.params)" :style="'width:' + (col.width - 20) + 'px'">
                    <Radio :key="index" v-for="(item, index) in col.params.binddata" :value="item.value">{{ item.label }}</Radio>
                  </RadioGroup>
                </div>
                <div v-else-if="col.params.MyDataType === 4">
                  <SwitchButton :disabled="isReadOnly(col.params)" v-model:checked="record[col.key]" />
                </div>
                <div v-else-if="col.params.MyDataType === 6">
                  <div :style="'width:' + (col.width - 20) + 'px;'">
                    <date-picker :disabled="isReadOnly(col.params)" v-model:value="record[col.key]" />
                  </div>
                </div>
                <div v-else-if="col.params.MyDataType === 7">
                  <div :style="'width:' + (col.width - 20) + 'px;'">
                    <date-picker :disabled="isReadOnly(col.params)" :show-time="true" v-model:value="record[col.key]" />
                  </div>
                </div>
                <div v-else>
                  <Input
                    v-model:value="record[col.key]"
                    :style="commonInputStyle(col)"
                    :disabled="col.params.UIIsReadonly"
                    @keyup="keyup(col.params.MyDataType, record, col)"
                    style="border: none; background-color: transparent; width: 100%"
                  />
                </div>
              </div>
              <div v-else>
                {{ record[col.key] || '' }}
              </div>
            </template>
            <template #action="{ record, index }">
              <Dropdown placement="bottom" :trigger="['click']">
                <div style="color: #1890ff; cursor: pointer"> <SettingOutlined style="margin-right: 5px" />{{'操作'}}</div>
                <template #overlay>
                  <Menu @click="(menuItem) => handleActionClick(menuItem, record, index)">
                    <MenuItem :key="'新建同级'" style="text-align: start">
                      <PlusCircleOutlined style="margin: 5px 10px" />
                      <span>{{'新建同级'}}</span>
                    </MenuItem>
                    <MenuDivider style="margin: 5px 10px" />
                    <MenuItem :key="'新建下级'" style="text-align: start">
                      <PlusSquareOutlined style="margin: 5px 10px" />
                      <span>{{'新建下级'}}</span>
                    </MenuItem>
                    <MenuDivider style="margin: 5px 10px" />
                    <MenuItem :key="'降级'" style="text-align: start">
                      <DownCircleOutlined style="margin: 5px 10px" />
                      <span>{{'降级'}}</span>
                    </MenuItem>
                    <MenuDivider style="margin: 5px 10px" />
                    <MenuItem :key="'升级'" style="text-align: start">
                      <UpCircleOutlined style="margin: 5px 10px" />
                      <span>{{'升级'}}</span>
                    </MenuItem>
                    <MenuDivider style="margin: 5px 10px" />
                    <MenuItem :key="'属性'" style="text-align: start">
                      <UpCircleOutlined style="margin: 5px 10px" />
                      <span>{{'属性'}}</span>
                    </MenuItem>
                    <MenuDivider style="margin: 5px 10px" />
                    <Popconfirm :title="'确定删除吗'" :ok-text="'确认'" :cancel-text="'取消'" @confirm="onDelete(record, index)">
                      <MenuItem key="0" style="text-align: start">
                        <DeleteOutlined style="margin: 5px 10px" />
                        <span>{{'删除'}}</span>
                      </MenuItem>
                    </Popconfirm>
                  </Menu>
                </template>
              </Dropdown>

              <!-- <TableAction :actions="getItemButtons(record, index)" /> -->
            </template>
          </BasicTable>
          <Modal
            v-model:open="popModal.visible"
            :title="popModal.title"
            :width="popModal.width"
            :bodyStyle="{
              '--padding': '0px 12px !important',
            }"
            :style="popModal.height"
            @ok="PopModalOK"
          >
            <Pop v-if="popModal.visible === true" :mapExt="popModal.mapExt" ref="refPop" :select-val="popModal.value" />
          </Modal>
        </div>
      </Spin>
    </div>
  </BaseComponent>

</template>
<script lang="ts" setup>
    import { reactive, ref, shallowRef, unref } from 'vue';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import {
    Input,
    Spin,
    Button,
    Select,
    SelectOption,
    Switch as SwitchButton,
    message,
    DatePicker,
    Modal,
    Radio,
    RadioGroup,
    Dropdown,
    Menu,
    MenuItem,
    Popconfirm,
    MenuDivider,
  } from 'ant-design-vue';
  import Pop from './subComponents/Pop.vue';
  import { useTable, BasicTable, TableAction } from '/@/components/Table';
  import { WF_Comm_Dtl } from '/@/DataUser/OverrideFiles/WF_Comm_Dtl';
  import { useRoute } from 'vue-router';
  import { useDDLDataLoader } from '/@/hooks/ens/useDDLDataLoader';
  import { UIContralType } from '/@/bp/en/EnumLab';
  import dayjs, { Dayjs } from 'dayjs';
  import { Attr } from '/@/bp/en/Map/Attr';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import {GPNReturnObj, GPNReturnType} from '/@/bp/UIEntity/PageBaseGroupNew';
  import { PlusCircleOutlined, SettingOutlined, PlusSquareOutlined, UpCircleOutlined, DownCircleOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import { GloComm } from './GloComm';
  const route = useRoute();
  const loading = ref(false);
  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        // 不能删除
        return {};
      },
    },
  });
  //弹窗显示
  const popModal = reactive({
    visible: false,
    title: '',
    modalType: '',
    keyOfEn: '',
    width: 800,
    height: {},
    mapExt: <any>{},
    value: '',
    names: '',
    No: '',
  });
  const { PKVal, ButsTableTop, ButsItem } = props.params || route.query;
  let EnName = props.params?.EnName || props.params?.EnsName;
  if (!EnName) {
    EnName = route.query.EnName || route.query.EnsName;
  }

  const commonInputStyle = (col: any) => {
    const width = col.width > 120 ? col.width - 100 : 100;
    return {
      width: width + 'px',
      textAlign: [2, 3, 8].includes(col.params.MyDataType) ? 'right' : 'left',
    };
  };
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const checklist = ref<any>([]);
  const HisUAC = ref<any>({});
  const nowid = ref(''); // 记录当前主键PKs

  const baseComp =  shallowRef<InstanceType<typeof BaseComponent>>();
  const isReadOnly = (attr: Attr) => !!attr.UIIsReadonly;
  //表格的列设置，根据attrs获得
  const TableColumn = ref<any>([]);
  const TreeData = ref<any>([]); //表格数据
  const attrs = ref<any>([]); //字段集合
  const enMapExts = ref<any>([]); //依靠字段集合
  const PKField = ref('');
  const InitPage = async () => {
    try {
      loading.value = true;
      //获得数据 NodeStations select MyPK,FK_Node,FK_Station FROM WF_NodeStation
      if (!EnName) {
        errorObj.hasError = true;
        errorObj.tips = '缺少参数 [ EnName ]';
        return;
      }
      // 根据参数传入的类名从ClassFactory拿到类
      const ens = await ClassFactory.GetEns(EnName);
      await ens.Init();
      await ens.Retrieve('ParentNo', props.params.PKVal || '0');
      const getAllChildren = async (parentNo: string) => {
        // 如果list为空， 返回空数组
        const list = await ClassFactory.GetEns(EnName);
        await list.Retrieve('ParentNo', parentNo);
        if (list.length === 0) {
          return undefined;
        }
        for (const item of list) {
          //对一些特殊的数据类型进行解析
          attrs.value.forEach((attr) => {
            if (attr.MyDataType == 6 || attr.MyDataType == 7) {
              //时间类型的数据进行解析
              const value = item.GetValByKey(attr.Key) == null || item.GetValByKey(attr.Key).length == 0 ? ref<Dayjs>() : ref(dayjs(item.GetValByKey(attr.Key), 'YYYY-MM-DD'));
              item.SetValByKey(attr.Key, value);
            } else if (attr.MyDataType == 8 || attr.MyDataType == 5 || attr.MyDataType == 3) {
              //浮点型，保留两位小数
              const value = item.GetValByKey(attr.Key) == null ? ref(0) : ref(item.GetValByKey(attr.Key).toFixed(2));
              item.SetValByKey(attr.Key, value);
            } else if (attr.MyDataType == 4) {
              //布尔值解析
              const value = item.GetValByKey(attr.Key) == 1 ? ref(true) : ref(false);
              item.SetValByKey(attr.Key, value);
            }
          });
          item.children = await getAllChildren(item.No);
          // 子节点添加scope
          item.scope = list;
        }
        return list;
      };
      PKField.value = ens.GetNewEntity.PK;
      if (ens.length == 0) {
        message.info('没有数据');
        const en = await ClassFactory.GetEn(EnName);
        await en.Init();
        en.ParentNo = props.params.PKVal;
        en.Name = '新节点';
        await en.Insert();
        // InitPage();
      } else {
        // 根据集合类拿到类的定义
        const en = ens.GetNewEntity;
        await en.Init();
        HisUAC.value = en.HisUAC;
        // 根据 类拿到里面定义的字段信息等
        attrs.value = en._enMap.attrs;
        enMapExts.value = en._enMap.enMapExts;
        //获得下拉菜单选项
        const { getDDLData } = useDDLDataLoader(en); //定义DDL数据实体.
        //构建表格的column
        TableColumn.value = [];
        for (let i = 0; i < attrs.value.length; i++) {
          const attr = attrs.value[i];
          if (attr.UIVisible) {
            attr.binddata = [];
            if (attr.UIContralType == UIContralType.DDL) {
              attr.binddata = await getDDLData(attr); //获得下拉菜单
            }
            const enMapExt = enMapExts.value.filter((item) => item.AttrOfOper == attr.Key);

            let columnItem = {};
            columnItem = {
              title: attr.Desc,
              dataIndex: attr.Key,
              key: attr.Key,
              params: attr, //方便获取MyDataType，MyFieldType，binddata
              enMapExt: enMapExt.length ? enMapExt[0] : null,
              slots: { customRender: attr.Key },
              width: attr.UIWidth < 150 ? 150 : attr.UIWidth,
            };
            TableColumn.value.push(columnItem);
          }
        }

        for (const item of ens) {
          //对一些特殊的数据类型进行解析
          attrs.value.forEach((attr) => {
            if (attr.MyDataType == 6 || attr.MyDataType == 7) {
              //时间类型的数据进行解析
              const value = item.GetValByKey(attr.Key) == null || item.GetValByKey(attr.Key).length == 0 ? ref<Dayjs>() : ref(dayjs(item.GetValByKey(attr.Key), 'YYYY-MM-DD'));
              item.SetValByKey(attr.Key, value);
            } else if (attr.MyDataType == 8 || attr.MyDataType == 5 || attr.MyDataType == 3) {
              //浮点型，保留两位小数
              const value = item.GetValByKey(attr.Key) == null ? ref(0) : ref(item.GetValByKey(attr.Key).toFixed(2));
              item.SetValByKey(attr.Key, value);
            } else if (attr.MyDataType == 4) {
              //布尔值解析
              const value = item.GetValByKey(attr.Key) == 1 ? ref(true) : ref(false);
              item.SetValByKey(attr.Key, value);
            }
          });
          item.children = await getAllChildren(item.No);
          item.scope = ens;
        }

        TreeData.value = ens;
      }
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e;
      console.error(e);
      message.error(e.toString());
    } finally {
      loading.value = false;
    }
  };
  const getTopButtons = () => {
    const arr = ButsTableTop || [];
    const arrs: Array<Record<string, any>> = [];
    if (HisUAC.value.IsInsert) {
      arrs.push({
        label: '新增',
        onClick: add.bind(null),
      });
    }
    if (HisUAC.value.IsUpdate) {
      arrs.push({
        label: '保存',
        onClick: saves.bind(null),
      });
    }
    if (HisUAC.value.IsDelete) {
      arrs.push({
        label: '删除',
        onClick: onDeletes.bind(null),
      });
    }
    arr?.split(',').forEach((x) => {
      arrs.push({
        label: x,
        onClick: WF_Comm_Dtl.TableTopBtnClick.bind(x, EnName, PKVal, EnName, checklist.value.join()),
      });
    });
    return arrs;
  };

  const getItemButtons = (item, index) => {
    const arrs = [
      {
        label: '新建同级',
        onClick: add.bind(null, item.ParentNo),
        width: 200,
      },
      {
        label: '新建下级',
        onClick: add.bind(null, item.No),
        width: 200,
      },
      {
        label: '降级',
        onClick: levelDown.bind(null, item),
        width: 100,
      },
      {
        label: '升级',
        onClick: levelUp.bind(null, item),
        width: 100,
      },
      {
        label: '删除',
        with: 100,
        popConfirm: {
          title: item?.children?.length > 0 ? '当前节点有子节点，确认删除吗？' : '确定删除吗？',
          confirm: onDelete.bind(null, item.No, index),
        },
      },
    ];
    return arrs;
  };
  //表格操作列下拉菜单处理函数
  const handleActionClick = (menuItem, item, index) => {
    switch (menuItem.key) {
      case '新建同级':
        add(item.ParentNo);
        break;
      case '新建下级':
        add(item.No);
        break;
      case '降级':
        levelDown(item);
        break;
      case '升级':
        levelUp(item);
        break;
      case '属性':
        onDetailClick(item);
        break;
      default:
        break;
    }
  };

  const onDetailClick = (item) => {
    const enOnlyUrl = GloComm.UrlEnOnly(EnName, item[PKField.value]);
    const callbackInfo = new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, enOnlyUrl);
    baseComp.value?.handleGPNCallback(callbackInfo);
  };
  const onDelete = async (item, index) => {
    if (Array.isArray(item.children) && item.children.length > 0) {
      message.error('当前节点有子节点，不可删除');
      return;
    }
    try {
      await item.Delete();
    } catch (e) {
      message.error('删除节点失败');
      return;
    }
    message.success('删除成功');
    InitPage();
  };
  //批量删除操作，目前不用
  const onDeletes = async () => {
    if (checklist.value == null || checklist.value.length == 0) {
      message.info('请选择删除项');
      return;
    }
    Modal.confirm({
      title: () => '提示',
      content: () => '确定删除选择项吗？',
      async onOk() {
        let proArr: any = [];
        let enMyPK = await ClassFactory.GetEns(EnName);
        await enMyPK.Init();
        await enMyPK.Retrieve();
        enMyPK.forEach((f, i) => {
          proArr[i] = new Promise(async (resolve) => {
            if (checklist.value.indexOf(f[nowid.value]) != -1) {
              f.SetValByKey(nowid.value, f[nowid.value]);
              await f.Delete();
            }
            resolve('finish');
          });
        });
        Promise.all(proArr).then(() => {
          message.success('删除成功');
          checklist.value = [];
          clearSelectedRowKeys();
          InitPage();
        });
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onCancel() {},
    });
  };
  //新增节点 包括新增同级 新增下级，新建节点，更改父亲节点编号，再插入
  const add = async (ParentNo) => {
    try {
      /// if ParentNo ==  当前节点的更 this.RootNo 就不允许创建.
      /// 2023.10.16 需求调整
      if (ParentNo == props.params.PKVal) {
        message.success(`无法在当前根节点${props.params.PKVal}下创建节点`);
        return;
      }
      const en = await ClassFactory.GetEn(EnName);
      await en.Init();
      en.ParentNo = ParentNo;
      en.Name = '新节点';
      await en.Insert();
    } catch (e) {
      message.error(`增加节点失败，错误信息：${e}`);
      return;
    }
    message.success('新增节点成功');
    InitPage();
  };
  //降级
  // 这里的scope就是当前的这个节点所有的兄弟节点数组，
  // 你判断当前兄弟的个数，为1不能降级，大于等于2，修改当前的节点父节点编号为相邻的节点编号
  // 直接可以通过findIndex找到当前节点位置，
  const levelDown = async (item) => {
    if (item?.scope?.length < 2) {
      message.error('当前节点没有兄弟节点，不可降级');
      return;
    }
    try {
      const index = item.scope.findIndex((i) => i.No == item.No); //寻找当前节点的索引，用来确定降级以后的父亲是哪一个兄弟节点
      if (index > 0) {
        item.ParentNo = item.scope[index - 1].No;
        await item.Update();
      } else if (index == 0) {
        item.ParentNo = item.scope[index + 1].No;
        await item.Update();
      }
    } catch (e) {
      message.error(`降级失败,错误信息：${e}`);
      return;
    }
    message.success('降级成功');
    InitPage();
  };
  //升级 获得父亲节点，改变自己的父节点编号
  const levelUp = async (item) => {
    if (item.ParentNo == props.params.PKVal) {
      message.error('当前节点已经是根节点，不可升级');
      return;
    }
    try {
      const pEn = await ClassFactory.GetEn(EnName);
      await pEn.Init();
      pEn.No = item.ParentNo;
      await pEn.Retrieve(); //获得父亲节点
      item.ParentNo = pEn.ParentNo;
      await item.Update();
    } catch (e) {
      message.error(`升级失败，错误信息：${e}`);
      return;
    }
    message.success('升级成功');
    InitPage();
  };

  const handleChange = (selectedRowKeys, selectedRows) => {
    checklist.value = [];
    console.log(selectedRows);
    selectedRows.forEach((f) => {
      checklist.value.push(f[nowid.value]);
    });
  };
  const [registerTable, { clearSelectedRowKeys }] = useTable({
    title: '',
    rowKey: (row) => row[unref(TreeData)[0].PK],
    'row-click': (item) => {
      onDetailClick(item)
    },
    indentSize: 14,
    defaultExpandAllRows: true,
    expandIconColumnIndex: 1,
    showIndexColumn: true,
    dataSource: TreeData,
    columns: TableColumn,
    bordered: true,
    pagination: false,
    maxHeight: 700,
    actionColumn: {
      width: 100,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
    },
    formConfig: {
      labelWidth: 120,
      // schemas: ensFormSchema,
      autoSubmitOnEnter: false,
      showResetButton: false,
      showSubmitButton: false,
      // showActionButtonGroup: false,
    },
  });
  //保存按钮
  const saves = () => {
    try {
      TreeData.value.forEach(async (item) => {
        await analyseAttr(item);
        if (item.children?.length > 0) {
          item.children.forEach(async (child) => {
            await save(child);
          });
        }
      });
    } catch (e) {
      message.error(`保存失败，错误信息：${e}`);
      return;
    }
    loading.value = true;
    setTimeout(() => {
      //更改数据量太大,导致的数据库没有更新完成，就刷新页面，暂时这么写
      message.success('保存成功');
      InitPage();
    }, 2000);
  };
  const save = async (item) => {
    await analyseAttr(item);
    if (item.children?.length > 0) {
      item.children.forEach(async (child) => {
        await save(child);
      });
    }
  };
  const analyseAttr = async (item) => {
    const data = await ClassFactory.GetEn(EnName);
    await data.Init();
    attrs.value.forEach((attr) => {
      if (attr.MyDataType == 6 || attr.MyDataType == 7) {
        //时间类型的数据进行解析
        if (item.GetValByKey(attr.Key).value) {
          const value = item.GetValByKey(attr.Key).value.format('YYYY-MM-DD');
          data.SetValByKey(attr.Key, value);
        } else {
          data.SetValByKey(attr.Key, '');
        }
      } else if (attr.MyDataType == 8 || attr.MyDataType == 5 || attr.MyDataType == 3) {
        data.SetValByKey(attr.Key, item.GetValByKey(attr.Key).value);
      } else if (attr.MyDataType == 4) {
        //布尔值解析
        const value = item.GetValByKey(attr.Key).value ? 1 : 0;
        data.SetValByKey(attr.Key, value);
      } else {
        data.SetValByKey(attr.Key, item[attr.Key]);
      }
    });
    await data.Update();
  };
  //弹窗---start
  const PopModalShow = (mapExt, value, No) => {
    popModal.visible = true;
    popModal.title = mapExt.AtPara?.GetValStrByKey('Label') || '请选择';
    popModal.keyOfEn = mapExt.AttrOfOper;
    popModal.width = mapExt.width || window.innerWidth * 0.8;
    popModal.width = popModal.width > window.innerWidth * 0.8 ? window.innerWidth * 0.8 : popModal.width;
    popModal.height = {
      height: mapExt.height || window.innerHeight * 0.8 + 'px',
    };
    popModal.mapExt = mapExt;
    popModal.modalType = mapExt.ExtType;
    popModal.value = value;
    popModal.No = No;
  };
  const refPop = shallowRef<InstanceType<typeof Pop>>();
  const PopModalOK = () => {
    const val = refPop.value?.handlerPopOK();
    popModal.value = val?.[0].join(',') || '';
    popModal.names = val?.[1].join(',') || '';
    UpdateTreeData(TreeData.value);
    popModal.visible = false;
  };
  const keyup = (type, record, col) => {
    if (type == 2 || type == 3 || type == 8) {
      if (isNaN(record[col])) {
        record[col] = 0;
      }
    }
  };
  const UpdateTreeData = (data) => {
    if (!data) return;
    data.forEach((item) => {
      if (item.children) UpdateTreeData(data.children);
      if (item.No == popModal.No) {
        item[popModal.keyOfEn] = popModal.value;
        item[`${popModal.keyOfEn}T`] = popModal.names;
        item.SetValByKey(popModal.keyOfEn, popModal.value);
        item.SetValByKey(`${popModal.keyOfEn}T`, popModal.names);
      }
    });
  };
  //弹窗----end
  InitPage();
</script>
<style lang="less" scoped>
  .ant-calendar-picker {
    min-width: auto !important;
  }

  .vben-basic-table-form-container {
    padding: 0;
  }

  .vben-basic-table-action.center {
    justify-content: right;
  }

  .vben-basic-table-form-container .ant-form {
    padding: 0;
    margin-bottom: 0;
  }
  :deep(.ant-table-cell-with-append) {
    display: flex;
    align-items: center;
  }
</style>
