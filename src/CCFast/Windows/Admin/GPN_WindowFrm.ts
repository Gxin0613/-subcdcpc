import { WinDocModel } from '../Admin/WinDocModel';
import { WindowTemplate } from '../Admin/WindowTemplate';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { MapAttr } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
import { GloWF } from '/@/WF/Admin/GloWF';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_WindowFrm extends PageBaseGroupNew {
  constructor() {
    super('GPN_WindowFrm');
    this.PageTitle = '表单(实体&单据)向导';
  }

  public async Init() {
    console.log(this.params);
    this.AddGroup('A', '新建窗体'); //增加分组.
    this.SelectItemsByList('SelectType', '图表分析', this.BuessUnit, false, this.selectChartType());
    this.AddIcon('icon-book-open', 'SelectType');
    // 查询需要的字段
    const numberSQL = GloWF.SQLOfWindowFrmNumberSQL(this.RequestVal('FrmID'));
    // `SELECT KeyOfEn as No,Name FROM Sys_MapAttr WHERE MyDataType IN (2,3,5,8)
    // AND LGType=0 AND FK_MapData='${this.RequestVal('FrmID')}'
    //  AND KeyOfEn NOT IN ('OID','FID','PWorkID','BillState','WFState','WFSta')
    //  UNION
    //  SELECT 'MyCountNum' as No, '条数' as Name FROM WF_Emp WHERE No='admin'
    //  `;
    const fkEnumSQL = GloWF.SQLOfWindowFrmFkEnumSQL(this.RequestVal('FrmID'));
    // `SELECT KeyOfEn as No,Name FROM Sys_MapAttr WHERE MyDataType IN (2,1)
    //  AND UIContralType in (1,3) AND FK_MapData='${this.RequestVal('FrmID')}' `;

    this.SelectItemsByList('SelectType.Group', '分析内容', this.BuessUnit, false, fkEnumSQL);
    this.SelectItemsByList('SelectType.Group.NumField', '分析数据', this.BuessUnit, true, numberSQL);

    //饼状图
    this.AddBlank('ChartPie', '饼状图', this.BuessUnit);
    this.AddIcon('icon-pie-chart', 'ChartPie');
    this.SelectItemsByList('ChartPie.Group', '分析内容', this.BuessUnit, false, fkEnumSQL);
    this.SelectItemsByList('ChartPie.Group.NumField', '分析数据', this.BuessUnit, false, numberSQL);

    //1维表格
    this.AddBlank('Table1', '一维表格', this.Table1);
    // this.AddIcon('glyphicon glyphicon-th-large'); //这样表达，是最后一个page的icon可否？
    this.AddIcon('glyphicon glyphicon-th-large', 'Table1');

    this.SelectItemsByList('Table1.Group', '分析内容', this.Table1, false, fkEnumSQL);
    this.SelectItemsByList('Table1.Group.NumField', '分析数据', this.Table1, true, numberSQL);

    //2维表格
    this.AddBlank('Table2', '二维表格', this.Table2);
    this.AddIcon('glyphicon glyphicon-th-list', 'Table2');
    this.SelectItemsByList('Table2.Group', '分析内容', this.Table2, false, fkEnumSQL);
    this.SelectItemsByList('Table2.Group.NumField', '分析数据', this.Table2, true, numberSQL);

    //3维表格
    this.AddBlank('Table3', '三维表格', this.Table3);
    this.AddIcon('glyphicon glyphicon-th', 'Table3');
    this.SelectItemsByList('Table3.Group1', '分析内容维度1', this.Table3, false, fkEnumSQL);
    this.SelectItemsByList('Table3.Group1.Group2', '分析内容维度2', this.Table3, false, fkEnumSQL);
    this.SelectItemsByList('Table3.Group1.Group2.NumField', '分析数据', this.Table3, false, numberSQL);

    this.AddGroup('B', '内置分析(开发中)'); //增加分组.
    this.AddBlank('Num0', '总数', this.HelpTodo);
    this.AddIcon('fa fa-fw fa-sitemap', 'Num0');
    this.AddBlank('Num1', '归档数', this.HelpTodo);
    this.AddIcon('fa fa-fw fa-sliders', 'Num1');
    this.AddBlank('Num2', '编辑数', this.HelpTodo);
    this.AddIcon('fa fa-fw fa-edit', 'Num2');
    this.AddBlank('FrmTrack', '轨迹动态', this.HelpTodo);
    this.AddIcon('fa fa-fw fa-tasks', 'FrmTrack');

    // this.SelectItemsByList('ChartRing', '环形图', this.BuessUnit, false, this.selectChartType());
    // this.SelectItemsByList('ChartRate', '环形图', this.BuessUnit, false, this.selectChartType());
  }

  // 选择图表类型
  public selectChartType() {
    return JSON.stringify([
      { No: WinDocModel.ChartLine, Name: '折线图' },
      // { No: WinDocModel.ChartPie, Name: '饼状图' },
      { No: WinDocModel.ChartZZT, Name: '柱状图' },
      // { No: WinDocModel.Table, Name: '简单表格' },
      //  { No: WinDocModel.ChartRate, Name: '百分比扇形图' },
      //  { No: WinDocModel.ChartRing, Name: '环形图' },
    ]);
  }

  // 选择图表类型
  public async GenerEn(attrGroups: string, frmID: string, defaultSQL: string): Promise<WindowTemplate> {
    const en = new WindowTemplate();
    //获得分组字段: XB,ZZMM
    const strs = attrGroups.split(',');
    for (let i = 0; i < strs.length; i++) {
      const str = strs[i];
      if (str == '' || str == null) continue;

      const attrID = frmID + '_' + str;
      const mapAttr = new MapAttr(attrID);
      await mapAttr.Retrieve();

      if (mapAttr.LGType == 1) {
        const attr = 'C' + i + 'Ens';
        const sql = 'SELECT IntKey as No, Lab as Name FROM Sys_Enum WHERE EnumKey= ~' + mapAttr.UIBindKey + '~ ';
        sql.replace('~', "'");
        en.SetValByKey(attr, sql);
        continue;
      }

      //枚举值.
      defaultSQL = defaultSQL.replaceAll(str + ',', str + 'T,');
    }
    en.Docs = defaultSQL;
    return en;
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    //判断是否需要执行.
    if (pageNo == 'SelectType.Group.NumField' || 'ChartPie.Group.NumField' || pageNo == 'Table1.Group.NumField' || pageNo == 'Table2.Group1.Group2.NumField') {
    } else return;

    const frmID = this.RequestVal('FrmID');
    const fromPageID = this.RequestVal('PageID');

    const frm = new MapData(frmID);
    await frm.RetrieveFromDBSources();

    //2维表格.
    if (pageNo == 'Table2.Group1.Group2.NumField') {
      const attrNums = this.RequestVal('tb1', 'Table2.Group1.Group2.NumField');
      //窗口名称: 比如:分析：政治面貌,性别.
      const winName = '分析:' + this.RequestVal('tb2', 'Table2.Group1') + ',' + this.RequestVal('tb2', 'Table2.Group1.Group2');

      //拼接 attrGroups 字段:XB,ZZMM
      const attrGroups = this.RequestVal('tb1', 'Table2.Group1') + ',' + this.RequestVal('tb1', 'Table2.Group1.Group2');
      let defaultSQL = `SELECT ${attrGroups} , ${attrNums
        .split(',')
        .map((item) => 'sum(' + item + ') as ' + item)
        .join(',')} FROM  ${frm.PTable} WHERE 1=1 GROUP BY ${attrGroups} `;

      //处理个数.
      defaultSQL = defaultSQL.replace('sum(MyCountNum) as MyCountNum', 'count(*) as MyNum');

      //更新节点表单类型.
      const en = new WindowTemplate();
      en.PageID = fromPageID;
      en.Name = winName;
      en.WinDocModel = 'Table'; //窗口内容模式.
      en.Icon = 'icon-grid';

      const md = new MapData(frmID);
      await md.RetrieveFromDBSources();

      //获得分组字段: XB,ZZMM
      const strs = attrGroups.split(',');
      for (let i = 0; i < strs.length; i++) {
        const str = strs[i];
        if (str == '' || str == null) return;

        const attrID = frmID + '_' + str;
        const mapAttr = new MapAttr(attrID);
        await mapAttr.Retrieve();

        //枚举值.
        if (mapAttr.LGType == 1) {
          const attr = 'C' + i + 'Ens';
          const sql = 'SELECT IntKey as No, Lab as Name FROM Sys_Enum WHERE EnumKey= ~' + mapAttr.UIBindKey + '~ ';
          sql.replace('~', "'");
          en.SetValByKey(attr, sql);
          continue;
        }

        //外键值.
        defaultSQL = defaultSQL.replaceAll(str + ',', str + 'T,');
        const attr = 'C' + i + 'Ens';
        en.SetValByKey(attr, ` SELECT DISTINCT ${str} as No, ${str}T as Name FROM  ${md.PTable}  WHERE ${str}!='' `);
      }

      en.Docs = defaultSQL; //给sql赋值.
      //列的中文名字. 格式: 性别,政治面貌
      let chName = this.RequestVal('tb2', 'Table2.Group1');
      chName += ',' + this.RequestVal('tb2', 'Table2.Group1.Group2');
      chName += ',' + this.RequestVal('tb2', 'Table2.Group1.Group2.NumField');
      en.Tag1 = chName; //解析列名.
      await en.Insert();
      const url = GloComm.UrlEn('TS.CCFast.Windows.WinTable', en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //1维表格.
    if (pageNo == 'Table1.Group.NumField') {
      const attrNums = this.RequestVal('tb1', 'Table1.Group.NumField');
      const winName = '分析:' + this.RequestVal('tb2', 'Table1.Group.NumField');
      const attrGroups = this.RequestVal('tb1', 'Table1.Group');
      let defaultSQL = `SELECT ${attrGroups} , ${attrNums
        .split(',')
        .map((item) => 'sum(' + item + ') as ' + item)
        .join(',')} FROM  ${frm.PTable} WHERE 1=1 GROUP BY ${attrGroups} `;

      defaultSQL = defaultSQL.replace('sum(MyCountNum) as MyCountNum', 'count(*) as MyNum');

      //更新节点表单类型.
      const en = new WindowTemplate();
      en.PageID = fromPageID;
      en.Name = winName;
      en.WinDocModel = 'Table'; //窗口内容模式.
      en.Icon = 'icon-grid';

      const md = new MapData(frmID);
      await md.RetrieveFromDBSources();

      //获得分组字段: XB,ZZMM
      const strs = attrGroups.split(',');
      for (let i = 0; i < strs.length; i++) {
        const str = strs[i];
        if (str == '' || str == null) return;

        const attrID = frmID + '_' + str;
        const mapAttr = new MapAttr(attrID);
        await mapAttr.Retrieve();

        if (mapAttr.LGType == 1) {
          const attr = 'C' + i + 'Ens';
          const sql = 'SELECT IntKey as No, Lab as Name FROM Sys_Enum WHERE EnumKey= ~' + mapAttr.UIBindKey + '~ ';
          sql.replace('~', "'");
          en.SetValByKey(attr, sql);
          continue;
        }
        //枚举值.
        defaultSQL = defaultSQL.replaceAll(str + ',', str + 'T,');

        //外键值.
        defaultSQL = defaultSQL.replaceAll(str + ',', str + 'T,');
        const attr = 'C' + i + 'Ens';
        en.SetValByKey(attr, 'SELECT DISTINCT ' + str + ' as No,' + str + 'T as Name FROM ' + md.PTable + ' WHERE 1=1 AND length(' + str + ') >1');
      }

      en.Docs = defaultSQL; //给sql赋值.
      en.Tag1 = this.RequestVal('tb2', 'Table1.Group') + ',' + this.RequestVal('tb2', 'Table1.Group.NumField'); //解析列名.
      await en.Insert();
      const url = GloComm.UrlEn('TS.CCFast.Windows.WinTable', en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //图形分析.
    if (pageNo == 'SelectType.Group.NumField') {
      const pageID = this.RequestVal('tb1', 'SelectType');
      const attrNums = this.RequestVal('tb1', 'SelectType.Group.NumField');
      const winName = '分析:' + this.RequestVal('tb2', 'SelectType.Group');
      const attrGroups = this.RequestVal('tb1', 'SelectType.Group');
      let defaultSQL = `SELECT ${attrGroups} , ${attrNums
        .split(',')
        .map((item) => 'sum(' + item + ') as ' + item)
        .join(',')} FROM  ${frm.PTable} WHERE 1=1 GROUP BY ${attrGroups} `;

      defaultSQL = defaultSQL.replace('sum(MyCountNum) as MyCountNum', 'count(*) as MyNum');

      const md = new MapData(frmID);
      await md.RetrieveFromDBSources();
      //   const en = this.GenerEn(attrGroups, frmID, defaultSQL) as unknown as WindowTemplate;
      const en = new WindowTemplate();
      //获得分组字段: XB,ZZMM
      const strs = attrGroups.split(',');
      for (let i = 0; i < strs.length; i++) {
        const str = strs[i];
        if (str == '' || str == null) continue;

        const attrID = frmID + '_' + str;
        const mapAttr = new MapAttr(attrID);
        await mapAttr.Retrieve();

        //枚举值.
        if (mapAttr.LGType == 1) {
          const attr = 'C' + i + 'Ens';
          const sql = 'SELECT IntKey as No, Lab as Name FROM Sys_Enum WHERE EnumKey= ~' + mapAttr.UIBindKey + '~ ';
          sql.replace('~', "'");
          en.SetValByKey(attr, sql);
          continue;
        }

        //外键值.
        defaultSQL = defaultSQL.replaceAll(str + ',', str + 'T,');
        const attr = 'C' + i + 'Ens';
        en.SetValByKey(attr, 'SELECT DISTINCT ' + str + ' as No,' + str + 'T as Name FROM ' + md.PTable + ' WHERE 1=1 AND length(' + str + ') >1');
      }
      en.Docs = defaultSQL;

      //折线图，柱状图.
      if (pageID === WinDocModel.ChartLine || pageID === WinDocModel.ChartZZT) {
        en.PageID = fromPageID;
        en.Name = winName;
        en.WinDocModel = pageID; //窗口内容模式.
        en.Icon = 'icon-fire';
        // en.Docs = 'SELECT FK_Dept,COUNT(*) AS Num FROM Port_Dept GROUP BY FK_Dept';
        en.Docs = defaultSQL;
        await en.Insert();
        const url = GloComm.UrlEn('TS.CCFast.Windows.' + pageID, en.No);
        return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      }

      //饼图.
      if (pageID === WinDocModel.ChartPie) {
        en.PageID = fromPageID;
        en.Name = winName;
        en.WinDocModel = pageID; //窗口内容模式.
        en.Icon = 'icon-fire';
        // en.Docs = 'SELECT FK_Dept,COUNT(*) AS Num FROM Port_Dept GROUP BY FK_Dept';
        en.Docs = defaultSQL;
        await en.Insert();
        const url = GloComm.UrlEn('TS.CCFast.Windows.' + pageID, en.No);
        return new GPNReturnObj(GPNReturnType.GoToUrl, url);
      }
    }
    //饼状图.
    if (pageNo == 'ChartPie.Group.NumField') {
      const attrNums = this.RequestVal('tb1', 'ChartPie.Group.NumField');
      const winName = '分析:' + this.RequestVal('tb2', 'ChartPie.Group');
      const attrGroups = this.RequestVal('tb1', 'ChartPie.Group');
      let defaultSQL = `SELECT ${attrGroups} , ${attrNums
        .split(',')
        .map((item) => 'sum(' + item + ') as ' + item)
        .join(',')} FROM  ${frm.PTable} WHERE 1=1 GROUP BY ${attrGroups} `;

      defaultSQL = defaultSQL.replace('sum(MyCountNum) as MyCountNum', 'count(*) as MyNum');

      const md = new MapData(frmID);
      await md.RetrieveFromDBSources();
      //   const en = this.GenerEn(attrGroups, frmID, defaultSQL) as unknown as WindowTemplate;
      const en = new WindowTemplate();
      //获得分组字段: XB,ZZMM
      const strs = attrGroups.split(',');
      for (let i = 0; i < strs.length; i++) {
        const str = strs[i];
        if (str == '' || str == null) continue;

        const attrID = frmID + '_' + str;
        const mapAttr = new MapAttr(attrID);
        await mapAttr.Retrieve();

        //枚举值.
        if (mapAttr.LGType == 1) {
          const attr = 'C' + i + 'Ens';
          const sql = 'SELECT IntKey as No, Lab as Name FROM Sys_Enum WHERE EnumKey= ~' + mapAttr.UIBindKey + '~ ';
          sql.replace('~', "'");
          en.SetValByKey(attr, sql);
          continue;
        }

        //外键值.
        defaultSQL = defaultSQL.replaceAll(str + ',', str + 'T,');
        const attr = 'C' + i + 'Ens';
        en.SetValByKey(attr, 'SELECT DISTINCT ' + str + ' as No,' + str + 'T as Name FROM ' + md.PTable + ' WHERE 1=1 AND length(' + str + ') >1');
      }
      en.Docs = defaultSQL;

      //饼图.
      en.PageID = fromPageID;
      en.Name = winName;
      en.WinDocModel = 'ChartPie'; //窗口内容模式.
      en.Icon = 'icon-fire';
      // en.Docs = 'SELECT FK_Dept,COUNT(*) AS Num FROM Port_Dept GROUP BY FK_Dept';
      en.Docs = defaultSQL;
      await en.Insert();
      const url = GloComm.UrlEn('TS.CCFast.Windows.ChartPie', en.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
  }
  public readonly Table1 = `
  #### 帮助 -2维表格 
  - 样式
  - ![输入图片说明](./resource/CCBill/RptTabl1.png "1维度表格")  
`;

  public readonly Table2 = `
#### 帮助 -2维表格 
- 样式
- ![输入图片说明](./resource/CCBill/RptTabl2.png "1维度表格")  
`;

  public readonly Table3 = `
#### 帮助 -2维表格 
- 样式
- ![输入图片说明](./resource/CCBill/RptTabl3.png "1维度表格")  
`;

  public readonly SFProc = `
  #### 帮助
  - 执行定义的过程.
  - 系统将把表单数据主表从表，都会写入到接口里面去.
`;

  // 按表单字段计算
  public readonly Docs0 = `
  #### 帮助
  - 在执行内容里填写一个存储过程名称，注意表达式支持变量。如： EXEC YourProName @OID
  #### 运行图例
  ![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/StoreProcedure.png "屏幕截图.png")  
`;

  // 业务单元.
  public readonly BuessUnit = `
#### 帮助
- ccbpm提供了一个让后台开发人员使用的代码表达业务逻辑实现的方式,业务单元是其中的一种.
- 定义: 处理一段业务逻辑脚本, 我们称为业务单元,比如:付款,出库. 
- 这个业务模块有通用性,可以被很多流程所调用,我们把它封装为一个业务单元.
- 这个代码块从一个基类上继承下来（BP.Sys.BuessUnitBase）. 按照要求重写方法. 
- 在配置的时候，ccbpm通过基类的反射功能，放入到下拉框，方便流程设计人员进行选择配置.
#### DEMO.
- 定义一个子类，如下图:
![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/UnitDemo.png "屏幕截图.png")  
- 在BP类里定义一个业务单元类 如下图中的 出库信息初始化 BuessUnitFrmND1407 ，继承自 BP.Sys.BuessUnitBase
![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/BuessUnitBase.Java.png "屏幕截图.png")  
- 在后台选择这个类配置到表单事件中。

#### 配置图例
![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/Event.png "屏幕截图.png")  
#### 配置图例
![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/Event1.png "屏幕截图.png")  
#### 事件存储
 所有的事件配置信息都存储在Sys_FrmEvent表里。
![输入图片说明](./resource/WF/Admin/FrmLogic/MapData/FrmEvent/Img/Eventcc.png "屏幕截图.png")  
`;
  public readonly Docs4 = `
#### 帮助
- 返回一行数据的json格式的数据源.
- 在执行内容里设置一个http://myserver/Do.aspx?DoType=aaaaa，创建一个Do.aspx 根据DoType 标记这不同的内容处理。
- 如果顺利处理了就返回空，出现异常一定要返回: Error+”异常信息。”
- 处理返回值用: this.Response.Write("Error:"+msg); 方法.
- Ccform 处理的机制是，使用 HttpWebRequest 类静默的执行URL ,然后获取返回的内容。如果检查到前几个字符是Error 就认为是异常ccform 就会抛出异常。
#### 系统参数：
- 您定义的url比如为 /App/DoUrl.aspx?ABC=123 , 系统会在之后增加一些参数，这些参数叫系统参数。实际执行的url为。
- http://yourserver/App/DoUrl.aspx?ABC=123&UserNo=xy&SID=xxxxx&FK_Dept=1010&FK_Unit=10&EntityName=ND101&EntityPK=OID&EntityPKVal=12333& FK_Event=xxxxxx
`;

  public async GenerSorts(): Promise<any[]> {
    //流程.
    if (this.RefMainEnName === 'TS.WF.Template.FlowExt') {
      return Promise.resolve([
        {
          No: 'FlowOnCreateWorkID',
          Name: '创建工作ID后',
        },
        {
          No: 'FlowOverBefore',
          Name: '流程结束前',
        },
        {
          No: 'FlowOverAfter',
          Name: '流程结束后',
        },
        {
          No: 'BeforeFlowDel',
          Name: '流程删除前',
        },
        {
          No: 'AfterFlowDel',
          Name: '流程删除后',
        },
      ]);
    } //流程.

    //节点.
    if (this.RefMainEnName === 'TS.WF.Template.NodeExt') {
      return Promise.resolve([
        {
          No: 'WorkArrive',
          Name: '工作到达',
        },
        {
          No: 'SendWhen',
          Name: '当节点发送前',
        },
        {
          No: 'SendSuccess',
          Name: '节点发送成功时',
        },
        {
          No: 'SendError',
          Name: '节点发送失败时',
        },
        {
          No: 'ReturnBefore',
          Name: '当节点退回前',
        },
        {
          No: 'ReturnAfter',
          Name: '退回后',
        },
        {
          No: 'UndoneBefore',
          Name: '当节点撤销发送前',
        },
        {
          No: 'UndoneAfter',
          Name: '当节点撤销发送后',
        },
        {
          No: 'WhenReadWork',
          Name: '工作打开后',
        },
      ]);
    } //流程.

    //是一个表单.
    if (this.RefMainEnName === 'TS.Frm.MapFrmFool') {
      return Promise.resolve([
        {
          No: 'FrmLoadBefore',
          Name: '表单载入前',
        },
        {
          No: 'FrmLoadAfter',
          Name: '节点表单载入后',
        },
        {
          No: 'SaveBefore',
          Name: '当表单保存前',
        },
        {
          No: 'SaveAfter',
          Name: '当表单保存后',
        },
        {
          No: 'FrmLoadAfter',
          Name: '节点表单载入后',
        },
        {
          No: 'DeleteBefore',
          Name: '当表单删除前',
        },
        {
          No: 'DeleteAfter',
          Name: '当表单删除后',
        },
      ]);
    } //结束表单.

    // alert('没有判断的类型:' + this.RefDtlEnName);
    // alert(this.RefMainEnName);

    return Promise.resolve([]);
  }
}
