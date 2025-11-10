import { computed, ref, type StyleValue } from 'vue';
import { GroupField } from '../../FrmLogic/GroupField';

export function useContainerFold(containerData: Recordable, expandHeight: string, foldHeight: string) {
  const expand = ref(true);
  const animHeight = ref('');
  const gf = new GroupField(containerData.dto.OID);
  gf.Retrieve().then((_) => {
    const state = gf.atPara.GetValStrByKey('expand');
    if (!state) {
      expand.value = true;
      gf.SetPara('expand', '1');
      syncSetting();
      return;
    }
    expand.value = state == '1';
  });
  const syncSetting = async () => {
    gf.SetPara('expand', expand.value ? '1' : '0');
    await gf.Update();
    containerData.dto.AtPara = gf.atPara.GenerAtParaStrs();
  };
  const handleFold = () => {
    animHeight.value = '500px';
    setTimeout(() => {
      animHeight.value = '';
    }, 300);
    expand.value = !expand.value;
    syncSetting();
  };
  const groupBarStyle = computed(() => {
    return {
      minHeight: expand.value ? expandHeight : foldHeight,
      height: expand.value ? animHeight.value : foldHeight,
    } as StyleValue;
  });
  return {
    expand,
    groupBarStyle,
    handleFold,
  };
}
