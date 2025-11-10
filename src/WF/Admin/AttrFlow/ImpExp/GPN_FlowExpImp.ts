import Entity from '../../FoolFormDesigner/dto/Entity';
import { MapAttr, MapAttrs } from '../../FrmLogic/MapAttrs/MapAttr';
import { MapData } from '../../FrmLogic/MapData';
import { GloWF } from '../../GloWF';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { ClassFactory } from '/@/bp/da/ClassFactory';
import { Attrs } from '/@/bp/en/Map/Attrs';
import { downloadByData } from '/@/utils/file/download';
import HttpHandler from '/@/utils/gener/HttpHandler';

export class GPN_FlowExpImp extends PageBaseGroupNew {
  constructor() {
    super('GPN_FlowExpImp');
    this.PageTitle = '导入导出';
  }
  public Init() {
    this.AddGroup('A', '导入模板');
    this.FileUpload('Imp', '导入流程模板', '请上传符合ccform表单格式的模式', this.Imp);
    const str = '@0=作为新流程导入@1=作为新流程导入2@2=作为新流程导入3';

    const json = GloWF.AtParaStringToJson(str);
    const jsonKeys = Object.keys(json);
    const list: { No: string; Name: string }[] = [];
    for (const key of jsonKeys) {
      list.push({
        No: key,
        Name: json[key],
      });
    }
    this.SelectItemsByList('Imp.Way', '选择模式', this.Imp, false, JSON.stringify(list));

    this.AddGroup('B', '导出');
    this.AddBlank('Exp', '导出流程模板', this.Exp);
    this.AddBlank('DTSField', '检查模板字段', this.HelpUn);

    this.AddGroup('C', '流程数据导入');
    this.AddBlank('ExpAllData', '导出本流程所有数据', this.ExpAllData); //导出流程数据.
    this.AddBlank('ImpAllData', '导人本流程所有数据', this.ExpAllData); //导出流程数据.
    this.FileUpload('ImpExcelFlowDB', 'Excel模式导入', '请上传符合ccform表单格式的模式', this.ImpExcelFlowDB);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    const fk_flow = this.PKVal;
    if (pageNo == 'Imp.Way') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrFlow');
      handler.AddFile(this.UploadFile);
      handler.AddPara('FlowNo', fk_flow);
      handler.AddPara('ImpWay', tb1);
      const data = await handler.DoMethodReturnJson<Recordable>('Imp_Done');
      return new GPNReturnObj(GPNReturnType.Message, data?.Msg || '创建成功');
    }
    if (pageNo == 'Exp') {
      const flow = new Entity('BP.WF.Flow', fk_flow);
      await flow.Init();

      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCBPMDesigner');
      handler.AddPara('FlowNo', fk_flow);
      const data = await handler.DoMethodReturnString('ExpFlowTemplete');
      downloadByData(data, flow.getData().Name + '.xml', 'xml');
      return new GPNReturnObj(GPNReturnType.DoNothing, '');
    }
    if (pageNo == 'ExpAllData') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrFlow');
      handler.AddFile(this.UploadFile);
      handler.AddPara('FlowNo', fk_flow);
      const data = await handler.DoMethodReturnJson<Recordable>('Imp_ExpAllData');
      return new GPNReturnObj(GPNReturnType.Message, data?.Msg || '导入信息如下:' + data);
    }

    if (pageNo == 'ImpExcelFlowDB') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrFlow');
      handler.AddFile(this.UploadFile);
      handler.AddPara('FlowNo', fk_flow);
      const data = await handler.DoMethodReturnJson<Recordable>('Imp_ImpExcelFlowDB');
      return new GPNReturnObj(GPNReturnType.Message, data?.Msg || '导入信息如下:' + data);
    }

    if (pageNo == 'DTSField') {
      const tables = ['WF_Flow', 'WF_Node', 'WF_Cond'];
      const allFactoryClassList = JSON.parse(await ClassFactory.toJSON([])) as Recordable[];
      console.log({ allFactoryClassList });
      // 为每个表创建一个表单. 表单ID, WF_Flow
      const md = new MapData();
      for (const tab of tables) {
        //检查表单是否有数据.
        md.setPKVal(tab);
        if ((await md.IsExits()) == false) {
          md.Name = tab;
          md.PTable = tab;
          await md.Insert();
        }
        //1.1 求出来已经存在的字段.
        const mapFrmAttrs = new MapAttrs();
        await mapFrmAttrs.Retrieve('FK_MapData', tab);
        //获得类集合.
        const targetClassList = allFactoryClassList.filter((cls) => cls.PTable == tab);
        console.log({ targetClassList });
        for (const targetCls of targetClassList) {
          const clsObj = await ClassFactory.GetEn(targetCls.No);
          const innerAttrs = clsObj._enMap.attrs as Attrs;
          for (const innerAttr of innerAttrs) {
            //如果已经存在.
            if (mapFrmAttrs.find((attr) => attr.KeyOfEn === innerAttr.Key)) continue;

            const attr = new MapAttr();
            attr.FK_MapData = tab;
            attr.KeyOfEn = innerAttr.Key;
            attr.Name = innerAttr.Desc;
            attr.MyDataType = innerAttr.MyDataType;
            attr.UIContralType = innerAttr.UIContralType;
            if (innerAttr.IsEnum) attr.LGType = 1;
            if (innerAttr.IsFK) attr.LGType = 2;
            attr.UIWidth = innerAttr.UIWidth;
            attr.UIHeight = innerAttr.UIHeight;
            attr.MinLen = innerAttr.MinLength;
            attr.MaxLen = innerAttr.MaxLength;
            attr.UIBindKey = innerAttr.UIBindKey;
            attr.UIRefKey = innerAttr.UIRefKeyValue;
            attr.UIRefKeyText = innerAttr.UIRefKeyText;
            attr.UIVisible = innerAttr.UIVisible;
            attr.UIIsEnable = innerAttr.UIIsReadonly;
            attr.UIIsLine = innerAttr.UIIsLine;
            attr.DefVal = innerAttr.DefaultVal;
            attr.MyPK = attr.FK_MapData + '_' + attr.KeyOfEn;
            await attr.Insert();
            mapFrmAttrs.push(attr);
            //加入里面去.
          }
        }
      }
      //1.找到所有的 EnName 的 PTable = tab 的实体.
      // for (Entity of ClassFactory.GetEns()) {
      //   if (cl.EnMap.PTable != table) continue;

      //   //把实体的 MapAttr 压入到 FrmID = Tab 的是表单里.
      //   const mapAttrs = cl.EnMap.HisMap;
      //   array.forEach((element) => {
      //     if (mapFrmAttrs.concat('') == true) continue;
      //     //不存在就插入.
      //     const attr = new MapAttr();
      //     attr.MyPK = '';
      //     attr.Insert();
      //     //加入里面去.
      //     mapFrmAttrs.add(attr);
      //   });
      // }
    }
    return new GPNReturnObj(GPNReturnType.Message, '检查成功.');
  }

  public readonly ExpAllData = `
  #### 帮助
   - 导出流程所有数据.
   - 草稿，空白除外.
   - 生成的文件放在TempFlowNoWorkID*.* , zzz流程编号， xxxxx工作ID.
   - 导出的数据都是xml格式，以目录存储.
   - 可以使用导入的模式，读取这里的文件进行导入。
  `;

  public readonly ImpExcelFlowDB = `
  #### 帮助
   - 解决其他异构的流程数据导入到本流程模板的过程.
   - 解决历史已经完成的流程在ccbpm进行查询分析.
  ##### 选择模式说明
   - 模板数据格式为excel2013版本以上.
   - 必须有: 实例主键、流程标题、流程发起人账号、流程发起日期必选字段字段.
   - 发起日期格式为: yyyy-MM-dd HH:mm
   - 导入的流程是已经完成的流程.
   - 文件格式请参考： DataUserTempleteOfImp导入格式流程数据模版.xlsx
  `;

  public readonly Imp = `
  #### 帮助
   - 上传模板、选择模式进行导入流程操作.
  ##### 选择模式说明
   - 作为新流程导入1：由ccbpm自动生成新的流程编号
   - 作为新流程导入2：使用流程模版里面的流程编号，如果该编号已经存在系统则会提示错误
   - 作为新流程导入3：使用流程模版里面的流程编号，如果该编号已经存在系统则会覆盖此流程
  `;

  public readonly Exp = `
  #### 关于流程模板
   - ccbpm生成的流程模版是一个特定格式的xml文件。
   - 它是流程引擎模版与表单引擎模版的完整的组合体。
   - ccbpm的jflow与ccflow的流程引擎导出的流程模版通用。
   - 流程模版用于流程设计者的作品交换。
   - 在实施的过程中，我们可以把一个系统上的流程模版导入到另外一个系统中去。
    
  `;
}
