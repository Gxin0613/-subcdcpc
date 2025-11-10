import { GloWF } from '../../GloWF';
import { SyncData } from './SyncData';
import { SyncDataField } from './SyncDataField';
import { DataType } from '/@/bp/en/DataType';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_SyncData extends PageBaseGroupNew {
  constructor() {
    super('GPN_SyncData');
    this.PageTitle = '新建数据同步';
    this.ForEntityClassID = 'TS.AttrFlow.SyncData';
  }

  public async Init() {
    //增加子页面.
    this.AddGroup('A', '新建数据同步'); //增加分组.

    this.AddBlank('APIOfSystem', '同步到内置的API接口', this.APIOfSystem);
    this.TextBox1_Name('APIOfSelf', '同步到API接口', this.APIOfSelf, '输入API', 'http://', '请输入API接口地址');
    //数据源.
    const srcOfList = GloWF.srcDBSrc;
    ('SELECT No,Name FROM Sys_SFDBSrc');
    this.SelectItemsByList('DBSrc', '数据源', this.DBSrc, false, srcOfList);
    this.SelectItemsByList('DBSrc.Table', '表', this.DBSrcTable, false, this.DBSrc_GenerTables);
    this.SelectItemsByList('DBSrc.Table.PKField', '表的主键', this.DBSrcTable, false, this.DBSrc_GenerTable_PKField, true, true);
    this.SelectItemsByList('DBSrc.Table.PKField.Fields', '要同步的字段', this.DBSrcTable, true, this.DBSrc_GenerTable_PKField, true, true);

    //选择要同步的表单.
    const flowNo = this.RequestVal('RefPKVal');
    const frmIDRpt = 'ND' + Number(flowNo) + 'Rpt';
    const sqlOfList = GloWF.SQLOfFrmsFields(flowNo, frmIDRpt);
    // `SELECT DISTINCT A.FK_Frm as No, B.Name as Name FROM WF_FrmNode A,Sys_MapData B WHERE A.FK_Flow=${flowNo} AND A.FK_Frm=B.No
    //  UNION SELECT '${frmIDRpt}' as No, '${frmIDRpt}流程业务表' as Name FROM Port_Emp where No='admin' `;
    this.SelectItemsByList('DBSrc.Table.PKField.Fields.Frm', '数据源表单', this.HelpUn, false, sqlOfList);

    //const flow = new Flow();
    //flow.No = this.RefPKVal;
    //await flow.Retrieve();
    //const sql = `SELECT KeyOfEn as No, Name FROM Sys_MapAttr WHERE FK_MapData='${flow.PTableMapDataNo}' `;
    //this.SelectItemsByList('DBSrc.Table.PKField.Fields', '选择同步的字段', this.DBSrcTable, true, sql);

    this.AddGroup('B', '数据源管理'); //增加分组.
    this.AddBlank('AdminDBSrc', '数据源维护', '');
    this.AddBlank('AdminDBSrc.ToUrl', '修改', '');
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  private async DBSrc_GenerTables() {
    //获得指定页面的参数. .
    const dbSrcNo = this.RequestVal('tb1', 'DBSrc');
    const sfDBSrc = new BSEntity('BP.Sys.SFDBSrc', dbSrcNo);
    //sfDBSrc.No = dbSrcNo; // this.RequestVal('DBSrcNo'); // syncData.DBSrc;
    await sfDBSrc.Retrieve();
    const result = await sfDBSrc.DoMethodReturnJSON('GetTablesJson');
    return JSON.stringify(result);

    //获得指定页面的参数.
    // const handler = new HttpHandler('BP.WF.HttpHandler.TA_App');
    // handler.AddPara('No', this.No);
    // handler.AddPara('Name', this.Name);
    // handler.AddPara('Note', note);
    // handler.AddPara('JE', jine);
    // const val = await handler.DoMethodReturnString('OrderBill_JiaoNaXueFei');

    // @zhoupeng 初始化的时候根本不可能获取到第一步的数据。
    // return ` SELECT No,Name FROM Sys_SFDBSrc Where No = '${this.RequestVal('tb1', 'DBSrc')}'`;
  }
  private async DBSrc_GenerTable_PKField() {
    const dbSrcNo = this.RequestVal('tb1', 'DBSrc');
    const table = this.RequestVal('tb1', 'DBSrc.Table');
    const sfDBSrc = new BSEntity('BP.Sys.SFDBSrc', dbSrcNo);
    await sfDBSrc.Retrieve();
    const result = await sfDBSrc.DoMethodReturnJSON('GetTableFieldsJson', table);
    return JSON.stringify(result);
  }
  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    if (pageNo == 'AdminDBSrc' || pageNo == 'AdminDBSrc.ToUrl') {
      const url = '/@/WF/Comm/Search.vue?EnName=TS.Sys.SFDBSrc';
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    const flowNo = this.RequestVal('RefPKVal');
    console.warn('未使用的变量:', sortNo, tb3);
    //如果是使用内置的接口，就直接结束了.
    if (tb1 === 'APIOfSystem') {
      const en = new SyncData();
      en.FlowNo = flowNo;
      en.SyncType = 'APIOfSystem'; //类型.
      en.SyncTypeT = '系统内置的API'; //类型.
      en.Note = tb1 + tb2; //内容.
      en.DBSrc = tb1;
      en.SetPara('EnName', 'TS.AttrFlow.SyncDataByAPI');
      await en.Insert();
      //转入到url.
      const url = '/@/WF/Comm/En.vue?EnName=' + en.GetParaString('EnName', '') + '&PKVal=' + en.MyPK;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //它只有两步.
    if (pageNo === 'APIOfSelf') {
      const en = new SyncData();
      en.FlowNo = flowNo;
      en.SyncType = 'APIOfSelf'; //类型.
      //en.SyncTypeT = '同步到API接口'; //类型.
      en.Note = '同步到API接口：' + tb1; //内容.
      en.APIUrl = tb1;
      en.PTable = '无'; //数据表.
      en.PTableName = '无'; //表名.
      en.TablePKName = '无'; //主键.
      en.TablePKType = '无'; //主键类型.
      en.FrmID = '无'; //源表单ID.
      en.FrmName = '无'; //名称.
      en.SetPara('EnName', 'TS.AttrFlow.SyncDataByAPI');
      await en.Insert();

      //转入到url.
      const url = GloComm.UrlEnOnly(en.GetParaString('EnName', ''), en.MyPK);
      //  const url = '/@/WF/Comm/En.vue?EnName=' + en.GetParaString('EnName', '') + '&PKVal=' + en.MyPK;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    //进入选择数据源页面.
    if (pageNo === 'DBSrc') {
      // this.GotoPage('DBSrc.Table'); tb1=数据圆编号， tb2=名称。
      return;
    }

    //进入选择数据表页面,这里执行保存入库并关闭.
    if (pageNo == 'DBSrc.Table' || pageNo === 'DBSrc.Table.PKField' || pageNo == 'DBSrc.Table.PKField.Fields') {
      return;
    }
    if (pageNo === 'DBSrc.Table.PKField.Fields.Frm') {
      //执行创建.
      const en = new SyncData();
      en.FlowNo = flowNo;
      en.SyncType = 'DBSrc'; //类型.
      en.SyncTypeT = '数据源'; // this.RequestVal('DBSrcName') ; //类型.
      en.Note = '把流程数据同步到数据源上:' + this.RequestVal('tb1', 'DBSrc'); //获得指定的步骤，输入的参数.
      en.DBSrc = this.RequestVal('tb1', 'DBSrc'); //数据源编号.
      en.DBSrcT = this.RequestVal('tb2', 'DBSrc'); //数据源名称.
      en.Src = this.RequestVal('tb1', 'DBSrc'); //设置数据源.
      en.SetPara('EnName', 'TS.AttrFlow.SyncDataByDBSrc');
      en.PTable = this.RequestVal('tb1', 'DBSrc.Table');
      en.PTableName = this.RequestVal('tb2', 'DBSrc.Table');

      //数据来源.
      en.FrmID = this.RequestVal('tb1', 'DBSrc.Table.PKField.Fields.Frm');
      en.FrmName = this.RequestVal('tb2', 'DBSrc.Table.PKField.Fields.Frm');

      const val = this.RequestVal('tb1', 'DBSrc.Table.PKField').split('=');
      en.TablePKName = val[0] as string; //  this.RequestVal('tb1', 'DBSrc.Table.PKField'); //主键
      en.TablePKType = val[1] as string; //  this.RequestVal('tb1', 'DBSrc.Table.PKField'); //主键
      await en.Insert();

      //写入字段信息.*************************************
      const attrs = this.RequestVal('tb1', 'DBSrc.Table.PKField.Fields').split(',');
      const names = this.RequestVal('tb2', 'DBSrc.Table.PKField.Fields').split(',');

      // alert(attrs);
      // alert(names);

      const enField = new SyncDataField();
      for (let index = 0; index < attrs.length; index++) {
        const str = attrs[index] as string;
        //  alert(str);
        const attrKey = str.split('=')[0];
        const attrType = str.split('=')[1].toLowerCase();

        //排除主键.
        if (attrKey == en.TablePKName) continue;

        enField.MyPK = en.PKVal + '_' + attrKey; //设置主键.
        const isExit = await enField.IsExits();
        if (isExit == true) continue; //如果存在，就不在处理.

        enField.RefPKVal = en.PKVal;
        enField.AttrKey = attrKey;
        enField.AttrName = names[index];
        //设置字段类型.
        if (attrType.includes('int') == true) {
          enField.AttrType = DataType.AppFloat; // names[index]; //字段类型.
          enField.AttrTypeT = '数值'; // names[index]; //字段类型.
        }
        if (attrType.includes('char') == true) {
          enField.AttrType = DataType.AppString; // names[index]; //字段类型.
          enField.AttrTypeT = '文本'; // names[index]; //字段类型.
        }
        if (attrType.includes('int') == true) {
          enField.AttrType = DataType.AppInt; // names[index]; //字段类型.
          enField.AttrTypeT = '整形'; // names[index]; //字段类型.
        }

        enField.FrmID = en.FrmID; // names[index]; //字段类型.
        //  enField.IsSync = 1; //是否同步？
        enField.FlowNo = this.RefPKVal;
        await enField.Insert();
      }
      //转入到url.
      //  const url = '/@/WF/Comm/En.vue?EnName=' + en.GetParaString('EnName', '') + '&PKVal=' + en.MyPK;
      const url = GloComm.UrlEnOnly(en.GetParaString('EnName', ''), en.MyPK);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    alert('没有判断的页面类型:[' + pageNo + ']');
    return;
  }

  //内置的API系统.
  public readonly APIOfSystem = `
  #### 帮助
  - 选择同步模式: ccbpm提供了三种同步模式.
  - 请仔细阅读每种模式.
  #### 同步到数据源
  - 选择一个数据源,如果列表里没有就配置一个数据源.
  - 选择要同步的表
  - 之后流程字段与表字段的同步关系.
  #### 同步到自定义的API
  - 输入一个API 地址.
  - 系统就会把流程运行的数据同步到这个地址里面去.
  #### 同步到内置的API
  - 系统提供一个内置的API接口，按照设置的同步时间点,系统就会数据写入到这个接口里面去.
  - 您可以重写这个接口，把后把数据写入到指定的位置.
  `;
  public readonly APIOfSelf = `
 ### 帮助
 - 请输入API地址。
 - 格式为: \`http://xxx.xxx.xxxx\`

 ### 写入数据说明
- 系统会把流程的\`主表数据\`、\`从表数据\`、\`从表附件数据\`、\`表格附件附件数据\`形成一个JSON传入到您的接口里。
- 您需要接收这个JSON数据实体来处理它。
- 下面是JSON示例：

\`\`\`json
{
  "mainTable": {
    "Emps": "",
    "FK_DeptName": "集团总部",
    "FK_NY": "2024-11",
    "SQDept": "集团总部",
    "SQR": "admin",
    "SQRQ": "2024-11-20",
    "ChuFaShiQiDong": "4324",
    "QingJiaYuanYin": "6565",
    "QingJiaLeiXing": "1",
    "oid": "1853315159"
  },
  "dtls": [
    {
      "dtlNo": "ND401MingXiBiao",
      "dtl": [
        {
          "dtlData": {
            "ZiDuan1": "666",
            "ZiDuan2": "777",
            "Idx": "0"
          },
          "dtlAths": []
        }
      ]
    }
  ],
  "aths": [
    {
      "attachmentid": "ND401_QJCLTJ",
      "athdb": {
        "fileFullName": "D%3A%5CJFlow2024%5Cjflow-web%5Csrc%5Cmain%5Cwebapp%5CDataUser%2FUploadFile%5CND401%5C%2F1853315159%2Fbe4b3ad8a85740df950bd029bf46d055.pdf",
        "fileName": "NewPortableDocument1.pdf",
        "sort": "",
        "fileExts": "pdf",
        "rdt": "11-20 10:42",
        "myPK": "be4b3ad8a85740df950bd029bf46d055",
        "refPKVal": "1853315159",
        "rec": "admin",
        "recName": "admin",
        "fk_dept": "100",
        "fk_deptName": "集团总部"
      }
    }
  ]
}
\`\`\`

#### JSON说明
- \`mainTable\` 为主表数据，包含表单中字段值和系统字段值。
- \`dtls\` 为从表数据集合。
- \`aths\` 为附件数据集合，需要注意的是附件全路径（\`fileFullName\`）使用了URL编码，接收到后需要做解码处理。

#### URL解码 NetCore
\`\`\`c#
System.Net.WebUtility.UrlDecode(fileFullName);
\`\`\`
#### URL解码 JAVA
\`\`\`java
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
/**
 * Java接收API的例子
 * 注：以下代码仅供参考
 */
@RestController
public class TestController {

    @PostMapping("/testReceive")
    @ResponseBody
    public Object testReceive(@RequestBody Map<String,Object> map){
        System.out.println(map);
        JSONObject obj = JSONUtil.parseObj(map);
        JSONObject mainTable = obj.getJSONObject("mainTable"); //主表数据
        JSONArray dtls = obj.getJSONArray("dtls"); //从表数据集合
        JSONArray aths = obj.getJSONArray("aths"); //附件数据集合
        if(!aths.isEmpty()){
            String fileFullName = aths.getJSONObject(0).getJSONObject("athdb").getStr("fileFullName");
            java.net.URLDecoder.decode(fileFullName, "UTF-8"); //URL解码
        }
        SortedMap<Object, Object> sortedMap = new TreeMap<Object, Object>() {
            private static final long serialVersionUID = 1L;
            {
                put("message", "执行成功");
                put("code", 200);
                put("data", JSONUtil.toJsonStr(JSONUtil.parseObj(map)));
                put("msg", "");
            }};
        return JSONUtil.toJsonStr(sortedMap);
    }
}
\`\`\`
`;

  // 选择数据源
  public readonly DBSrc = `
  #### 帮助
  - 数据源：就是链接数据库的工具.
  - 如果没有您的数据源，需要在系统管理里创建一个数据源.
`;
  // 选择表
  public readonly DBSrcTable = `
  #### 帮助
  - 选择要同步数据的表.
  - 注意不能选择视图
  - 完成之后就需要设置字段的同步对应关系.

`;
}
