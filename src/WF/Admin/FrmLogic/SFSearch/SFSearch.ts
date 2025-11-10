import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';
import { SFParas } from '../SFTable/SFPara';
import { SFColumns } from './SFColumn';
import { SFColumnSln, SFColumnSlns } from './SFColumnSln';
import BSEntity from '/@/utils/gener/BSEntity';
import { MapAttrs } from '../MapAttrs/MapAttr';
import { GloDBsrcHelper } from '../GloDBSrcHelper';

// 查询
export class SFSearch extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SFSearch');
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
    const map = new Map('Sys_SFSearch', '查询');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 200, 75);
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 100);
    map.AddDDLEntities('FK_SFDBSrc', 'local', '数据源', new SFDBSrc(), true);
    map.AddDDLSysEnum('ResultNum', 0, '类型', true, true, 'ResultNum', '@0=多行(集合查询)@1=单行(实体查询)');
    map.AddTBString('ConnString', null, 'ConnString', true, false, 0, 200, 110, true);

    map.AddTBString('SelectStatement', null, '表达式内容', true, false, 0, 1000, 200, true);
    map.AddTBString('ExpNote', null, '表达式说明', true, false, 0, 1000, 200, true);

    map.AddTBString('ParamAlia', null, '参数别名', true, false, 0, 200, 200, true, GloDBsrcHelper.Help_ParamAlia);

    map.AddDDLStringEnum('RequestMethod', 'Get', '请求模式', '@Get=Get@POST=POST', true);
    // map.AddTBString('RootNode', '', 'Json根节点', true, false, 0, 200, 600, true);
    map.AddTBStringDoc('PostDoc', null, 'POST内容', true, false, true, this.descPost);
    map.AddTBString('JsonNode', null, 'Json节点', true, false, 0, 500, 600, false);

    map.AddTBStringDoc('ColumnsRemark', '', '格式备注', true, false, true);
    map.AddTBInt('IsPara', 0, '参数', false, true, false, '');

    // 创建信息
    map.AddGroupAttr('创建信息');
    map.AddTBString('Remark', null, '备注', true, false, 0, 100, 20, true);
    map.AddTBDateTime('RDT', null, '创建日期', true, true);
    map.AddTBString('OrgNo', null, '组织编号', true, true, 0, 100, 20);
    map.AddTBInt('Idx', 0, '排序', false, true, false, '');
    map.AddTBAtParas(4000);
    map.AddSearchAttr('FK_SFDBSrc');

    // map.AddGroupMethod('相关');
    map.AddRM_DtlBatch('参数设置', new SFParas(), 'RefPKVal');
    map.AddRM_DtlBatch('返回列设置', new SFColumns(), 'RefPKVal');

    // const rm = new RefMethod();
    // rm.Title = '查看数据';
    // rm.ClassMethod = this.ToString() + '.DoEdit';
    // rm.RefMethodType = RefMethodType.RightFrameOpen;
    // rm.IsForEns = false;
    // map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }

  //生成数据.
  public async GenerData(paras: string) {
    const en = new BSEntity('BP.Sys.SFSearch');
    en.setPK(this.No);
    await en.RetrieveFromDBSources();
    const da = en.DoMethodReturnJSON('GenerDataOfJson', paras);
    return da;
  }

  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    return Promise.resolve(true);
  }

  //增加转换方案.
  public async AddSln(sln: string, frmID: string) {
    //查询出来列.
    const cols = new SFColumns();
    await cols.Retrieve('RefPKVal', this.No);

    const mapAttrs = new MapAttrs();
    await mapAttrs.Retrieve('FK_MapData', frmID);

    //智能更新cols的描述.
    cols.forEach((col) => {
      if (col.AttrKey == col.AttrName) {
        //没有设置描述的字段.
        mapAttrs.forEach(async (mapAttr) => {
          if (mapAttr.KeyOfEn == col.AttrKey) {
            //更新数据类型.
            col.AttrName = mapAttr.Name;
            switch (mapAttr.MyDataType) {
              case 1:
              case 6:
              case 7:
                col.DataType = 'String';
                break;
              case 2:
              case 4:
                col.DataType = 'Int';
              case 5:
              case 3:
                col.DataType = 'Float';
              default:
                break;
            }
            await col.Update(); //执行更新，数据源.
          }
        });
      }
    });

    for (let index = 0; index < cols.length; index++) {
      const col = cols[index];

      const slnEn = new SFColumnSln();
      slnEn.MyPK = sln + '_' + col.AttrKey;
      const num = await slnEn.RetrieveFromDBSources();
      if (num == 1) {
        //智能匹配数据库字段.
        if (!slnEn.ToField) {
          mapAttrs.forEach(async (mapAttr) => {
            if (mapAttr.KeyOfEn == slnEn.AttrKey || mapAttr.Name === slnEn.AttrName) {
              slnEn.ToField = mapAttr.KeyOfEn;
              await slnEn.Update();
            }
          });
        }
        continue;
      }

      //创建新列.
      slnEn.AttrKey = col.AttrKey;
      slnEn.AttrName = col.AttrName;
      slnEn.DataType = col.DataType;
      slnEn.RefPKVal = sln;
      slnEn.FrmID = frmID;

      mapAttrs.forEach(async (mapAttr) => {
        if (mapAttr.KeyOfEn == slnEn.AttrKey || mapAttr.Name === slnEn.AttrName) {
          slnEn.ToField = mapAttr.KeyOfEn;
        }
      });

      await slnEn.Insert();
      // sln.ToKey = col.AttrKey;
    }
    //删除已经不存在的, 数据源的列已经存在了.
    const slns = new SFColumnSlns();
    await slns.Retrieve('RefPKVal', sln);
    for (let index = 0; index < slns.length; index++) {
      const slnEn = slns[index];
      let isHave = false;
      for (let ii = 0; ii < cols.length; ii++) {
        const col = cols[ii];
        if (col.AttrKey == slnEn.AttrKey) {
          isHave = true;
          break;
        }
      }
      if (isHave == true) continue;

      //删除它.
      const myen = new SFColumnSln(slnEn.MyPK);
      await myen.Delete();
    }
  }
}

//查询 s
export class SFSearchs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SFSearch();
  }
  constructor() {
    super();
  }
}
