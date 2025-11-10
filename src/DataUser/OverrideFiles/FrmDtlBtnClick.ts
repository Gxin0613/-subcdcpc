import { CommonConfig } from './CommonConfig';
import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GloComm } from '/@/WF/Comm/GloComm';

/**
 * 从表重写类使用说明.
 * 1. 该类文件位于 datauser下，开发人员可以重写该文件，不会对cc的核心代码造成影响.
 * 2. 定义的按钮展现在 /WF/Comm/DtlSearch.vue /WF/Comm/DtlBatch.vue 上,如果用户按下了事件,就调用 BtnClick 方法.
 * 3. 可以通过写方法实现业务逻辑.
 */

export class FrmDtlBtnClick extends PageBaseGroupNew {
  constructor() {
    super('FrmDtlBtnClick');
    this.PageTitle = '从表重写类';
  }
  public override Init() {
    // this.FileUpload('0','文件上传','请上传需要导入的Excel文件','')
    //增加子页面分组.
    this.FileUpload('0', '清空方式导入1', '请上传符合格式的Excel文件.', 'this.Desc0');
    throw new Error('Method not implemented.');
  }
  override GenerSorts(_systemNo?: string): Promise<Array<any>> {
    throw new Error('Method not implemented.');
  }

  public static async TableTopBtnClick(btnName: string, _dtlEnName: string, pkval: number, _selectedDtlPKs: string, _bodyJson: string) {
    if (_dtlEnName === 'XZ_GZJSBnxgzmxb' && btnName == '数据复核') {
      const url = GloComm.UrlSearch('TS.YNJT.Salary_year_print', '&s_key_RefPK=' + pkval);
      // alert(pkval);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
    if (_dtlEnName === 'XZ_GZJSBgzmxb' && btnName == '数据复核') {
      const url = GloComm.UrlSearch('TS.YNJT.Salary_month_print', '&s_key_RefPK=' + pkval);
      //alert(pkval);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
  }
  public override async Save_TextBox_X(_pageID: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    // if (pageID == 'DownTemplate') return;
    //调用导入接口
    const dtlID = _tb2; //从表ID
    const workID = Number(_tb1); //WorkID
    alert('从表ID为：' + dtlID + ';Work ID为：' + workID);
    const handler = new HttpHandler('BP.imp');
    handler.AddFile(this.UploadFile);
    handler.AddPara('FrmID', dtlID); //从表的ID.
    handler.AddPara('PageType', 'Vue3'); //vue3.
    handler.AddPara('FK_MapData', dtlID); //从表的ID.
    handler.AddPara('WorkID', workID); //WorkID.
    // handler.AddPara('DDL_ImpWay', pageID);
    const data = await handler.DoMethodReturnString('impExcel');
    return new GPNReturnObj(GPNReturnType.Message, data);
  }
  public static async TableBtnAddClick(dtlEnName: string, WorkID: number, bodyJson: string, row: Record<string, any>, FID: number) {
    if (CommonConfig.IsGZFrm) {
      //送审流程，强条从表的工程名和主表项目名称一致,专业名称和图纸表中的专业一致
      if (dtlEnName == 'ND1203QiangTiaoTongJiBiao') {
        const mainData = JSON.parse(bodyJson);
        //项目名称
        const PrjName = mainData.PrjName;
        row['GongChengMingChen'] = PrjName;

        // 获取年、月、日、小时、分钟和秒
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以要加1，并确保两位数显示
        // 格式化日期为 YYYY-MM-DD HH:MM:SS 的形式
        row['YueFen'] = `${year}-${month}`;
        //获取专业
        const handler = new HttpHandler('BP.App.NetCore.GZSZ.GZ_CommTS');
        handler.AddPara('WorkID', FID);
        const data = await handler.DoMethodReturnJson('GetZhuanYeInfo');
        const ZhuanYe = data.Table[0].ZhuanYe;
        const ZhuanYeT = data.Table[0].ZhuanYeT;
        row['SQL_ZhuanYe'] = ZhuanYe;
        row['SQL_ZhuanYeT'] = ZhuanYeT;
      }
    }
  }
}
