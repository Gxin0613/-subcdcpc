import { message } from 'ant-design-vue';
import { GloWF } from '../GloWF';
import { Cond } from './Cond';
import { Direction } from './Direction';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { Node } from '/@/WF/TSClass/Node';
import { CCRole } from '../AttrNode/CCRole/CCRole';
import { MapAttr } from '../FrmLogic/MapAttrs/MapAttr';
import { NodeExt } from '../AttrNode/NodeExt';
import { SysEnumMain } from '../FrmLogic/SysEnum/SysEnumMain';
import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
import WebUser from '/@/bp/web/WebUser';
import { SFProc } from '../FrmLogic/SFProc/SFProc';
import HttpHandler from '../FoolFormDesigner/dto/HttpHandler';
export class DataFrom {
  public static readonly CondByFrm = '0'; //节点表单条件
  public static readonly StandAloneFrm = '1'; //独立表单
  public static readonly CondStation = '2'; //按角色
  public static readonly CondDept = '3'; //按部门
  public static readonly CondBySQL = '4'; //按SQL
  public static readonly CondBySQLTemplate = '5'; //按SQL模板
  public static readonly CondByPara = '6'; //按参数
  public static readonly CondByUrl = '7'; //按url计算.
  public static readonly CondByWebApi = '8'; //按照webapi计算.
  public static readonly CondByWorkCheck = '9'; //按审核组件立场.
  public static readonly CondLeaderOfDept = '10'; //按部负责人计算.
  public static readonly CondEmp = '11'; //按人员
  public static readonly CondByProc = '12'; //按照自定义过程.
  public static readonly CondByBuessUnit = '13';
  public static readonly CondByFrmDtl = '14'; //表单从表条件
  public static readonly GenerDBSrc = '50'; //通用数据源计算
  public static readonly Operator = '100'; //操作符.
}
export class GPN_Cond extends PageBaseGroupNew {
  constructor() {
    super('GPN_Cond');
    this.PageTitle = '新建条件/表达式';
    this.ForEntityClassID = 'TS.WF.Cond';
  }

  public async Init() {
    //增加子页面.
    this.AddGroup('A', '条件表达式');
    this.AddBlank('Left', '左括号', this.ByCond100);
    this.AddBlank('Right', '右括号', this.ByCond100);
    this.AddBlank('AND', 'AND', this.ByCond100);
    this.AddBlank('OR', 'OR', this.ByCond100);

    // this.AddGoToUrl('')

    //绑定表单库模式.
    this.AddGroup('B', '内置表单条件');

    let flowNo = this.RequestVal('FlowNo');
    let nodeID = Number.parseInt(flowNo + '01');

    if (this.RefMainEnName.includes('CCRole') == true) {
      const role = new CCRole();
      role.MyPK = this.RefPKVal;
      role.RetrieveFromDBSources();
      nodeID = role.NodeID;
      flowNo = role.FlowNo;
    } else if (this.RefMainEnName.includes('NodeExt') == true) {
      nodeID = this.RefPKVal;
      const nodeExt = new NodeExt(nodeID);
      await nodeExt.Retrieve();
      flowNo = nodeExt.FK_Flow;
    } else {
      const dir = new Direction();
      dir.MyPK = this.RefPKVal; //this.RequestVal('MyPK');
      const num = await dir.RetrieveFromDBSources();
      if (num == 0) {
      }
      nodeID = dir.Node;
      flowNo = dir.FK_Flow;
    }

    //xxxx
    const frmIDRpt = 'ND' + Number(flowNo) + 'Rpt';

    this.SelectItemsByList('CondByFrm', '表单字段条件', this.ByFrm, false, GloWF.SQLOfCondByFrm(nodeID, frmIDRpt));

    //选择字段.
    // const sqlOfListField = `SELECT MyPK as No, Name FROM Sys_MapAttr
    // WHERE FK_MapData='@tb1_CondByFrm' OR FK_MapData='${frmIDRpt}'
    //  `;

    // this.SelectItemsByList('CondByFrm.SelectField', '选择字段', this.ByFrm, false, () => {
    //   return `SELECT MyPK as No, Name FROM Sys_MapAttr WHERE FK_MapData='${this.RequestVal('tb1', 'CondByFrm')}'
    //   AND KeyOfEn NOT IN ('OID','FID','AtPara')`;
    // });

    this.SelectItemsByGroupList(
      'CondByFrm.SelectField',
      '选择字段',
      this.ByFrm,
      false,
      () => {
        const frmID = this.RequestVal('tb1', 'CondByFrm');
        // const sql = `
        // SELECT OID as No, Lab AS Name FROM Sys_GroupField WHERE FrmID='${frmID}' AND 1=1
        // UNION
        // SELECT 0 AS No, '无分组' as Name FROM Port_Emp WHERE No='admin'
        // `;
        return GloWF.SQLOfCondSelectField(frmID);
      },
      () => {
        const frmID = this.RequestVal('tb1', 'CondByFrm');
        const exp = `'OID','FID','AtPara','GUID','WFState','WFSta'`;
        //   const sql = `
        //   SELECT MyPK as No, Name, GroupID FROM Sys_MapAttr WHERE FK_MapData='${frmID}'
        //    AND KeyOfEn NOT IN (${exp}) AND GroupID  IN (select OID from Sys_GroupField where FrmID='${frmID}')
        //    UNION
        //    SELECT MyPK as No, Name, 0 as GroupID FROM Sys_MapAttr WHERE FK_MapData='${frmID}'
        //    AND KeyOfEn NOT IN (${exp}) AND GroupID Not IN (select OID from Sys_GroupField where FrmID='${frmID}')
        // `;

        return GloWF.SQLOfCondByFrmSelectField(frmID, exp);
      },
    );

    this.SelectItemsByList('CondByFrmDtl', '表单从表字段条件', this.ByFrm, false, GloWF.SQLOfCondByFrm(nodeID, frmIDRpt));
    this.SelectItemsByList('CondByFrmDtl.SelectDtl', '选择从表', '', false, () => {
      const frmID = this.RequestVal('tb1', 'CondByFrmDtl');
      return GloWF.SQLOfDtls(frmID);
    });
    this.SelectItemsByGroupList(
      'CondByFrmDtl.SelectDtl.SelectField',
      '选择字段',
      this.ByFrm,
      false,
      () => {
        const frmID = this.RequestVal('tb1', 'CondByFrmDtl.SelectDtl');
        return GloWF.SQLOfCondSelectField(frmID);
      },
      () => {
        const frmID = this.RequestVal('tb1', 'CondByFrmDtl.SelectDtl');
        const exp = `'OID','AtPara','GUID','WFState','WFSta','RDT','Title','Rec','CDT'`;
        return GloWF.SQLOfCondByFrmSelectField(frmID, exp);
      },
    );

    this.TextBox1_Name(DataFrom.CondByWorkCheck, '审核组件的立场', this.CondByWorkCheck, '输入立场中文名称', '同意', '在审核组件中的立场配置.');
    this.AddGroup('C', '组织结构条件');
    //按角色计算.
    this.SelectItemsByGroupList(DataFrom.CondStation, '按角色计算', this.ByStation, true, GloWF.srcStationTypes, GloWF.srcStations);
    this.SelectItemsByTree(DataFrom.CondDept, '按部门计算', this.ByDept, true, GloWF.srcDepts, GloWF.srcDeptRoot);
    this.SelectItemsByTree(DataFrom.CondLeaderOfDept, '按部门负责人计算', this.ByLeaderOfDept, true, GloWF.srcDepts, GloWF.srcDeptRoot);
    this.SelectItemsByTreeEns(DataFrom.CondEmp, '按人员计算', this.ByEmp, true, GloWF.srcDeptLazily, '0', GloWF.srcEmpLazily, '@No=账号@Name=名称@Tel=电话', true);

    this.AddGroup('D', '开发接口条件');
    this.TextBox1_Name(DataFrom.CondByPara, '按开发者参数计算', this.CondByPara, '参数', '', '请输入表达式,比如:Jine > 1000 ');
    this.AddIcon('icon-playlist', DataFrom.CondByPara);

    // this.SelectItemsByList(DataFrom.CondBySQLTemplate, '按SQL模板条件计算', this.sqlTemplate, false, GloWF.CondTemplate);
    //this.AddIcon('icon-cup', DataFrom.CondBySQLTemplate);

    this.AddBlank(DataFrom.GenerDBSrc, '通用数据源计算', this.HelpUn);

    // this.SelectItemsByList(DataFrom.CondByBuessUnit, '业务单元-BuessUnit', this.ByBuessUnit, false, await this.GenerBuessUnit());
    // this.SelectItemsByGroupList(DataFrom.CondByProc, '按自定义过程计算', this.ByProc, false, GloWF.srcDBSrc, GloWF.srcSFProc);
    // this.AddIcon('icon-energy', DataFrom.CondByProc);

    // const sqlDemo = ` SELECT count(*) AS NUM FROM MyTable WHERE MyField='@WebUser.No' `;
    // this.TextSQL(DataFrom.CondBySQL, '按SQL表达式计算', this.BySQL, 'SQL表达式', sqlDemo, '请设置一个SQL语句,返回是number');
    // this.AddIcon('icon-doc', DataFrom.CondBySQL);

    //const sqlTemplate = 'SELECT No as No,Name as Name FROM WF_SQLTemplate WHERE SQLType=0 ';

    //this.TextBox1_Name(DataFrom.CondByUrl, '按Url条件计算', this.CondByUrl, 'URL', 'http://', '请输入url地址.');
    ///this.AddIcon('icon-graph', DataFrom.CondByUrl);

    //this.TextBox3_NameNoNote(DataFrom.CondByWebApi, '按WebApi返回值计算', this.WebApi, '', '请输入webapi接口地址 ', '判断值', '备注(不为空)', '');
    //this.AddIcon('icon-graph', DataFrom.CondByWebApi);

    // this.SelectItemsByList(DataFrom.CondByProc, '执行自定义过程', this.HelpTodo, false, 'SELECT No,Name FROM Sys_SFProc ');
    // this.TextBox2_NameNo(DataFrom.CondByUrl, '按Url条件计算', this.Desc100, '', 'SQL表达式', '备注', '请设置一个SQL语句,返回0,大于0');
    // this.TextBox3_NameNoNote(DataFrom.CondByWebApi, '按WebApi返回值计算', this.Desc100, '', '接口地址', '接口参数', '描述', 'http://xxxx');
  }
  ///业务单元.
  public async GenerBuessUnit() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode');
    const data = await handler.DoMethodReturnJson('ActionDtl_Init');
    return JSON.stringify(data);
  }
  //重写保存方法实现业务逻辑.
  // @ts-ignore
  /**
   *
   * @author
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @last-modified 22/6/28 移除了未使用的pageName , 修改为sortNo
   * @param pageID 页面ID.
   * @param sortNo 分类编号, 可以为空.
   * @param tb1 第1个文本框的值
   * @param tb2 第2个文本框的值
   * @param tb3 第3个文本框的值
   */
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    //检查是否方向条件规则是否按连接线自动计算?
    const refPKVal = this.RequestVal('RefPKVal');
    //alert(refPKVal + '' + this.RefMainEnName);

    let flowNo = '';
    let nodeID = 0;
    let toNodeID = 0;
    //检查转向条件，是否按照自动计算的模式?
    if (this.RefMainEnName.includes('CCRole') == true) {
      const en = new CCRole(refPKVal);
      await en.Init();
      await en.Retrieve();
      flowNo = en.FlowNo;
      nodeID = en.NodeID;
      toNodeID = en.NodeID;
    } else if (this.RefMainEnName.includes('NodeExt') == true) {
      const en = new NodeExt(refPKVal);
      await en.Init();
      await en.Retrieve();
      flowNo = en.FK_Flow;
      nodeID = en.NodeID;
      toNodeID = en.NodeID;
    } else {
      //方向条件.
      const dir1 = new Direction(refPKVal);
      await dir1.Init();
      await dir1.Retrieve();
      const node = new Node(dir1.Node);
      await node.RetrieveFromDBSources();
      if (node.CondModel != 0) {
        node.CondModel = 0;
        await node.Update();
      }
      //设置方向实体.
      const dir = new Direction(refPKVal);
      await dir.Init();
      await dir.Retrieve();
      flowNo = dir.FK_Flow;
      nodeID = dir.Node;
      toNodeID = dir.ToNode;
    }

    if (pageID == 'CondByFrm' || pageID == 'CondByFrmDtl' || pageID == 'CondByFrmDtl.SelectDtl') return;

    //创建对象.
    const en = new Cond();
    await en.Init();
    en.FK_Flow = flowNo;
    en.FK_Node = nodeID;
    en.ToNodeID = toNodeID;
    en.CondType = 2; //方向条件.
    if (this.RefMainEnName.includes('CCRole') == true) en.CondType = 4;
    if (this.RefMainEnName.includes('NodeExt') == true) en.CondType = 1; //流程完成条件.

    en.DataFrom = pageID;
    en.DataFromText = this.GetPageName(pageID);
    en.Idx = 100;
    en.RefPKVal = refPKVal;
    if (pageID === 'Left' || pageID === 'Right' || pageID === 'AND' || pageID === 'OR') {
      // @FK_Node=103@ToNodeID=104@FK_Flow=001@RefDirectionPK=001_103_104@orderBy=Idx
      en.DataFrom = 100; //运算符.
      en.DataFromText = '运算符';
      en.Note = pageID; //运算符.
      if (pageID === 'Left') en.Note = '(';
      if (pageID === 'Right') en.Note = ')';

      en.FK_Operator = en.Note; //都赋值，以免用错.
      en.OperatorValue = en.Note; //都赋值，以免用错.
      en.SetPara('EnName', 'TS.WF.Cond100'); //编辑类.
      await en.Insert();
      message.info('保存成功!!!');
      return new GPNReturnObj(GPNReturnType.CloseAndReload);
    }

    //按照表单的字段值计算.
    if (pageID === 'CondByFrm.SelectField') {
      const mapAttr = new MapAttr(tb1);
      mapAttr.MyPK = tb1;
      await mapAttr.Retrieve();

      //根据不同的字段类型,让其使用不同的类进行编辑.
      let enName = 'TS.WF.CondFrmString';
      en.Tag1 = mapAttr.UIBindKey; //设置枚举或者外键key.
      if (mapAttr.LGType == 1) {
        enName = 'TS.WF.CondFrmEnum';
        const enumMain = new SysEnumMain();
        if (SystemConfig.CCBPMRunModel == CCBPMRunModel.SAAS) enumMain.No = WebUser.OrgNo + '_' + mapAttr.UIBindKey;
        else enumMain.No = mapAttr.UIBindKey;

        const num = await enumMain.RetrieveFromDBSources();
        if (num == 1) if (enumMain.EnumType == 1) enName = 'TS.WF.CondFrmEnumString';
        //alert(enumMain.EnumType + ' ' + enumMain.No);
      }
      if (mapAttr.LGType >= 2) enName = 'TS.WF.CondFrmString';
      if (mapAttr.LGType == 0 && mapAttr.IsNum) enName = 'TS.WF.CondFrmNum';

      en.Note = ''; //自动生成描述 在beforUpdateInsertAction();
      if (mapAttr.FK_MapData.includes('ND') && mapAttr.FK_MapData.includes('Rpt')) en.DataFrom = DataFrom.CondByFrm;
      else en.DataFrom = DataFrom.StandAloneFrm;

      en.FK_Attr = tb1; //字段  ND1Rpt_QJLX
      en.AttrKey = mapAttr.KeyOfEn; //字段 QJLX
      en.AttrName = tb2; //字段名称. 请假类型.

      en.FK_Operator = '='; //操作符.
      en.FK_OperatorT = '等于'; //操作符.

      en.OperatorValue = '0'; //操作值.
      en.OperatorValueT = '未设置'; //操作值.

      en.Idx = 100;
      en.SetPara('EnName', enName); //编辑类.
      en.FrmID = this.RequestVal('tb1', 'CondByFrm'); //表单ID.
      if (en.FrmID.startsWith('ND') == false) en.DataFrom = DataFrom.StandAloneFrm;
      en.FrmName = this.RequestVal('tb2', 'CondByFrm'); //表单名称.
      await en.Insert();

      const url = GloComm.UrlEn(enName, en.MyPK); // '/@/WF/Comm/En.vue?EnName=' + enName + '&PKVal=' + en.MyPK;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    //按照表单的字段值计算.
    if (pageID === 'CondByFrmDtl.SelectDtl.SelectField') {
      const mapAttr = new MapAttr(tb1);
      mapAttr.MyPK = tb1;
      await mapAttr.Retrieve();

      //根据不同的字段类型,让其使用不同的类进行编辑.
      let enName = 'TS.WF.CondFrmString';
      en.Tag1 = mapAttr.UIBindKey; //设置枚举或者外键key.
      if (mapAttr.LGType == 1) {
        enName = 'TS.WF.CondFrmEnum';
        const enumMain = new SysEnumMain();
        if (SystemConfig.CCBPMRunModel == CCBPMRunModel.SAAS) enumMain.No = WebUser.OrgNo + '_' + mapAttr.UIBindKey;
        else enumMain.No = mapAttr.UIBindKey;

        const num = await enumMain.RetrieveFromDBSources();
        if (num == 1) if (enumMain.EnumType == 1) enName = 'TS.WF.CondFrmEnumString';
        //alert(enumMain.EnumType + ' ' + enumMain.No);
      }
      if (mapAttr.LGType >= 2) enName = 'TS.WF.CondFrmString';
      if (mapAttr.LGType == 0 && mapAttr.IsNum) enName = 'TS.WF.CondFrmNum';

      en.Note = ''; //自动生成描述 在beforUpdateInsertAction();
      en.DataFrom = DataFrom.CondByFrmDtl;

      en.FK_Attr = tb1; //字段  ND1Rpt_QJLX
      en.AttrKey = mapAttr.KeyOfEn; //字段 QJLX
      en.AttrName = tb2; //字段名称. 请假类型.

      en.FK_Operator = '='; //操作符.
      en.FK_OperatorT = '等于'; //操作符.

      en.OperatorValue = '0'; //操作值.
      en.OperatorValueT = '未设置'; //操作值.

      en.Idx = 100;
      en.SetPara('EnName', enName); //编辑类.
      en.FrmID = this.RequestVal('tb1', 'CondByFrmDtl.SelectDtl'); //表单ID.
      en.FrmName = this.RequestVal('tb2', 'CondByFrmDtl.SelectDtl'); //表单名称.
      await en.Insert();

      const url = GloComm.UrlEn(enName, en.MyPK); // '/@/WF/Comm/En.vue?EnName=' + enName + '&PKVal=' + en.MyPK;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    if (pageID === DataFrom.CondByWorkCheck) {
      en.Note = '当立场=[' + tb1 + ']时.';
      en.FK_Operator = pageID; //都赋值，以免用错.
      en.OperatorValue = tb1; //都赋值，以免用错.
      en.Idx = 100;
      en.SetPara('EnName', 'TS.WF.CondWorkCheckSelected'); //编辑类.
      en.AttrKey = '';
      await en.Insert();
      message.info('保存成功');
      const url = GloComm.UrlEn(en.GetParaString('EnName'), en.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //如果按照SQL作为条件.
    if (pageID === DataFrom.CondBySQL) {
      en.Note = tb3;
      en.FK_Operator = pageID; //都赋值，以免用错.
      en.OperatorValue = tb2; //都赋值，以免用错.
      en.Idx = 100;
      en.SetPara('EnName', 'TS.WF.CondSQL'); //编辑类.
      //en.AttrKey = 'local';
      en.FK_DBSrc = tb1;

      await en.Insert();
      message.info('保存成功');
      const url = GloComm.UrlEn(en.GetParaString('EnName'), en.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //按照过程计算.
    if (pageID === DataFrom.CondByProc) {
      en.Note = tb3;
      en.FK_Operator = pageID; //都赋值，以免用错.
      en.OperatorValue = tb1; //都赋值，以免用错.
      en.Idx = 100;
      en.SetPara('EnName', 'TS.WF.CondProc'); //编辑类.

      const proc = new SFProc(tb1);
      proc.No = tb1;
      await proc.RetrieveFromDBSources();

      en.Note = '过程名称:' + tb2 + ',数据源编号:' + proc.FK_SFDBSrc + ',' + proc.FK_SFDBSrcText;
      en.FK_SFDBSrc = proc.FK_SFDBSrc; //设置数据源.
      await en.Insert();
      message.info('保存成功');
      const url = GloComm.UrlEn(en.GetParaString('EnName'), en.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //按照过程计算.
    if (pageID === DataFrom.CondByBuessUnit) {
      en.Note = tb3;
      en.FK_Operator = pageID; //都赋值，以免用错.
      en.OperatorValue = tb1; //都赋值，以免用错.
      en.Idx = 100;
      en.SetPara('EnName', 'TS.WF.CondProc'); //编辑类.

      const proc = new SFProc(tb1);
      proc.No = tb1;
      await proc.RetrieveFromDBSources();

      en.Note = '过程名称:' + tb2 + ',数据源编号:' + proc.FK_SFDBSrc + ',' + proc.FK_SFDBSrcText;
      en.FK_SFDBSrc = proc.FK_SFDBSrc; //设置数据源.
      await en.Insert();
      message.info('保存成功');
      const url = GloComm.UrlEn(en.GetParaString('EnName'), en.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    //按照参数计算.
    if (pageID === DataFrom.CondByPara) {
      //判断tb1以空格分割数组大小
      if (!tb1) {
        message.error('参数条件不能为空');
        return;
      }
      if (tb1.split(' ').length < 3) {
        message.error('请检查设置的条件是否正确,操作符前后必须有空格');
        return;
      }
      en.Note = tb1;
      en.FK_Operator = pageID; //都赋值，以免用错.
      en.OperatorValue = tb1; //都赋值，以免用错.
      en.Idx = 100;
      en.SetPara('EnName', 'TS.WF.CondParas'); //编辑类.
      await en.Insert();
      message.info('保存成功');
      const url = GloComm.UrlEn(en.GetParaString('EnName'), en.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //按照url计算.
    if (pageID === DataFrom.CondByUrl) {
      en.Note = tb1;
      en.FK_Operator = pageID; //都赋值，以免用错.
      en.OperatorValue = tb1; //都赋值，以免用错.
      en.Idx = 100;
      en.SetPara('EnName', 'TS.WF.CondWebApi'); //编辑类.
      await en.Insert();
      message.info('保存成功');

      const url = GloComm.UrlEn(en.GetParaString('EnName'), en.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //按照WebApi计算.
    if (pageID === DataFrom.CondByWebApi) {
      en.Note = tb3;
      en.OperatorValue = tb1;
      en.Idx = 100;
      en.SetPara('EnName', 'TS.WF.CondWebApi'); //编辑类.
      await en.Insert();

      const url = GloComm.UrlEn(en.GetParaString('EnName'), en.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //按照角色计算.
    if (pageID === DataFrom.CondStation) {
      en.OperatorValue = tb1;
      en.OperatorValueT = tb2;
      en.Note = tb2;
      en.Idx = 100;
      en.SetPara('EnName', 'TS.WF.CondStation'); //编辑类.
      await en.Insert();
      const url = GloComm.UrlEn(en.GetParaString('EnName'), en.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //按照部门计算.
    if (pageID === DataFrom.CondDept || pageID === DataFrom.CondLeaderOfDept) {
      // debugger;
      en.OperatorValue = tb1;
      en.OperatorValueT = tb2;
      en.Note = tb2;
      en.Idx = 100;
      en.SetPara('EnName', 'TS.WF.CondDept'); //编辑类.
      await en.Insert();
      message.info('保存成功');
      const url = GloComm.UrlEn(en.GetParaString('EnName'), en.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //按照人员计算.
    if (pageID === DataFrom.CondEmp) {
      en.OperatorValue = tb1;
      en.OperatorValueT = tb2;
      en.Note = tb2;
      en.Idx = 100;
      en.SetPara('EnName', 'TS.WF.CondEmp'); //编辑类.
      await en.Insert();
      const url = GloComm.UrlEn(en.GetParaString('EnName'), en.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    if (pageID == DataFrom.GenerDBSrc) {
      //根据不同的字段类型,让其使用不同的类进行编辑.
      const enName = 'TS.WF.CondGenerDBSrc';
      en.Note = '通用数据源条件.';
      en.SetPara('EnName', enName); //编辑类.

      await en.Insert();
      const url = GloComm.UrlEn(enName, en.MyPK); // '/@/WF/Comm/En.vue?EnName=' + enName + '&PKVal=' + en.MyPK;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    message.error('没有判断的类型:' + en.DataFromText + ' pageID:' + pageID);
  }

  public readonly CondByWorkCheck = `
  #### 帮助
  - 审核组件立场.
  `;
  public readonly ByFrm = `
  #### 帮助
  - 按照表单的字段值来计算，是常用的一个方向条件，前提是您不是采用sdk模式开发的，是使用ccbpm内置的表单.
  - 场景: 请假流程的请假天数转向条件，合同审批流程的合同金额，作为转向条件.
  - 请选择一个表单，点击创建按钮.
  `;
  public readonly ByCond100 = `
  #### 帮助
  - 条件表达式包括 ( 、) 、AND、OR四个类型.
  - 用于链接条件，只有正确的配置好条件表达式，条件才可以工作.
  - 我们提供检查功能，来帮助您检查条件表达式是否正确.
  - 您可以拖动调整位置.
  #### 其它
  - 当有多个条件的时这些才有用.
  `;
  public readonly BySQL = `
  #### 帮助
  - 按SQL表达式计算.
  - 设置一个查询SQL，返回一行一列，获取一个数值，如果大于0，条件=true, 否则=false.
  - 比如: SELECT count(*) from port_emp WHERE FK_Dept='@WebUser.DeptNo' or xxxx=@MyFieldName
  - 支持ccbpm表达式，可以获取当前登录人员的信息变量，也可以获取表单字段变量.
  `;
  public readonly sqlTemplate = `
  #### 帮助
  - 按照SQL模板计算，与按SQL计算类似，我们把常用的SQL放入sql模板库存储起来.
  - 这里只是一个引用，不是copy，就是说当sql模板的配置信息变化后，这里跟着变化.
  - 支持ccbpm表达式，可以获取当前登录人员的信息变量，也可以获取表单字段变量.
  #### 其它
  - 请在系统管理里维护SQL模板.
  `;

  //按开发者参数计算
  public readonly CondByPara = `
  #### 帮助
  - 所谓的开发者参数，就是开发人员在执行流程过程中(发送、退回)，向接口传入的参数作为条件.
  - 比如: 发送方法
 #### 后端 DEMO
  //组织参数.
  Hashtable ht = new Hashtable();
  ht.Add("PrjNo", "项目编号"); 
  ht.Add("PrjName", "项目名称"); 
  ht.Add("JinE", 500000.00); //项目金额, 根据项目金额大小自动转向.
  //调用发送接口.
  BP.WF.Dev2Interface.Node_SendWork("001", 1002, ht, null);
  #### 前端Demo
  - 调用Toolkit的方法，把参数保存到系统中.
  -  Flow_SaveParas(100,'@JinE=100000.00')
  `;

  public readonly CondByUrl = `
  #### 帮助
  - URL就是通过http协议，运行一个url，返回数据，根据数据内容作为条件的一种方式.
  - 返回值是 err@开头的字符串，说明系统是有异常。
  - 返回值 >0 条件 =true，否则为false.
  #### 配置参数
  - 配置格式: http://ccflow.org/xxx.jsp
  - 系统解析格式: http://ccflow.org/xxx.do?WorkID=xxxx&FK_Flow=001&FK_Node=101&UserNo=zhangsan&Token=xxx-xx-xxx
  - 系统会自动把当前环境已知的参数加里面去，开发人员可以通过 WorkID获取流程的实例的其它数据，可以通过UserNo，Token来校验合法性.
  `;

  // 业务单元.
  public readonly ByBuessUnit = `
    #### 帮助
   - 通过调用业务单元，根据业务单元返回的值，来判断方向条件.
   - 返回true,false或者1,0来决定方向条件是否通过.
#### 其他
- ccbpm提供了一个让后台开发人员使用的代码表达业务逻辑实现的方式，业务单元是其中的一种.
- 定义: 处理一段业务逻辑脚本，我们称为业务单元，比如：付款，出库. 
- 这个业务模块有通用性，可以被很多流程所调用，我们把它封装为一个业务单元.
- 这个代码块从一个基类上继承下来（BP.Sys.BuessUnitBase）.按照要求重写方法. 
- 在配置的时候，ccbpm通过基类的反射功能，放入到下拉框，方便流程设计人员进行选择配置.
#### DEMO.
- 定义一个子类，如下图:
![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/UnitDemo.png "屏幕截图.png")  
- 在BP类里定义一个业务单元类，如下图中的：出库信息初始化 BuessUnitFrmND1407，继承自 BP.Sys.BuessUnitBase.
![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/BuessUnitBase.Java.png "屏幕截图.png")  
- 在后台选择这个类配置到表单事件中.
`;

  //事件类
  public readonly Event = `
#### 帮助
- 首先要写一个子类，从指定的基类上集成下来.
- 1. for c# 改基类为：BP.WF.FlowEventBase， 请参考文档尾部的代码模板.
- 2. for java 改基类为: bp.wf.FlowEventBase ， 请参考文档尾部的代码模板.
- 3. 在子类里重写这些事件，利用这些事件完成您的业务逻辑.
`;

  public readonly ByProc = `
  #### 帮助
   - 该模式的条件是通过数据源的过程返回值来判断方向条件的。
   - 数据源的过程返回，true,false 或者1,0。来决定方向条件是否通过。
  #### 数据源概念.
   - 首先了解数据源概念，请打开=>数据源设计=>帮助。
  `;

  public readonly WebApi = `
  #### 帮助
   - 返回值说明，"false"是不通过，"true"是通过。
   - WebAPI的输入格式：http://demo.ccflow.org/DataUser/GetEmps?id=51184
   - 接口地址支持固定参数，或者ccbpm内置参数，或者流程表单参数，比如：http://demo.ccflow.org/DataUser/GetEmps?id=@FK_Node
   #### 其它
   - 返回值是 err@开头的字符串，说明系统是有异常。
   - 返回值 >0 条件 =true, 否则为false。
  `;

  public readonly ByStation = `
  #### 帮助
   - 按角色计算: 是否属于所选角色. 
  `;

  public readonly ByLeaderOfDept = `
  #### 帮助
  - 按部门负责人计算：是否是所选部门的负责人.
  `;

  public readonly ByEmp = `
  #### 帮助
  - 按人员计算：是否在所选人员中.
  `;

  public readonly ByDept = `
  #### 帮助
  - 按部门计算：是否在所选部门中. 
  `;

  //不需要分组,就返回空.
  GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
    //  return null;
  }
}
