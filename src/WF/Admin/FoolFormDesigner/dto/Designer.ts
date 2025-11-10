import HttpHandler from '/@form/dto/HttpHandler';
import { DesignerInfo } from '/@form/props/database/FormInfo';
import { useRoute } from 'vue-router';
import { FormGroup } from '/@form/props/form/FormComponents';
import { useDesignerStore } from '/@/store/modules/form';
import { actualComponents, GroupType, FieldType, InputType, customizeTypes } from '/@form/props/type-map/FormTypeMap';
import { syncFieldProps, syncGroupProps, getCorrectKey } from '/@form/props/type-utils/FormTypeUtils';
import useWidgetHelper from '/@form/hooks/useWidgetsHelper';
import { DBEnums } from '/@form/props/database/DatabaseFormItem';
import { MapAttr as TSMapAttr } from '../../FrmLogic/MapAttrs/MapAttr';
import { GroupField as TSGroupField } from '../../FrmLogic/GroupField';
import { message } from 'ant-design-vue';
// 表单设计器，继承自HttpHandler
// 这个类的职责就是更新设计器数据
// 更新表单设置之类的应该由Entity类或其子类负责

type FieldType = {
  key: string;
  category: string;
};
let retryCount = 3;
export default class Designer {
  // 相应
  private data: DesignerInfo = {
    Sys_FrmAttachment: [],
    Sys_GroupField: [],
    Sys_MapAttr: [],
    Sys_MapData: [],
    Sys_MapDtl: [],
    Sys_MapExt: [],
    Sys_MapFrame: [],
  };

  private route = useRoute();

  constructor() {}

  // 获取数据，这里是设计器的专有数据
  private async fetchData() {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner');
      const { IsFirst, FrmID, FK_Flow, FK_Node } = this.route.query;
      handler.AddPara('IsFirst', IsFirst || '');
      handler.AddPara('FK_MapData', FrmID || '');
      handler.AddPara('FK_Flow', FK_Flow || '');
      handler.AddPara('FK_Node', FK_Node || '0');
      this.data = await handler.DoMethodReturnJson('Designer_Init');
    } catch (e: any) {

      message.error(e);
      // const s=e.toString();
      // if (s.includes('err@'))
      // if (e.toString(())
      console.error(e);
    }
  }

  // 转换成组件列表
  private convertToList = async () => {
    const widgetHelper = useWidgetHelper();
    const { Sys_MapAttr, Sys_GroupField, Sys_MapFrame } = this.data;
    const reqList: Promise<any>[] = [];
    const currGroupIdList = Sys_GroupField.filter((sg) => !sg.CtrlType || sg.CtrlType === 'Attr').map((sg) => Number(sg.OID)); // 当前所有的普通分组id

    let defaultGroupID = -1;
    // 先判断是不是有分组,没有先创建一个
    if (currGroupIdList.length == 0) {
      const sg = new TSGroupField();
      sg.SetValByKey('FrmID', this.route.query['FrmID']);
      await sg.Insert();
      defaultGroupID = sg.OID;
      // 默认 = 第1个
    } else {
      defaultGroupID = currGroupIdList[0];
    }
    for (const attr of Sys_MapAttr) {
      // 如果是异常的分组id,则插入到默认的分组
      if (attr.GroupID == '' || attr.GroupID == null || attr['GroupID'] == '0' || !currGroupIdList.includes(Number(attr.GroupID))) {
        const fAttr = new TSMapAttr(attr.MyPK);
        await fAttr.Retrieve();
        fAttr.SetValByKey('GroupID', defaultGroupID);
        reqList.push(fAttr.Update());
      }
    }

    if (reqList.length > 0 && retryCount-- > 0) {
      await Promise.all(reqList);
      await this.fetchData();
      return await this.convertToList();
    }

    const widgets: Array<FormGroup> = [];
    // 这里应该排除分组id的，但是创建出来的东西有bug
    // const groupKeys = Sys_GroupField.map(group => group.CtrlID)
    for (const group of Sys_GroupField) {
      try {
        // 获取前端分组类型，如果没找到对应类型则跳过
        const groupInfo = GroupType.get(group.CtrlType) || { category: 'container', key: 'groupfield' };
        // 找到分组实际对应的前端组件，没找到跳过
        const item = actualComponents.filter((component) => component.category == groupInfo.category && component.key == groupInfo.key)[0];
        if (!item) continue;
        // 同步后端字段属性到前端
        const groupElem = syncGroupProps(widgetHelper.mergeWidgetObject(item), group, Sys_MapFrame);
        // // 如果是附件，判断下是不是需要显示，从Sys_FrmAttachment取值
        // if (group.CtrlType === 'Ath') {
        //   const attachment = Sys_FrmAttachment.find((attachment) => attachment.MyPK === group.CtrlID);
        //   if (!attachment) continue;
        //   groupElem.visible = attachment.IsVisable == '1';
        //   groupElem.fileType = attachment.FileType + '';
        // } else if (group.CtrlType == '') {
        //   groupElem.visible = group.ShowType == 0;
        // }
        // 找到分组下所有属性字段
        // const MapEntities = Sys_MapAttr.filter(attr => attr.GroupID == group.OID && !groupKeys.includes(attr.MyPK))
        const MapEntities = Sys_MapAttr.filter((attr) => attr.GroupID == group.OID);
        // 循环遍历所有子组件属性，同步后端属性到前端
        for (const MapEntity of MapEntities) {
          let fieldInfo: Nullable<FieldType> = null;
          if (MapEntity.UIContralType > 3) {
            fieldInfo = customizeTypes.field;
            if (MapEntity.UIContralType === DBEnums.BigText) {
              fieldInfo = FieldType.get(DBEnums.BigText);
            }
          } else {
            fieldInfo = FieldType.get(MapEntity.UIContralType);
          }
          // 找到控件类型，如果没找到跳过
          if (!fieldInfo) {
            continue;
          }
          // 深拷贝
          fieldInfo = JSON.parse(JSON.stringify(fieldInfo));
          // 同步字段属性
          fieldInfo!.key = getCorrectKey(fieldInfo!.key, MapEntity.KeyOfEn);
          // 获取此类型字段的在前端定义的基本属性
          let pageWidget = actualComponents.filter((pw) => pw.category === fieldInfo!.category && pw.key === fieldInfo!.key)[0];
          if (!pageWidget) {
            continue;
          }
          pageWidget = JSON.parse(JSON.stringify(pageWidget));
          if (MapEntity.UIContralType == DBEnums.TB) {
            pageWidget.key = <string>InputType.get(MapEntity.MyDataType);
          }
          // 添加到分组字段
          groupElem.children.push(syncFieldProps(widgetHelper.mergeWidgetObject(pageWidget), MapEntity));
        }
        if (Array.isArray(groupElem.children) && groupElem.children.length > 0) {
          groupElem.children = groupElem.children.sort((prev, curr) => prev.Idx - curr.Idx);
        }
        widgets.push(groupElem as unknown as FormGroup);
      } catch (err) {
        console.error(err);
      }
    }
    return widgets;
  };

  // 更新设计器数据
  public async Init() {
    const store = useDesignerStore();
    store.mapExtList = [];
    store.widgetsList = [];
    try {
      await this.fetchData();
      // 更新组件列表
      store.mapExtList = this.data.Sys_MapExt;
      store.athInfoList = this.data.Sys_FrmAttachment;
      store.widgetsList = await this.convertToList();
    } catch (e: any) {
      store.mapExtList = [];
      store.widgetsList = [];
    }
  }
}
