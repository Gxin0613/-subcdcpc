<template>
  <Spin :spinning="loading" style="background-color: white; height: 100%">
    <div v-if="errorObj.hasError" class="ant-tag-red">
      {{ errorObj.tips }}
    </div>
    <div v-else>
      <div style="display: flex; flex-direction: row; justify-content: flex-end; margin-right: 10px; margin-top: 5px">
        <Button @click="handleExpandAll" v-if="expandAllRows">{{ '全部折叠' }}</Button>
        <Button @click="handleExpandAll" v-if="!expandAllRows">{{ '全部展开' }}</Button>
      </div>

      <BasicTable @register="registerTable">
        <template #bodyCell="{ column, _, record }">
          <template v-if="column.dataIndex === 'isShow'">
            <RadioGroup v-model:value="record.isShow" @change="(e) => changeTreeDataStatus(e, record)">
              <Radio value="1">{{ '显示' }}</Radio>
              <Radio value="0">{{ '隐藏' }}</Radio>
            </RadioGroup>
          </template>
          <template v-if="column.dataIndex === 'Name'">
            <template v-if="!record.selfIcon">
              <folder-outlined v-if="record.CtrlType != 'mapAttr'" />
              <file-outlined v-else-if="record.CtrlType == 'mapAttr'" />
            </template>
            <template v-else>
              <i :class="record.selfIcon"></i>
            </template>
            {{ record.Name }}
          </template>
        </template>
      </BasicTable>
    </div>
  </Spin>
</template>
<script lang="ts" setup>
  import { message, Spin, RadioGroup, Radio, RadioChangeEvent, Button } from 'ant-design-vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { reactive, ref } from 'vue';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import { GroupField, MapAttr } from '/#/entity';
  import { useTable, BasicTable, BasicColumn } from '/@/components/Table';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { FileOutlined, FolderOutlined } from '@ant-design/icons-vue';

  interface TreeNode {
    id: string;
    Name: string;
    isShow: number | '0' | '1'; //"0"隐藏，"1"显示
    CtrlType: string;
    type: 'group' | 'attr';
    children?: TreeNode[];
    selfIcon: string;
  }
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
    frmID: {
      type: String,
      default: '',
    },
  });
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const column = [
    {
      title: '名称',
      dataIndex: 'Name',
      align: 'left',
      width: 300,
    },
    {
      title: '内容类型',
      dataIndex: 'CtrlType',
      align: 'center',
      format: (text) => CtrlTypeText.get(text),
      width: 100,
    },
    {
      title: '设置显示/隐藏',
      dataIndex: 'isShow',
      align: 'center',
    },
  ];
  //控件类型文本
  const CtrlTypeText = new Map([
    ['Dir', '目录'],
    ['', '目录'],
    ['Attr', '目录'],
    ['Dtl', '从表'],
    [null, '目录'],
    ['Ath', '附件'],
    ['ChapterFrmSelfUrl', '自定义Url'],
    ['ChapterFrmLinkFrm', '自定义表单'],
    ['mapAttr', '字段'],
  ]);
  const loading = ref(false);
  const groupFields = ref<Array<GroupField & { ParentOID: string }>>([]); //分组
  const attrs = ref<Array<MapAttr>>([]); //字段集合
  const mainData = ref<Record<string, any>>({}); //表单数据集合
  const hideGroup = ref<Array<string>>([]); //章节的显示信息
  const hideGroupRes = ref<Array<string>>([]); //章节的显示信息结果
  const hideAttrs = ref<Array<string>>([]); //字段的显示信息
  const hideAttrsRes = ref<Array<string>>([]); //字段的显示信息结果
  const treeData = ref<Array<TreeNode>>([]); //字段的显示信息
  const expandedRowKeys = ref<any[]>([]); //展开的行
  const allRowKeys = ref<any[]>([]); //所有的行
  const expandAllRows = ref(true);
  const InitPage = async () => {
    try {
      loading.value = true;
      const frmID = props.params.FK_MapData || props.params.FrmID || props.frmID;
      const oid = props.params.WorkID || 0;

      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddPara('FrmID', frmID);
      handler.AddPara('OID', oid);
      const data = await handler.DoMethodReturnJson('ChapterFrm_Init');

      groupFields.value = data.GroupFields; //章节
      attrs.value = data.Sys_MapAttr; //字段
      mainData.value = data.MainTable[0]; //表单数据
      //存储显示状态
      const GroupStatus = GetPara(mainData.value.AtPara, 'HideGroup');
      if (GroupStatus == undefined) hideGroup.value = [];
      else hideGroup.value = GroupStatus.split(',');
      const AttrStatus = GetPara(mainData.value.AtPara, 'HideAttrs');
      if (AttrStatus == undefined) hideAttrs.value = [];
      else hideAttrs.value = AttrStatus.split(',');
      //构造树形数据
      treeData.value = [];
      groupFields.value.forEach((gf) => {
        if (gf.ParentOID === '' || gf.ParentOID === null || gf.ParentOID === undefined) {
          let isShow: number | '0' | '1' = hideGroup.value.findIndex((item) => item === gf.OID.toString());
          isShow = isShow > -1 ? '0' : '1';
          if (hideGroup.value.length === 0) isShow = '1';
          if (isShow === '0') hideGroupRes.value.push(gf.OID.toString());
          let node: TreeNode = {
            id: gf.OID.toString(),
            Name: gf.Lab,
            isShow: isShow,
            CtrlType: gf.CtrlType,
            type: 'group',
            selfIcon: gf.Icon || '',
          };
          const thisChildren = [...getGroupChildren(gf.OID), ...getAttrsChildren(gf.OID.toString(), gf.CtrlType)];
          if (Array.isArray(thisChildren) && thisChildren.length > 0) {
            node.children = thisChildren;
            expandedRowKeys.value.push(node.id);
            allRowKeys.value.push(node.id);
          }
          treeData.value.push(node);
        }
      });
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.error(e);
      message.error(`获取信息错误：${e}`);
      loading.value = false;
      return;
    } finally {
      loading.value = false;
    }
  };
  /**
   * @description 获得以ParentOID为父级的章节
   * @param ParentOID 父级OID
   */
  const getGroupChildren = (ParentOID: number | string) => {
    const children: TreeNode[] = [];
    groupFields.value.forEach((gf) => {
      if (gf.ParentOID === ParentOID.toString()) {
        let isShow: number | '0' | '1' = hideGroup.value.findIndex((item) => item === gf.OID.toString());
        isShow = isShow > -1 ? '0' : '1';
        if (hideGroup.value.length === 0) isShow = '1';
        if (isShow === '0') hideGroupRes.value.push(gf.OID.toString());
        let node: TreeNode = {
          id: gf.OID.toString(),
          Name: gf.Lab,
          isShow: isShow,
          CtrlType: gf.CtrlType,
          type: 'group',
          selfIcon: gf.Icon || '',
        };
        const thisChildren = [...getGroupChildren(gf.OID), ...getAttrsChildren(gf.OID.toString(), gf.CtrlType)];
        if (Array.isArray(thisChildren) && thisChildren.length > 0) {
          node.children = thisChildren;
          expandedRowKeys.value.push(node.id);
          allRowKeys.value.push(node.id);
        }
        children.push(node);
      }
    });
    return children;
  };
  /**
   * @description 获得GroupID下的字段，
   * @param GroupID 分组id
   * @param CtrlType 'Attr'返回所有可见字段，默认类型只返回文本字段
   */
  const getAttrsChildren = (GroupID: string, CtrlType: string) => {
    const children: TreeNode[] = [];
    attrs.value.forEach((attr) => {
      if (attr.GroupID.toString() === GroupID && attr.UIVisible === 1) {
        let isShow: number | '0' | '1' = hideAttrs.value.findIndex((item) => item === attr.KeyOfEn);
        isShow = isShow > -1 ? '0' : '1';
        if (hideAttrs.value.length === 0) isShow = '1';
        if (isShow === '0') hideAttrsRes.value.push(attr.KeyOfEn);
        const node: TreeNode = {
          id: attr.KeyOfEn,
          Name: attr.Name,
          isShow: isShow,
          CtrlType: 'mapAttr',
          type: 'attr',
          selfIcon: attr.ICON && attr.ICON != '0' ? attr.ICON : '',
        };
        if ((CtrlType == '' || CtrlType == null || CtrlType == 'Dir') && attr.TextModel != 1 && attr.MyDataType == 1 && attr.UIContralType == 0) {
          //默认类型的控件只显示文本字段
          children.push(node);
        } else if (CtrlType == 'Attr') {
          //Attr类型显示其下所有字段
          children.push(node);
        }
      }
    });
    return children;
  };
  /**
   * @description 改变数组显示隐藏状态
   * @description 某节点被设为隐藏，其子全为隐藏
   * @description 某节点设为显示，其父全为显示
   */
  const changeTreeDataStatus = (e: RadioChangeEvent, node: TreeNode) => {
    EachList(node.id, treeData.value, e.target.value);
  };
  /**
   * @description 递归寻找当前节点(显示隐藏状态改变的当前节点)
   * @param id 要寻找的节点id
   * @param list 当前要遍历的列表
   * @param isShow 要改变的状态:'0'|'1'
   */
  const EachList = (id: string, list: TreeNode[], isShow: '0' | '1') => {
    list.forEach((item, index) => {
      if (item.id === id) {
        list[index].isShow = isShow;
        changeRes(item.id, isShow, item.type); //改变结果数组
        if (Array.isArray(item.children) && item.children.length > 0 && isShow === '0') {
          //当本节点的状态变为隐藏，递归改变本节点的子节点状态
          EachChildern(item.children, isShow);
          return;
        } else if (isShow === '1') {
          //当本节点的状态变为显示，递归改变本节点的父节点状态
          EachParent(item.id, treeData.value, isShow);
          return;
        }
      }
      if (item.children && item.children.length > 0) {
        EachList(id, item.children, isShow);
      }
    });
  };
  /**
   * @description 改变显示结果
   * @param id : 节点id
   * @param isShow :节点改变后的状态，'0'：改变后为隐藏，加入结果数组; '1': 改变后状态为显示，从结果数组里删掉.
   * @param type :节点类型，决定改变哪个结果数组
   */
  const changeRes = (id: string, isShow: '0' | '1', type: 'group' | 'attr') => {
    if (isShow === '0') {
      if (type === 'group') {
        const index = hideGroupRes.value.findIndex((item) => item === id);
        if (index === -1) hideGroupRes.value.push(id);
      } else if (type === 'attr') {
        const index = hideAttrsRes.value.findIndex((item) => item === id);
        if (index === -1) hideAttrsRes.value.push(id);
      }
    } else if (isShow === '1') {
      if (type === 'group') {
        const index = hideGroupRes.value.findIndex((item) => item === id);
        if (index > -1) hideGroupRes.value.splice(index, 1);
      } else if (type === 'attr') {
        const index = hideAttrsRes.value.findIndex((item) => item === id);
        if (index > -1) hideAttrsRes.value.splice(index, 1);
      }
    }
  };
  /**
   * @description 改变树形数组的显示状态，如果父亲变为隐藏，则他的后代都变为隐藏
   * @param list : 要遍历的节点列表
   * @param isShow :要改变的状态
   */
  const EachChildern = (list: TreeNode[], isShow: '0' | '1') => {
    list.forEach((item: TreeNode, index) => {
      if (isShow === '0') {
        list[index].isShow = isShow;
        changeRes(item.id, isShow, item.type); //改变结果数组
      }
      if (Array.isArray(item.children) && item.children.length > 0) {
        EachChildern(item.children, isShow);
      }
    });
  };
  /**
   * @description 递归遍历改变父级的状态：先寻找改变状态的节点，找到后返回'FindChild'，然后再改变当前节点的状态
   * @param id ：改变状态的节点id
   * @param list ：当前层级的列表
   * @param isShow ：改变后的状态
   */
  const EachParent = (id: string, list: TreeNode[], isShow: '0' | '1') => {
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      if (item.id == id) {
        list[i].isShow = isShow;
        return 'FindChild';
      }
      if (Array.isArray(item.children) && item.children.length > 0) {
        let findChild = EachParent(id, item.children, isShow);
        if (findChild == 'FindChild') {
          list[i].isShow = isShow;
          changeRes(item.id, isShow, item.type); //改变结果数组
          return 'FindChild';
        }
      }
    }
    return 'NotChild';
  };
  //渲染表格
  const [registerTable] = useTable({
    title: '',
    rowKey: 'id',
    showIndexColumn: true,
    expandIconColumnIndex: 1,
    dataSource: treeData,
    columns: column as BasicColumn[],
    bordered: true,
    pagination: false,
    canResize: false,
    expandedRowKeys: expandedRowKeys,
    onExpandedRowsChange(expandedRows) {
      expandedRowKeys.value = expandedRows;
    },
  });
  // 展开折叠全部
  const handleExpandAll = () => {
    if (expandAllRows.value == true) {
      expandedRowKeys.value = [];
    } else {
      expandedRowKeys.value = allRowKeys.value;
    }
    expandAllRows.value = !expandAllRows.value;
  };

  /**
   * @description 保存显示状态，捕捉错误处理在父级
   */
  const SaveSetting = async () => {
    const frmID = props.params.FK_MapData || props.params.FrmID || props.frmID;
    const oid = props.params.WorkID || 0;
    const en = new BSEntity(frmID, oid);
    await en.Init();
    await en.Retrieve();
    en.setPara('HideGroup', hideGroupRes.value.join(','));
    en.setPara('HideAttrs', hideAttrsRes.value.join(','));
    await en.Update();
  };
  defineExpose({ SaveSetting });
  InitPage();
</script>
