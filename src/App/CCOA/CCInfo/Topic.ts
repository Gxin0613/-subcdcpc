import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { RefMethod } from '/@/bp/en/Map/RefMethod';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GPN_Topic } from './GPN_Topic';
import { InfoForAIs } from './InfoForAI';

//专题
export class Topic extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCOA.CCInfo.Topic');
    if (!!pkVal) this.setPKVal(pkVal);
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
    const map = new Map('OA_InfoTopic', '专题');
    map.AddTBStringPK('No', null, '编号', true, true, 3, 3, 100);
    map.AddTBString('Name', null, '名称', true, false, 0, 300, 300);

    map.AddTBStringDoc('PublicDocs', '', '插入公共内容', true, false, true);
    map.AddTBStringDoc('Words', '', '提示词', true, false, true);
    map.AddTBInt('Idx', 0, '显示顺序', true, false);

    map.AddRM_GPN(new GPN_Topic());

    // const rm = new RefMethod();
    // rm.Title = '1.生成文章标题';
    // rm.ClassMethod = 'GenerInfos';
    // rm.IsCanBatch = false;
    // map.AddRefMethod(rm);

    //map.AddRM_DtlBatch('2.修改文章提示词', new Infos(), 'TopicNo', '', '导出,', 'icon-people', '', SubTablePostion.Left, 0, 400);
    map.AddRM_DtlSearch('2.修改文章提示词', new InfoForAIs(), 'TopicNo', '', '导出,', '', 'icon-people', false, '');

    const rm2 = new RefMethod();
    rm2.Title = '3.下载并生成文章';
    rm2.ClassMethod = 'DownIt';
    rm2.IsCanBatch = false;
    map.AddRefMethod(rm2);
    // map.AddRM_DtlSearch('成员Search', new Infos(), 'TopicNo', '', 'Btn1,', '', 'icon-people', true, '', SubTablePostion.Tab);
    // map.AddRM_DtlBatch('从表', new Infos(), 'TopicNo', '', '', '', '');

    this._enMap = map;
    return this._enMap;
  }

  public async GenerInfos(): Promise<string> {
    const handler = new HttpHandler('BP.App.Handler_Eyer');
    handler.AddPara('RefNo', this.No);
    return await handler.DoMethodReturnString('Topic_Init');
  }

  public async DownIt(): Promise<string> {
    const handler = new HttpHandler('BP.App.Demo.Handler_Demo');
    handler.AddPara('No', this.No);
    handler.AddPara('Name', this.Name);
    // handler.AddFile
    return await handler.DoMethodReturnString('Student_ZhuXiaoXueJi');
  }
}

/**
 * 专题s
 */
export class Topics extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Topic();
  }
  constructor() {
    super();
  }
}
