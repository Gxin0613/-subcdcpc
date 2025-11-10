/// <summary>
/// 流程目录 属性
/// </summary>
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityTreeAttr } from '/@/bp/en/EntityTree';
import DBAccess from '/@/utils/gener/DBAccess';
import { FlowAdms } from './FlowAdm';
import WebUser from '/@/bp/web/WebUser';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';

export class FlowSortAttr extends EntityTreeAttr {
  /// 组织编号
  public static readonly OrgNo = 'OrgNo';
  /// 短名称
  public static readonly ShortName = 'ShortName';
  /// 域名
  public static readonly DomainExt = 'DomainExt';
}

/// <summary>
/// 流程目录
/// </summary>
export class FlowSort extends EntityNoName {
  constructor(no?: string) {
    super('TS.WF.Admin.FlowSort');
    if (!!no) {
      this.setPKVal(no);
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('WF_FlowSort', '流程目录');
    map.CodeStruct = '2';
    map.AddTBStringPK(FlowSortAttr.No, null, '编号', false, false, 1, 100, 20);
    map.AddTBString(FlowSortAttr.ParentNo, null, '父节点No', false, false, 0, 100, 30);
    map.AddTBString(FlowSortAttr.Name, null, '名称', true, false, 0, 200, 30, true);
    map.AddTBString(FlowSortAttr.ShortName, null, '简称', true, false, 0, 200, 30, true);
    map.AddTBString(FlowSortAttr.OrgNo, '0', '组织编号(0为系统组织)', false, false, 0, 150, 30, false);
    map.SetHelperAlert(FlowSortAttr.OrgNo, '用于区分不同组织的的流程,比如:一个集团有多个子公司,每个子公司都有自己的业务流程.');
    map.AddTBString(FlowSortAttr.DomainExt, null, '域/系统编号', true, false, 0, 100, 30);
    map.SetHelperAlert(FlowSortAttr.DomainExt, '用于区分不同系统的流程,比如:一个集团有多个子系统每个子系统都有自己的流程,就需要标记那些流程是那个子系统的,比如:OA,CRM,ERP');
    map.AddTBInt(FlowSortAttr.Idx, 0, 'Idx', false, false);
    map.AddDDLSysEnum('DirType', 0, '目录类型', true, true, 'DirType', '@0=目录@1=系统', null, false);
    map.AddDDLSysEnum('MobileColorType', 0, '移动端颜色类型', true, true, 'MobileColorType', '@0=蓝色@1=橙色@2=绿色', null, false);
    map.AddTBString('Icon', null, 'Icon', true, false, 0, 50, 100, true, null);

    map.AddGroupAttr('系统信息');
    map.AddTBString('WebHost', null, '系统根路径', true, false, 0, 200, 30, true, this.HelpWebHost);
    map.AddTBString('TokenPiv', null, '系统私钥', true, false, 0, 200, 30, true, this.HelpWebHost);
    map.AddTBString('TokenPublie', null, '系统公钥', true, false, 0, 200, 30, true, this.HelpWebHost);
    map.AddTBString('CallBack', null, '系统回调审批态的url全路径', true, false, 0, 200, 30, true, this.HelpWebHost);
    map.AddDDLStringEnum('RequestMethod', 'POST', '请求模式', '@POST=POST@Get=Get', true);
    map.AddDDLStringEnum('ParaDTModel', '1', '数据格式', '@0=From格式@1=JSON格式', true);
    map.AddTBInt('CallMaxNum', 5, '最大回调次数', true, false);
    map.AddTBStringDoc('ApiParas', null, '参数格式', true, false, true, this.HelpWebHost);
    map.AddTBStringDoc('ApiNote', null, '备注', true, false, true, this.HelpWebHost);

    //相关功能.
    map.AddRM_DtlSearch('流程顺序', new FlowAdms(), 'FK_FlowSort', null, null, 'No,Name,PTable', 'icon-user', true);

    this._enMap = map;
    return this._enMap;
  }
  public static HelpWebHost = `
  ### 帮助
  - WebHost  该目录下的自定义表单前缀.
  - http://192.168.1.12:9090
  - 在使用sdk表单，或者嵌入模式的自定义表单的时候的前缀.
  `;
  protected override async beforeInsert(): Promise<boolean> {
    if (!this.No) this.No = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

/**
 * 流程目录s
 */
export class FlowSorts extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new FlowSort();
  }
  constructor() {
    super();
  }
  //查询全部
  override async RetrieveAll() {
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) return await super.RetrieveAll('Idx');
    return await this.Retrieve('OrgNo', WebUser.OrgNo, 'Idx');
  }
}
