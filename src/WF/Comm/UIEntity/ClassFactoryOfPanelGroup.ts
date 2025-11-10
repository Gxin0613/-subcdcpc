import { PG_Dept2Emp } from '../../Admin/PG_Dept2Emp';
import { PG_FlowSort2Flow } from '../../Admin/PG_FlowSort2Flow';
import { PG_FrmSort2Frm } from '../../Admin/PG_FrmSort2Frm';
import { PageBasePanelGroup } from '/@/bp/UIEntity/PageBasePanelGroup';
import { PG_Group2Method } from '/@/CCFast/CCBill/Method/PG_Group2Method';
import { PG_Module2Menu } from '/@/CCFast/GPM/PG_Module2Menu';

const EnMap = new Map<string, any>([
  ['PG_FlowSort2Flow', PG_FlowSort2Flow],
  ['PG_FrmSort2Frm', PG_FrmSort2Frm],
  ['PG_Dept2Emp', PG_Dept2Emp],
  ['PG_Group2Method', PG_Group2Method],
  ['PG_Module2Menu', PG_Module2Menu],
]);

export class ClassFactoryOfPanelGroup {
  public static GetEn(classID: string): PageBasePanelGroup {
    const obj = EnMap.get(classID);
    if (obj) return new obj();
    throw new Error('GetEn没有判断的类名PanelGroup :' + classID);
  }
  public static toJSON(filterdPrefix: string[]) {
    const mapObj = Object.fromEntries(EnMap);
    const keys = Object.keys(mapObj);
    return JSON.stringify(
      keys
        .filter((key) => {
          for (const prefix of filterdPrefix) {
            if (key.startsWith(prefix)) return false;
          }
          return true;
        })
        .map((item) => {
          const clsObj = new mapObj[item]();
          return {
            No: item,
            Name: clsObj.PageTitle + `(${item})`,
          };
        }),
    );
  }
}
