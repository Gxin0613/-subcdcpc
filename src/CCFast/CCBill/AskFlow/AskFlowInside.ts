import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GPE_Welcome } from '../AskFrm/GPE_Welcome';
import { GPE_SaveAfterTodo } from '../AskFrm/GPE_SaveAfterTodo';

// 调查问卷
export class AskFlowInside extends EntityMyPK {
  constructor(no?: string) {
    super('TS.AskFrm.AskFlowInside');
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
    const map = new Map('Frm_GenerAskFrm', '流程内部人员');

    map.AddGroupAttr('基本设置');
    map.AddMyPK(); //主键,是调查问卷的从表.
    map.AddTBString('FrmID', null, '单据ID', true, true, 0, 100, 10);
    map.AddTBString('FrmName', null, '单据名称', true, true, 0, 200, 10);
    map.AddTBString('Title', null, '问卷标题', true, false, 0, 300, 10);

    //map.AddDDLSysEnum('AskModel', 0, '问卷模式', true, false, 'AskModel', '@0=信息采集模式@1=考卷模式');
    //map.AddDDLSysEnum('UserScrop', 0, '用户范围', true, true, 'UserScrop', '@0=微信用户@1=内部用户');

    map.AddDDLSysEnum('AskFrmState', 0, '状态', true, true, 'AskFrmState', '@0=设计中@1=运行中@2=已完成');
    map.AddDDLSysEnum('DBTime', 0, '次数模式', true, false, 'DBTime', '@0=单次@1=多次');

    const helpDBTimeModel = ` 
    ##### 单次
    - 说明:一个账号一个活动仅填写一次.
    - 比如:
    - 1. 员工家庭信息采集表
    - 2. 关于xxx的征集意见.
    - 3. 年度绩效考核自评
    - 4. 员工满意度调查
    ##### 多次
    - 说明：一个账号可以填写多次.
    - 比如:
    - 1.内部建议箱.
    - 2.项目进度更新
    - 3.日常工作汇报.
    `;
    map.SetHelperAlert('DBTime', helpDBTimeModel);

    map.AddTBString('SaveAfterTodo', null, '保存之后的处理', false, false, 0, 100, 100, true);
    map.AddTBString('SaveAfterDoc', null, '处理内容', false, false, 0, 100, 100, true);

    map.AddTBInt('WelcomeModel', 0, '欢迎词模式', false, false, false);
    map.AddTBString('WelcomeDoc', null, '欢迎词', false, false, 0, 100, 100, true);

    map.AddTBDateTime('DTFrom', null, '日期从', true, false);
    map.AddTBDateTime('DTTo', null, '到', true, false);

    map.AddGroupAttr('运行数据');
    map.AddTBInt('NumVisite', 0, '访问人数', true, true);
    map.AddTBInt('NumSubmit', 0, '提交人数', true, true);
    map.AddTBFloat('AvgCent', 0, '平均分值', true, true);

    map.AddGroupAttr('系统信息');
    map.AddTBDateTime('RDT', null, '记录日期', true, true);
    map.AddTBString('RecNo', null, '记录人', false, false, 0, 200, 150);
    map.AddTBString('RecName', null, '记录人名称', true, true, 0, 200, 150);
    map.AddTBAtParas(500);

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

    map.AddRM_EnOnly('下发', 'TS.AskFrm.RelToEmp', '@MyPK', 'icon-plane');
    this._enMap = map;
    return this._enMap;
  }

  //生成微信二维码.
  public async WXQRCode(): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
    handler.AddPara('MyPK', this.MyPK);
    handler.AddPara('WebUrl', 'http://wwww:9090/'); //@lyc
    return await handler.DoMethodReturnString('GenerAskFrm_WXQRCode_Gener');
  }
}

//调查问卷s
export class GenerAskFrms extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new AskFlowInside();
  }
  constructor() {
    super();
  }
}
