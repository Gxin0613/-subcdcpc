import { MethodFunc } from './MethodFunc';
import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { FrmTracks } from '/@/WF/Comm/Components/FrmTrack';
import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { message } from 'ant-design-vue/es';
import { IsMobile } from '/@/utils/gener/StringUtils';
import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
import { FieldTypeS } from '/@/bp/en/EnumLab';
import { isNumber } from 'lodash-es';

export class GL_FuncLog extends PageBaseGenerList {
  constructor() {
    super('GL_FuncLog');
    this.PageTitle = '方法执行';
  }
  //重写的构造方法.
  async Init() {
    // this.GroupFieldDefault = 'RecName';
    // this.GroupFields = 'DeptName,RecName'; //可以分组显示的字段..
    this.PageSize = 10; // 分页的页面行数, 0不分页.
    this.BtnOfToolbar = '新建';
    this.Icon = '';
    this.HisGLShowModel = GenerListPageShowModel.Table; //表格展示.

    const workID = this.RequestVal('OID');
    const mID = this.RequestVal('MethodID');
    const mNo = this.RequestVal('MethodNo');

    // const methond = new MethodFunc(mID);
    // await methond.RetrieveFromDBSources();

    this.DTFieldOfSearch = 'RDT'; //按照日期范围查询的字段.
    this.DTFieldOfLabel = '执行日期'; //日期字段名.

    //查询出来数据.
    const frmTracks = new FrmTracks();
    await frmTracks.Retrieve('WorkID', workID, 'FlowNo', mID, 'RDT');
    // 把  mydata 属性转化为json.
    /*this.Columns = [
      { Key: 'MyPK', Name: 'MyPK', IsShow: false, IsShowMobile: false },
      { Key: 'DeptName', Name: '部门', width: 160 },
      { Key: 'RecName', Name: '执行人', width: 160 },
      { Key: 'Msg', Name: '执行消息', width: 500 },
      { Key: 'AtPara', Name: '内容', width: 500 },
      { Key: 'RDT', Name: '执行日期', width: 160 },
    ];*/

    //获得参数:增加参数列.
    const attrs = new MapAttrs();
    await attrs.Retrieve('FK_MapData', mNo, 'Idx');
    this.Columns = [];
    let uibindKey = '';
    for (const item of attrs) {
      if (item.LGType === FieldTypeS.Enum) uibindKey += `'${item.UIBindKey}',`;
      this.Columns.push({
        Key: item.KeyOfEn,
        Name: item.Name,
        width: item.UIWidth,
      });
    }
    if (!!uibindKey) uibindKey = uibindKey.substring(0, uibindKey.length - 1);
    this.Columns.push({ Key: 'RDT', Name: '执行日期', width: 160 });
    this.Data = frmTracks;
    const sysEnums = new SysEnums();
    if (!!uibindKey) await sysEnums.RetrieveIn('EnumKey', uibindKey);
    this.Data.forEach((item) => {
      const atPara = item.atPara;
      attrs.forEach((attr) => {
        const val = atPara.GetValStrByKey(attr.KeyOfEn) || '';
        if (attr.LGType == FieldTypeS.Enum && !!val) {
          const ens = sysEnums.filter((sysEnum) => sysEnum.IntKey === parseInt(val) && sysEnum.EnumKey === attr.UIBindKey);
          item[attr.KeyOfEn] = ens[0].Lab;
          item.SetValByKey(attr.KeyOfEn, ens[0].Lab);
        } else {
          item[attr.KeyOfEn] = val;
          item.SetValByKey(attr.KeyOfEn, atPara.GetValStrByKey(attr.KeyOfEn + 'T') || val);
        }
      });
    });

    //设置数据源.
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {}

  //按钮事件.
  async BtnClick(btnName: string, object: Record<string, any>) {
    const isHavePara = this.RequestVal('IsHavePara');
    const workID = this.RequestVal('OID') || this.RequestVal('RefNo');
    const methodNo = this.RequestVal('MethodNo');
    const method = new MethodFunc(methodNo);
    await method.RetrieveFromDBSources();
    if (isHavePara == 0) {
      let warning = method.WarningMsg;
      if (!warning) warning = '您确定要执行本次操作吗？';
      if (window.confirm(warning) == false) return new GPNReturnObj(GPNReturnType.DoNothing);

      //执行无参的方法
      try {
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('MyPK', methodNo);
        handler.AddPara('FrmID', this.RequestVal('FrmID'));
        handler.AddPara('WorkID', workID);
        await handler.DoMethodReturnString('DoMethod_ExeSQL');
        return new GPNReturnObj(GPNReturnType.Reload);
      } catch (e) {
        message.error(e as string);
        return new GPNReturnObj(GPNReturnType.DoNothing);
      }
    }
    let url = '/src/CCFast/CCBill/RefMethodFunc.vue?IsHavePara=' + isHavePara;
    if (IsMobile()) url = '/src/CCFastMobile/RefMethodFunc.vue?IsHavePara=' + isHavePara;
    url = url + '&OID=' + workID + '&MethodNo=' + methodNo + '&FrmID=' + this.RequestVal('FrmID');
    console.log(url, object);
    return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
  }
}
