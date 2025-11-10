/* eslint-disable no-unused-vars */
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { ref } from 'vue';
const frmData = ref();
export class GL_FieldPopShowDtl extends PageBaseGenerList {
  constructor() {
    super('GL_FieldPopShowDtl');
    this.PageTitle = '详情';
  }
  //重写的构造方法，初始化参数.
  async Init() {
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.DTFieldOfSearch = ''; //按照日期范围查询的字段.
    this.DTFieldOfLabel = ''; //日期字段名.
    this.HisGLShowModel = GenerListPageShowModel.Table; //窗口的模式.

    //获得参数.
    // const attrKey = this.RequestVal('AttrKey');
    // const frmID = this.RequestVal('FrmID');
    // const pkval = this.RequestVal('PKVal'); //pk
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddPara('FrmID', this.RequestVal('FrmID'));
    handler.AddPara('PKVal', this.RequestVal('PKVal'));
    handler.AddPara('RefNo', this.RequestVal('AttrKey'));
    const data = await handler.DoMethodReturnJson('FrmGL_InitData');
    frmData.value = JSON.parse(JSON.stringify(data));
    this.Columns = frmData.value.Attrs;
    this.Data = frmData.value.Data;

    this.PageSize = 15; // 分页的页面行数, 0不分页.
    // // //获得mapExt;
    // // const myPK = frmID + '_' + attrKey + '_FieldPopShowDtl';
    // // const mapExt = new MapExt(myPK);
    // // const val = mapExt.RetrieveFromDBSources();
    // //如何解决安全执行sql的问题?

    // // this.BtnOfToolbar = '宫格展示';
    // // this.GroupFieldDefault='';
    // // 定义列，这些列用于显示.
    // this.Columns = [
    //   { Key: 'Name', Name: '名称', IsShow: true, width: '65%' },
    //   { Key: 'No', Name: '编号', IsShow: true, width: '10%' },
    //   { Key: 'Icon', Name: 'Icon', IsShow: false },
    //   { Key: 'Btns', Name: '操作', IsShow: false },
    // ];
    // const dbs = await DBAccess.RunSQLReturnTable(sql);
    // this.Data = dbs;
  }

  //打开页面.
}
