import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { FrmTracks } from '/@/CCFast/CCBill/FrmTrack';

export class GL_Track extends PageBaseGenerList {
  constructor() {
    super('GL_Track');
    this.PageTitle = '轨迹';
  }
  //重写的构造方法，初始化参数.
  async Init() {
    const frmID = this.RequestVal('FrmID');
    const workID = this.RequestVal('WorkID');
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.DTFieldOfSearch = ''; //按照日期范围查询的字段.
    this.DTFieldOfLabel = ''; //日期字段名.
    this.LinkField = ''; //关键字段.
    this.GroupFields = ''; //分组字段.

    this.BtnOfToolbar = '';
    this.HisGLShowModel = GenerListPageShowModel.Table; //窗口的模式.
    this.BtnsOfRow = '';
    this.LabFields = '';
    this.Columns = [];

    this.Columns.push(
      { Key: 'MyPK', Name: '编号', IsShow: false, width: '10%' },
      { Key: 'ActionTypeText', Name: '类型', IsShow: true, width: '10%' },
      { Key: 'RecName', Name: '记录人', IsShow: true, width: '10%' },
      { Key: 'RDT', Name: '记录日期', IsShow: true, width: '10%' },
      { Key: 'DeptName', Name: '部门', IsShow: true, width: '10%' },
      { Key: 'Msg', Name: '信息', IsShow: true, width: '35%' },
    );

    //获得数据源.
    this.Data = [];
    const frmTracks = new FrmTracks();
    await frmTracks.Retrieve('FrmID', frmID, 'WorkID', workID);
    this.Data = frmTracks;
  }

  //打开页面.
  async LinkFieldClick(_object: Record<string, any>) {}

  async BtnClick(_btnName: string, _object: Record<string, any>) {}
}
