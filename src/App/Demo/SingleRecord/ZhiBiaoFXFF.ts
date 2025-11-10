import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';

// 分析方法
export class ZhiBiaoFXFF extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.ZhiBiaoFXFF');
    if (!!pkval) this.setPKVal(pkval);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    //检查是否有部门编号?
    // if (await WebUser.CheckIsHaveDeptNo('1001')==true)
    // uac.OpenAll();
    //检查是否有岗位编号?
    //if (await WebUser.CheckIsHaveStationNo('1001')==true)
    uac.OpenAll();
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_ZhiBiaoFXFF', '分析方法及依据');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 4, 4, 80); //如果设置自动编号字段必须是只读的.
    map.AddTBString('Mark', null, '助记码', true, true, 0, 4, 50);
    map.AddTBString('Name', null, '分析方法及依据', true, true, 0, 200, 100, true);
    map.AddTBString('EnVer', '1', '版本号', true, true, 0, 4, 50);
    map.AddDDLSysEnum('EnSta', 0, '版本状态', true, false, 'EnSta', '@0=当前版本@1=历史版本可用@2=不可用', '', false, 50);

    map.AddTBString('ZhiBiaoNo', null, '项目编号', true, true, 0, 4, 50);
    map.AddTBString('ZhiBiaoName', null, '项目名称', true, true, 0, 150, 100);

    map.AddGroupAttr('采样信息');
    map.AddTBFloat('FeeCaiYang', 0, '采样费', true, true);
    map.AddBoolean('IsDDCY', false, '单独采样', true, true);
    map.AddTBInt('YB_YXQDays', 15, '样本保存有效期天', true, false);
    map.AddTBInt('YB_YXQHours', 0, '小时', true, false);
    map.AddTBString('GDJBH', null, '固定剂编号', true, false, 0, 150, 100);

    map.AddGroupAttr('分析信息');
    map.AddTBFloat('JCX_Up', 0, '检出上限', true, false);
    map.AddTBFloat('JCX_Down', 0, '检出下限', true, false);

    map.AddTBFloat('FeeOfFenXi', 0, '分析费', true, false);
    map.AddTBFloat('FeeOfQCL', 0, '前处理费', true, false);
    map.AddTBFloat('FeeOfKaiJi', 0, '开机费', true, false);

    map.AddBoolean('IsHaveZKY', false, '有质控样', true, true);
    map.AddBoolean('IsHaveBlankYB', false, '有空白样本', true, true);
    map.AddBoolean('IsHaveBZQX', false, '有标准曲线模版', true, true);
    map.AddTBInt('HYDays', 2, '分析需要的天数', true, false);
    map.AddTBString('JLDW', 'mg/l', '计量单位', true, false, 0, 50, 50);
    map.AddTBFloat('ValOfJC', 0, '检出限', true, false);

    map.AddGroupAttr('计量认证信息');
    map.AddTBDate('YXQFrom', null, '计量认证有效期从', true, false);
    map.AddTBDate('YXQTo', null, '到', true, false);

    //版本的状态.
    map.AddSearchAttr('EnSta');

    const rm = new RefMethod();
    rm.Title = '生成新版本';
    rm.ClassMethod = 'GenerVer';
    rm.RefMethodType = RefMethodType.FuncToolbar;
    rm.Warning = '您确定要执行吗？ ';
    rm.IsCanBatch = false; //是否允许批处理，在Search.vue组件里.
    rm.IsForEns = false;
    map.AddRefMethod(rm);

    const rm1 = new RefMethod();
    rm1.Title = '设置主版本';
    rm1.ClassMethod = 'SetMainVer';
    rm1.RefMethodType = RefMethodType.FuncToolbar;
    rm1.Warning = '您确定要执行吗？ ';
    rm1.IsCanBatch = false; //是否允许批处理，在Search.vue组件里.
    rm1.IsForEns = false;
    map.AddRefMethod(rm1);

    const rm2 = new RefMethod();
    rm2.Title = '设置不可用';
    rm2.ClassMethod = 'Set2';
    rm2.RefMethodType = RefMethodType.FuncToolbar;
    rm2.Warning = '您确定要执行吗？ ';
    rm2.IsCanBatch = false; //是否允许批处理，在Search.vue组件里.
    rm2.IsForEns = false;
    map.AddRefMethod(rm2);

    const rm3 = new RefMethod();
    rm3.Title = '设置可用';
    rm3.ClassMethod = 'Set1';
    rm3.RefMethodType = RefMethodType.FuncToolbar;
    rm3.Warning = '您确定要执行吗？ ';
    rm3.IsCanBatch = false; //是否允许批处理，在Search.vue组件里.
    rm3.IsForEns = false;
    map.AddRefMethod(rm3);

    this._enMap = map;
    return this._enMap;
  }

  public async GenerVer() {
    const help = `
#### 帮助.
1. 系统将把数据深度复制一份存储到数据库.
2. 把EnVer加 1. 
3. 设置当前版本 EnSta=2 设置为不可用.
      `;
    if (window.confirm(help) == false) {
      const obj = new GPNReturnObj(GPNReturnType.Message, '您取消了操作.');
      return obj;
    }

    //执行后台方法.
    const handler = new HttpHandler('BP.App.Demo.Handler_Demo');
    handler.AddPara('No', this.No);
    const data = await handler.DoMethodReturnString('ZhiBiaoFXFF_GenerVer');

    const url = GloComm.UrlEn('TS.Demo.ZhiBiaoFXFF', data);
    const obj = new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    return obj;
  }

  public async Set2() {
    if (this.EnSta == 0) {
      const obj = new GPNReturnObj(GPNReturnType.Message, '当前是主版本不能执行此操作.');
      return obj;
    }
    if (this.EnSta == 2) {
      const obj = new GPNReturnObj(GPNReturnType.Message, '当前已经是不可用状态.');
      return obj;
    }

    this.EnSta = 2;
    await this.Update();

    const obj = new GPNReturnObj(GPNReturnType.Message, '执行成功.');
    return obj;
  }

  public async Set1() {
    if (this.EnSta == 0) {
      const obj = new GPNReturnObj(GPNReturnType.Message, '当前是主版本不能执行此操作.');
      return obj;
    }
    if (this.EnSta == 1) {
      const obj = new GPNReturnObj(GPNReturnType.Message, '当前已经是不可用状态.');
      return obj;
    }

    this.EnSta = 1;
    await this.Update();

    const obj = new GPNReturnObj(GPNReturnType.Message, '执行成功.');
    return obj;
  }

  public async SetMainVer(): Promise<string> {
    if (this.EnSta == 0) return 'info@当前已经是主版本.';

    const help = `
      #### 帮助.
      1. 把原来的主版本设置为，历史版本.
      2. 把当前版本设置主版本.
      `;
    if (window.confirm(help) == false) return '您取消了操作.';

    const handler = new HttpHandler('BP.App.Demo.Handler_Demo');
    handler.AddPara('No', this.No);
    return await handler.DoMethodReturnString('ZhiBiaoFXFF_SetMainVer');
  }

  override async beforeUpdate(): Promise<boolean> {
    // //删除垃圾数据.
    // const sql1 = 'DELETE FROM LI_FXFFMatter WHERE FK_FXFF NOT IN (SELECT OID FROM LI_ZhiBiaoFXFF)';
    // await DBAccess.RunSQL(sql1);
    // //更新采样费用.
    // const sql = 'UPDATE LI_ZhiBiaoFXFF SET FeeCaiYang=(SELECT Fee FROM LI_CaiYangFangFa WHERE No=LI_ZhiBiaoFXFF.FK_CaiYangFangFa)';
    // await DBAccess.RunSQL(sql);
    return true;
  }
}

//分析方法s
export class ZhiBiaoFXFFs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new ZhiBiaoFXFF();
  }
  constructor() {
    super();
  }
}
