import Entity from '../../FoolFormDesigner/dto/Entity';
import { GloWF } from '../../GloWF';
import { GroupField } from '../GroupField';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';
import { SFColumn, SFColumns } from '../SFSearch/SFColumn';
import { DataType } from '/@/bp/en/DataType';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import Events from '/@/utils/Events';
import { downloadByData } from '/@/utils/file/download';
import BSEntities from '/@/utils/gener/BSEntities';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { Node } from '/@/WF/TSClass/Node';

export class GPN_FrmExpImp extends PageBaseGroupNew {
  constructor() {
    super('GPN_FrmExpImp');
    this.PageTitle = '模板导入导出';
  }
  public async Init() {
    this.AddGroup('A', '模板导入');
    const list: { No: string; Name: string }[] = [
      { No: '0', Name: '只读' },
      { No: '1', Name: '可编辑' },
    ];
    const flowNo = this.RequestVal('FlowNo');

    if (!!flowNo) {
      //const sql = `SELECT NodeID as No, Name FROM WF_Node WHERE FK_Flow='${flowNo}'`;
      this.SelectItemsByList('ImpNodeFrm', '从节点上导入', this.ImpNodeFrm, false, GloWF.SQLOfNodes(flowNo));
      this.SelectItemsByList('ImpNodeFrm.IsReadOnly', '导入是否只读', this.ImpIsReadOnly, false, JSON.stringify(list));
    }
    // const sqlGroup = 'SELECT No,Name FROM WF_FlowSort ';
    // const sqlFlow = 'SELECT No,Name,FK_FlowSort FROM WF_Flow ';
    this.SelectItemsByGroupList('ImpFlowFrom', '从其它流程导入', this.ImpNodeFrm, false, GloWF.srcFlowSorts, GloWF.srcFlows);

    this.SelectItemsByGroupList('ImpFrmID', '从表单库导入', this.ImpNodeFrm, false, GloWF.srcFrmTree, GloWF.srcFrmList);
    this.SelectItemsByList('ImpFrmID.IsReadOnly', '导入是否只读', this.ImpIsReadOnly, false, JSON.stringify(list));

    //按表单ID导入.
    this.TextBox1_Name('ImpFrmIDInput', '按表单ID导入', '请输入表单ID', '表单ID', '', '如：Frm_XXX');
    this.SelectItemsByList('ImpFrmIDInput.IsReadOnly', '导入是否只读', this.ImpIsReadOnly, false, JSON.stringify(list));

    this.FileUpload('Imp', '导入表单模板', '请上传文件', this.Imp);
    this.AddIcon('icon-magic-wand', 'Imp');
    this.TextBox1_Name('ImpEnsFrm', '从实体类导入', this.ImpEnsFrm, 'className', '', '如：BP.Port.Emps');

    // this.SelectItemsByGroupList('ImpFlowFrom', '从节点上导入', this.ImpNodeFrm, false, sql);
    // if (frmID.startsWith('ND') == true) {
    // }
    // alert(frmID);
    // this.FileUpload('ImpFrmNode', '从其它节点导入', '请上传文件', this.Imp);
    //处理这个时间与流程的事件一起处理.
    //const sql = `SELECT No, Name FROM Sys_SFDBSrc WHERE 1=1 AND DBSrcType!='WebApi' `;
    this.SelectItemsByList('TableSrc', '导入表结构', this.TableSrc, false, GloWF.SQLOfSelectItemsByList);
    this.AddIcon('icon-calendar', 'TableSrc');

    // this.SelectItemsByList('TableSrc.Tables', '选择表', this.TableSrc_Tables, false, this.GenerTables);
    this.Table('TableSrc.Tables', '选择表', this.TableSrc_Tables, false, this.GenerTables);
    this.SelectItemsByList('TableSrc.Tables.Fields', '选择字段', this.TableSrc_Tables, true, this.GenerTableFields);

    // const sql1 = `SELECT No, Name,FK_SFDBSrc FROM Sys_SFSearch WHERE 1=1 `;
    // const sql2Group = `SELECT No, Name FROM Sys_SFDBSrc WHERE 1=1 `;
    // this.SelectItemsByList('SFSearch', '导入查询', this.TableSrc, false, sql1);
    this.SelectItemsByGroupList('SFSearch', '导入查询', this.TableSrc, true, GloWF.srcDBSrc, GloWF.srcDBSFSearch, true);
    this.AddIcon('icon-magnifier-add', 'SFSearch');
    this.SelectItemsByList('SFSearch.Fields', '选择字段', this.TableSrc_Tables, true, this.GenerSFSearchFields, true, false);

    this.AddGroup('B', 'Office导入');
    this.FileUpload('Excel', 'Excel表单模板', '请上传Excel格式的表单模板', '对excel内容作为表单的字段生成');
    //const sql2 = "SELECT 0 AS No, '把列作为字段' AS Name FROM WF_Emp WHERE No='admin' UNION SELECT 1 AS No, '把内容作为字段' as Name FROM WF_Emp WHERE No='admin' ";
    this.SelectItemsByList('Excel.FieldModel', '选择模式', this.ImpNodeFrm, false, GloWF.SQLOfFieldModel);
    this.SelectItemsByList('Excel.FieldModel.SelectField', '选择字段', this.ImpNodeFrm, true, this.GenerExcelFields);

    this.FileUpload('Word', 'Word表单模板', '请上传Word格式的表单模板', this.WordImpHelpUn);
    // const sql3 = "SELECT 0 AS No, '经典表单' AS Name FROM WF_Emp WHERE No='admin' UNION SELECT 1 AS No, '章节表单' as Name FROM WF_Emp WHERE No='admin' ";
    //const sql3 = "SELECT 0 AS No, '经典表单' AS Name FROM WF_Emp WHERE No='admin' ";
    this.SelectItemsByList('Word.FrmModel', '表单模式', this.ImpNodeFrm, false, GloWF.SQLOfFrmModel);

    this.AddGroup('C', '表单模板导出', 'icon-layers');
    this.AddBlank('ExpXml', '导出xml模板', this.Exp);
    this.AddBlank('ExpExcel', '导出Excel模板', this.Exp);

    this.AddGroup('D', '表单数据导出', 'icon-directions');
    this.AddBlank('ExpDataXml', '导出xml格式', this.Exp);
    this.AddBlank('ExpDataExcel', '导出Excel格式数据', this.Exp);
  }
  //获得数据源的表.
  public async GenerExcelFields() {
    const frmID = (this.RequestVal('FrmID') as string) || (this.RequestVal('PKVal') as string);

    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner_ImpExp');
    handler.AddFile(this.UploadFile);
    handler.AddPara('FrmID', frmID);
    handler.AddPara('Model', this.RequestVal('tb1', 'Excel.FieldModel'));
    const data = await handler.DoMethodReturnString('Imp_ExcelFileds');
    return JSON.stringify(data);
  }

  //获得数据源的表.
  public async GenerTables() {
    const src = this.RequestVal('tb1', 'TableSrc');
    const sfdbSrc = new SFDBSrc(src);
    await sfdbSrc.RetrieveFromDBSources();
    const tables = await sfdbSrc.GenerTables();
    return JSON.stringify(tables);
  }

  //获得表的字段.
  public async GenerTableFields() {
    const src = this.RequestVal('tb1', 'TableSrc');
    const tableNo = this.RequestVal('tb1', 'TableSrc.Tables');

    const sfdbSrc = new SFDBSrc(src);
    await sfdbSrc.RetrieveFromDBSources();
    const fields = await sfdbSrc.GenerTableFields(tableNo);
    return JSON.stringify(fields);
  }
  //获得表的字段.
  public async GenerSFSearchFields() {
    const no = this.RequestVal('tb1', 'SFSearch');

    const ens = new SFColumns();
    await ens.Retrieve('RefPKVal', no);

    for (let index = 0; index < ens.length; index++) {
      const element = ens[index];
      element.No = element.AttrKey;
      element.Name = element.AttrName;
    }
    return JSON.stringify(ens);
    //return ens;
    //const sfdbSrc = new SFSearch(src);
    //await sfdbSrc.RetrieveFromDBSources();
    //const fields = await sfdbSrc.GenerTableFields(tableNo);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, tb2: string, _tb3: string) {
    const frmID = (this.RequestVal('FrmID') as string) || (this.RequestVal('PKVal') as string);
    //导入word
    if (pageNo == 'Word.FrmModel') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner_ImpExp');
      handler.AddFile(this.UploadFile);
      handler.AddPara('FrmID', frmID);
      handler.AddPara('FrmModel', tb1);
      const data = await handler.DoMethodReturnString('Imp_WordFileSaveIt');
      //提示信息.
      Events.emit('reloadForm');
      if (data.includes('err@')) return new GPNReturnObj(GPNReturnType.Error, data);
      else return new GPNReturnObj(GPNReturnType.Message, data);
    }
    //导入Execl
    if (pageNo == 'Excel.FieldModel.SelectField') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner_ImpExp');
      handler.AddFile(this.UploadFile);
      handler.AddPara('FrmID', frmID);
      handler.AddPara('Fields', tb1);
      const data = await handler.DoMethodReturnString('Imp_ExcelFileSaveIt');
      //提示信息.
      Events.emit('reloadForm');
      if (data.includes('err@')) return new GPNReturnObj(GPNReturnType.Error, data);
      else return new GPNReturnObj(GPNReturnType.Message, data);
    }

    //导入表单.
    if (pageNo === 'Imp') {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner_ImpExp');
      handler.AddFile(this.UploadFile);
      handler.AddPara('FrmID', frmID);
      const data = await handler.DoMethodReturnString('Imp_LoadFrmTempleteFromLocalFile');
      Events.emit('reloadForm');
      //提示信息.
      if (data.includes('err@')) return new GPNReturnObj(GPNReturnType.Error, data);
      else return new GPNReturnObj(GPNReturnType.Message, data);
    }

    //导入表单.
    if (pageNo === 'ImpNodeFrm.IsReadOnly' || pageNo === 'ImpFrmIDInput.IsReadOnly' || pageNo === 'ImpFrmID.IsReadOnly' || pageNo === 'ImpFlowFrom') {
      let frmIDOfImp;
      let IsReadOnly; //0只读  1可编辑
      if (pageNo === 'ImpFrmID.IsReadOnly') {
        frmIDOfImp = this.RequestVal('tb1', 'ImpFrmID');
        IsReadOnly = this.RequestVal('tb1', 'ImpFrmID.IsReadOnly');
      }

      if (pageNo === 'ImpFrmIDInput.IsReadOnly') {
        //按表单ID导入.
        frmIDOfImp = this.RequestVal('tb1', 'ImpFrmIDInput');
        IsReadOnly = this.RequestVal('tb1', 'ImpFrmIDInput.IsReadOnly');
      }

      //从节点上导入.
      if (pageNo === 'ImpNodeFrm.IsReadOnly') {
        frmIDOfImp = 'ND' + this.RequestVal('tb1', 'ImpNodeFrm');
        IsReadOnly = this.RequestVal('tb1', 'ImpNodeFrm.IsReadOnly');
      }
      //从流程导入.
      if (pageNo === 'ImpFlowFrom') {
        const nodeId = parseInt(parseInt(tb1) + '01');
        const node = new Node(nodeId);
        await node.Retrieve();
        frmIDOfImp = !!node.NodeFrmID ? node.NodeFrmID : 'ND' + nodeId;
      }

      //执行.
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner_ImpExp');
      handler.AddPara('FK_MapData', frmID);
      handler.AddPara('FromFrmID', frmIDOfImp);
      handler.AddPara('IsClear', 0);
      handler.AddPara('IsSetReadonly', IsReadOnly === '1' ? 0 : 1);
      const data = await handler.DoMethodReturnString('Imp_FromsCopyFrm');
      Events.emit('reloadForm');
      return new GPNReturnObj(GPNReturnType.Reload, data);

      // // if ($('#CB_IsClear').attr('checked') == 'checked')
      // //     handler.AddPara("IsClear", 1);
      // // else
      // //     handler.AddPara("IsClear", 0);
      // // var val = document.getElementById("CB_IsSetReadonly").checked;
      // // if (val == true)
      // //     handler.AddPara("IsSetReadonly", 1);
      // // else
      // //     handler.AddPara("IsSetReadonly", 0);
      // // if (confirm('您确定要从[' + nodeIdSelected + ']执行导入吗？导入后会清空当前的设计的元素。') == false)
      // //     return;
      // // if (data.indexOf('err@') == 0) {
      // //   alert(data);
      // //   return;
      // // }
      // alert(data + '\t\n 如果父页面不能刷新，请关闭当前表单设计器重新打开.');
      // window.parent.location.href = window.parent.location.href;
      //执行导入表单. @lyc
    }

    if (pageNo == 'ImpEnsFrm') {
      const ensName = tb1;
      //执行.
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner_ImpExp');
      handler.AddPara('FrmID', frmID);
      handler.AddPara('EnsName', ensName);
      const data = await handler.DoMethodReturnString('Imp_FrmEnsName');
      Events.emit('reloadForm');
      return new GPNReturnObj(GPNReturnType.Message, data);
    }

    // 导入表结构.
    if (pageNo == 'TableSrc.Tables.Fields') {
      const fields = tb1;
      const names = tb2;

      //GroupID
      const groups = new BSEntities('BP.Sys.GroupFields');
      await groups.Retrieve('FrmID', frmID);
      const group = groups.getData();
      let groupID = 0;
      if (group.length == 0) {
        const gf12 = new GroupField();
        gf12.Lab = '基本信息';
        gf12.FrmID = frmID;
        gf12.Idx = 1;
        await gf12.DirectInsert();
        groupID = gf12.OID;
      } else {
        groupID = group[0].OID;
      }

      const fieldsStrs = fields.split(',');
      const namesStrs = names.split(',');
      for (let index = 0; index < fieldsStrs.length; index++) {
        const field = fieldsStrs[index].split('=');
        const name = namesStrs[index];

        const entity = new Entity('BP.Sys.MapAttr');
        const PK = `${frmID}_${field[0]}`;
        entity.setPK(PK);
        if (!(await entity.RetrieveFromDBSources())) {
          const attr = entity.getData();
          attr.KeyOfEn = field[0];
          if (field[1] === 'varchar' || field[1] === 'character varying' || field[1] === 'text') {
            attr.MyDataType = 1; // string
          } else if (field[1] === 'int' || field[1] === 'integer' || field[1] === 'smallint' || field[1] === 'bigint') {
            attr.MyDataType = 2; // int
          } else if (field[1] === 'float' || field[1] === 'real' || field[1] === 'float4') {
            attr.MyDataType = 3; // float
          } else if (field[1] === 'double' || field[1] === 'double precision' || field[1] === 'float8') {
            attr.MyDataType = 5; // double
          } else if (field[1] === 'boolean' || field[1] === 'bit' || field[1] === 'bool') {
            attr.MyDataType = 4; // boolean
          } else if (field[1] === 'date') {
            attr.MyDataType = 6; // date
          } else if (field[1] === 'datetime' || field[1] === 'timestamp' || field[1] === 'datetime2' || field[1] === 'timestamp with time zone') {
            attr.MyDataType = 7; // datetime
          } else if (field[1] === 'money' || field[1] === 'decimal' || field[1] === 'numeric' || field[1] === 'smallmoney' || field[1] === 'currency') {
            attr.MyDataType = 8; // money
          }
          attr.GroupID = groupID;
          attr.Idx = index;
          attr.MyPK = PK;
          attr.FrmID = frmID;
          attr.FK_MapData = frmID;
          attr.Name = name;

          await entity.Insert();
        }
        Events.emit('reloadForm');
      }

      return new GPNReturnObj(GPNReturnType.Message, '导入成功.');
    }

    // 导入查询.
    if (pageNo == 'SFSearch.Fields') {
      const fields = tb1;
      const names = tb2;
      const fieldsStrs = fields.split(',');
      const namesStrs = names.split(',');
      const sfCol = new SFColumn();
      const searchNo = this.RequestVal('tb1', 'SFSearch');

      let msg = '';
      for (let index = 0; index < fieldsStrs.length; index++) {
        const field = fieldsStrs[index];
        const name = namesStrs[index];

        sfCol.MyPK = searchNo + '_' + field;
        await sfCol.RetrieveFromDBSources();

        const entity = new Entity('BP.Sys.MapAttr');
        const PK = `${frmID}_${field}`;
        entity.setPK(PK);
        const num = await entity.RetrieveFromDBSources();
        if (num == 1) {
          msg += '字段:' + field + '已经存在.';
          continue;
        }

        sfCol.MyPK = field;
        await sfCol.RetrieveFromDBSources();

        const attr = entity.getData();
        attr.KeyOfEn = field;

        if (sfCol.DataType == 'String') attr.MyDataType = DataType.AppString;
        if (sfCol.DataType == 'Int') attr.MyDataType = DataType.AppInt;
        if (sfCol.DataType == 'Float') attr.MyDataType = DataType.AppFloat;
        if (sfCol.DataType == 'DateTime') attr.MyDataType = DataType.AppDateTime;
        if (sfCol.DataType == 'Date') attr.MyDataType = DataType.AppDate;
        if (sfCol.DataType == 'Double') attr.MyDataType = DataType.AppDouble;

        // todo扩展类型判断
        attr.Idx = index;
        attr.MyPK = PK;
        attr.FrmID = frmID;
        attr.FK_MapData = frmID;
        attr.Name = name;
        await entity.Insert();
        msg += '字段:' + field + '导入成功.';
      }
      Events.emit('reloadForm');
      return new GPNReturnObj(GPNReturnType.Message, '导入信息如下:' + msg);
    }

    if (pageNo === 'ExpExcel') {
      alert('尚未实现.');
      return;
    }
    //导出表单. @lyc
    if (pageNo === 'ExpXml') {
      const md = new Entity('BP.Sys.MapData', frmID);
      await md.Init();
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCBPMDesigner');
      handler.AddPara('FK_MapData', frmID);
      const data = await handler.DoMethodReturnString('DownFormTemplete');
      if (data.includes('url@')) {
        const url = data.replace('url@', '');
        return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      }
      downloadByData(data, md.getData().Name + '.xml', 'xml');
      Events.emit('reloadForm');

      return new GPNReturnObj(GPNReturnType.DoNothing, '');
    }
  }

  public readonly Imp = `
  #### 帮助
   - 选择的模版文件必须是驰骋表单引擎导出的格式为 .xml 的文件.
   - **导入后会清空当前设计的元素.**
  `;
  public readonly ImpNodeFrm = `
  #### 帮助
   - 选择下列节点所绑定的表单进行导入.
   
  `;
  public readonly ImpIsReadOnly = `
  #### 帮助
   - 选择从表单库导入的表单是否可编辑.
   
  `;
  public readonly TableSrc = `
  #### 帮助
  - 从数据表结构导入字段然后生成表单.
  - 选择表结构.
  `;
  public readonly TableSrc_Tables = `
  #### 帮助
  - 选择表.
  `;
  public readonly TableSrc_Tables_Fields = `
  #### 帮助
  - 选择字段.
  `;
  public readonly ImpEnsFrm = `
  #### 帮助
  - 根据实体类的属性进行导入.
  `;
  public readonly Exp = `
  #### 帮助
   - 表单导出.
   - 请点击下一步进行下载.  
  `;
  //帮助：word表单导入
  public readonly WordImpHelpUn = `
   #### 帮助
   - 视频教程：https://drive.weixin.qq.com/s?k=AOsAZQczAAY4qqF3E1
   - 此功能使用到了OFFICE API,后台只能发布在安装office或wps的windows系统中
   - 此功能只支持docx操作
   - 通过识别定义的标志对word进行解析操作
       1.自动生成表单
       2.自动生成rtf模版，在运行=》列表 ，双击已生成的数据时 可以在左侧看到“rtf生成文档”打印按钮
   #### 标志介绍
   - .XY （表格标志）
       第一行第一列单元格内容以.XY结尾 (行标题和列标题共同组成主表字段，数据以表单的形式逐个录入)
      ![输入图片说明](./resource/WF/Admin/FrmLogic/ImpExp/xy1.png "屏幕截图.png") 
      ![输入图片说明](./resource/WF/Admin/FrmLogic/ImpExp/xy2.png "屏幕截图.png") 
      ![输入图片说明](./resource/WF/Admin/FrmLogic/ImpExp/xy3.png "屏幕截图.png") 
   - .X  （表格标志）
      第一行第一列单元格内容以.X结尾(行标题组成主表字段，数据以表单的形式逐个录入)
     ![输入图片说明](./resource/WF/Admin/FrmLogic/ImpExp/x1.png "屏幕截图.png") 
   - .T  （表格标志）
      第一行第一列单元格内容以.T结尾 (行标题组成主表字段，数据以表单的形式逐个录入) 
     ![输入图片说明](./resource/WF/Admin/FrmLogic/ImpExp/t1.png "屏幕截图.png") 
   - .DTL （表格标志）  
      第一行第一列单元格内容以.DTL结尾(行标题组成主表字段，数据以表格形式插入多行数据)
      ![输入图片说明](./resource/WF/Admin/FrmLogic/ImpExp/dtl.png "屏幕截图.png") 
   - .* (表格标志)
      以此开头的单元格内容会保留原数据不会处理  
   - #PIC# （图片标志）
      在word文档需要插入图片的地方录入此标志(支持多图片上传)
      ![输入图片说明](./resource/WF/Admin/FrmLogic/ImpExp/pic.png "屏幕截图.png") 
  `;
}
