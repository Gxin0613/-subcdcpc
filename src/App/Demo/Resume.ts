import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { ShengFen } from './ShengFen';
import { City } from './City';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import Dev2Interface from '/@/WF/TSClass/Dev2Interface';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
import { WGEntity_Resume } from './WGEntity_Resume';

// 简历
export class Resume extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.Demo.Resume');
    if (!!pkval) this.setPKVal(pkval);
  }

  override GetRefExt(): WaiGuaBaseEntity | null {
    return new WGEntity_Resume();
  }
  // 重写逻辑删除配置
  override get LogicDelConfig() {
    return {
      key: 'IsDelete',
      enable: true,
    };
  }
  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_Resume', '简历');
    map.AddMyPK();
    map.AddTBString('StudentNo', null, '学生编号', false, false, 0, 200, 10);
    map.AddTBString('NianYue', null, '年月', true, false, 0, 200, 100);
    map.AddTBString('GongZuoDanWei', null, '工作单位', true, false, 0, 200, 200);
    map.AddTBString('ZhengMingRen', '', '证明人', true, false, 1, 200, 100);
    map.AddTBMoney('XinShui', 4000, '薪水', true, false); //打开薪水的超链接. Search组件在列上弹窗.
    map.AddTBDate('BirthMonth', null, '出生月份', true, false, false, '', { type: 'month', format: 'YYYYMM' });

    //'级联关系实现,参考ShengFen, City类.'
    map.AddDDLEntities('ShengFen', null, '省份', new ShengFen(), true, null, false);
    map.AddDDLEntities('City', null, '城市', new City(), true, null, false);
    map.enMapExts.SetJiLian('ShengFen', 'City', 'Ens://TS.Demo.City/No,Name/ShengFen=@Key'); //级联模式

    // map.AddDDLEntities('ShengFen', null, '省份', new ShengFen(), true, null, false);
    // map.AddDDLEntities('City', null, '城市', new City(), true, null, false);
    // map.enMapExts.SetJiLian('ShengFen', 'City', 'Ens://TS.Demo.City/No,Name/ShengFen=@Key'); //级联模式

    map.AddTBString('PopBanJi', null, '选择班级', true, false, 0, 200, 100);
    map.AddTBString('PopBZR', null, '班主任名称', true, false, 0, 200, 100);
    map.AddTBString('PopTel', null, '班主任电话', true, false, 0, 200, 100);
    map.SetPopList('PopBanJi', 'DemoStudent_Student_BanJi', false, '500', '600', '请选择'); //pop返回值.
    //数据填充. 返回一行多列, 必须有@Key关键字.
    map.enMapExts.SetAutoFillCtrls('PopBanJi', `DemoStudent_Student_PopBanJiFull`);

    map.AddTBString('TBBanJi', null, '输入班级', true, false, 0, 200, 100);
    map.AddTBString('TBBZR', null, '班主任名称', true, false, 0, 200, 100);
    map.AddTBString('TBTel', null, '班主任电话', true, false, 0, 200, 100);
    map.enMapExts.SetTextBoxFull('TBBanJi', `DemoStudent_Student_BanJiFind`);
    //数据填充. 返回一行多列, 必须有@Key关键字.
    map.enMapExts.SetAutoFillCtrls('TBBanJi', `DemoStudent_Student_FullTBBanJi`);
    map.AddBoolean('测试', false, '测试', true, true);
    map.AddTBString('BeiZhu', null, '备注', true, false, 0, 200, 300);
    map.AddTBInt('Idx', 0, '显示顺序', true, false);

    const rm37 = new RefMethod();
    rm37.Title = '发起流程流程';
    rm37.ClassMethod = 'StartFlow058';
    rm37.RefMethodType = RefMethodType.RightFrameOpen;
    rm37.IsCanBatch = false; //是否允许批处理，在Search.vue组件里.
    rm37.IsForEns = true;
    rm37.Icon = 'icon-plane';
    map.AddRefMethod(rm37);

    this._enMap = map;
    return this._enMap;
  }

  public async StartFlow058() {
    const flowNo = '058';
    if (this.WorkIDOf058 == 0) {
      const workID = await Dev2Interface.Node_CreateBlank(flowNo); //创建workID.
      await Dev2Interface.Node_SetDraft(workID); //设置为草稿.
      this.WorkIDOf058 = workID; //设置workID,更新到.
      //保存数据到开始节点表单.
      let paras = '@StuNo=' + this.No;
      paras += '@StuName=' + this.Name;
      paras += '@Tel=' + this.Tel;
      paras += '@Addr=' + this.Addr;
      await Dev2Interface.Node_SaveWork(workID, paras); //保存数据,也可以使用http方式传入.
      await this.Update();
    }
    //生成url连接.
    const paras = `&FlowNo=058&StuNo=${this.No}&StuName=${this.Name}&Tel=${this.Tel}&Addr=${this.Addr}`;
    // paras
    const url = GloComm.UrlMyView(this.WorkIDOf058, paras);
    // alert(url);
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
  }

  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
  override async beforeUpdateInsertAction(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

/**
 * 简历s
 */
export class Resumes extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new Resume();
  }
  constructor() {
    super();
  }
}
