import { message } from 'ant-design-vue';
import HttpHandler from '/@/utils/gener/HttpHandler';

export function useMethodExecutor() {
  const execMethod = async (No: string, row: Recordable, frmId: string, workId: string, execType: string) => {
    try {
      if (execType == '0') {
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('PKVal', No);
        handler.AddPara('FrmID', frmId);
        handler.AddPara('WorkID', workId);
        const keys = Object.keys(row);
        for (const key of keys) {
          handler.AddPara(key, row[key]);
        }
        const data = await handler.DoMethodReturnString('DoMethodPara_ExeSQL_V3');
        message.success(data);
      } else if (execType == '1') {
        // const jsFunction = () => {
        //   const keys = Object.keys(row);
        //   const key
        //   eval(currentActiveTab?.Docs);
        // }
        // jsFunction();
        message.error('暂未实现');
      } else if (execType == '2') {
        message.error('暂未实现');
      } else {
        message.error('未知方法类型');
      }
    } catch (e: any) {
      message.error(e);
    }
  };

  return {
    execMethod,
  };
}
