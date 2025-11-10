<template>
  <select-helper :widget="widgetInfo" class="checkbox" :setting-url="settingUrl">
    <n-form-item :label="widgetInfo.title" :show-feedback="false" :required="widgetInfo.required">
      <div class="content" v-if="widgetInfo.uiType === DBEnums.CheckBok">
        <n-switch v-if="widgetInfo?.dto?.LGType === 0" :disabled="widgetInfo.readonly" v-model:value="switchDefVal">
          <template #checked>{{ widgetInfo.checkedTips }}</template>
          <template #unchecked>{{ widgetInfo.unCheckedTips }}</template>
        </n-switch>
        <n-checkbox-group v-else :value="selectedItems" :disabled="widgetInfo.readonly" :class="widgetInfo.direction === '3' ? '' : 'vertical'">
          <n-checkbox class="item" v-for="option in options" :key="option.value" :value="option.value" :label="option.label" />
        </n-checkbox-group>
      </div>
      <div class="content" v-else-if="widgetInfo.uiType === DBEnums.RadioBtn">
        <n-radio v-if="widgetInfo?.dto?.LGType === 0" />
        <n-radio-group v-else :value="selectedVal" :disabled="widgetInfo.readonly" :class="widgetInfo.direction === '3' ? '' : 'vertical'">
          <n-radio class="item" v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
          </n-radio>
        </n-radio-group>
      </div>
      <n-select v-else-if="widgetInfo.uiType === DBEnums.DDL && widgetInfo.dto?.LGType === 0" v-model:value="selectedVal" :options="fsOptions" :disabled="widgetInfo.readonly" />
      <n-select v-else-if="widgetInfo.uiType === DBEnums.DDL" v-model:value="selectedVal" :options="options" :disabled="widgetInfo.readonly" />
      <div class="content" v-else style="font-size: 12px; color: #ff5555">{{ '未知类型' }}</div>
    </n-form-item>
  </select-helper>
</template>

<script lang="ts">
  import { defineComponent, ref, PropType, computed, onMounted } from 'vue';
  import { NFormItem, NSwitch, NCheckboxGroup, NCheckbox, NSelect, NRadio, NRadioGroup } from 'naive-ui';
  import SelectHelper from '/@form/components/helper/SelectHelper.vue';
  import { InputTheme } from '/@form/theme';
  import { getEnums } from '/@form/api/FromApi';
  import Event from '/@/utils/Events';
  import { DBEnums } from '/@form/props/database/DatabaseFormItem';
  import { InputEnumsItemProps } from '/@form/props/widgets/input/InputEnumsWidget';
  import { MapAttrEnum } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttrEnum';
  import BSEntity from '/@/utils/gener/BSEntity';
  import type { SelectBaseOption } from 'naive-ui/es/select/src/interface';
import { GenerDBSrc } from '/@/CCFast/GenerDBSrc/GenerDBSrc';
import { GloGenerDBSrc } from '/@/CCFast/GenerDBSrc/GloGenerDBSrc';

  interface En {
    No: string;
    Name: string;
  }

  // 金额，数字，整数等都是这个组件
  export default defineComponent({
    name: 'InputEnums',
    components: {
      NFormItem,
      NSwitch,
      SelectHelper,
      NCheckboxGroup,
      NCheckbox,
      NSelect,
      NRadio,
      NRadioGroup,
    },
    props: {
      widgetInfo: {
        type: Object as PropType<InputEnumsItemProps>,
        default: () => {},
      },
    },
    setup(props) {
      const selectedVal = ref<string>('');
      const selectedItems = ref<Array<string>>([]);
      // 枚举值
      const options = ref<SelectBaseOption<string, string>[]>([]);
      // 外键
      const fsOptions = ref<SelectBaseOption<string, string>[]>([]);

      const fetchFs = async () => {
        // todo 获取枚举值
        if(!!props.widgetInfo?.enumKey){
          if(props.widgetInfo?.enumKey == 'CommGenerDBSrc'){
            //外键为空的时候，根据GenerDBSrc的值获取数据
            const en = new GenerDBSrc();
            debugger
            en.MyPK = 'Frm.'+props.widgetInfo.id+'.Main';
            if(await en.RetrieveFromDBSources()==1){
              const data = await GloGenerDBSrc.GenerData_ByMyPK_WithAtPara(en.MyPK, '');
              fsOptions.value = data.map((item) => {
                return {
                  label: item.Name || item.NAME || item.name,
                  value: item.No || item.NO || item.no,
                };
              });
            }
          }else{
            const sfTable = new BSEntity('BP.Sys.SFTable', props.widgetInfo?.enumKey);
            await sfTable.Retrieve();
            const ens = await sfTable.DoMethodReturnString('GenerDataOfJson');
            fsOptions.value = ens.map((en: En) => {
              return {
                label: en.Name,
                value: en.No,
              };
            });
          } 
        }
        
      };

      const enumsEntity = new MapAttrEnum(props.widgetInfo?.id);

      // 如果是开关的时候，显示的默认值
      const switchDefVal = ref(false);

      switchDefVal.value = parseInt(props.widgetInfo?.dto?.DefVal || '') === 1;

      const fetchEnums = async () => {
        if (!props.widgetInfo?.dto?.UIBindKey || props.widgetInfo?.dto?.LGType === 0) {
          return;
        }
        const getRealKey = (obj) => (obj.StrKey != '' ? obj.StrKey : obj.IntKey);
        const enumKey = props.widgetInfo.dto.UIBindKey;
        const res = await getEnums(enumKey);
        options.value = res
          .filter((option) => option.EnumKey === enumKey)
          .map((option) => {
            return {
              label: option.Lab,
              value: getRealKey(option) + '',
            };
          });
        await enumsEntity.RetrieveFromDBSources();
        const data = Object.fromEntries(enumsEntity.Row);
        // const idx = parseInt(data.DefVal);
        // console.log(data.DefVal, options.value);
        selectedVal.value = data.DefVal;
        selectedItems.value = [data.DefVal];
        // if (!!idx) {
        //   const currVal = options.value?.[idx]?.value;
        //   if (currVal) {
        //     selectedVal.value = currVal;
        //     selectedItems.value = [selectedVal.value];
        //   }
        // }
      };

      const fetchData = () => {
        const { widgetInfo } = props;
        // 外键
        if (widgetInfo.uiType === DBEnums.DDL && widgetInfo?.dto?.LGType === 0) {
          fetchFs();
          return;
        }
        fetchEnums();
      };

      onMounted(async () => {
        Event.on('updateEnums', () => {
          fetchData();
          switchDefVal.value = parseInt(props.widgetInfo?.dto?.DefVal || '') === 1;
        });
        fetchData();
      });

      return {
        selectedVal,
        fsOptions,
        options,
        selectedItems,
        InputTheme,
        settingUrl: computed(() => {
          const { widgetInfo } = props;
          // SQL数据源
          if (widgetInfo?.dto?.LGType === 0 && widgetInfo?.uiType === DBEnums.DDL) {
            return `../../Comm/En.htm?EnName=TS.FrmUI.MapAttrSFSQL&PKVal=${widgetInfo.id}&s=` + Math.random();
          }
          // 外键
          if (widgetInfo?.dto?.LGType === 2 && widgetInfo?.uiType === DBEnums.DDL) {
            return `../../Comm/En.htm?EnName=TS.FrmUI.MapAttrSFTable&PKVal=${widgetInfo.id}&s=` + Math.random();
          }
          // 多选
          if (widgetInfo?.dto?.LGType === 0 && widgetInfo?.uiType === DBEnums.CheckBok) {
            return `../../Comm/En.htm?EnName=TS.FrmUI.MapAttrBoolean&PKVal=${widgetInfo.id}&s=${Math.random()}`;
          }
          // 单选
          return `../../Comm/En.htm?EnName=TS.FrmUI.MapAttrEnum&PKVal=${widgetInfo.id}&s=${Math.random()}`;
        }),
        DBEnums,
        switchDefVal,
      };
    },
  });
</script>

<style lang="less" scoped>
  .checkbox :deep(.n-form-item-label) {
    height: 100%;
  }

  .checkbox :deep(.n-form-item-blank) {
    border: 1px solid #eeeeee;
    overflow: hidden;
  }

  .content {
    box-sizing: border-box;
    padding-left: 12px;
    padding-right: 12px;
    width: 100%;

    .vertical {
      display: flex;
      flex-direction: column;
    }

    .item {
      flex-shrink: 0;
      flex-wrap: wrap;
    }
  }
</style>
