import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';
import { SFParas } from '../SFTable/SFPara';
import { MapAttrs } from '../MapAttrs/MapAttr';
import { SFParaSln, SFParaSlns } from '/@/WF/Admin/FrmLogic/SFProc/SFParaSln';

// 过程
export class SFProc extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SFProc');
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
    const map = new Map('Sys_SFProc', '过程');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 200, 150);
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 150);
    map.AddDDLEntities('FK_SFDBSrc', 'local', '数据源', new SFDBSrc(), true);
    map.AddTBString('ConnString', null, 'ConnString', true, false, 0, 200, 150, true);

    map.AddDDLSysEnum('IsPara', 0, '参数个数', true, true, 'IsPara', '@0=无参数@1=有参数');

    map.AddTBString('SelectStatement', null, '表达式', true, false, 0, 1000, 600, true);
    map.AddDDLStringEnum('RequestMethod', 'Get', '请求模式', '@Get=Get@POST=POST', true);
    map.AddTBStringDoc('ColumnsRemark', '', '格式备注', true, false, true);

    // 创建信息
    map.AddGroupAttr('创建信息');
    map.AddTBString('Remark', null, '备注', true, false, 0, 100, 20, true);
    map.AddTBDateTime('RDT', null, '创建日期', true, false);
    map.AddTBString('OrgNo', null, '组织编号', true, true, 0, 100, 20);
    map.AddTBInt('Idx', 0, '排序', false, true, false, '');
    map.AddTBAtParas();
    /* map.AddSearchAttr('FK_SFDBSrc');
    // map.AddGroupMethod('相关');
    map.AddRM_DtlBatch('参数设置', new SFParas(), 'RefPKVal');
    map.AddSearchAttr('IsPara');
    */
    // const rm = new RefMethod();
    // rm.Title = '查看数据';
    // rm.ClassMethod = this.ToString() + '.DoEdit';
    // rm.RefMethodType = RefMethodType.RightFrameOpen;
    // rm.IsForEns = false;
    // map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }

  //增加转换方案.
  public async AddSln(sln: string, frmID: string) {
    //查询出来列.
    const paras = new SFParas();
    await paras.Retrieve('RefPKVal', this.No);

    const mapAttrs = new MapAttrs();
    await mapAttrs.Retrieve('FK_MapData', frmID);

    //智能更新cols的描述.
    paras.forEach((para) => {
      if (para.AttrKey == para.AttrName) {
        //没有设置描述的字段.
        mapAttrs.forEach(async (mapAttr) => {
          if (mapAttr.KeyOfEn == para.AttrKey) {
            //更新数据类型.
            para.AttrName = mapAttr.Name;
            switch (mapAttr.MyDataType) {
              case 1:
              case 6:
              case 7:
                para.DataType = 'String';
                break;
              case 2:
              case 4:
                para.DataType = 'Int';
              case 5:
              case 3:
                para.DataType = 'Float';
              default:
                break;
            }
            await para.Update(); //执行更新，数据源.
          }
        });
      }
    });

    for (let index = 0; index < paras.length; index++) {
      const para = paras[index];

      const slnEn = new SFParaSln();
      slnEn.MyPK = sln + '_' + para.ParaKey;
      const num = await slnEn.RetrieveFromDBSources();
      if (num == 1) {
        //智能匹配数据库字段.
        if (!slnEn.FrmAttr) {
          mapAttrs.forEach(async (mapAttr) => {
            if (mapAttr.KeyOfEn == slnEn.ParaKey || mapAttr.Name === slnEn.ParaName) {
              slnEn.FrmAttr = mapAttr.KeyOfEn;
              await slnEn.Update();
            }
          });
        }
        continue;
      }

      //创建新列.
      slnEn.ParaKey = para.ParaKey;
      slnEn.ParaName = para.ParaName;
      slnEn.DataType = para.DataType;
      slnEn.RefPKVal = sln;
      slnEn.FrmID = frmID;

      mapAttrs.forEach(async (mapAttr) => {
        if (mapAttr.KeyOfEn == slnEn.ParaKey || mapAttr.Name === slnEn.ParaName) {
          slnEn.FrmAttr = mapAttr.KeyOfEn;
        }
      });

      await slnEn.Insert();
      // sln.ToKey = col.AttrKey;
    }
    //删除已经不存在的, 数据源的列已经存在了.
    const slns = new SFParaSlns();
    await slns.Retrieve('RefPKVal', sln);
    for (let index = 0; index < slns.length; index++) {
      const slnEn = slns[index];
      let isHave = false;
      for (let ii = 0; ii < paras.length; ii++) {
        const para = paras[ii];
        if (para.ParaKey == slnEn.ParaKey) {
          isHave = true;
          break;
        }
      }
      if (isHave == true) continue;

      //删除它.
      const myen = new SFParaSln(slnEn.MyPK);
      await myen.Delete();
    }
    return '执行成功';
  }
  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

//过程 s
export class SFProcs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SFProc();
  }
  constructor() {
    super();
  }
}
