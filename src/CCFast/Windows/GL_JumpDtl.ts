import { message, Modal } from 'ant-design-vue';
import { GLEnOpenModel, GLEnOpenShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { JumpDtl } from './JumpDtl';
export class GL_JumpDtl extends PageBaseGenerList {
  constructor() {
    super('GL_JumpDtl');
    this.PageTitle = '明细列表';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = ''; // 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = ''; // '发起日期'; //日期字段名.
    this.LinkField = ''; // 'Title';
    this.GroupFields = ''; // 'NodeName,FlowName,StarterName'; //分组字段.
    this.GroupFieldDefault = ''; // 'FlowName'; //分组字段.
    this.Icon = '';
    this.BtnOfToolbar = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    try {
      const enID = this.RequestVal('MyPK');
      const en = new JumpDtl();
      en.setPKVal(enID);
      await en.Retrieve();

      const handler = new HttpHandler('BP.CCFast.DataV_Lowcode');
      handler.AddPara('MyPK', enID);
      handler.AddJson(this.params);
      const data: any = await handler.DoMethodReturnJson('GetJumpDtl');
      this.Data = data;
      const cols = en.DtlColNames || '';
      if (cols == '' && this.Data.length > 0) {
        const en = this.Data[0];
        for (const key in en) {
          this.Columns.push({
            Key: key,
            Name: key,
            IsShow: true,
            IsShowMobile: true,
            DataType: 1,
          });
        }
      }
      if (!!cols) {
        cols.split(',').forEach((col) => {
          if (!!col) {
            const keyVal = col.trim().split('=');
            this.Columns.push({
              Key: keyVal[0],
              Name: keyVal.length > 1 ? keyVal[1] : keyVal[0],
              IsShow: true,
              IsShowMobile: true,
              DataType: 1,
            });
          }
        });
      }
    } catch (e) {
      Modal.error({ content: e as string });
      this.Columns = [];
    }
  }

  //打开页面.
  async LinkFieldClick(_object: Record<string, any>) {}
  BtnClick(_btnName: string, _record: Record<string, any>, _ids?: string) {
    throw new Error('Method not implemented.');
  }
}
