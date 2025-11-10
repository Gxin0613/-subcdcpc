import { LabelInfo } from '/@/WF/Admin/FlowDesigner/FlowAttr';
import BSEntity from '/@/utils/gener/BSEntity';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { message } from 'ant-design-vue';
import type { Ref } from 'vue';

export function useX6Tag(labelList: Ref<Array<LabelInfo>>, flowNo: string) {
  const modifyTagVal = async (MyPK: string, val: string) => {
    const labelEntity = new BSEntity('BP.WF.Template.LabNote', MyPK);
    await labelEntity.Init();
    labelEntity.setVal('Name', val);
    await labelEntity.Update();
  };
  // 更新位置
  const changeTagPosition = async (x: number, y: number, MyPK: string) => {
    const labelEntity = new BSEntity('BP.WF.Template.LabNote', MyPK);
    await labelEntity.Init();
    labelEntity.setVal('X', x);
    labelEntity.setVal('Y', y);
    await labelEntity.Update();
  };
  // 删除标签
  const deleteTag = async (MyPK: string) => {
    const labelEntity = new BSEntity('BP.WF.Template.LabNote', MyPK);
    await labelEntity.Delete();
  };
  // 添加标签
  const addTag = async (x: number, y: number) => {
    try {
      const labeName = window.prompt('请输入标签:');
      if (!labeName) return;

      const newLabel: LabelInfo = {
        FK_Flow: flowNo,
        MyPK: '',
        Name: labeName,
        X: x,
        Y: y,
      };
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_CCBPMDesigner2018');
      handler.AddPara('X', x);
      handler.AddPara('Y', y);
      handler.AddPara('LabName', labeName);
      handler.AddPara('FK_Flow', flowNo);
      const res = await handler.DoMethodReturnJson<LabelInfo>('CreatLabNote');
      newLabel.MyPK = res.MyPK;
      labelList.value.push(newLabel);
      return newLabel;
      // message.success('标签创建成功');
    } catch (e: any) {
      message.error(e.toString());
    }
  };

  return {
    modifyTagVal,
    changeTagPosition,
    deleteTag,
    addTag,
  };
}
