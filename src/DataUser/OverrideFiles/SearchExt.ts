/**
 * 从表重写类使用说明.
 * 1. 该类文件位于 datauser下，开发人员可以重写该文件，不会对cc的核心代码造成影响.
 * 2. 定义的按钮展现在 /WF/Comm/Frm.vue.
 * 3. 可以通过写方法实现业务逻辑,通过返回值，可以修改表单的数据.
 */
export class SearchExt {
  constructor() {}

  /**
   * 重写的按钮事件
   * @param _enName 实体类名
   * @param _btnName  按钮名称 比如: 发起流程
   * @param _selectVals 选择的ItemsPKs, 比如: 001,002,003
   * @param _bodyJson 选择的数据. 不需要改变表单数据时返回null
   */
  public static async BtnClick(_enName: string, _btnName: string, _selectVals: Recordable[], _bodyJson: Record<string, any>) {
    return null;
  }
}
