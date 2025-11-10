import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';

// 问卷
export class FrmAsk extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.FrmAsk');
    if (pkval) this.No = pkval;
  }

  // 问卷的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapData', '问卷表单');
    map.GroupBarShowModel = 1; //平铺模式.
    map.AddTBStringPK('No', null, '编号', true, true, 1, 100, 100, false);

    //@0=信息采集模式@1=考卷模式
    map.AddTBInt('AskModel', 0, '问卷模式', true, true);
    map.ParaFields = 'AskModel';
    map.AddTBAtParas(400);

    // map.AddTBInt('SaveAfterTodo', 0, '保存后执行内容', false, false, false);
    // map.AddTBString('SaveAfterDoc', null, '内容', false, false, 0, 500, 100, true);
    this._enMap = map;
    return this._enMap;
  }

  public CCFormAPI() {
    const help = `
    #### 帮助
    -  ccform提供两个类的接口， 功能页面调用与
    #### 新建接口
    - 新建一问卷记录的链接. 
    - /WF/Port.vue?DoWhat=NewFrmAskRec&FrmID=xxxx
    - 打开一问卷记录的链接. 
    - /WF/Port.vue?DoWhat=OpenFrmAskRec&FrmID=xxxx&OID=xxxx
    `;
    return 'tabOpen@' + help;
  }
}

//问卷s
export class FrmAsks extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new FrmAsk();
  }

  constructor() {
    super();
  }
}
