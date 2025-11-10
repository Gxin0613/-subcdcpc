import { h } from 'vue';
import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
import dayjs from 'dayjs';
import WebUser from '/@/bp/web/WebUser';
import HttpHandler from '/@/utils/gener/HttpHandler';

export class WGEntity_En_XueSheng extends WaiGuaBaseEntity {
  constructor() {
    super('WGEntity_En_XueSheng', 'En_XueSheng');
  }

  override Init() {
    this.SearchToolbarBtns = 'Btn1,Btn2';
    this.SearchOptBtns = 'Btn3';

    if (WebUser.No === 'admin') this.SearchRowRightContiext = 'Btn1,xxxx,,xxxx,xx';
    else this.SearchRowRightContiext = 'Btn1,xxxx';

    this.EntityToolbarBtns = '按钮1,按钮2,';
    this.CustomColumnsRender = [
      {
        key: 'ChuShengRiQi',
        title: '出生日期',
        width: 120,
        render: (record: Record<string, any>) => {
          const style = { color: '#333333' };
          if (record.ChuShengRiQi) {
            // @ts-ignore
            const date = dayjs(record.ChuShengRiQi);
            const now = dayjs();
            const diffDays = now.diff(date, 'day');
            if (diffDays < 900 && diffDays >= 0) {
              style.color = 'red';
            }
          }
          return h('span', { style }, record.ChuShengRiQi ? record.ChuShengRiQi : '无');
        },
      },
      {
        key: 'bmi',
        title: 'BMI指数',
        width: 120,
        align: 'center',
        afterColumn: 'TiZhong', // 提供之后显示
        render: (record: Record<string, any>) => {
          const height = record.ShenGao;
          const weight = record.TiZhong;
          // 计算BMI
          const bmi = height && weight ? (weight / ((height / 100) * (height / 100))).toFixed(2) : '无';
          return h('span', {}, bmi);
        },
      },
    ];
  }
  /**
   *
   * @param _srcEvent
   * @param _btnLab
   * @param _selectedRowIDs
   * @param _record
   */
  public override async BtnClick(_srcEvent: string, _btnLab: string, _selectedRowIDs: string, _record: Record<string, any> | undefined) {
    //在查询列表上，进行双击行.
    if (_srcEvent == 'SearchFlow' && _btnLab == 'RowDBClickBefore') {
      //  alert(_record):
      return true; //可以打开页面.  return fasle 不能打开页面.
    }
    if (_srcEvent == 'SearchFlow' && _btnLab == 'RowDBClickBefore') {
      //  alert(_record):
      // Dev2InterfaceCCBill.GetDtlInfo)()
      return true; //可以打开页面.  return fasle 不能打开页面.
    }

    if (_btnLab === 'xxxxx') {
    }

    if (_btnLab === 'xxxxx') {
      const handler = new HttpHandler('BP.App.Demo.Handler_Demo');
      handler.AddPara('No', _selectedRowIDs);
      // handler.AddPara('Name', this.Name);
      // handler.AddPara('Note', note);
      // handler.AddPara('JE', jine);
      const msg = await handler.DoMethodReturnString('Student_JiaoNaXueFei');
      //获得文本框的值.
      //const val = this.GetTextBoxVal('Tel');

      //给文本框赋值.
      //this.SetTextBoxVal('Tel', 'xxxxxx');

      // window.prompt('xxx', '');
      // alert('xxx');

      // this.SetTextBoxValDtl('ND101Dtl1','Tel','xxx')

      return msg;
    }

    alert('接受的参数:_srcEvent: ' + _srcEvent + ' _btnLab:' + _btnLab + ' _selectedRowIDs:' + _selectedRowIDs + ',_record:' + _record);
  }
}
