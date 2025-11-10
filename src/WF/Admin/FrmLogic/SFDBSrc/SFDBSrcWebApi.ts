import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFDBSrcAttr } from './SFDBSrc';
import BSEntity from '/@/utils/gener/BSEntity';
import { SFApiParas } from './SFApiPara';
import { GPE_WebApiResultModel } from './GPE_WebApiResultModel';

// 数据源
export class SFDBSrcWebApi extends EntityNoName {
  constructor(no?: string) {
    super('TS.Sys.SFDBSrcWebApi');
    if (!!no) this.setPKVal(no);
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
    const map = new Map('Sys_SFDBSrc', 'WebApi数据源');
    map.AddTBStringPK(SFDBSrcAttr.No, null, '编号', true, true, 1, 20, 20);
    map.AddTBString(SFDBSrcAttr.Name, null, '名称', true, false, 0, 30, 20);
    map.AddTBString(SFDBSrcAttr.DBSrcType, 'WebApi', '类型', true, true, 0, 30, 20);
    map.AddTBString(SFDBSrcAttr.ConnString, null, '连接', true, false, 0, 300, 20, true);
    map.AddGroupMethod('基本设置');

    //数据标准转化格式.
    map.AddRM_GPE(new GPE_WebApiResultModel(), 'icon-drop');
    map.AddRM_DtlSearch('内置参数', new SFApiParas(), 'DBSrcNo', '', '', '', 'icon-drop');

    // //map.AddRM_GPN(new GPN_SFTableWebAPI(), 'icon-drop'); //新建字典.
    // const rm = new RefMethod();
    // rm.Title = '连接测试';
    // rm.ClassMethod = 'TestConn';
    // rm.Warning = '';
    // map.AddRefMethod(rm);

    // map.AddGroupMethod('列表');
    // map.AddRM_DtlSearch('字典', new SFTableWebApiNoNames(), 'FK_SFDBSrc', '', '', 'No,Name,CodeStruct,RequestMethod,ParaMethod,', 'icon-drop');
    // map.AddRM_DtlSearch('查询', new SFSearchs(), 'FK_SFDBSrc', '', '', '', 'icon-drop');
    // map.AddRM_DtlSearch('过程', new SFProcs(), 'FK_SFDBSrc', '', '', '', 'icon-drop');
    map.AddRM_HelpDocs('帮助', '/src/WF/Comm/HelpDocs.vue?key=WebAPI', this.WebAPI, 'icon-support');

    // map.AddTBAtParas(300);
    // const rm = new RefMethod();
    // rm.Title = '连接测试';
    // rm.ClassMethod = 'TestConn';
    // map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }
  public async TestConn() {
    const en = new BSEntity('BP.Sys.SFDBSrc', this.No);
    await en.Init();
    en.No = this.No;
    await en.Retrieve();
    const data = await en.DoMethodReturnString('DoConn');
    return data;
  }
  public readonly WebAPI = `
  #### 字典
  - 应用的场景-外部数据源,表单下拉字段级联关系,接收人规则
  #### 查询
  - 应用的场景-pop填充,装载填充,从表填充,
  #### 过程
  - 应用的场景-流程事件,节点事件
  #### 通用配置
  - 1.请求方式分为Get、Post方法
  - 2.请求方式为Get方式时，路径的配置方式为/xxxx?UserID=@WebUser.No&Ticket=@Token&workID=@WorkID&JE=@JinE
       请求方式为Post方式时，路径的配置方式为/xxx,post内容为JSON格式,例如：
       {
          UserID:'@WebUser.No',
          Ticket:'@Token',
          WorkID:'@WorkID',
          JE:@JinE
        }
  - 3.参数别名:当使用的位置的替换的参数值与设置的参数不一致时，需要设置参数别名,例如:@JinE=JE,ZongJinE,HuaFeiJinE@WorkID=OID,FID等
  `;
}
