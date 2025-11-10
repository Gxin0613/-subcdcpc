import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloWF } from '/@/WF/Admin/GloWF';
import HttpHandler from '/@/utils/gener/HttpHandler';

export class GPN_SelectEmps extends PageBaseGroupNew {
  constructor() {
    super('GPN_SelectEmps');
    this.PageTitle = '选择会签人员';
  }
  public async Init() {
    //增加子页面.
    this.AddGroup('A', '选择人员'); //增加分组.
    this.SelectItemsByTreeEns('SelectEmps', '选择会签人', '', true, GloWF.srcDeptLazily, GloWF.srcDeptRoot, GloWF.srcEmpLazily, '', true);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    if (pageNo === 'SelectEmps') {
      if (!_tb1) {
        return new GPNReturnObj(GPNReturnType.Message, '请选择人员');
      }
      try {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
        handler.AddPara('WorkID', this.RequestVal('WorkID'));
        handler.AddPara('HuiQianType', this.RequestVal('HuiQianType'));
        handler.AddPara('AddEmps', _tb1);
        await handler.DoMethodReturnString('HuiQian_AddEmps');
        handler.AddPara('ToNodeID', this.RequestVal('NodeID'));
        await handler.DoMethodReturnString('HuiQian_SaveAndClose');
        return new GPNReturnObj(GPNReturnType.CloseAndReload, '', '', null); //'InitPage'
      } catch (e) {
        return new GPNReturnObj(GPNReturnType.Message, e as string);
      }
    }
  }

  public override GenerSorts(_systemNo?: string): Promise<Array<any>> {
    return Promise.resolve(undefined);
  }
}
