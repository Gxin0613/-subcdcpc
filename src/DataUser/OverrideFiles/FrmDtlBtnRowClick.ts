import { ND101Dtl1, ND101Dtl1s } from '/@/App/F001/ND101Dtl1';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';

/**
 * 从表重写类使用说明.
 * 1. 该类文件位于 datauser下，开发人员可以重写该文件，不会对cc的核心代码造成影响.
 * 3. 可以通过写方法实现业务逻辑.
 */
export class FrmDtlBtnRowClick {
  constructor() {}

  /**
   * 行的按钮执行.
   * @param btnName 按钮名称
   * @param dtlEnName 从表ID
   * @param pkval 主键OID,
   * @param dtlOID 从表OID
   * @param bodyJson 表单Json数据.
   * @returns 执行结果
   */
  public static async BtnClick(btnName: string, dtlEnName: string, pkval: number, dtlOID: number, bodyJson: string) {
    //价格系统新增从表.
    if (btnName == 'Delete' && dtlEnName == 'ND101Dtl1') {
      // //求出该行的BatchID.
      // const dtl = new ND101Dtl1(dtlOID);
      // const val = await dtl.RetrieveFromDBSources();
      // if (val == 0) return;
      // //求出来所有的DtlsIDs.
      // const dtls = new ND101Dtl1s();
      // await dtls.Retrieve('RefPK', pkval, 'BatchID', dtl.BatchID);
      // //删除。
      // debugger;
      // for (let index = 0; index < dtls.length; index++) {
      //   const mydtl = dtls[index];
      //   const dtl = new ND101Dtl1(mydtl.OID);
      //   await dtl.Delete();
      // }
      // return 'reload'; //标识执行成功，需要刷新数据.
    }
  }
    /**
   * 超链接的处理方法自定义
   * @param _btnName 从表属性
   * @param _mapDtl 从表属性
   * @param _params 请求的参数
   * @param _rowData 从表行的数据
   * @param _mainData 主表的数据
   * @constructor
   */
  public static async LinkUrlClick(_btnName:string,_mapDtl: Record<string, any>, _params: Record<string, any>, _rowData: Record<string, any>, _mainData: Record<string, any>) {
    if(_mapDtl.No ==='Bill_JiaYouJiLuCongBiao'){
      if(_btnName==='方法1'){
         return new GPNReturnObj(GPNReturnType.Message, "执行成功");
      }
      if(_btnName === '方法2'){
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer60,GloComm.UrlGenerList('GL_Todolist'));
      }
    }
    return null;
  }
}
