<template>
  <div class="en-wrapper">
    <ThemeWrapper>
      <Spin :spinning="loading">
        <div v-if="errorObj.hasError" class="ant-tag-red">
          {{ errorObj.tips }}
        </div>
        <div class="p-1" v-else>
          <div class="p-4" style="box-sizing: border-box; text-align: right; background-color: white">
            <Button type="primary" @click="Save" class="btn">{{ '保存' }}</Button>
          </div>
          <BasicTable @register="registerTable">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key == 'Name'">
                <Input v-model:value="record.Name" />
              </template>
            </template>
            <template #action="{ record }">
              <Dropdown placement="bottom" :trigger="['click']">
                <div style="color: #1890ff; cursor: pointer"> <SettingOutlined style="margin-right: 5px" />{{ '操作' }}</div>
                <template #overlay>
                  <Menu @click="(menuItem) => handleActionClick(menuItem, record)">
                    <MenuItem :key="'新建同级'" style="text-align: start" v-if="record.ParentNo != '0'">
                      <PlusCircleOutlined style="margin: 5px 10px" />
                      <span>{{ '新建同级' }}</span>
                    </MenuItem>
                    <MenuDivider style="margin: 5px 10px" v-if="record.ParentNo != '0'" />
                    <MenuItem :key="'新建下级'" style="text-align: start">
                      <PlusSquareOutlined style="margin: 5px 10px" />
                      <span>{{ '新建下级' }}</span>
                    </MenuItem>
                    <MenuDivider style="margin: 5px 10px" />
                    <MenuItem :key="'降级'" style="text-align: start">
                      <DownCircleOutlined style="margin: 5px 10px" />
                      <span>{{ '降级' }}</span>
                    </MenuItem>
                    <MenuDivider style="margin: 5px 10px" />
                    <MenuItem :key="'升级'" style="text-align: start" v-if="record.ParentNo != '0'">
                      <UpCircleOutlined style="margin: 5px 10px" />
                      <span>{{ '升级' }}</span>
                    </MenuItem>
                    <MenuDivider style="margin: 5px 10px" v-if="record.ParentNo != '0'" />
                    <Popconfirm :title="'确定删除吗'" :ok-text="'确认'" :cancel-text="'取消'" @confirm="onDelete(record)" v-if="record.ParentNo != '0'">
                      <MenuItem key="delete" style="text-align: start">
                        <DeleteOutlined style="margin: 5px 10px" />
                        <span>{{ '删除' }}</span>
                      </MenuItem>
                    </Popconfirm>
                  </Menu>
                </template>
              </Dropdown>
            </template>
          </BasicTable>
        </div>
      </Spin>
    </ThemeWrapper>
  </div>
</template>

<script setup lang="ts">
  import { nextTick, reactive, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { Input, Spin, Button, message, Menu, MenuItem, Dropdown, MenuDivider, Popconfirm } from 'ant-design-vue';
  import { BasicColumn, BasicTable, useTable } from '/@/components/Table';
  import BSEntity from '/@/utils/gener/BSEntity';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import { PlusCircleOutlined, SettingOutlined, PlusSquareOutlined, UpCircleOutlined, DownCircleOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import { SFTable } from '../../Admin/FrmLogic/SFTable/SFTable';
  import { SFTableDtl, SFTableDtls } from '../../Admin/FrmLogic/SFTable/SFTableDtl';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  const fk_sftable = ref();
  const loading = ref(false);
  const TreeData = ref<any>([]); //表格数据
  const data = ref<any>([]); //原始数据
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const NoGenerModel = ref();
  const isSave = ref(true);
  const currenNo = ref();
  const newNode = ref(0);
  const allRowKeys = ref<string[]>([]);
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });
  const route = useRoute();
  const TableColumn = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: 40,
    },
    {
      title: '编号',
      dataIndex: 'BH',
      key: 'BH',
      align: 'left',
      width: 200,
    },
    {
      title: '名称',
      dataIndex: 'Name',
      key: 'Name',
    },
  ];
  const [registerTable, { expandRows }] = useTable({
    title: '',
    rowKey: (row) => row.sys_rand_key,
    isTreeTable: true,
    showIndexColumn: true,
    indentSize: 14,
    expandIconColumnIndex: 1,
    dataSource: TreeData,
    columns: TableColumn as BasicColumn[],
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
      autoSubmitOnEnter: false,
      showResetButton: false,
      showSubmitButton: false,
    },
  });
  const InitPage = async () => {
    fk_sftable.value = props.params.FK_SFTable || route.query.FK_SFTable || props.params.PKVal;
    try {
      loading.value = true;
      //编号生成模式
      const sfTable = new SFTable(fk_sftable.value);
      await sfTable.Retrieve();
      NoGenerModel.value = sfTable.NoGenerModel;
      // const en = new BSEntity('BP.Sys.SFTable', fk_sftable.value);
      // en.No = fk_sftable.value;
      // await en.Init();
      // await en.Retrieve();
      // NoGenerModel.value = en.NoGenerModel;
      //获取数据
      const dtls = new SFTableDtls();
      await dtls.Retrieve('FK_SFTable', fk_sftable.value);
      data.value = dtls;
      getTreeData();
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e;
      message.error(`获取数据失败：${e}`);
    } finally {
      loading.value = false;
    }
    //表格渲染
    await nextTick();
    expandRows(allRowKeys.value);
  };

  //构造树形数据
  const getTreeData = () => {
    TreeData.value = [];
    data.value.forEach((item) => {
      if (item.ParentNo === '0') {
        const rand_key = Math.random() + '';
        const treeNode: Recordable = {
          ...Object.fromEntries(item.Row),
          MyPK: item.MyPK,
          sys_rand_key: rand_key,
        };
        treeNode.children = getChildren(item.BH);
        allRowKeys.value.push(rand_key);
        TreeData.value.push(treeNode);
      }
    });
  };

  //获取孩子
  const getChildren = (ParentNo) => {
    const children: any[] = [];
    data.value.forEach((item) => {
      if (item.ParentNo === ParentNo) {
        const randKey = Math.random() + '';
        const treeNode: Recordable = {
          ...Object.fromEntries(item.Row),
          MyPK: item.MyPK,
          sys_rand_key: randKey,
        };
        treeNode.children = getChildren(item.BH);
        allRowKeys.value.push(randKey);
        children.push(treeNode);
      }
    });
    if (children.length > 0) return children;
    else return null;
  };
  //操作
  const handleActionClick = (menuItem, item) => {
    switch (menuItem.key) {
      case '新建同级':
        add(item.ParentNo);
        break;
      case '新建下级':
        add(item.BH);
        break;
      case '降级':
        levelDown(item);
        break;
      case '升级':
        levelUp(item);
        break;
      default:
        break;
    }
  };

  //新建节点
  const add = async (ParentNo) => {
    await Save();
    let newNo = '';
    if (NoGenerModel.value === 4) {
      const en = new BSEntity('BP.Sys.SFTable', fk_sftable.value);
      en.No = fk_sftable.value;
      await en.Init();
      await en.Retrieve();
      newNo = await en.DoMethodReturnString('GenerSFTableNewNo');
    } else if (NoGenerModel.value === 1) {
      if (isSave.value) {
        const en = new BSEntity('BP.Sys.SFTable', fk_sftable.value);
        en.No = fk_sftable.value;
        await en.Init();
        await en.Retrieve();
        newNo = await en.DoMethodReturnString('GenerSFTableNewNo');
        currenNo.value = newNo;
      } else {
        let num = parseInt(currenNo.value) + 1;
        if (num < 10) newNo = '00' + num.toString();
        else if (num >= 10 && num < 100) newNo = '0' + num.toString();
        else newNo = num.toString();
        currenNo.value = newNo.toString();
      }
      isSave.value = false;
    } else if (NoGenerModel.value === 0) {
      newNo = prompt('请输入编号', '') || '';
      if (newNo === '') {
        alert('编号不能为空');
        return;
      }
    }
    newNode.value++;
    const randKey = Math.random();
    const newEntity = {
      Row: new Map([
        ['BH', newNo],
        ['sys_rand_key', randKey],
        ['Name', `新建节点${ParentNo}`],
        ['ParentNo', ParentNo],
      ]),
      BH: newNo,
      ParentNo,
      Name: `新建节点${ParentNo}`,
      sys_rand_key: randKey,
    };
    data.value.push(newEntity);
    getTreeData();
    expandRows(allRowKeys.value);
  };
  //寻找树形数组里的某个元素
  const findNode = (BH, list) => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].BH === BH) return list[i];
      if (Array.isArray(list[i].children) && list[i].children.length > 0) {
        let node = findNode(BH, list[i].children);
        if (node) return node;
      }
    }
    return null;
  };
  //降级
  const levelDown = async (item) => {
    const node = findNode(item.ParentNo, TreeData.value);
    if (node.children.length < 2) {
      message.error('当前节点没有兄弟节点，不可降级');
      return;
    }
    try {
      let index = node.children.findIndex((i) => i.BH == item.BH); //寻找当前节点的索引，用来确定降级以后的父亲是哪一个兄弟节点
      index = index == 0 ? index + 1 : index - 1;
      const dtl = new SFTableDtl();
      dtl.FK_SFTable = fk_sftable.value;
      dtl.Name = item.Name;
      dtl.BH = item.BH;
      dtl.setPKVal(item.MyPK);
      dtl.ParentNo = node.children[index].BH;
      await dtl.Update();
    } catch (e) {
      message.error(`降级失败,错误信息：${e}`);
      return;
    }
    message.success('降级成功');
    InitPage();
  };
  //升级 获得父亲节点，改变自己的父节点编号
  const levelUp = async (item) => {
    try {
      const pDtl = new SFTableDtls();
      await pDtl.Retrieve('FK_SFTable', fk_sftable.value, 'BH', item.ParentNo); //获得父亲节点
      if (pDtl[0].ParentNo === '0') {
        message.error('当前节点不能升级，只能有一个根节点');
        return;
      }

      const dtl = new SFTableDtl();
      dtl.FK_SFTable = fk_sftable.value;
      dtl.Name = item.Name;
      dtl.BH = item.BH;
      dtl.setPKVal(item.MyPK);
      dtl.ParentNo = pDtl[0].ParentNo;
      await dtl.Update();
    } catch (e) {
      message.error(`升级失败，错误信息：${e}`);
      return;
    }
    message.success('升级成功');
    InitPage();
  };

  let saves: any[] = [];
  //遍历树形数组
  const tree = async (list) => {
    if (list.length === 0) return;
    list.forEach(async (item) => {
      if (Array.isArray(item.children) && item.children.length > 0) tree(item.children);
      if (!item.MyPK) {
        const en = new SFTableDtl();
        en.FK_SFTable = fk_sftable.value;
        if (item.Name) {
          if (NoGenerModel.value === 1 || NoGenerModel.value === 4 || NoGenerModel.value === 0) {
            en.Name = item.Name;
            en.ParentNo = item.ParentNo;
            en.BH = item.BH;
            en.setPKVal(fk_sftable.value + '_' + item.BH);
            saves.push(en.Insert());
          } else if (NoGenerModel.value === 2) {
            //全拼编号
            const no = await ParsePinYin(item.Name, true);
            en.Name = item.Name;
            en.ParentNo = item.ParentNo;
            en.BH = no;
            en.setPKVal(fk_sftable.value + '_' + no);
            saves.push(en.Insert());
          } else if (NoGenerModel.value === 3) {
            //简拼编号
            const no = await ParsePinYin(item.Name, false);
            en.Name = item.Name;
            en.ParentNo = item.ParentNo;
            en.BH = no;
            en.setPKVal(fk_sftable.value + '_' + no);
            saves.push(en.Insert());
          }
        }
      } else {
        const en = new SFTableDtl();
        en.FK_SFTable = fk_sftable.value;
        const oldData = data.value.filter((i) => i.MyPK === item.MyPK)[0];
        if (item.Name != oldData.Name) {
          en.setPKVal(item.MyPK);
          en.Name = item.Name;
          en.ParentNo = item.ParentNo;
          en.BH = item.BH;
          saves.push(en.Update());
        }
      }
    });
  };
  //保存
  const Save = async () => {
    try {
      loading.value = true;
      tree(TreeData.value);
      await Promise.all(saves);
      saves = [];
      isSave.value = true;
    } catch (e) {
      message.error(`保存失败,错误信息：${e}`);
      loading.value = false;
    } finally {
      loading.value = false;
    }
    InitPage();
  };
  //删除
  const onDelete = async (item) => {
    if (Array.isArray(item.children) && item.children.length > 0) {
      message.error('当前节点有子节点，不可删除');
      return;
    }
    try {
      const dtl = new SFTableDtl();
      dtl.setPKVal(item.MyPK);
      await dtl.Delete();
    } catch (e) {
      message.error(`删除节点失败:${e}`);
      return;
    }
    message.success('删除成功');
    InitPage();
  };
  //生成拼音编号
  const ParsePinYin = async (str, model) => {
    let pinYin;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner');
    handler.AddPara('name', str);
    handler.AddPara('flag', model);

    pinYin = await handler.DoMethodReturnString('ParseStringToPinyin');

    return pinYin;
  };
  InitPage();
</script>

<style scoped>
  .btn {
    height: 30px;
    border-radius: 5px;
    margin-left: 12px;
  }
</style>
