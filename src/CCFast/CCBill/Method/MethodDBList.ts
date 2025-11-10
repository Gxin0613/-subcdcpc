import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MethodAttr } from '../Method/Method';
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { PCenters } from '../../GPM/PCenter/PCenter';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';
import { SFDBSrc } from '/@/WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';

// 二维码
export class MethodDBList extends EntityNoName {
  constructor(no?: string) {
    // super("bp.demo.MethodQRCode","TS.Demo.BPFramework.MethodQRCode");
    super('TS.CCBill.MethodDBList');
    this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Frm_Method', '数据列表');

    map.AddGroupAttr('基础设置');
    //主键.
    map.AddTBStringPK(MethodAttr.No, null, '编号', true, true, 0, 50, 10);
    map.AddTBString(MethodAttr.Name, null, '方法名', true, false, 0, 300, 10);
    map.AddTBString(MethodAttr.MethodID, null, '方法ID', true, true, 0, 300, 10);
    map.AddTBString(MethodAttr.GroupID, null, '分组ID', true, true, 0, 50, 10);

    //功能标记.
    map.AddTBString(MethodAttr.MethodModel, null, '模式', true, true, 0, 300, 10);
    map.AddTBString(MethodAttr.Mark, null, '查询日期字段', true, false, 0, 300, 10);
    map.SetHelperAlert('Mark', '可以为空,用户日期范围查询.');
    map.AddTBString(MethodAttr.Icon, null, '图标', true, false, 0, 50, 10, true);
    map.AddDDLEntities('DBSrcNo', 'local', '数据源', new SFDBSrc(), true, null, false);
    map.AddTBStringDoc(MethodAttr.Docs, null, 'SQL数据', true, false, true);
    map.SetHelperAlert(MethodAttr.Docs, '支持表达式：@WebUser.No,@WebUser.Name,@WebUser.Dept,@WebUser.DeptName,@单记录的字段ID');
    map.AddTBString(MethodAttr.Tag1, null, '字段列对应', true, false, 0, 500, 10, true);
    map.SetHelperAlert('Tag1', '格式:@Tel=电话,@Email=邮件');

    map.AddGroupAttr('弹窗');
    map.AddTBString('Tag2', null, '焦点字段', true, false, 0, 100, 10, true);
    map.SetHelperAlert('Tag2', '点击该字段弹出窗体.');

    map.AddTBString('Tag3', null, '弹窗链接URL', true, false, 0, 100, 10, true);
    map.SetHelperAlert('Tag3', '弹窗的url.');

    const model = '@0=弹窗-强制关闭@1=新窗口打开-winopen模式@2=弹窗-非强制关闭@3=执行指定的方法.@4=不打开@5=抽屉30%@6=抽屉50%@7=抽屉70%@8=抽屉90%';
    map.AddDDLSysEnum('Tag4', 6, '打开方式', true, true, 'OpenModel', model);
    map.AddTBString('Tag5', null, '弹窗方法', true, false, 0, 300, 60, false);
    let msg = '首先在写一个函数，放入到:/DataUser/JSLab/SearchSelf.js里面 ';
    msg += `	
 该函数里 OpenIt(传入一个已经计算好的url);`;
    msg += `	
 比如您写一个方法: OpenItMyUrl(url);`;
    map.SetHelperAlert('Tag5', msg);
    // map.AddBoolean(MethodAttr.IsMyBillToolBar, true, '是否显示在MyBill.htm工具栏上', true, true, true);
    // map.AddBoolean(MethodAttr.IsMyBillToolExt, false, '是否显示在MyBill.htm工具栏右边的更多按钮里', true, true, true);
    // map.AddBoolean(MethodAttr.IsSearchBar, false, '是否显示在Search.htm工具栏上(用于批处理)', true, true, true);
    map.ParaFields = ',DBSrcNo,';
    map.AddTBAtParas();
    map.AddRM_DtlSearch('权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '', 'icon-drop', true);

    this._enMap = map;
    return this._enMap;
  }
}

//分析人员授权s
export class MethodDBLists extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new MethodDBList();
  }
  constructor() {
    super();
  }
}
