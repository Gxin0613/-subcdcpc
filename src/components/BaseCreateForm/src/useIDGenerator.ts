import { ref } from 'vue';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { PinYinMode } from './typing';

export function usePinYinGenerator() {
  const pinyinMode = ref<PinYinMode>('full');
  const generatePinyin = async (event: any, refValue: any) => {
    if (typeof refValue.prefix != 'string') return;
    const target = event.target as HTMLInputElement;
    const val = target.value;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner');
    handler.AddPara('name', val);
    handler.AddPara('flag', pinyinMode.value === 'full' ? 'true' : 'false');
    const pinyinStr = await handler.DoMethodReturnString('ParseStringToPinyin');
    refValue.no = refValue.prefix + pinyinStr;
  };
  const changePinyin = async (_event: any, refValue: any) => {
    if (typeof refValue.prefix != 'string') return;
    const val = refValue.name;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner');
    handler.AddPara('name', val);
    handler.AddPara('flag', pinyinMode.value === 'full' ? 'true' : 'false');
    const pinyinStr = await handler.DoMethodReturnString('ParseStringToPinyin');
    refValue.no = refValue.prefix + pinyinStr;
  };
  return {
    pinyinMode,
    generatePinyin,
    changePinyin,
  };
}
