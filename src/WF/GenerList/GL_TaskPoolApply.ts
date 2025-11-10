import { PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { DataType } from '/@/bp/en/DataType';
import dayjs from 'dayjs';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GL_TaskPoolApply extends PageBaseGenerList {
  constructor() {
    super('GL_TaskPoolApply');
    this.PageTitle = '我申请下来的任务';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = '发起日期'; //日期字段名.
    this.LinkField = 'Title';
    this.GroupFields = 'NodeName,FlowName,StarterName'; //分组字段.
    this.GroupFieldDefault = 'FlowName'; //分组字段.
    this.LabFields = 'WFState';
    this.Icon = '';
    this.BtnOfToolbar = '';
    //this.BtnsOfRow = '放入任务池'; //行操作按钮.
    this.PageSize = 15; // 分页的页面行数, 0不分页.

    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'WorkID', Name: '工作ID', IsShow: false, DataType: 2 },
      { Key: 'Title', Name: '标题', IsShow: true, DataType: 1, width: 350 },
      { Key: 'StarterName', Name: '发起人', IsShow: true, DataType: 1, width: 66 },
      { Key: 'NodeName', Name: '停留节点', IsShow: true, DataType: 1, width: 150 },
      { Key: 'FlowName', Name: '流程', IsShow: true, DataType: 1, width: 150 },
      { Key: 'RDT', Name: '发起时间', IsShow: true, DataType: 7, width: 144, RefFunc: 'FirendlyDT' },
      { Key: 'Sender', Name: '发送人', IsShow: true, DataType: 1, width: 121 },
      // { Key: 'PRI', Name: 'PRI', IsShow: true, DataType: 1, width: 46, RefFunc: 'PRI' },
      { Key: 'SDT', Name: '应完成时间', IsShow: true, DataType: 7, width: 144 },
      { Key: 'ADT', Name: '接收时间', IsShow: true, DataType: 7, width: 150 },
      { Key: 'IsRead', Name: '是否读取', IsShow: false, DataType: 2, RefFunc: 'IsRead' },
      { Key: 'WFState', Name: '标签', IsShow: true, DataType: 2 },
      { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    // handler.AddPara('FK_Node', GetQueryString('FK_Node'));
    const data: any = await handler.DoMethodReturnJson('TaskPoolApply_Init');

    const curr = dayjs(DataType.CurrentDateTime).toDate();
    //处理数据,增加标签.
    data.forEach((en) => {
      // 判断是否是逾期.  SDT 应完成日期与当前日期对比.
      let lab = '';
      if (en.SDT != '无' && dayjs(en.SDT).toDate() < curr) lab = '@逾期=red';
      if (en.WFState == 1) {
        en.WFState = '@草稿=orange';
        en.SDT = '';
      }
      if (en.WFState == 2) en.WFState = lab + '@新工作=green';
      if (en.WFState == 4) en.WFState = '@挂起=yellow';
      if (en.WFState == 7) en.WFState = '@作废=red';
      if (en.WFState == 5) en.WFState = lab + '@退回=red';
      if (en.WFState == 3) en.WFState = lab + '@归档=blue';
      if (en.WFState == 6) en.WFState = lab + '@移交=red';
      if (en.WFState == 8) en.WFState = lab + '@加签=green';
      if (en.AtPara.includes('@IsCC=1')) {
        en.WFState = '@抄送=blue';
        en.SDT = ''; //没有应完成日期.
      }
      // if (en.PRI == 0) en.PRI = '<img src="resource/WF/Img/PRI/0.png" style="display:inline"/>';
      // if (en.PRI == 1) en.PRI = '<img src="resource/WF/Img/PRI/1.png" style="display:inline"/>';
      // if (en.PRI == 2) en.PRI = '<img src="resource/WF/Img/PRI/2.png" style="display:inline"/>';
      if (en.PRI == 0) en.PRI = '#80a22e';
      if (en.PRI == 1) en.PRI = '#ffde72';
      if (en.PRI == 2) en.PRI = '#db382e';
      en.ADT = this.FirendlyDT(en.ADT);
      en.SDT = !!en.SDT && en.SDT != '无' ? dayjs(en.SDT).format('YYYY-MM-DD HH:mm') : '无';
      en.RDT = !!en.RDT ? (en.RDT == '无' ? '无' : dayjs(en.RDT).format('YYYY-MM-DD HH:mm')) : '';
      //处理发送人 for ningbogang
      const sender = en.Sender;
      if (sender != null && sender != '' && sender != undefined) {
        en.Sender = sender.split(',').length > 1 ? sender.split(',')[1].replace(';', '') : sender.split(',')[0];
      }
      en.Btns = '放入任务池';
    });

    this.Data = data;
    console.log('data', this.Data);
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    const workID = object.WorkID;
    let url = '/#/WF/MyFlow?WorkID=' + workID;
    const keys = Object.keys(object);
    for (const key of keys) {
      if (key === 'WorkID') continue;
      url += `&${key}=${object[key]}`;
    }
    window.open(url); //打开页面。
  }

  async BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName == '放入任务池') {
      if (window.confirm('您确定要把该任务放入任务池吗？') == false) return;

      const handler = new HttpHandler('BP.WF.HttpHandler.WF');
      handler.AddPara('WorkID', object.WorkID);
      const data = await handler.DoMethodReturnString('TaskPoolApply_PutOne');
      if (data.indexOf('err@') == 0) {
        alert(data);
        return;
      }
    }
    return new GPNReturnObj(GPNReturnType.Reload);
  }
}
