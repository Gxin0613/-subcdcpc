import { Modal } from 'ant-design-vue';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
export class GL_Jump extends PageBaseGenerList {
  override BtnClick(_btnName: string, _record: Record<string, any>, _ids?: string) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_Jump');
    this.PageTitle = '明细表';
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
      const handler = new HttpHandler('BP.CCFast.DataV_Lowcode');
      handler.AddPara('PKVal', this.RequestVal('PKVal'));
      handler.AddPara('Key', this.RequestVal('Key'));
      handler.AddJson(this.params);
      const data: any = await handler.DoMethodReturnJson('Win_Dtl');
      this.Data = JSON.parse(data[0].DtlExp);
      const cols = data[0].DtlColNames || '';
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
}
