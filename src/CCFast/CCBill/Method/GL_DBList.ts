import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { MethodDBList } from './MethodDBList';
import DBAccess from '/@/utils/gener/DBAccess';
import { message } from 'ant-design-vue';
import { DealExp, IsMobile } from '/@/utils/gener/StringUtils';
import { showFailToast } from 'vant';
import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
import { GloWF } from '/@/WF/Admin/GloWF';

export class GL_DBList extends PageBaseGenerList {
  constructor() {
    super('GL_DBList');
    this.PageTitle = '数据列表';
  }
  //重写的构造方法.
  async Init() {
    // this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段.
    // this.DTFieldOfLabel = '发起日期'; //日期字段名.
    // this.PageTitle = '在途';
    // this.GroupFields = 'NodeName,FlowName'; //可以分组显示的字段..
    this.GroupFieldDefault = '';
    this.PageSize = 10; // 分页的页面行数, 0不分页.
    // this.BtnOfToolbar = '新建流程';
    this.Icon = '';

    this.HisGLShowModel = GenerListPageShowModel.Table; //表格展示.

    // 把  mydata 属性转化为json.
    // this.Columns = [
    //   { Key: 'No', Name: '工作ID', IsShow: false, IsShowMobile: false },
    //   { Key: 'Name', Name: 'Name', width: 350 },
    //   { Key: 'StarterName', Name: '发起人', width: 120 },
    //   { Key: 'NodeName', Name: '停留节点', width: 160 },
    //   { Key: 'DeptName', Name: '发起人部门', width: 150 },
    //   { Key: 'RDT', Name: '到达时间', width: 160 },
    //   { Key: 'TodoEmps', Name: '当前处理人', width: 350 },
    //   // { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
    // ];
    // this.Btns = [
    //   { pageNo: 'methond', list: ['填充'] },
    // ];

    // :src="`/#/WF/GenerList?EnName=GL_DBList&OID=
    // ${props.params?.WorkID}
    // &MethodID=${tab.No}
    // &FrmID=${props.params?.FrmID}
    // &MethodNo=${tab.key}`"

    const workID = this.RequestVal('OID') || this.RequestVal('WorkID') || this.RequestVal('No');
    const frmID = this.RequestVal('FrmID');
    const MethodID = this.RequestVal('MethodID');

    const mapData = new MapData(frmID);
    await mapData.Retrieve();
    //单记录的数据
    let dictData;
    if (mapData.EntityType != 5)
      dictData = await DBAccess.RunDBSrc(GloWF.SQLOfDBList(mapData.PTable, workID), 0, mapData.DBSrc); //'SELECT * FROM ' + mapData.PTable + ' WHERE OID=' + workID
    else dictData = await DBAccess.RunDBSrc(GloWF.SQLOfDBListByNo(mapData.PTable, workID), 0, mapData.DBSrc);
    // const ens = new GenerWorkFlowExts();
    // await ens.Retrieve('PWorkID', workID, 'PFlowNo', frmID, 'FK_Flow', MethodID, 'RDT');
    const method = new MethodDBList(MethodID);
    await method.RetrieveFromDBSources();
    const dbSrcNo = method.GetParaString('DBSrcNo') || 'local';
    let sql = method.Docs;
    //判断是否是查询语句
    if (sql.toLowerCase().indexOf('select') === 0) {
      //替换业务字段（单记录里的数据）或者当前人员信息（WebUser里的）
      sql = DealExp(sql, dictData[0]);
    } else {
      message.warning(sql + '仅支持查询语句，请修改SQL语句配置');
      return;
    }
    if (!sql) {
      if (IsMobile()) {
        showFailToast('请再单实体记录相关功能中[' + method.Name + ']配置SQL语句');
        return;
      }
      message.error('请再单实体记录相关功能中[' + method.Name + ']配置SQL语句');
      return;
    }
    const exp = method.Tag1; //转换表达式.  @Tel=电话@Email=邮件
    const mydata = await DBAccess.RunDBSrc(sql, 0, dbSrcNo);
    // @xyj 11.27 解析exp
    // const mappingString = "@No=编号,@Name=名称";
    const mappingArray = exp.split(',');
    const mappingObject = {};
    mappingArray.forEach((item) => {
      const [key, value] = item.split('=');
      mappingObject[key.slice(1)] = value;
    });
    const resultArray = [];
    Object.keys(mappingObject).forEach((key) => {
      resultArray.push({ Key: key, Name: mappingObject[key] });
    });
    this.Columns = resultArray;
    // result.width = 350;
    // 要把 myData 转化为.
    console.log('method===', method);
    console.log('methodData:::', mydata);

    //设置数据源.
    this.Data = mydata;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    // let url = '/#/WF/MyView?';
    // const keys = Object.keys(object);
    // const useKeys = ['FK_Flow', 'FlowNo', 'FK_Node', 'FID', 'PWorkID'];
    // for (const key of keys) {
    //   if (useKeys.includes(key)) url += `&${key}=${object[key]}`;
    // }
    // url = url + '&WorkID=' + object['WorkID'];
    // console.log(url, object);
    // //return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    // return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    // const flowOpenModel = WebConfig.FlowOpenModel || 0;
    // if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    // if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    // if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByTab, url);
    // if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }

  //按钮事件.
  async BtnClick(btnName: string, object: Record<string, any>) {
    // if (  btnName == '新建') {
    //   const oid = this.RequestVal('OID');
    //   const frmID = this.RequestVal('FrmID');
    //   const methodNo = this.RequestVal('MethodNo');
    //   const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    //   handler.AddPara('WorkID', oid);
    //   handler.AddPara('FrmID', frmID);
    //   handler.AddPara('MethodNo', methodNo); //方法ID.
    //   let data = (await handler.DoMethodReturnString('MyDict_DoFlowEtc_StartFlow')) as string;
    //   if (data.includes('err@') == true) {
    //     alert(data);
    //     return;
    //   }
    //   data = '/#/WF' + data;
    //   data = data.replace('../', '/');
    //   data = data.replace('.htm', '');
    //   return new GPNReturnObj(GPNReturnType.GoToUrl, data);
    // }
    // const workID = object.WorkID;
    // if (btnName === '撤销发送') {
    //   return this.UnSend(workID, object.FK_Flow);
    // }
    // if (btnName === '催办') {
    //   this.Prsss(workID);
    //   return;
    // }
  }
}
