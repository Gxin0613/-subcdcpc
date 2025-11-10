<template>
  <Card style="border-radius: 12px">
    <div class="header">
      <div class="title">执行功能： {{ title }}</div>
    </div>
    <Divider />
    <template v-for="attr in renderAttrs">
      <template v-if="attr.MyDataType === DataType.AppBoolean">
        <Col :span="12" :key="attr.Key + '_boolean'">
          <Checkbox v-model:checked="inputValues[attr.Key]">{{ attr.Desc }}</Checkbox>
        </Col>
      </template>
      <template v-else-if="attr.UIVisible">
        <div :key="attr.Key + '_label'">
          <div class="label">
            {{ attr.Desc }}
            <Helper v-if="attr.HelperUrl" :help-docs="attr.HelperUrl" />
          </div>
        </div>
        <div :key="attr.Key + '_input'">
          <!--      字符串-->
          <Select
            v-if="attr.UIContralType == 6"
            :disabled="isReadonly(attr)"
            v-model:value="inputValues[attr.Key]"
            :style="{ width: attr.UIWidth + 'px' }"
            @change="updateDDLText(attr, $event + '')"
          >
            <SelectOption v-for="item in attr.ddl" :key="item.value" :value="item.value">{{ item.label }}</SelectOption>
          </Select>
          <!--pop弹出框-->
          <template v-else-if="isPopTextArea(attr as any)">
            <InputGroup compact :disabled="true" style="width: 100%">
              <!--            <Input v-model:value="row[attr.Key + 'T']" :disabled="true" style="width: calc(100% - 46px)" />-->
              <div class="pop_intput_div" :id="'div_' + attr.Key" style="padding-left: 5px">
                <template v-for="(ele, p_idx) in attr.Tag" :key="ele">
                  <Tag :closable="true" @close="DeleteDB(attr, ele, p_idx)">
                    {{ inputValues[attr.Key + 'T'].split(',')[p_idx] }}
                  </Tag>
                </template>
              </div>
              <Button @click="PopModalShow(attr)">
                <SettingOutlined />
              </Button>
            </InputGroup>
          </template>

          <Input v-else-if="attr.MyDataType === DataType.AppString" :disabled="isReadonly(attr)" v-model:value="inputValues[attr.Key]" :placeholder="attr.Desc" />
          <InputNumber v-else-if="isNumber(attr as any)" :disabled="isReadonly(attr)" v-model:value="inputValues[attr.Key]" :placeholder="attr.Desc" style="width: 100%" />
          <Checkbox v-else-if="attr.MyDataType === DataType.AppBoolean" :disabled="isReadonly(attr)" v-model:checked="inputValues[attr.Key]">{{ attr.Desc }} </Checkbox>
          <DatePicker v-else-if="attr.MyDataType === DataType.AppDate" :disabled="isReadonly(attr)" v-model:value="inputValues[attr.Key]" value-format="YYYY-MM-DD" />
          <DatePicker
            v-else-if="attr.MyDataType === DataType.AppDateTime"
            :disabled="isReadonly(attr)"
            v-model:value="inputValues[attr.Key]"
            value-format="YYYY-MM-DD HH:mm"
            :showtime="true"
          />

          <div v-else>{{ '【未知组件】' }}</div>
        </div>
      </template>
    </template>

    <div class="footer">
      <Button style="width: 100%" type="primary" :loading="execLoading" @click="beforeExecMethod">{{ entityRef?.BtnDoneText || '执行' }}</Button>
    </div>
    <Modal
      v-model:open="popModal.visible"
      :title="popModal.title"
      :width="popModal.width"
      :bodyStyle="{
        '--padding': '0px 12px !important',
      }"
      :style="popModal.height"
      @ok="PopModalOK"
    >
      <template #footer>
        <div v-if="popModal.mapExt?.Tag6 !== '0' && popModal.mapExt?.Tag5 != '0' && popModal.modalType === 'PopTree'" class="up_level">
          <Button type="primary" class="btnStyle" style="margin: 5px" @click="UpperLevel">{{ '上一级' }}</Button>
        </div>
        <Button key="back" @click="handleCancel">{{ '取消' }}</Button>
        <Button key="submit" type="primary" class="btnStyle" @click="PopModalOK">{{ '确定' }}</Button>
      </template>
      <Pop
        v-if="popModal.visible === true"
        :popHeight="popModal.height"
        :selectVal="row[popModal.keyOfEn]"
        :selectNameVal="row[popModal.keyOfEn + 'T']"
        :mapExt="(popModal.mapExt as EnMapExt)"
        :rowData="row"
        ref="refPop"
      />
    </Modal>
    <!--    模态弹窗-->
    <Modal v-model:open="confirmModal.visible" :title="confirmModal.title" @ok="execMethod" @cancel="resetModal" centered>
      <div class="p-4" v-html="confirmModal.content"> </div>
    </Modal>
  </Card>
</template>

<script lang="ts" setup>
  import { Input, Modal, Tag, InputNumber, InputGroup, Divider, Card, Checkbox, message, DatePicker, Button, Col, Select, SelectOption } from 'ant-design-vue';
  import { ref, PropType, computed, unref, reactive, shallowRef } from 'vue';
  import { DataType } from '/@/bp/en/DataType';
  import { Attr } from '/@/bp/en/Map/Attr';
  import { useTypeConvert } from '/@/hooks/ens/useDataConvert';
  import { useUserStore } from '/@/store/modules/user';
  import { User } from '/@/bp/web/WebUser';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { getAppEnvConfig } from '/@/utils/env';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import { useDBSourceLoader } from '/@/hooks/ens/useDBSourceLoader';
  import { GloWF } from '/@/WF/Admin/GloWF';
  import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
  import useFieldType from '/@/hooks/ens/useFieldType';
  import Pop from '/@/WF/Comm/subComponents/Pop.vue';
  import { EnMapExt } from '/@/bp/en/Map/EnMapExt';
  import { SettingOutlined } from '@ant-design/icons-vue';
  import { Entity } from '/@/bp/en/Entity';
  import { RefMethod } from '/@/bp/en/Map/RefMethod';
  import { MapExt } from '/@/WF/Admin/FrmLogic/MapExt';
  import Helper from '/@/WF/Comm/subComponents/helper.vue';

  type DropdownItem = {
    value: string | number;
    label: string;
  };
  type MergedAttr = Attr & {
    ddl: DropdownItem[];
    Name?: string;
    Desc?: string;
    Tag: string[];
    KeyOfEn: string;
    mapExt: MapExt[];
  };
  const props = defineProps({
    title: {
      type: String,
      default: '',
    },
    attrs: {
      type: Object as PropType<Array<MergedAttr>>,
      default: () => {
        return [];
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

  const userStore = useUserStore();
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  const basicPath = VITE_GLOB_API_URL;
  // 这里要写上传头像的接口，不是指定图片路径
  const uploadApi = async (uploadParams: { file: Blob; name: string; filename: string; fileSrc?: File | undefined }) => {
    const { fileSrc } = uploadParams;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Setting');
    handler.AddFile(fileSrc);
    const response = await handler.DoMethodReturnString('HeadPic_Save');
    return {
      data: response,
    };
  };
  //弹窗显示
  const popModal = reactive({
    visible: false,
    title: '',
    modalType: '',
    keyOfEn: '',
    width: 800,
    height: {
      height: '400px',
    },
    mapExt: new EnMapExt(),
  });
  const PopModalShow = (attr) => {
    popModal.visible = true;
    popModal.title = '请选择' + attr.Desc;
    popModal.keyOfEn = attr.Key;
    popModal.width = attr.mapExt[0].W > window.innerWidth * 0.8 ? window.innerWidth * 0.8 : attr.mapExt[0].W;
    popModal.height = {
      height: attr.mapExt[0].H || window.innerHeight * 0.8 + 'px',
    };
    popModal.mapExt = attr.mapExt[0];
    popModal.modalType = attr.mapExt[0].ExtType;
    console.log('popModal', popModal);
  };
  //取消按钮
  const handleCancel = () => {
    popModal.visible = false;
  };
  const UpperLevel = async () => {
    if (popModal.mapExt?.Tag6 != '0') {
      message.info('已到第一级机构');
      return;
    }
  };
  const refPop = shallowRef<InstanceType<typeof Pop>>();
  const PopModalOK = () => {
    const checkedInfo = refPop.value!.handlerPopOK();
    if (checkedInfo[0].length === 0) {
      inputValues.value[popModal.keyOfEn] = '';
      inputValues.value[popModal.keyOfEn + 'T'] = '';
    } else {
      inputValues.value[popModal.keyOfEn] = checkedInfo?.[0].join(',');
      inputValues.value[popModal.keyOfEn + 'T'] = checkedInfo?.[1].join(',');
    }
    props.attrs.forEach((item) => {
      if (item.Key == popModal.keyOfEn) item['Tag'] = inputValues.value[popModal.keyOfEn].split(',');
    });
    popModal.visible = false;
  };

  const DeleteDB = (attr, ele, idx) => {
    const val = inputValues.value[attr.Key];
    const valT = inputValues.value[attr.Key + 'T'];
    if (!!val && !!valT) {
      const arrVal: [] = val.split(',');
      arrVal.splice(idx, 1);
      inputValues.value[attr.Key] = arrVal.join(',');
      const arrValT: [] = valT.split(',');
      arrValT.splice(idx, 1);
      inputValues.value[attr.Key + 'T'] = arrValT.join(',');
      props.attrs.forEach((item) => {
        if (item.Key == attr.Key) item.Tag = arrVal;
      });
    }
  };

  const isReadonly = (attr: Pick<Attr, 'UIIsReadonly'>) => {
    return !!attr.UIIsReadonly;
  };

  const updateDDLText = (attr: Recordable, event: string) => {
    const ddlItem = attr.ddl.find((ddlItem: DropdownItem) => ddlItem.value === event);
    if (ddlItem) {
      inputValues.value[attr.Key + 'T'] = ddlItem.label;
    }
  };

  const headerImg = basicPath + '/DataUser/UserIcon/Default.png';
  const avatar = computed(() => {
    const { No } = userStore.getUserInfo as User;
    const avatar = basicPath + '/DataUser/UserIcon/' + No + '.png';
    return avatar || headerImg;
  });
  const GetSignature = computed(() => {
    const { No } = userStore.getUserInfo as User;
    const avatar = basicPath + '/DataUser/Siganture/' + No + '.jpg';
    return avatar || headerImg;
  });
  //判断初始化是否有图片
  const IconImgErr = (desc) => {
    const avatar = ref<string>('');
    if (!desc.includes('更换图片')) {
      avatar.value = basicPath + '/DataUser/Siganture/UnName.jpg';
    }
    return avatar.value || headerImg;
  };
  function updateAvatar({ src, data }) {
    const userinfo = userStore.getUserInfo as User;
    userinfo.avatar = src;
    userStore.setUserInfo(userinfo);
    console.log('data', data);
  }
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
  const execLoading = ref(false);
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
  // const isNumber = (type: number) => {
  //   return [DataType.AppInt, DataType.AppMoney, DataType.AppDouble, DataType.AppFloat].includes(type);
  // };

  const inputValues = ref<Recordable>({});

  const getSelectOption = async (attr: Attr) => {
    const { getDBSource } = useDBSourceLoader();
    const getRealKey = (obj: Recordable) => (obj.StrKey != '' ? obj.StrKey : obj.IntKey);
    try {
      if (attr.UIBindKey?.trim?.()?.toLowerCase?.().startsWith('select')) {
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
      message.error(`解析选项失败: ${e}${attr.Key}${attr.Desc}`);
      console.trace(e);
      return [];
    }
  };
  const renderAttrs = ref<MergedAttr[]>([]);
  async function InitComponent() {
    let targetAttrs = (props.refMethod?.HisMap.attrs || []) as MergedAttr[];
    if (Array.isArray(props.attrs) && !props.attrs[0].hasOwnProperty('Desc')) {
      targetAttrs = props.attrs.map((attr) => {
        return {
          ...attr,
          Desc: attr.Name,
        } as MergedAttr;
      });
    }
    if (Array.isArray(props.attrs) && !props.attrs[0].hasOwnProperty('Key')) {
      targetAttrs = targetAttrs.map((attr) => {
        return {
          ...attr,
          Key: attr.KeyOfEn,
        } as MergedAttr;
      });
    }

    for (const attr of targetAttrs) {
      if (attr.UIContralType == 6) {
        attr.ddl = await getSelectOption(attr as unknown as Attr);
      }
      if (!!props.row[attr.Key]) {
        inputValues.value[attr.Key] = props.row[attr.Key];
        continue;
      }
      const DefaultVal = attr.DefaultVal;
      if (isNumber(attr)) {
        inputValues.value[attr.Key] = DefaultVal || 0;
        continue;
      }
      if (attr.MyDataType === DataType.AppBoolean) {
        inputValues.value[attr.Key] = DefaultVal || false;
        continue;
      }
      if (typeof DefaultVal === 'string' && DefaultVal.startsWith('@')) {
        const key = splitAtString(DefaultVal)[0];
        inputValues.value[attr.Key] = props.row[key] || DefaultVal;
      }
      if (isPopTextArea(attr as any)) {
        inputValues.value[attr.Key] = props.row[attr.Key];
      }
    }
    // console.log('props.attrs', props.refMethod, props.attrs);
    const mapExts = props.refMethod?.HisMapExts || [];
    for (const attr of targetAttrs) {
      if (mapExts.length > 0) {
        attr.mapExt = mapExts.filter((ext) => ext.AttrOfOper === attr.Key) as MapExt[];
      }
    }
    renderAttrs.value = targetAttrs;
    console.log({ targetAttrs });
  }

  // 执行保存方法，依靠父组件执行
  const emit = defineEmits(['exec']);
  const execMethod = async () => {
    execLoading.value = true;
    const { booleanToNumber } = useTypeConvert();
    const actualData = booleanToNumber(renderAttrs.value as unknown as Attr[], inputValues.value);
    if (props.execFunc) {
      await props.execFunc(props.methodName, actualData);
    } else {
      emit('exec', props.methodName, actualData);
    }
    resetModal();
    execLoading.value = false;
  };
  const { isNumber, isPopTextArea } = useFieldType();

  InitComponent();
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
    height: 2px;
    background-color: #f2f5f7;
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
  .pop_intput_div {
    line-height: 32px;
    min-height: 32px;
    /*height: auto;*/
    width: calc(100% - 46px);
    border: 1px solid #ccc;
  }

  .change-avatar {
    img {
      display: block;
      margin-bottom: 15px;
      border-radius: 50%;
    }
  }
</style>
