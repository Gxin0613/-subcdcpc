// 实体类

// eslint-disable-next-line prettier/prettier
import CCFormAPI from './CCFormAPI';

export default class CCFormDemo {
  //测试.
  public CCFormDemo() {}

  /**
   * 代码演示方法，展示如何使用CCFormAPI进行表单数据的操作
   */
  public CodeDemo() {
    // 定义表单ID
    const frmID = 'Frm_ABC';

    // 创建一个空白OID，类型为Int
    // 调用CCFormAPI的CreateBlankOID方法，传入表单ID，将返回值转换为数字类型
    const oid = CCFormAPI.CreateBlankOID(frmID) as unknown as number;

    // 将创建的OID对应的数据保存为草稿
    CCFormAPI.SaveAsDraftByOID(frmID, oid);

    // 定义要保存的数据
    const json = { Tel: '18660153393', Addr: '山东济南' };
    // 保存数据到指定表单和OID
    // 调用CCFormAPI的SaveData方法，传入表单ID、OID和数据对象
    CCFormAPI.SaveData(frmID, oid, json);

    // 删除指定表单和OID的数据
    // 调用CCFormAPI的Delete方法，传入表单ID和OID
    CCFormAPI.Delete(frmID, oid);
  }
  /**
   * 界面演示方法，具体实现待补充
   */
  public UIDemo() {
    const frmID = 'Frm_ABC';
    //  const url = '/#/src/WF/Comm/CCFrom/Frm.vue?FrmID=' + frmID;
  }
}
