import HttpHandler from './FoolFormDesigner/dto/HttpHandler';
import { GloWF } from './GloWF';
import { ClassFactory } from '/@/bp/da/ClassFactory';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GPN_Menu } from '/@/CCFast/GPM/CCMenu/GPN_Menu';

export class GPN_AIRpt extends PageBaseGroupNew {
  constructor() {
    super('GPN_AIRpt');
    this.PageTitle = '表单AI白色大屏';
  }

  public async Init() {
    throw new Error('未实现');
    //增加子页面.
    this.AddGroup('A', '创建'); //增加分组.
    //this.SelectItemsByGroupList('SelectedDict', '依据表单创建', this.HelpUn, false, GloWF.srcFrmTree, GloWF.srcFrmDictList, true);
    this.SelectItemsByGroupList('SelectedBill', '依据单据创建', this.HelpUn, false, GloWF.srcFrmTree, GloWF.srcFrmListOfBill, true);
    this.Table('SelectedBill.Windows', '选择窗体', this.AlertCar, true, this.GenerWindows);

    // this.AddBlank('SelectedEntity', 'Entity数据实体', this.SearchHelp);
    this.AddTableByOptions({
      no: 'SelectedEntity',
      name: '选择实体',
      columns: [
        {
          title: '类名',
          key: 'Name',
          width: 120,
        },
        {
          title: 'ClassID',
          key: 'No',
          width: 140,
        },
        {
          title: '存储表',
          key: 'PTable',
          width: 140,
        },
      ],
      helpDocs: '选择实体(单选)',
      IsMultiSelect: false,
      srcOfList: await GPNMenuExt.GenerEnsList('Entity'),
    });
    // this.SelectItemsByGroupList('SelectedEntity', '依据实体创建(规划中)', this.HelpUn, false, GloWF.srcFrmTree, GloWF.srcFrmDictList, true);
    this.Table('SelectedEntity.Windows', '选择窗体', this.AlertCar, true, this.GenerWindows);
  }

  public async GenerWindows() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');

    let frmID = this.RequestVal('tb1', 'SelectedBill');
    if (frmID == null || frmID == undefined || !!frmID || frmID == '' || frmID == ' ') {
      frmID = this.RequestVal('tb1', 'SelectedEntity');
      const en = await ClassFactory.GetEn(frmID);
      await en.Init();
    }

    handler.AddPara('FrmID', frmID);
    handler.AddPara('PageID', this.RequestVal('PageID'));
    const data: any = await handler.DoMethodReturnJson('WhiteRpt_GenerWindows');
    return JSON.stringify(data);
  }
  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(_pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    if (_pageNo.includes('SelectedBill.Windows') == true) {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
      handler.AddPara('FrmID', this.RequestVal('tb1', 'SelectedBill'));
      handler.AddPara('PageID', this.RequestVal('PageID'));
      handler.AddPara('Vals', _tb1); //选择的编号.
      const data: any = await handler.DoMethodReturnString('WhiteRpt_SaveWindows');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, data);
    }
    if (_pageNo.includes('SelectedEntity.Windows') == true) {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
      handler.AddPara('FrmID', this.RequestVal('tb1', 'SelectedEntity'));
      handler.AddPara('PageID', this.RequestVal('PageID'));
      handler.AddPara('Vals', _tb1); //选择的编号.
      const data: any = await handler.DoMethodReturnString('WhiteRpt_SaveWindows');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, data);
    }
  }
  public readonly AlertCar = `
    我要做一个车辆管理表单。
    基础信息包含车辆编号，名称，车牌号、车辆类型(轿车、工程车、清洁车)等基础字段，请提供.
    从表有如下几个，请给出每个从表的字段。
    车辆配件：
    维修记录：
    出车记录：
    `;
  public readonly SearchHelp = `
    我要做一个车辆管理表单。
    基础信息包含车辆编号，名称，车牌号、车辆类型(轿车、工程车、清洁车)等基础字段，请提供.
    从表有如下几个，请给出每个从表的字段。
    车辆配件：
    维修记录：
    出车记录：
    `;
}
