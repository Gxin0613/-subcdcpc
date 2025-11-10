<template>
  <div class="en-wrapper">
    <Spin :spinning="loading">
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="p-1">
        <Table :defaultExpandedKeys="alldata.length > 0 ? expandedRowKeys : []" :dataSource="alldata" :pagination="false" :columns="Columns" :scroll="{ x: 'auto', y: 700 }">
          <template #name="{ text, record }">
            <a @click="edit(record.No)">{{ text }}</a>
          </template>
          <template #operation="{ text, record, index }">
            <Dropdown>
              <a class="ant-dropdown-link" @click.prevent>{{ '操作' }}<DownOutlined /> </a>
              <template #overlay>
                <Menu>
                  <MenuItem>
                    <a style="margin-left: 10px" @click="edit(record.No)"><i class="icon-user"></i>{{ '编辑' }}</a>
                  </MenuItem>
                  <MenuItem>
                    <a style="margin-left: 10px" @click="addcommon(record, 1)">{{ '新建同级' }}</a>
                  </MenuItem>
                  <MenuItem>
                    <a style="margin-left: 10px" @click="addcommon(record, 2)">{{ '新建下级' }}</a>
                  </MenuItem>
                  <MenuItem>
                    <a style="margin-left: 10px" @click="arrowUp(text, record, index)">{{ '上移' }}</a>
                  </MenuItem>
                  <MenuItem>
                    <a style="margin-left: 10px" @click="arrowDown(text, record, index)">{{ '下移' }}</a>
                  </MenuItem>
                  <MenuItem>
                    <Popconfirm v-if="alldata.length > 0" :title="'确定删除吗?'" @confirm="onDelete(record)">
                      <a style="margin-left: 10px">{{ '删除' }}</a>
                    </Popconfirm>
                  </MenuItem>
                </Menu>
              </template>
            </Dropdown>
          </template>
        </Table>
        <Modal v-model:open="visible" title="Title" @ok="save">
          <Form style="padding: 20px" :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }">
            <FormItem :label="'名称'">
              <Input v-model:value="form.name" />
            </FormItem>
            <FormItem :label="'顺序'">
              <Input v-model:value="form.idx" />
            </FormItem>
          </Form>
        </Modal>
        <Modal v-model:open="showvisible" :title="'操作'" width="40%">
          <en :EnName="EnName" :PKVal="pkval" />
        </Modal>
        <!--    右侧抽屉-->
        <drawer v-model:open="rightDrawer.visible" :title="rightDrawer.title" width="800px">
          <component v-if="rightDrawer.visible" :is="rightDrawer.component" :params="rightDrawer.params" />
        </drawer>
      </div>
    </Spin>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { message, Table, TreeSelectProps, Modal, Form, FormItem, Input, Drawer, Popconfirm, Dropdown, Menu, MenuItem } from 'ant-design-vue';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { EntitiesMyPK } from '/@/bp/en/EntityMyPK';
  import En from '../../WF/Comm/En.vue';

  const Columns = ref([
    { key: 'No', title: '编号', dataIndex: 'No', width: 150 },
    { key: 'name', dataIndex: 'name', title: '名称', width: 200, slots: { customRender: 'name' } },
    { key: 'parentid', dataIndex: 'parentid', title: '父节点', width: 100 },
    { key: 'idx', dataIndex: 'idx', title: '顺序', width: 100 },
    {
      key: 'operation',
      title: '操作',
      dataIndex: 'operation',
      slots: { customRender: 'operation' },
      width: 200,
    },
  ]);
  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });
  const rightDrawer = reactive({
    visible: false,
    component: {},
    title: '',
    params: {},
  });

  const { EnName, PKVal, RootNo } = props.params;
  const checkedList = ref([]);
  const Data = ref([]);
  const alldata: TreeSelectProps['treeData'] = ref([]);
  let ensOfMyPK: EntitiesMyPK;
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const pkval = ref('');
  const form = ref<any>({
    No: undefined,
    name: undefined,
    parentid: undefined,
    idx: undefined,
  });
  const loading = ref(false);
  const visible = ref<boolean>(false);
  const showvisible = ref<boolean>(false);
  const expandedRowKeys = ref([]);
  const InitPage = async () => {
    try {
      loading.value = true;

      //获得数据 NodeStations  select MyPK,FK_Node,FK_Station FROM WF_NodeStation
      if (!EnName) {
        errorObj.hasError = true;
        errorObj.tips = '缺少参数 [ EnName ]';
        return;
      }

      ensOfMyPK = await ClassFactory.GetEns(EnName);
      if (!!ensOfMyPK) {
        alert('错误:' + EnName + ',请检查拼写是否正确?');
        return;
      }

      await ensOfMyPK.Init();
      await ensOfMyPK.RetrieveAll();
      alldata.value = [];
      checkedList.value = [];
      Data.value = [];
      form.value = {
        No: undefined,
        name: undefined,
        parentid: undefined,
        idx: undefined,
      };
      ensOfMyPK
        .filter((f: any) => f.ParentNo == '0' || f.ParentNo == '')
        .forEach((f: any, i) => {
          let d: any = {
            No: f.No,
            name: f.Name,
            parentid: f.ParentNo,
            key: f.ParentNo + '_' + i,
            idx: f.Idx,
            children: [],
          };
          expandedRowKeys.value.push(d.No as never);
          gettree(ensOfMyPK, d.No, d);
          alldata.value.push(d);
        });
      console.log(alldata.value);
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e;
    } finally {
      loading.value = false;
    }
  };
  function gettree(arr, parentid, t) {
    arr
      .filter((f) => f.ParentNo == parentid)
      .forEach((f, i) => {
        let d = {
          No: f.No,
          name: f.Name,
          parentid: f.ParentNo,
          key: f.ParentNo + '_' + i,
          idx: f.Idx,
          children: [],
        };
        expandedRowKeys.value.push(d.No as never);
        t.children.push(d);
        gettree(arr, d.No, d);
      });
  }

  const edit = (nodeID) => {
    showvisible.value = true;
    pkval.value = nodeID;
    // const url = "/#/WF/Comm/En?EnName="+EnName+"&PKVal=" + nodeID;
    // windowOpen(url);
  };
  function addcommon(item, type) {
    visible.value = true;
    form.value = {
      No: undefined,
      name: undefined,
      parentid: undefined,
      idx: undefined,
    };
    switch (type) {
      case 0:
        form.value.No = item.No;
        form.value.name = item.name;
        form.value.idx = item.idx;
        form.value.parentid = item.parentid;
        break;
      case 1:
        form.value.parentid = item.parentid;
        break;
      case 2:
        form.value.parentid = item.No;
        break;
      case 3:
        form.value.parentid = item.No;
        break;
      case 4:
        form.value.parentid = item.No;
        break;
    }
  }

  // const DoUp=async (nodeID)=>
  // {
  //   const en = await ClassFactory.GetEns(EnName);
  //   en.No = nodeID;
  //   await en.Init();
  //   await en.Retrieve();
  //    await en.DoUp();
  // }
  // const DoDown=async (nodeID)=>
  // {
  //   const en = await ClassFactory.GetEns(EnName);
  //   en.No = nodeID;
  //   await en.Init();
  //   await en.Retrieve();
  //   await en.DoDown();
  // }
  const arrowUp = (text, record, index) => {
    if (index <= 0) {
      message.info('已经是第一条了');
    } else {
      alldata.value.forEach((f) => {
        if (record.No == f.No) {
          let upData = alldata.value[index - 1];
          alldata.value.splice(index - 1, 1);
          alldata.value.splice(index, 0, upData);
        } else {
          gett(f.children, record.No, index, 1);
        }
      });
    }
  };

  const gett = (parentdata, no, index, type) => {
    parentdata.forEach((f) => {
      if (no == f.No) {
        if (type == 1) {
          let upData = parentdata[index - 1];
          parentdata.splice(index - 1, 1);
          parentdata.splice(index, 0, upData);
        } else {
          if (index === parentdata.length - 1) {
            message.info('已经是最后一条了');
          } else {
            let downData = parentdata[index + 1];
            parentdata.splice(index + 1, 1);
            parentdata.splice(index, 0, downData);
          }
        }
      } else {
        gett(f.children, no, index, type);
      }
    });
  };
  const arrowDown = (text, record, index) => {
    alldata.value.forEach((f) => {
      if (record.No == f.No) {
        if (index === alldata.value.length - 1) {
          message.info('已经是最后一条了');
        } else {
          let downData = alldata.value[index + 1];
          alldata.value.splice(index + 1, 1);
          alldata.value.splice(index, 0, downData);
        }
      } else {
        gett(f.children, record.No, index, 2);
      }
    });
  };

  const save = async () => {
    if (form.value.name == null || form.value.name.length == 0) {
      message.info('名称不能为空');
    } else {
      const en = await ClassFactory.GetEn(EnName);
      await en.Init();
      en.SetValByKey('No', form.value.No);
      en.SetValByKey('ParentNo', form.value.parentid);
      en.SetValByKey('Idx', form.value.idx);
      en.SetValByKey('Name', form.value.name);
      en.SetValByKey('OrgNo', RootNo);
      await en.Save();
      message.success('保存成功');
      visible.value = false;

      InitPage();
    }
  };

  const onDelete = async (item) => {
    if (item.children.length > 0) {
      message.info('有子级不能删除');
      return;
    }
    const en = await ClassFactory.GetEn(EnName);
    await en.Init();
    en.SetValByKey('No', item.No);
    await en.Delete();
    message.success('删除成功');
    InitPage();
  };

  InitPage();
</script>
