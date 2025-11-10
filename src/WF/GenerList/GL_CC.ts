import { PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
// import { WebConfig } from '/@/DataUser/WebConfig';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { router } from '/@/router';
import { IsMobile } from '/@/utils/gener/StringUtils';
import { isComPage } from '/@/utils/gl';
import { Node } from '/@/WF/TSClass/Node';
import { message } from 'ant-design-vue';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
export class GL_CC extends PageBaseGenerList {
  constructor() {
    super('GL_CC');
    this.PageTitle = '抄送';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = '发起日期'; //日期字段名.
    this.LinkField = 'Title';
    this.GroupFields = 'NodeName,FlowName,StarterName'; //分组字段.
    this.GroupFieldDefault = 'FlowName'; //分组字段.
    this.Icon = '';
    this.BtnOfToolbar = '';
    this.PageSize = 15; // 分页的页面行数, 0不分页.

    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'WorkID', Name: '工作ID', IsShow: false, IsShowMobile: false, DataType: 2 },
      { Key: 'Title', Name: '标题', IsShow: true, DataType: 1, width: 350 },
      { Key: 'RecName', Name: '抄送人', IsShow: true, DataType: 1, width: 66 },
      { Key: 'NodeIDCCName', Name: '当前节点', IsShow: true, DataType: 1, width: 150 },
      { Key: 'FlowName', Name: '流程', IsShow: true, DataType: 1, width: 150 },
      { Key: 'RDT', Name: '日期', IsShow: true, DataType: 7, width: 144 },
      { Key: 'IsRead', Name: '是否读取', IsShow: false, IsShowMobile: false, DataType: 2 },
      {
        Key: 'WFSta',
        Name: '标签',
        IsShow: false,
        IsShowMobile: false,
        DataType: 2,
      },
    ];

    const Sta = this.RequestVal('Sta');
    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF');
    if (!!Sta) handler.AddPara('Sta', Sta); //@0=未读（待阅）@1=已读（已阅）@2=已回复@3=已删除
    const data: any = await handler.DoMethodReturnJson('CC_Init');
    //处理数据,增加标签. @liuwei.
    data.forEach((en) => {
      if (en.WFSta == 0) en.WFSta = '@新工作=green';
      if (en.WFSta == 1) en.WFSta = '@归档=blue';
      if (en.WFSta == 2) en.WFSta = '@其他=yellow';
      en.IsRead = en.Sta;
    });

    this.Data = data;
    console.log('data', this.Data);
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    let url = '/#/WF/MyCC?WorkID=' + object.WorkID;
    const atpara = object.AtPara;
    // 判断是否是vsto.
    if (!!atpara && atpara.includes('@AppID=MyFlow') == true) {
      url = '/src/WF/MyView.vue?WorkID=' + object.WorkID;
      const ojson = {};
      ojson['WorkID'] = object['WorkID'];
      ojson['FK_Node'] = object['FK_Node'];
      ojson['FK_Flow'] = object['FK_Flow'];
      ojson['NodeID'] = object['FK_Node'];
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_MyCC');
      handler.AddJson(ojson);
      const data: string = (await handler.DoMethodReturnString('MyCC_Init')) || '';
      const keys = Object.keys(data);
      for (const key of keys) {
        const nvalue = data[key];
        if (key == 'NodeID' || key == 'FK_Node' || key == 'FK_Flow') {
          url += `&${key}=${nvalue}`;
        }
      }
    } else {
      const keys = Object.keys(object);
      for (const key of keys) {
        if (key === 'WorkID') continue;
        if (key === 'NodeID') continue;
        if (key === 'FK_Node') continue;
        if (key === 'NodeIDCC') {
          let nodeID = object[key];
          const node = new Node();
          node.setPKVal(nodeID);
          const i = await node.RetrieveFromDBSources();
          if (i == 0) {
            message.warning('节点[' + nodeID + ']已经删除,打开开始节点的流程信息');
            nodeID = parseInt(parseInt(object.FK_Flow || object.FlowNo) + '01');
          }
          url += `&NodeID=${nodeID}&FK_Node=${nodeID}`;
          url += `&${key}=${nodeID}`;
          continue;
        }
        if (key === 'FK_Flow') {
          url += `&FK_Flow=${object['FlowNo'] || object['FK_Flow']}`;
          continue;
        }
        url += `&${key}=${object[key]}`;
      }
    }
    const flowOpenModel = CommonConfig.FlowOpenModel || 0;
    const PathHash = location.hash;
    let urlPath: any = '';
    if (IsMobile()) {
      const mobileUrl = url.replace('/#/WF/', '/CCMobile/');
      try {
        router.push(mobileUrl);
      } catch (e: any) {
        location.hash = '#' + mobileUrl;
      }
      return;
    }
    if (PathHash.includes('/WF/Port') || flowOpenModel == 3) {
      urlPath = isComPage(url);
      url = urlPath + '&win=true';
      // 新标签页打开;
      window.open(url);
      return;
    }
    // const flowOpenModel = WebConfig.FlowOpenModel || 0;
    // if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    // if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
    // if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByTab, url);
    // if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url, object.NodeName);
    //    throw new Error("Method not implemented.");
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName == '批处理') {
      // const url = '/src/WF/Batch.vue?xx' + object.WorkID;
      // window.location.href = url;
      alert('未实现');
      return;
    }
    return;
    // throw new Error('Method not implemented.');
  }
}
