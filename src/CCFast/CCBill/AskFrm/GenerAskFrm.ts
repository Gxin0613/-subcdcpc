import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GPE_Welcome } from './GPE_Welcome';
import { GPE_SaveAfterTodo } from './GPE_SaveAfterTodo';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import HttpHandler from '/@/utils/gener/HttpHandler';

// 调查问卷
export class GenerAskFrm extends EntityMyPK {
  constructor(no?: string) {
    super('TS.CCBill.GenerAskFrm');
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
    const map = new Map('Frm_GenerAskFrm', '活动');

    map.AddGroupAttr('基本设置');
    map.AddMyPK(); //主键,是调查问卷的从表.
    map.AddTBString('FrmID', null, '单据ID', true, true, 0, 100, 10);
    map.AddTBString('FrmName', null, '单据名称', true, true, 0, 200, 10);

    map.AddTBString('FlowNo', null, '流程编号', true, true, 0, 100, 10);
    map.AddTBString('FlowName', null, '流程名称', true, true, 0, 200, 10);

    // AskBillInside，AskExamInside，AskBillOutside，AskExamOutside, AskFlowOutside, AskFlowInside

    map.AddDDLStringEnum('AskFrmApp', null, '应用类型', '@AskBill=信息采集@AskExam=考卷测评@AskFlow=流程', false);
    map.AddDDLStringEnum('UserType', null, '用户类型', '@Outside=外部用户@Inside=内部用户', false);
    map.AddDDLSysEnum('DBTime', 0, '填写次数', true, false, 'DBTime', '@0=单次@1=多次');
    map.AddTBString('Title', null, '问卷标题', true, false, 0, 200, 10);

    map.AddDDLSysEnum('AskFrmState', 0, '状态', false, false, 'AskFrmState', '@0=设计中@1=运行中@2=已完成');
    map.AddTBString('SaveAfterTodo', null, '保存之后的处理', false, false, 0, 100, 100, true);
    map.AddTBString('SaveAfterDoc', null, '处理内容', false, false, 0, 100, 100, true);

    map.AddTBInt('WelcomeModel', 0, '欢迎词模式', false, false, false);
    map.AddTBString('WelcomeDoc', null, '欢迎词', false, false, 0, 100, 100, true);

    map.AddTBDateTime('DTFrom', null, '日期从', true, false);
    map.AddTBDateTime('DTTo', null, '到', true, false);

    map.AddGroupAttr('运行数据');
    map.AddTBInt('NumRelEmp', 0, '下发人数', true, true);
    map.AddTBInt('NumVisite', 0, '访问人数', true, true);
    map.AddTBInt('NumSubmit', 0, '提交人数', true, true);

    map.AddTBFloat('AvgCent', 0, '平均分值', true, true);

    map.AddGroupAttr('系统信息');
    map.AddTBDateTime('RDT', null, '记录日期', true, true);
    map.AddTBString('RecNo', null, '记录人', false, false, 0, 200, 150);
    map.AddTBString('RecName', null, '记录人名称', true, true, 0, 200, 150);

    //问卷模式.
    map.AddGroupMethod('问卷设置');
    map.AddRM_GPE(new GPE_Welcome(), 'icon-drop');
    map.AddRM_GPE(new GPE_SaveAfterTodo(), 'icon-drop');
    // map.AddRM_GPE(new GPE_RecAddModel(), 'icon-drop'); 记录增加方式？

    map.AddGroupMethod('分享方式');
    //  map.AddRM_HelpDocs('生成链接', '?FrmID=@No&Type=Link', '我的链接');
    //  map.AddRM_HelpDocs('微信二维码', '?FrmID=@No&Type=WX', '我的链接');
    // map.AddRM_HelpDocs('QQ二维码', '?FrmID=@No&Type=QQ', '我的链接');

    const rm = new RefMethod();
    rm.Title = '微信二维码';
    rm.ClassMethod = 'WXQRCode';
    rm.RefMethodType = RefMethodType.Func;
    rm.IsCanBatch = false;
    rm.IsForEns = false;
    map.AddRefMethod(rm);

    map.AddTBAtParas(500);
    this._enMap = map;
    return this._enMap;
  }

  //生成微信二维码.
  public async WXQRCode(): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
    handler.AddPara('MyPK', this.MyPK);
    handler.AddPara('WebUrl', 'http://127.0.0.1'); //@lyc
    return await handler.DoMethodReturnString('GenerAskFrm_WXQRCode_Gener');
  }
  public async UrlShare(): Promise<string> {
    const url = 'http://localhost:3000/XX?AskFrmMyPK=' + this.MyPK;
    return url;
  }
}

//调查问卷s
export class GenerAskFrms extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new GenerAskFrm();
  }
  constructor() {
    super();
  }
}
