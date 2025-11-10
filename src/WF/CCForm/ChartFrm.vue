<template>
  <div style="background-color: white; height: 100%" id="ceshi">
    <ThemeWrapper>
      <Spin :spinning="loading">
        <div v-if="errorObj.hasError" class="ant-tag-red" style="height: 10%">
          {{ errorObj.tips }}
          <div>{{'刷新后问题不能解决，联系管理员'}}</div>
        </div>
        <div v-else style="background-color: rgb(240, 242, 245)">
          <!--表单内容-->
          <Layout>
            <LayoutHeader class="layout_header">
              <!-- 展开折叠按钮 -->
              <img src="../../assets/images/logo.png" alt="" class="flow-logo">
              <Tooltip :title="ShrinkKey.length  == 0 ? '展开' : '折叠'">
                <Button class="flow-btn" @click="handleShrink">
                  <PlusSquareOutlined v-if="ShrinkKey.length == 0"></PlusSquareOutlined>
                  <MinusSquareOutlined v-else></MinusSquareOutlined>
                </Button>
              </Tooltip>
              <Button class="flow-btn" @click="handleSetting">{{'设置'}}</Button>
              <Button class="flow-btn" @click="()=>{showIndex=true;}" v-if="!showIndex">显示索引</Button>
              <Button class="flow-btn" @click="()=>showIndex=false" v-if="showIndex">关闭索引</Button>
            </LayoutHeader>
            <Divider class="divider" />
            <Layout>
              <LayoutSider :width="278" style="background-color: white; padding-top: 20px;overflow:auto">
                <DirectoryTree v-if="treeData.length > 0" :tree-data="treeData" style="height: 90vh" :selected-keys="[selectedNode.key]"
                  @select="(_, e) => handleSelect(e)" :expanded-keys="ShrinkKey" :default-expanded-keys="ShrinkKey"
                  @expand="handleExpand">
                  <template #icon="{ treeType, selfIcon }">
                    <template v-if="!selfIcon">
                      <folder-outlined v-if="treeType != 'rich'" />
                      <file-outlined v-else-if="treeType == 'rich'" />
                    </template>
                    <template v-else>
                      <i :class="selfIcon"></i>
                    </template>
                  </template>
                  <template #title="{ title, isSaved,index }">
                    <!-- -根据isSaved判断是否有对号 -->
                    <span v-if="isSaved"><span v-if="showIndex">{{ index+' ' }}</span>{{ title }}
                      <CheckCircleOutlined style="color: green" />
                    </span>
                    <span v-else><span v-if="showIndex">{{ index+' ' }}</span>{{ title }}</span>
                  </template>
                  <template #icon="{ CtrlType, selected }" v-if="false">
                    <!-- {{ CtrlType }} -->
                    <!-- 纯目录节点 -->
                    <template v-if="CtrlType === 'Dir'">
                      <FolderOpenOutlined v-if="selected" />
                      <FolderOutlined v-else />
                    </template>
                    <!-- 从表 -->
                    <template v-else-if="CtrlType === 'Dtl'">
                      <FolderOutlined />
                    </template>
                    <!-- 显示小的表单 -->
                    <template v-else-if="CtrlType === 'Attr'">
                      <FolderOutlined />
                    </template>
                    <!-- children是文本框字段 -->
                    <template v-else-if="CtrlType === ''">
                      <FolderOpenOutlined v-if="selected" />
                      <FolderOutlined v-else />
                    </template>
                    <template v-else-if="CtrlType === 'Ath'">
                      <i class="icon-paper-clip"></i>
                    </template>
                    <!-- 自定义表单链接 -->
                    <template v-else-if="CtrlType === 'ChapterFrmLinkFrm'">
                      <LinkOutlined />
                    </template>
                    <!-- 自定义URL -->
                    <template v-else-if="CtrlType === 'ChapterFrmSelfUrl'">
                      <PaperClipOutlined />
                    </template>
                    <!-- 其他 -->
                    <template v-else>
                      <FolderOutlined />
                    </template>
                  </template>
                </DirectoryTree>
              </LayoutSider>
              <Divider class="divider" type="vertical" />
              <LayoutContent id="content">
                <div class="content" style="background-color: white; height: 100%">
                  <Ath
                    v-if="CtrlType === 'Ath' && loadReady"
                    :ref="'ath' + AthInfo.MyPK"
                    :params="{ ...props.params, value: '' ,WorkID:PKVal}"
                    :athInfo="AthInfo"
                    :is-readonly="props.fieldIsReadonly"
                    :PKValue="PKVal"
                    />
                  <Dtl
                    v-else-if="CtrlType === 'Dtl' && loadReady"
                    :params="props.params"
                    :frmStyleContent="frmStyleContent"
                    :groupField="selectedNode"
                    :dtlInfo="DtlInfo"
                    :isShowGF="true"
                    :main-data="mainData"
                    :main-mapExts="GetDtlMapExt(DtlInfo.No)"
                    :ref="'dtl' + DtlInfo.No"
                    :key="selectedKey"
                    :is-readonly="props.fieldIsReadonly"
                    @update-prop-data="handleUpdate"
                    />
                  <Card v-else-if="CtrlType === 'Attr'&& loadReady" style="padding: 20px">
                    <MapAttrForm
                      :map-attrs="selectedNode.attrChildren"
                      :frmData="frmData"
                      :mainData="mainData"
                      :checkField="checkField"
                      :fwcVer="fwcVer"
                      :params="props.params"
                      :is-readonly="props.fieldIsReadonly"
                      ref="AttrRef"
                      :tableCol="tableCol"
                      :labPostion="labPostion"
                      :labAlign="labAlign"
                      :class="frmStyleContent.frmstyle"
                      />
                  </Card>
                  <div v-else-if="CtrlType === 'welcom'" class="welcom">
                    <div class="ccflow">CCFlow</div>
                    <div class="text">{{'欢迎使用章节表单'}}</div>
                  </div>
                  <div v-else-if="CtrlType === 'ChapterFrmLinkFrm'" id="ChapterFrmLinkFrm">
                    <component :is="useCachedComponentLoader('/@/WF/CCForm/Frm.vue')" :frmID="selectedNode.CtrlID"
                      ref="LinkFrmRef" />
                  </div>
                  <div v-else-if="CtrlType === 'ChapterFrmSelfUrl'">
                    <iframe :src="selectedNode.CtrlID" width="100%" height="100%"
                      v-if="!selectedNode.CtrlID.includes('.vue')"></iframe>
                    <component v-if="selectedNode.CtrlID.includes('.vue')"
                      :is="useCachedComponentLoader(selectedNode.CtrlID)" :frmID="selectedNode.CtrlID" ref="LinkFrmRef" />
                  </div>
                  <Spin v-else-if="CtrlType == 'rich'" :spinning="!loadReady">
                    <Tinymce v-if="props.fieldIsReadonly != true" v-model="selectedNode['value']" width="100%"
                      height="90vh"/>
                    <div v-else v-html="selectedNode['value']"></div>
                  </Spin>
                </div>
              </LayoutContent>
            </Layout>
          </Layout>
        </div>
        <!--居中弹窗-->
        <Modal v-model:open="modal.modalVisible" centered :closable="modal.closable" :title="modal.modalTitle"
          :width="modal.modalWidth" :body-style="modal.modalHeight" :footer="null">
          <div class="h-100">
            <!--退回小纸条显示-->
            <div style="padding: 10px; overflow-y: auto; height: 100%">
              <template v-for="(item, index) in dataInfo" :key="index">
                <div v-if="item.title === '退回信息'" style="line-height: 24px; color: red; font-weight: bold">{{ item.title
                }}</div>
                <div v-else style="line-height: 24px; font-weight: bold">{{ item.title }}</div>
                <p v-html="item.content" style="line-height: 24px"></p>
              </template>
            </div>
          </div>
        </Modal>
        <!--设置弹窗-->
        <Modal v-model:open="settingModal.modalVisible" centered :closable="settingModal.closable"
          :title="settingModal.modalTitle" :width="settingModal.modalWidth" :body-style="settingModal.modalStyle"
          :destroyOnClose="true" @ok="handleSettingOk">
          <ChapterFrmSetting :params="props.params" :frmID="FrmID" ref="ChapterFrmSettingRef" />
        </Modal>
      </Spin>
    </ThemeWrapper>
  </div>
</template>

<script lang="ts" setup>
import { Tinymce } from '/@/components/Tinymce/index';
import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
import { getCurrentInstance, provide, reactive, ref, shallowRef } from 'vue';
import Ath from './Ath.vue';
import Dtl from './Dtl.vue';
import MapAttrForm from './MapAttrForm.vue';
import { Modal, Spin, Tree, Layout, LayoutSider, LayoutContent, message, LayoutHeader, Button, Divider, Card, Textarea,Tooltip } from 'ant-design-vue';
import { CheckCircleOutlined, PlusSquareOutlined, MinusSquareOutlined, FolderOpenOutlined, FolderOutlined, LinkOutlined, PaperClipOutlined,FileOutlined } from '@ant-design/icons-vue';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { DealExp, GetPara } from '/@/utils/gener/StringUtils';
import { GetMapExtsGroup, MapAttrExt, userConvertData } from './FrmEnd';
import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
import { DataType } from '/@/bp/en/DataType';
import {FrmAttachment } from '/#/entity';
import { mapExtParse } from './MapExt';
import { FrmEleDBAttr, FrmEleDBs } from '../Admin/FrmLogic/MapAttrs/FrmEleDB';
import { FrmImg } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmImg';
import ChapterFrmSetting from './ChapterFrmSetting.vue';
import useCachedComponentLoader from '/@/hooks/ens/useCachedComponentLoader';
import Frm from '/@/WF/CCForm/Frm.vue';
import { FrmAttachmentExts } from '../Admin/FrmLogic/FrmAttachment/FrmAttachmentExt';
import Entity from '../Admin/FoolFormDesigner/dto/Entity';
import { nextTick } from 'vue';
import { getmark } from '/@/utils/gener/watermark';
import {MapData} from "/@/WF/Admin/FrmLogic/MapData";
const { DirectoryTree } = Tree;
//定义以下树组件数据的类型
interface TreeData {
  title: string;
  index: string;
  key: string;
  CtrlID: string;
  CtrlType: string;
  isSaved: boolean;
  children: any[];
  attrChildren: any[];
  selfIcon:string;
}
//获取传的参数
const props = defineProps({
  fieldIsReadonly: {
    type: Boolean,
    default: false,
  },
  isReadonly: {
    type: Boolean,
    default: false,
  },
  isSave: {
    type: Boolean,
    default: false,
  },
  params: {
    //请求参数集合
    type: Object,
    default: () => { },
  },
  frmData: {
    //表单属性集合
    type: Object,
    default: () => {},
  },
});
const errorObj = reactive({
  tips: '',
  hasError: false,
});
const showIndex=ref(true);//是否显示索引号
const { GetDataTableOfTBChoice, GetActionDLLData } = mapExtParse();
const { ConvertDataToDB,ConvertDataFromDB } = userConvertData();
const { watermark } = getmark();
//弹窗显示
const modal = reactive({
  modalVisible: false,
  closable: true,
  modalType: '',
  modalTitle: '',
  modalWidth: 800,
  modalHeight: {},
});
const settingModal = reactive({
  modalVisible: false,
  closable: true,
  modalType: '',
  modalTitle: '设置',
  modalWidth: 800,
  modalStyle: { height: '600px', overflow: 'scroll' },
});
  //表单风格
  const frmStyleContent = reactive({
    frmContent: '',
    frmTitle: '',
    GroupTitle: '',
    frmstyle: '',
  });
const AttrRef = shallowRef<InstanceType<typeof MapAttrForm>>();
const LinkFrmRef = shallowRef<InstanceType<typeof Frm>>();
const ChapterFrmSettingRef = shallowRef<InstanceType<typeof ChapterFrmSetting>>();
const frmData = ref<any>({}); //表单所有属性集合
const mainData = ref<Record<string, any>>({}); //表单数据集合
const groupFields = ref<any>([]); //章.
const attrs = ref<any>([]); //字段.
const aths = ref<Array<FrmAttachment>>([]); //附件集合
const checkField = ref(''); // 签批字段
const fwcVer = ref(0);
const hideGroup = ref<Array<string>>([]); //隐藏的章节的
const hideAttrs = ref<Array<string>>([]); //隐藏的字段的
//表单的列数，标签位置(左边，顶部)，标签对齐方式(靠左，靠右）
const tableCol = ref<number>(4);
const labPostion = ref<string>('left');
const labAlign = ref<string>('left');
const mapData = ref(); //表单属性
const loading = ref(false);
const loadReady = ref(false);
const dataInfo = ref<Record<string, any>[]>([]);
const FrmID = ref<string>(''); //参数
const PKVal = ref<string|number>(''); //参数
const EntityType = ref<number>(0);
const treeData = ref<TreeData[]>([]); //左边树形目录
const selectedKey = ref<string>(); //树形选中的节点key
const selectedNode = ref<Recordable>({}); //树形选中P
const CtrlType = ref(''); //判断一级目录类型
const DtlInfo = ref<Recordable>({}); //从表请
const AthInfo = ref<Recordable>({}); //附件请求参数
const firstNode = ref(false);//是否找到了第一个可以显示的节点
const instance = getCurrentInstance();
provide('isChapterForm', '1'); //解析自定义表单时需要做一些样式适配
//初始化页面，判断当前流程表单类型
const InitPage = async () => {
  try {
    firstNode.value=false;
    loading.value = true;
    const en = new MapData();
    en.No = props.params.FrmID || props.params.FK_MapData;
    await en.RetrieveFromDBSources();
    mapData.value = en;
    //获取参数FrmID
    FrmID.value = mapData.value.No as string;
    EntityType.value = en.EntityType;
    //获取参数OID
    PKVal.value = props.params.OID || props.params.WorkID ||  props.params.PKVal || props.params.No || 100


    //获取表单的数据
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddPara('FrmID', FrmID.value);
    handler.AddPara('PKVal', PKVal.value);
    handler.AddPara('EntityType',EntityType.value);
    const data = await handler.DoMethodReturnJson<Recordable>('ChapterFrm_Init');
    frmData.value = data;
    groupFields.value = data['GroupFields']; //章.
    attrs.value = data['Sys_MapAttr']; //字段.
    formatMapAttr();
    mainData.value = data.MainTable[0] || {};
    mainData.value = await ConvertDataFromDB(mainData.value, attrs.value as any);
    aths.value = (data.Sys_FrmAttachment as Array<FrmAttachment>) || [];
    //表单的列数，标签位置(左边，顶部)，标签对齐方式(靠左，靠右）
    tableCol.value = data.Sys_MapData.TableCol == 0 ? 4 : data.Sys_MapData.TableCol;
    labPostion.value = GetPara(data.Sys_MapData.AtPara, 'LabelPosition') || 'left';
    labAlign.value = GetPara(data.Sys_MapData.AtPara, 'LabelAlign') || 'left';
    //存储显示状态
    // const en = new BSEntity(FrmID.value, OID.value);
    // await en.Init();
    // await en.Retrieve();
    const GroupStatus = GetPara(mainData.value.AtPara, 'HideGroup') || '';
    if (GroupStatus == '') hideGroup.value = [];
    else hideGroup.value = GroupStatus.split(',');
    const AttrStatus = GetPara(mainData.value.AtPara, 'HideAttrs') || '';
    if (AttrStatus == '') hideAttrs.value = [];
    else hideAttrs.value = AttrStatus.split(',');

    treeData.value = [];
    //构造树形组件的数据
    let i = 0;
    groupFields.value.forEach((item) => {
      if (item.ParentOID == '' || item.ParentOID == null) {
        const index = hideGroup.value.findIndex((i) => i === item.OID.toString());
        if (index == -1 || hideGroup.value.length === 0) {
          let node = {
            ...item,
            title: item.Lab,
            index:(i + 1).toString(),
            key: item.OID,
            //isSaved: false,
            children: [],
            attrChildren: [],
            treeType: 'group', //用于判断切换节点时是否要保存
            selfIcon:item.Icon||''
          };
          if (item.CtrlType == 'Dir') {
            node.children = [...getGroupChildren(item.OID, (i + 1) + '.'), ...getAttrsChildren(item.OID.toString(), item.CtrlType,(i + 1) + '.')];
          } else if (item.CtrlType == '' || item.CtrlType == null) {
            node.children = [...getGroupChildren(item.OID, (i + 1) + '.'), ...getAttrsChildren(item.OID.toString(), item.CtrlType,(i + 1) + '.')];
          } else if (item.CtrlType == 'Attr') {
            node.attrChildren = getAttrsChildren(item.OID.toString(), item.CtrlType,(i + 1) + '.');
          }
          if (item.Lab != '封面')
            i++;
          if(node.children&&node.children.length>0)ShrinkKey.value.push(node.key);
          treeData.value.push(node);
        }
      }
    });
    console.log(ShrinkKey.value);

    CtrlType.value='-1';
    findFirstNode(treeData.value);
    //CtrlType.value = 'welcom';
  } catch (e) {
    errorObj.hasError = true;
    errorObj.tips = e as string;
    console.error(e);
  } finally {
    setTimeout(() => {
      loadReady.value = true;
    }, 50);
    loading.value = false;
  }
};
/**
 * @description 获得以ParentOID为父级的章节
 * @param ParentOID 父级OID
 */
const getGroupChildren = (ParentOID: number, ParentXuHao: string) => {
  let children = <any>[];
  let i = 1;
  groupFields.value.forEach((item) => {
    if (item.ParentOID === ParentOID.toString()) {
      const index = hideGroup.value.findIndex((i) => i === item.OID.toString());
      if (index == -1 || hideGroup.value.length === 0) {
        const child = {
          ...item,
          title: item.Lab,
          index:ParentXuHao + i,
          key: item.OID,
          //isSaved: false,
          children: [],
          attrChildren: [],
          treeType: 'group', //节点是一个章节
          selfIcon:item.Icon||'',
        };
        if (item.CtrlType == 'Dir') {
          child.children = [...getGroupChildren(item.OID, ParentXuHao + i + "."), ...getAttrsChildren(item.OID.toString(), item.CtrlType,ParentXuHao + i + ".")];
        } else if (item.CtrlType == '' || item.CtrlType == null) {
          child.children = [...getGroupChildren(item.OID, ParentXuHao + i + "."), ...getAttrsChildren(item.OID.toString(), item.CtrlType,ParentXuHao + i + ".")];
        } else if (item.CtrlType == 'Attr') {
          child.attrChildren = getAttrsChildren(item.OID.toString(), item.CtrlType,ParentXuHao + i + ".");
        }
        i++;
        if(child.children&&child.children.length>0)ShrinkKey.value.push(child.key);
        children.push(child);
      }
    }
  });
  return children;
};
/**
 * @description 获得GroupID下的字段，
 * @param GroupID 分组id
 * @param CtrlType 'Attr'返回所有可见字段，默认类型只返回文本字段
 */
const getAttrsChildren = (GroupID: string, CtrlType: string | null,ParentXuHao:string) => {
  const children = <any>[];
  let i = 1;
  attrs.value.forEach((item) => {
    if (item.GroupID.toString() === GroupID && item.UIVisible === 1) {
      const index = hideAttrs.value.findIndex((i) => i === item.KeyOfEn);
      if (index == -1 || hideAttrs.value.length === 0) {
        let child = item;
        child.key = item.KeyOfEn;
        child.title = item.Name;
        child.treeType = '';
        child.selfIcon=item.ICON&&item.ICON!='0'?item.ICON:'';
        if ((CtrlType == '' || CtrlType == null||CtrlType=='Dir') && item.TextModel != 1 && item.MyDataType == 1 && item.UIContralType == 0) {
          //默认类型的控件只显示文本字段
          child.treeType = 'rich'; //节点用文本编辑器解析
          child.index=ParentXuHao + i;
          children.push(child);
          i++;
        } else if (CtrlType == 'Attr') {
          //Attr类型显示其下所有字段
          child.treeType = 'attr'; //节点用MapAttrForm解析
          children.push(child);
        }
      }
    }
  });
  return children;
};
const findFirstNode = (list:any[])=>{
list.forEach((item)=>{
  if(item.children&&item.children.length>0&&firstNode.value==false){
    findFirstNode(item.children);
  }
  if(firstNode.value==false&&item.CtrlType!=''&&item.CtrlType!='Dir'&&item.CtrlType!=null){
    handleSelect({node:item},true);
    firstNode.value=true;
  }else if(firstNode.value==false&&item.treeType=='rich'){
    handleSelect({node:item},true);
    firstNode.value=true;
  }

})
}
//处理字段类型
const formatMapAttr = async () => {
  const mapExts = GetMapExtsGroup(frmData.value.Sys_MapExt);
  const eles = new FrmEleDBs();
  await eles.Retrieve(FrmEleDBAttr.RefPKVal, PKVal.value);
  //处理字段的下拉框
  for (const mapAttr of attrs.value) {
    mapAttr['type'] = 'input';
    mapAttr['rules'] = [];
    //mapExt的集合
    mapAttr.mapExts = mapExts[mapAttr.MyPK] || [];
    if ((mapAttr.LGType === FieldTypeS.Normal && mapAttr.UIContralType === UIContralType.DDL) || mapAttr.LGType === FieldTypeS.FK || mapAttr.LGType === FieldTypeS.Enum) {
      // const data = frmData.value.Sys_MapExt.filter((item) => item.ExtModel === 'ActiveDDL' && item.AttrsOfActive === mapAttr.KeyOfEn);
      // if (data.length > 0) {
      //   const ddl = await GetActionDLLData(mainData.value[data[0].AttrOfOper], data[0], props.params.WorkID, mainData.value);
      //   // const ddl = [];
      //   mapAttr.ddl = ddl;
      // } else {
      mapAttr['ddl'] = GetDDLOption(mapAttr as any) || [];
      // }
      mapAttr['mode'] = '';
      if (mapAttr.LGType === FieldTypeS.Enum && mapAttr.UIContralType === UIContralType.CheckBok) mapAttr['mode'] = 'multiple';
      mapAttr['ShowType'] = mapAttr['ddl'].length != 0 && mapAttr['ddl'][0].hasOwnProperty('ParentNo') ? 'Tree' : '';
    }
    //图片 例如肖像
    if (mapAttr.UIContralType === UIContralType.FrmImg) mainData.value[mapAttr.KeyOfEn] = await GetImgPath(mapAttr);
    //日期、日期时间类型
    if (mapAttr.MyDataType === DataType.AppDate || mapAttr.MyDataType === DataType.AppDateTime) {
      mapAttr.format = GetDateTimeOption(mapAttr as any);
      if (mapAttr.UIIsInput) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空', type: 'string' }];
      //数值类型
    } else if (mapAttr.MyDataType === DataType.AppFloat || mapAttr.MyDataType === DataType.AppDouble || mapAttr.MyDataType === DataType.AppMoney) {
      mapAttr['bit'] = parseInt(GetPara(mapAttr.AtPara, 'NumScale') || 2);
      if (mapAttr.UIIsInput) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空' }];
      //其他字段的必填
    } else {
      if (mapAttr.UIIsInput) mapAttr['rules'] = [{ required: true, message: mapAttr.Name + '值不能为空' }];
    }

    //含有正则表达式
    mapAttr.mapExts
      .filter((mapExt) => mapExt.ExtModel === 'BindFunction' && mapExt.ExtType === 'RegularExpression')
      .forEach((mapExt) => {
        mapAttr['rules'].push({
          pattern: new RegExp(/^[0-9]*$/, 'g'),
          message: mapExt.Tag2,
          trigger: mapExt.Tag,
        });
      });
    //字段附件，获取对应的附件信息
    let athSlns = [];
    if (!!frmData.value.WF_FrmNode) {
        const frmNode = frmData.value.WF_FrmNode[0];
        const athments = new FrmAttachmentExts();
        await athments.Retrieve('FK_MapData', frmNode.FK_Frm, 'FK_Node', frmNode.FK_Node);
        athSlns = athments;
      }
    if (mapAttr.UIContralType === UIContralType.AthShow) {
          const result = aths.value.filter((ath) => ath.MyPK === mapAttr.MyPK);
          if (result.length == 0) {
            mapAttr.ath = null;
            mainData.value[mapAttr.KeyOfEn] = '附件信息丢失,请联系管理员';
          }
          mapAttr.ath = result[0];
          if (athSlns.length != 0) {
            const result1 = athSlns.filter((ath) => ath.MyPK === mapAttr.MyPK + '_' + ath.FK_Node);
            if (result1.length != 0) {
              const ath = result1[0];
              ath.MyPK = mapAttr.ath.MyPK;
              mapAttr.ath = ath;
            }
          }
        }
    //评分
    if (mapAttr.UIContralType === UIContralType.Score) {
      if (mainData.value[mapAttr.KeyOfEn] == '') mainData.value[mapAttr.KeyOfEn] = 0;
      mapAttr.Tag2 = mapAttr.Tag2 || '5';
    }
    //是否可以清空填写
    mapAttr.clearable = parseInt(GetPara(mapAttr.AtPara, 'clearable') || '0') == 0 ? false : true;
    //后置说明
    mapAttr.suffix = GetPara(mapAttr.AtPara, 'suffix') || '';

    if (mapAttr.mapExts.length > 0) {
      //判断是不是存在小范围单选，小范围多选
      let data = mapAttr.mapExts.filter((item) => item.ExtModel === 'MultipleChoiceSmall' || item.ExtModel === 'SingleChoiceSmall');
      if (data.length > 0) {
        mapAttr['ddl'] = (await GetDataTableOfTBChoice(data[0], props.params.WorkID)) || [];
        mapAttr['type'] = 'select';
        mapAttr['mode'] = '';
        if (data[0].ExtModel === 'MultipleChoiceSmall' || data[0].ExtModel === 'MultipleChoiceSearch') {
          mapAttr['mode'] = 'multiple';
          mainData.value[mapAttr.KeyOfEn] = !mainData.value[mapAttr.KeyOfEn] ? [] : mainData.value[mapAttr.KeyOfEn].split(',');
        }
      }
    }

    mapAttr['eleDBs'] = eles.filter((ele) => ele.EleID === mapAttr.KeyOfEn);
    if (mapAttr['eleDBs'].length > 0) mainData.value[mapAttr.KeyOfEn] = mapAttr['eleDBs'].map((ele) => ele.Tag1).join(',');
  }
  mainData.value =await ConvertDataFromDB(mainData.value, attrs.value as any);
  generateWatermark();
};
const generateWatermark = () => {
    let mapExts = frmData.value.Sys_MapExt || [];
    mapExts = mapExts.filter((mapExt) => {
      return mapExt.ExtModel === 'FrmBodySecret';
    });
    let text = '';
    if (mapExts.length != 0) text = mapExts[0].Tag1;
    if (text.includes('@') == true) text = DealExp(text, mainData.value);
    if (!!text) watermark(text);
  };
/**
 * @description 获取所选的字段的数据
 * @param attrKey 字段的KeyOfEn
 */
const ChapterFrmShow = (attrKey) => {
  if (attrKey == null || attrKey == '') {
    return;
  }
  var handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
  handler.AddPara('FrmID', FrmID.value);
  handler.AddPara('PKVal', PKVal.value);
  handler.AddPara('KeyOfEn', attrKey);
  handler.AddPara('EntityType', EntityType.value);
  var data = handler.DoMethodReturnString('ChapterFrm_InitOneField');
  return data;
};

/**
 * @description 树形组件选择事件
 * @param e 点击事件，包含节点内容node
 */
const handleSelect = async (e,findFirst=false) => {
  try {
    // micro task 每执行一次宏任务 , 会清空所有的微任务队列 []
    loadReady.value = false;
    //连续点击同一个，防抖
    if (selectedKey.value == e.node.key) return;
    //先保存数据
    if (CtrlType.value === 'Attr' && props.fieldIsReadonly != true) {
      //保存Attr表单数据
      await saveAttr(selectedNode.value);
    } else if (selectedNode.value.treeType === 'rich' && props.fieldIsReadonly != true) {
      //保存Tinymce内容
      await saveData(selectedNode.value.key, selectedNode.value.value);
    } else if(CtrlType.value === 'Dtl'){
      //保存从表数据
      await Save();
    }
    //保存当前节点内容
    await nextTick();
    selectedNode.value = e.node;
    //保存当前节点类型，显示不同的内容
    CtrlType.value = e.node.CtrlType;
    if (e.node.treeType === 'rich') {
      //Tinymce解析内容
      const currentValue = await ChapterFrmShow(e.node.key);
      selectedNode.value.value = currentValue;
      CtrlType.value = 'rich';
    }
    if (CtrlType.value == 'Dtl') {
      //从表节点
      DtlInfo.value = frmData.value.Sys_MapDtl.filter((dtl)=>dtl.No===selectedNode.value.CtrlID&&dtl.IsView)[0];

    }
    if (CtrlType.value == 'Ath') {
      //附件节点
      AthInfo.value = frmData.value.Sys_FrmAttachment.filter((ath) => ath.MyPK == selectedNode.value.CtrlID && ath.IsVisable != '0' && ath.NoOfObj != 'FrmWorkCheck')[0];
    }
    if (CtrlType.value == 'Attr') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddPara('FK_MapData', FrmID.value);
      handler.AddPara('PKVal', PKVal.value);
      handler.AddPara('EntityType', EntityType.value)
      const result = await handler.DoMethodReturnJson('ChapterFrm_AttrInit');
      if (result.toString().indexOf('err@') > -1) {
        message.error(`获取Attr分组信息出错:${result}`);
        loadReady.value = true;
        return;
        // result = replaceAll(result, '\\\\\\"', '\\\\"');
        // data.MainTable[0] = JSON.parse(result);
      }
      frmData.value.MainTable[0] = await ConvertDataFromDB(result, attrs.value as any);
      mainData.value = await ConvertDataFromDB(result, attrs.value as any);
    }
    //更新选中节点的key，防抖
    selectedKey.value = e.node.key;
  } catch (e: any) {
    message.error(e.toString());
  } finally {
    if(findFirst)return;
    // macro task
    setTimeout(() => {
      loadReady.value = true;
    }, 50);
  }
};
 /**
   * 对从表求值
   * @constructor
   */
   const GetDtlMapExt = (dtlNo) => {
    return frmData.value.Sys_MapExt.filter((mapExt) => mapExt.ExtModel === 'NumEnterLimit' && mapExt.Doc === dtlNo) || [];
  };
  /**
   * 从表值改变
   * @param updatedData
   */
  const handleUpdate = (updatedData) => {
    mainData.value = updatedData;
  };
/**
 * @description Tinymce内容保存
 * @param e Tinymce内容
 */
const handleChange = (e) => {
  selectedNode.value.value = e;
};
/**
 * @description 保存Tinymce解析内容
 * @param attrKey 字段的KeyOfEn
 * @param attrValue 字段的值
 */
const saveData = async (attrKey, attrValue) => {

  if (attrKey == null || attrKey == '') {
    return;
  }
  //判断内存的值是否更新
  // const childIndex = parseInt(selectedNode.value.pos.toString().split('-')[1]);
  // const parentIndex = parseInt(selectedNode.value.pos.toString().split('-')[0]);
  // const oldVal = treeData.value[parentIndex].children[childIndex].value;
  // if (oldVal == selectedNode.value.value) return; //数据没有变化.
  // treeData.value[parentIndex].children[childIndex].value = selectedNode.value.value;
  // //判断是否有数据，控制节点后方的绿色对号
  // if (attrValue) treeData.value[parentIndex].children[childIndex].isSaved = true; //值不为零这个子节点有对号
  // else treeData.value[parentIndex].children[childIndex].isSaved = false;
  // //判断父节点是否有对号
  // const parentIsSave = ref<boolean>(true);
  // treeData.value[parentIndex].children.forEach((item) => {
  //   parentIsSave.value = parentIsSave.value && item.isSaved;
  // });
  // treeData.value[parentIndex].isSaved = parentIsSave.value;
  // var loading = layer.msg('正在保存中', { icon: 16, shade: 0.3 });
  var handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
  handler.AddPara('FrmID', FrmID.value);
  handler.AddPara('PKVal', PKVal.value);
  handler.AddPara('KeyOfEn', attrKey);
  handler.AddPara('Vals', attrValue);
  handler.AddPara('EntityType', EntityType.value);
  const data = await handler.DoMethodReturnString('ChapterFrm_SaveOneField');
  if (data.toString().indexOf('err@') == 0) {
    alert(data);
    return;
  }
};
/**
 * @description 保存Attr类型分组的内容
 */
const saveAttr = async (node) => {
  try {
    let formData:Recordable<any> = {};
    formData = await VerifyFormData(true)||{};
    if(Object.keys(formData).length==0){
      throw new Error('数据格式有误！');

    }
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddPara('PKVal', PKVal.value);
    handler.AddPara('FrmID', FrmID.value);
    handler.AddJson(formData);
    handler.AddJson(props.params); //params:{}
    handler.AddPara('GroupID', node.key.toString());
    handler.AddPara('EntityType',EntityType.value);
    const data = await handler.DoMethodReturnString('ChapterFrm_SaveAttr');
    if (data.toString().indexOf('err@') == 0) {
      alert(data);
      return;
    }
    const en = new Entity(FrmID.value, PKVal.value);
    await en.Init();
    en.setPara('HideGroup', hideGroup.value.join(','));
    en.setPara('HideAttrs', hideAttrs.value.join(','));
    await en.Update();
  } catch (e) {
    message.error(`保存失败：${e}`);
    return false;
  } finally {
    message.success('保存Attr分组成功');
  }
};
/**
 * 校验Attr
 */
 const VerifyFormData = async (isOnlySave = false) => {
    //更改数据字段值的类型
    let rowData: any = {};
    if (AttrRef.value != undefined) {
      if (Array.isArray(AttrRef.value)) rowData = AttrRef.value[0].mainData;
      else rowData = AttrRef.value.mainData;
    }
    const resultData = await ConvertDataToDB(rowData, attrs.value as any);
    resultData.AtPara = mainData.value.AtPara;
    let result = true;
    let msg = '';
    //校验文本字段的输入长度是否超出数据库设置的长度
    attrs.value
      .filter((mapAttr) => mapAttr.MyDataType === DataType.AppString)
      .forEach((mapAttr) => {
        if (resultData[mapAttr.KeyOfEn] != null && resultData[mapAttr.KeyOfEn] != '' && resultData[mapAttr.KeyOfEn].length > mapAttr.MaxLen)
          msg += '字段' + mapAttr.Name + '输入字段的长度不能超过' + mapAttr.MaxLen + `位,	
`;
      });
    if (msg != '') {
      message.error(msg);
      return null;
    }
    //校验必填,只有发送的时候校验必填
    if (isOnlySave == false) {
      attrs.value
        .filter((mapAttr) => mapAttr.UIIsInput === 1)
        .forEach((mapAttr) => {
          if (mapAttr.LGType === FieldTypeS.Enum && resultData[mapAttr.KeyOfEn] === -1) msg += '字段' + mapAttr.Name + `值不能为空,	
`;
          if (resultData[mapAttr.KeyOfEn] === null || resultData[mapAttr.KeyOfEn] === '') msg += '字段' + mapAttr.Name + `值不能为空,	
`;
        });
      if (msg != '') {
        message.error(msg);
        return null;
      }
    }
    //保存从表
    if (frmData.value.Sys_MapDtl.length > 0) {
      for (const dtl of frmData.value.Sys_MapDtl) {
        let refDtl = instance?.refs['dtl' + dtl.No];
        if (!!refDtl && Array.isArray(refDtl)) refDtl = refDtl[0];
        if (!!refDtl) {
          const data = await refDtl.SaveAll(isOnlySave);
          if (data == false) result = false;
        }
      }
    }
    //校验附件
    if (aths.value.length > 0) {
      for (const ath of aths.value) {
        let refAth = instance?.refs['ath' + ath.MyPK];
        if (!!refAth && Array.isArray(refAth)) refAth = refAth[0];
        if (!!refAth) {
          const data = refAth.CheckAth();
          if (data == false) result = false;
        }
      }
    }
    //校验正则
    //保存审核组件
    // if (isHaveEditWorkCheck.value == true) {
    //   if (isHaveSignCheck.value == true) {
    //     //if (basicData.value == undefined) result = TabbasicData.value.WorkCheckSave(isOnlySave);
    //     //else result = await basicData.value.WorkCheckSave(isOnlySave);
    //   } else {
    //     if (workCheck.value == undefined) result = tabWorkCheck.value.WorkCheckSave(isOnlySave);
    //     else {
    //       if (Array.isArray(workCheck.value)) result = await workCheck.value[0].WorkCheckSave(isOnlySave);
    //       else result = await workCheck.value.WorkCheckSave(isOnlySave);
    //     }
    //   }
    // }
    if (result != true) {
      return null;
    }

    return resultData;
  };
/**
 * 如果当前打开的是Attr类型的章节，可以使用工具栏的保存按钮来保存这一章节
 */
const Save = async() => {
  if (CtrlType.value === 'Attr') {
    await saveAttr(selectedNode.value);
  }
  if (CtrlType.value === 'ChapterFrmLinkFrm') {
    await LinkFrmRef.value?.Save();
  }
  if (CtrlType.value === 'rich') {
    //保存Tinymce内容
    await saveData(selectedNode.value.key, selectedNode.value.value);
  }
  if(CtrlType.value === 'Dtl'){
    //保存从表
    let refDtl = instance?.refs['dtl' + selectedNode.value.CtrlID];
    if (!!refDtl && Array.isArray(refDtl)) refDtl = refDtl[0];
    if (!!refDtl) {
      await refDtl.SaveAll(true);
    }
  }
  return true;
};
/**
 * 获取枚举、外键、外部数据源的选择集合
 * @param mapAttr
 * @constructor
 */
const GetDDLOption = (mapAttr: MapAttrExt) => {
  let uiBindKey = mapAttr.UIBindKey || '';
  if (uiBindKey == '')
    return [
      {
        value: mainData.value[mapAttr.KeyOfEn],
        label: '绑定的外键枚举值丢失',
      },
    ];
  const options: any[] = [];
  let data = frmData.value[mapAttr.KeyOfEn];
  if (data == undefined) data = frmData.value[mapAttr.UIBindKey];
  //枚举字段
  if (data == undefined && mapAttr.LGType === FieldTypeS.Enum) {
    const myEnums = frmData.value.Sys_Enum.filter((sysEnum) => sysEnum.EnumKey == uiBindKey);
    if ((mapAttr.UIIsInput === 0 || mapAttr.DefVal === '-1') && mapAttr.UIContralType == UIContralType.DDL) {
      options.push({
        value: -1,
        label: '-无-',
      });
    }
    myEnums.forEach((item) => {
      options.push({
        value: item.IntKey,
        label: item.Lab,
      });
    });
    return options;
  }
  //只读的状态时
  if (data == undefined && (props.isReadonly == true || mapAttr.UIIsEnable == 0)) {
    let valText = mainData.value[mapAttr.KeyOfEn + 'Text'] || '';
    if (valText == '') valText = mainData.value[mapAttr.KeyOfEn + 'T'] || '';
    return [
      {
        value: mainData.value[mapAttr.KeyOfEn],
        label: valText,
      },
    ];
  }
  if (data == undefined)
    return [
      {
        value: '',
        label: '请选择',
      },
    ];
  if (data.length != 0 && data[0].hasOwnProperty('ParentNo') == true) {
    //转成树形结构
    const { listToTree } = useTreeConvert();
    const treeData = listToTree('0', data) || [];
    return treeData;
  } else {
    if (mapAttr.UIIsInput === 0)
      options.push({
        value: '',
        label: '-无-',
      });
    data.forEach((item) => {
      options.push({
        value: item.No,
        label: item.Name,
      });
    });
  }
  return options;
};
/**
 * 时间类型格式
 * @param mapAttr
 * @constructor
 */
const GetDateTimeOption = (mapAttr: MapAttrExt) => {
  switch (parseInt(mapAttr.IsSupperText)) {
    case 0:
      return 'YYYY-MM-DD';
    case 1:
      return 'YYYY-MM-DD HH:mm';
    case 2:
      return 'YYYY-MM-DD HH:mm:ss';
    case 3:
      return 'YYYY-MM';
    case 4:
      return 'HH:mm';
    case 5:
      return 'HH:mm:ss';
    case 6:
      return 'MM-DD';
    case 7:
      return 'YYYY';
    case 8:
      return 'MM';
    default:
      return 'YYYY-MM-DD';
  }
};
/**
 * 获取图片路径
 * @param mapAttr
 * @constructor
 */
const GetImgPath = async (mapAttr) => {
  const frmImg = new FrmImg(mapAttr.MyPK);
  const result = await frmImg.RetrieveFromDBSources();
  if (result == 0) {
    message.error('图片控件[' + mapAttr.Name + ']信息丢失，请联系管理员');
    return '';
  }
  //数据来源为本地.
  let imgSrc = '';
  if (frmImg.ImgSrcType == 0) {
    //替换参数
    let frmPath = frmImg.ImgPath;
    frmPath = frmPath.replace('＠', '@');
    frmPath = frmPath.replace(/@basePath/g, '/resource/');
    imgSrc = DealExp(frmPath, mainData.value);
  }

  //数据来源为指定路径.
  if (frmImg.ImgSrcType == 1) {
    let url = frmImg.ImgURL;
    url = url.replace('＠', '@');
    url = url.replace(/@basePath/g, '/resource/');
    imgSrc = DealExp(url, mainData.value);
  }
  // 由于火狐 不支持onerror 所以 判断图片是否存在放到服务器端
  if (imgSrc == '' || imgSrc == null) imgSrc = '/resource/CompanyImgLogo/cc_logo.png';
  return imgSrc;
};
/**
 * 展开折叠
 * 通过置空key值数组使折叠按钮生效
 */
const ShrinkKey = ref<any[]>([]);
const handleShrink = () => {
  if (ShrinkKey.value.length > 0) {
    ShrinkKey.value.length = 0
  } else {
    handleGetKey(treeData.value);
  }
}
const handleExpand = (key) => {
  if (ShrinkKey.value.indexOf(key))
    ShrinkKey.value = key;
}
/**
 *递归获得所有树结构key值，并通过key值数组ShrinkKey.value使父节点默认展开
 */

const handleGetKey = (list) => {
  const find = (arr) => {
    arr.forEach(item => {
      ShrinkKey.value.push(item.key)
      if (item.children&&item.children.length > 0) {
        find(item.children);
      }
    })
  }
  find(list);
}
handleGetKey(treeData.value);
/**
 * @description 打开设置弹窗
 */
const handleSetting = () => {
  settingModal.modalVisible = true;
};
/**
 * @description 关闭设置弹窗
 * @description 保存弹窗数据
 * @description 刷新本页面
 */
const handleSettingOk = async () => {
  try {
    await ChapterFrmSettingRef.value?.SaveSetting();
    settingModal.modalVisible = false;
    message.success('保存成功');
    InitPage();
  } catch (e) {
    message.error(`保存失败：${e}`);
    return;
  }
};
InitPage();
//抛出保存Attr类型分组的方法，用于ToolBar的保存按钮
defineExpose({ Save,VerifyFormData });
</script>

<style lang="less" scoped>
.toolBar {
  background-color: white;
  position: fixed;
  width: 100%;
  height: 50px;
  z-index: 1000;
}

.layout_header {
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  .flow-logo {
    margin-right: auto;
    width: 115px;
  }

  .flow-btn {
    margin: 0 5px;
  }
}

.divider {
  margin: 0;
}

.welcom {
  color: rgb(9, 109, 217);
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  .ccflow {
    font-size: 50px;
    font-weight: 800;
  }

  .text {
    font-size: 30px;
  }
}
</style>
