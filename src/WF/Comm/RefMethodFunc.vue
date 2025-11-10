<template>
  <Card style="border-radius: 12px">
    <div class="header">
      <div class="title">{{ title }}</div>
    </div>
    <Divider />
    <div>
      <EnFields :row-data="row" :map-attrs="(mapAttrs as any)" :map-exts="rmEnMap.EnMapExts" ref="enFields" />
      <div class="footer">
        <Button type="primary" :loading="execLoading" @click="beforeExecMethod">{{ entityRef?.BtnDoneText || '执行' }}</Button>
      </div>
    </div>
    <!--    模态弹窗-->
    <Modal v-model:open="confirmModal.visible" :title="confirmModal.title" @ok="execMethod" @cancel="resetModal" centered>
      <template #footer>
        <div class="modal-footer-style">
          <Button @click="resetModal">{{ '取消' }}</Button>
          <Button type="primary" @click="execMethod">{{ '确定' }}</Button>
        </div>
      </template>
      <div class="p-4" v-html="confirmModal.content"> </div>
    </Modal>
    <Modal v-model:open="modal.noFooterModalVisible" centered :title="modal.modalTitle" :width="modal.modalWidth" :body-style="modal.modalHeight" :footer="null">
      <HandWriting :imageSrc="imageSrc" writingType="MakeImage" @ChangeWriteImg="ChangeWriteImg" />
    </Modal>
  </Card>
</template>

<script lang="ts" setup>
  import { Modal, Divider, Card, message, Button } from 'ant-design-vue';
  import { ref, PropType, unref, reactive, onMounted, shallowRef } from 'vue';
  import { Attr } from '/@/bp/en/Map/Attr';
  import { useTypeConvert } from '/@/hooks/ens/useDataConvert';
  import { useDBSourceLoader } from '/@/hooks/ens/useDBSourceLoader';
  import { GloWF } from '../Admin/GloWF';
  import { SysEnums } from '../Admin/FrmLogic/SysEnum/SysEnum';
  import { Entity } from '/@/bp/en/Entity';
  import { RefMethod } from '/@/bp/en/Map/RefMethod';
  import HandWriting from '/@/WF/CCForm/HandWriting.vue';
  import { Row } from '/@/bp/en/Map/Row';
  import { Attrs } from '/@/bp/en/Map/Attrs';
  import EnFields from './subComponents/EnFields.vue';
  import { Map } from '/@/bp/en/Map/Map';
  import { FieldType, UIContralType } from '/@/bp/en/EnumLab';
  import { DataType } from '/@/bp/en/DataType';
  import { ClassFactory } from '/@/bp/da/ClassFactory';

  const props = defineProps({
    title: {
      type: String,
      default: '',
    },
    attrs: {
      type: Object as PropType<Attrs>,
      default: () => {
        return [];
      },
    },
    rmEnMap: {
      type: Object,
      default: () => {
        return new Map();
      },
    },
    methodName: {
      type: String,
      default: '',
    },
    row: {
      type: Object,
      default: () => {
        return {};
      },
    },
    entityRef: {
      type: Object as PropType<Entity>,
      default: () => ({}),
    },
    execFunc: {
      type: Function,
      default: null,
    },
    execTips: {
      type: String,
    },
    refMethod: {
      type: Object as PropType<RefMethod>,
    },
  });

  const enFields = shallowRef<InstanceType<typeof EnFields>>();

  // 模态框属性,一般都是执行方法前的提示
  const confirmModal = reactive({
    visible: false,
    content: '',
    title: '',
    confirmMethod: '',
  });
  const resetModal = () => {
    confirmModal.confirmMethod = '';
    confirmModal.visible = false;
    confirmModal.content = '';
    confirmModal.title = '';
  };
  const beforeExecMethod = () => {
    const execTips = props.entityRef.WarningMsg || props.execTips;
    if (!execTips) {
      execMethod();
      return;
    }
    confirmModal.visible = true;
    confirmModal.content = execTips;
    confirmModal.title = '提示';
  };

  // 判断是不是数字类型
  const getSelectOption = async (attr: Attr) => {
    const { getDBSource } = useDBSourceLoader();
    const getRealKey = (obj: Recordable) => (obj.StrKey != '' ? obj.StrKey : obj.IntKey);
    try {
      if (!!attr.BindEntityID) {
        const ens = await ClassFactory.GetEns(attr.BindEntityID);
        await ens.RetrieveAll();
        return ens.map((en) => {
          return {
            label: en.Name,
            value: en[en.PK],
          };
        });
      } else if (attr.UIBindKey?.trim?.()?.toLowerCase?.().startsWith('select')) {
        const options = GloWF.DealExp(attr.UIBindKey + '', unref(props.entityRef));
        const list = await getDBSource(options);
        return list.map((item) => {
          return {
            label: item.Name + '',
            value: item.No + '',
          };
        });
      } else {
        const enums = new SysEnums();
        await enums.Retrieve('EnumKey', attr.UIBindKey);
        return enums.map((obj) => {
          return {
            label: obj.Lab,
            value: getRealKey(obj),
          };
        });
      }
    } catch (e) {
      message.error(`解析选项失败: ${e}`);
      console.trace(e);
      return [];
    }
  };
  //签字版图片
  const imageSrc = ref<string>();
  //弹窗显示
  const modal = reactive({
    noFooterModalVisible: false,
    footerModalVisible: false,
    modalTitle: '',
    modalType: '',
    modalWidth: 800,
    modalHeight: {},
  });
  //改变签名
  const ChangeWriteImg = (imgSrc) => {
    imageSrc.value = imgSrc;
    modal.noFooterModalVisible = false;
  };
  // 执行保存方法，依靠父组件执行
  const emit = defineEmits(['exec']);
  const row = ref<Recordable>({});
  const mapAttrs = ref<Array<Attr>>([]);

  const execLoading = ref(false);
  const execMethod = async () => {
    execLoading.value = true;
    const rowData = enFields.value?.rowData || {};
    const { booleanToNumber } = useTypeConvert();
    const actualData = booleanToNumber(mapAttrs.value as unknown as Attr[], rowData);
    const keys = Object.keys(rowData);
    // 处理T字段
    for (const k of keys) {
      let tKey = k + 'T';
      if (rowData.hasOwnProperty(tKey)) {
        actualData[tKey] = rowData[tKey];
      }
    }
    // end
    if (props.execFunc) {
      await props.execFunc(props.methodName, actualData);
    } else {
      emit('exec', props.methodName, actualData);
    }
    resetModal();
    execLoading.value = false;
  };

  const initAttrs = async () => {
    const { numberToBoolean } = useTypeConvert();
    const { attrs, enMapExts } = props.rmEnMap;
    for (const attr of attrs) {
      // 处理下拉框
      if (attr.UIContralType === UIContralType.DDL || attr.UIContralType === UIContralType.RadioBtn) {
        attr.ddl = await getSelectOption(attr);
        const oldData = row.value[attr.Key];
        if (oldData || oldData === 0) {
          row.value[attr.Key] = oldData;
        }
      }
      //判断是否有扩展属性
      if (enMapExts.length == 0) continue;
      const arr = enMapExts.filter((item) => item.AttrOfOper === attr.Key);
      attr['mapExt'] = arr;
      //是否是pop弹窗
      if (
        attr.MyDataType === DataType.AppString &&
        attr.MyFieldType === FieldType.Normal &&
        attr.UIContralType === UIContralType.TB &&
        attr['mapExt'] &&
        attr['mapExt'].length > 0
      ) {
        if (row.value[attr.Key] && row.value[attr.Key + 'T'] && row.value[attr.Key] != '"null"') {
          let val = row.value[attr.Key + 'T'];
          val = val.startsWith(',') ? val.substring(1) : val;
          row.value[attr.Key + 'T'] = val;
          attr['Tag'] = val.split(',');
        } else {
          attr['Tag'] = [];
        }
      }
    }
    mapAttrs.value = attrs;
    // 过滤
    row.value = numberToBoolean(attrs as any, row.value);
  };

  onMounted(() => {
    const enRow = new Row();
    enRow.LoadAttrs(props.attrs);
    row.value = Object.fromEntries(enRow);
    initAttrs();
  });
</script>

<style lang="less" scoped>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: bold;
    }
  }

  .divider {
    width: 100%;
    height: 1px;
    background-color: #f2f5f7;
    margin-top: 6px;
    margin-bottom: 6px;
  }

  .label {
    height: 32px;
    line-height: 32px;
  }

  .footer {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 40px;
  }
  .modal-footer-style {
    padding: 10px;
  }
</style>
