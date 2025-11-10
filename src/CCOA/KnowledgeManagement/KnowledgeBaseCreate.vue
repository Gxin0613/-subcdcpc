<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div>
        <p class="text-gray-600"> 创建一个新的知识库来组织和管理您的文档和资料 </p>
      </div>

      <Card>
        <Form :model="formData" :rules="rules" ref="formRef" @finish="handleSubmit">
          <!-- 知识库名称 -->
          <FormItem name="name" label="知识库名称" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <Input v-model:value="formData.name" placeholder="输入知识库名称" />
          </FormItem>

          <!-- 知识库封面 -->
          <FormItem
            label="知识库封面"
            :label-col="{ span: 24 }"
            :wrapper-col="{ span: 24 }"
            :validate-status="coverImage ? 'success' : coverImageError ? 'error' : ''"
            :help="coverImageError || ''"
          >
            <div class="KnowImg-box">
              <div class="KnowImg-Bigs"><img :src="ImgUrl" /></div>
              <div class="KnowImg-Small">
                <ul>
                  <li v-for="(imgt, im) in KnowImgData" :key="im">
                    <img :src="imgt.imgurl" @click.stop="ChooseImg(imgt.imgurl)" />
                  </li>
                </ul>
              </div>
            </div>
          </FormItem>

          <!-- 知识库描述 -->
          <FormItem name="description" label="知识库描述" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <Textarea v-model:value="formData.description" placeholder="描述这个知识库的用途和内容..." :rows="4" />
            <p class="mt-1 text-xs text-gray-500"> 最多可输入500个字符 </p>
          </FormItem>
          <!-- 图片下载是否添加水印 -->
          <FormItem name="isShowWaterMark" label="图片是否添加水印" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <Switch v-model:checked="formData.isShowWaterMark" />
          </FormItem>
          <template v-if="formData.isShowWaterMark === true">
            <FormItem name="waterText" label="水印内容" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <Input v-model:value="formData.waterText" placeholder="请输入您想添加的水印，默认'涉密''" />
            </FormItem>
          </template>
          <!-- 可见范围 -->
          <FormItem name="visibility" label="可见范围" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
            <RadioGroup v-model:value="formData.visibility">
              <RadioButton value="private">
                <Icon type="lock" class="mr-2" />
                私有 - 仅自己可见
              </RadioButton>
              <RadioButton value="workspace">
                <Icon type="team" class="mr-2" />
                工作空间 - 团队成员可见
              </RadioButton>
              <RadioButton value="public">
                <Icon type="global" class="mr-2" />
                公开 - 所有人可见
              </RadioButton>
            </RadioGroup>
          </FormItem>
          <template v-if="formData.visibility == 'workspace'">
            <FormItem name="emps" label="参与人" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
              <Tag class="Empsdata-list" v-for="citem in EmpsData" :key="citem.no">
                <span>{{ citem.name }}</span> <span @click="DelEmps(citem.no, citem.name)"><CloseOutlined /></span>
              </Tag>
              <Tag class="Empsdata-list" @click="selectRefShow"> <i class="fa fa-fw fa-plus"></i>人员 </Tag>
            </FormItem>
          </template>
          <FormItem :wrapper-col="{ offset: 8 }">
            <Button type="primary" html-type="submit" :loading="isSubmitting"> 确认</Button>
            <Button style="margin-left: 8px" @click="emit('close-modal')"> 取消 </Button>
            <Button style="margin-left: 8px" @click="handleDelete" type="primary" danger ghost v-if="isShowDel"> <DeleteOutlined /> 删除知识库 </Button>
          </FormItem>
        </Form>
      </Card>

      <Modal v-model:open="popModal.visible" :title="'添加人员'" @ok="handleEnsure" width="980px" style="z-index: 9999999">
        <Pop
          v-if="popModal.visible === true"
          :popHeight="popModal.height"
          :selectVal="popModal.selectNo"
          :selectNameVal="popModal.selectName"
          :mapExt="(popModal.mapExt as EnMapExt)"
          :key="popModal.componetKey"
          ref="refPop"
        />
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, shallowRef } from 'vue';
  import { message, Card, Form, FormItem, Input, Button, Tag, Textarea, RadioGroup, RadioButton, Modal, Switch } from 'ant-design-vue';
  import { KnowledgeBaseFormData } from '/@/CCOA/KnowledgeManagement/type-index';
  import { DeleteOutlined, CloseOutlined } from '@ant-design/icons-vue';
  import BSEntity from '/@/utils/gener/BSEntity';
  import WebUser from '/@/bp/web/WebUser';
  import { EnMapExt, ExtModel } from '/@/bp/en/Map/EnMapExt';
  import { GloWF } from '/@/WF/Admin/GloWF';
  import { AtPara } from '/@/bp/da/AtPara';
  import Pop from '/@/WF/Comm/subComponents/Pop.vue';

  const formRef = ref<any>(null);
  const isSubmitting = ref(false);
  const coverImage = ref<File | null>(null);
  const coverImageError = ref<string | null>(null);

  const isShowDel = ref(false);

  const props = defineProps({
    params: {
      type: Object,
      default: () => {},
    },
    editParams: {
      type: Object,
      default: () => {},
    },
  });

  const editParams: Record<any, any> = props.editParams || {};

  const EmpsData = ref<Array<Recordable>>([]); //参与人

  const EmpsRaw = ref<string>('');

  const isShowWaterMark = ref<boolean>(false);

  const getVisibilityNo = (visibility) => {
    switch (visibility) {
      case 'public':
        return 0;
      case 'private':
        return 1;
      case 'workspace':
        return 2;
    }
  };
  const getVisibilitySta = (visibility) => {
    switch (visibility) {
      case 0:
        return 'public';
      case 1:
        return 'private';
      case 2:
        return 'workspace';
      default:
        return 'public';
    }
  };

  const emit = defineEmits(['close-modal']);

  const formData: KnowledgeBaseFormData = reactive({
    name: '',
    description: '',
    visibility: 'private',
    isShowWaterMark: false,
    waterText: '',
  });

  const popModal = reactive({
    visible: false,
    title: '',
    modalType: '',
    keyOfEn: '',
    width: 800,
    height: {},
    mapExt: new EnMapExt(),
    enableSelect: false,
    selectNo: '',
    selectName: '',
    componetKey: 0,
  });

  const selectRefShow = () => {
    popModal.visible = true;
    popModal.componetKey++;
    const mapExt = new EnMapExt();
    mapExt.ExtModel = ExtModel.Pop;
    mapExt.ExtType = 'PopTreeEns';
    mapExt.AtPara = new AtPara();
    mapExt.Tag1 = GloWF.srcDeptLazily;
    mapExt.Tag3 = GloWF.srcEmpLazily;
    mapExt.Tag4 = GloWF.srcEmpSearchKey; // 搜索数据源
    mapExt.Tag5 = GloWF.srcDeptRoot;
    mapExt.AtPara.SetVal('IsShowSearch', '1');
    mapExt.AtPara.SetVal('IsLazily', '1');
    //单选还是多选.
    mapExt.AtPara.SetVal('IsMultipleChoice', '1');
    mapExt.W = '800px';
    mapExt.H = '400px';
    popModal.mapExt = mapExt;
  };

  //删除参与人
  const DelEmps = (no: string, name: string) => {
    EmpsRaw.value = EmpsRaw.value.replace(name + ';', '');
    var newArr = [];
    for (var i = 0; i < EmpsData.value.length; i++) {
      var j = EmpsData.value[i];
      if (j.no != no) {
        newArr.push(j);
      }
    }
    EmpsData.value = newArr;
  };

  /*
   *弹窗确认事件;
   */
  const refPop = shallowRef<InstanceType<typeof Pop>>();
  const checkedList: any = ref([]);
  const checkedNames: any = ref([]);
  /*
   *popTreeEns弹出确认
   */
  const handleEnsure = async (e: MouseEvent) => {
    popModal.visible = false;
    //获取到所有的No、Name
    const checkedInfo = refPop.value!.handlerPopOK();
    checkedList.value = checkedInfo?.[0] || [];
    checkedNames.value = checkedInfo?.[1] || [];

    popModal.selectNo = checkedList.value.join(',');
    popModal.selectName = checkedNames.value.join(',');
    //重新排布排成no、name对象
    const Emps = checkedList.value.map((no, index) => {
      return {
        no: no,
        name: checkedNames.value[index],
      };
    });
    //把数据放到EmpsRaw.value中，进行保存
    // 创建一个Set来跟踪已经存在的no值
    const existingNos = new Set(EmpsData.value.map((emp) => emp.no));
    // 遍历Emps数组，并将唯一元素添加到EmpsData中
    Emps.forEach((emp) => {
      if (!existingNos.has(emp.no)) {
        EmpsData.value.push(emp);
        existingNos.add(emp.no); // 更新Set，以便后续检查
      }
    });
  };

  const rules = {
    name: [
      { required: true, message: '请输入知识库名称', trigger: 'blur' },
      { min: 2, message: '知识库名称至少需要2个字符', trigger: 'blur' },
      { max: 50, message: '知识库名称不能超过50个字符', trigger: 'blur' },
    ],
    description: [{ max: 500, message: '描述不能超过500个字符', trigger: 'blur' }],
    visibility: [{ required: true, message: '请选择可见范围', trigger: 'change' }],
  };

  //封面图片存放地址
  const imgUrlPrefix = '/resource/CCFast/KnowledgeManagement/';
  //图片数组
  const KnowImgData = [
    { id: 1, imgurl: imgUrlPrefix + '1.png' },
    { id: 2, imgurl: imgUrlPrefix + '2.png' },
    { id: 3, imgurl: imgUrlPrefix + '3.png' },
    { id: 4, imgurl: imgUrlPrefix + '4.png' },
    { id: 5, imgurl: imgUrlPrefix + '5.png' },
    { id: 6, imgurl: imgUrlPrefix + '7.png' },
    { id: 8, imgurl: imgUrlPrefix + '8.png' },
  ];
  //选择图片
  const ImgUrl = ref(imgUrlPrefix + '1.png');
  const ChooseImg = (imgurl) => {
    ImgUrl.value = imgurl;
  };
  // 处理表单提交
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (formData.visibility == 'workspace') {
      }
      if (formData.visibility == 'private') {
        EmpsData.value = [];
        EmpsData.value.push({ no: WebUser.No, name: WebUser.Name });
      }

      let Empsstr = '';
      for (let s = 0; s < EmpsData.value.length; s++) {
        let de = EmpsData.value[s];
        Empsstr += de.no + '@' + de.name + ';';
      }
      const en = isShowDel.value ? new BSEntity('BP.CCOA.KnowledgeManagement.Knowledge', editParams.No) : new BSEntity('BP.CCOA.KnowledgeManagement.Knowledge');
      en.setVal('Title', formData.name);
      en.setVal('ImgUrl', ImgUrl.value);
      en.setVal('KnowledgeSta', getVisibilityNo(formData.visibility));
      en.setVal('Docs', formData.description);
      en.setVal('Emps', Empsstr);
      en.setVal('IsShowWaterMark', formData.isShowWaterMark || false);
      en.setVal('WaterText', formData.waterText || '');
      en.setVal('KnowledgeNo', editParams.PageID);
      await (isShowDel.value ? en.Update() : en.Insert());
      message.success(`知识库${isShowDel.value ? '更新' : '创建'}成功！`);
      emit('close-modal');
    } catch (error) {
      message.error('创建知识库失败，请重试');
      console.error('创建知识库失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  //删除知识库
  const handleDelete = async () => {
    // const id = route.params.id;
    if (!editParams.No || !window.confirm('确定要删除这个知识库吗？此操作不可恢复。')) {
      return;
    }
    try {
      const kncateDel = new BSEntity('BP.CCOA.KnowledgeManagement.Knowledge', editParams.No);
      await kncateDel.Delete();
      emit('close-modal');
    } catch (e: any) {
      console.log(e.toString());
    }
  };

  const setIsSubmitting = (value: boolean) => {
    isSubmitting.value = value;
  };

  //初始化及回显
  const Init = () => {
    formData.description = editParams.Docs;
    formData.name = editParams.Title;
    formData.visibility = getVisibilitySta(editParams.KnowledgeSta);
    formData.isShowWaterMark = editParams.IsShowWaterMark === '1' ? true : false;
    formData.waterText = editParams.WaterText;
    console.log('editParams', editParams);
    if (!!editParams.isShowDel) {
      isShowDel.value = editParams.isShowDel;
      ImgUrl.value = editParams.ImgUrl;
    }
    //人员回显
    if (!!editParams.Emps) {
      EmpsData.value = editParams.Emps.split(';')
        .filter(Boolean)
        .map((item) => {
          const [no, name] = item.split('@');
          return { no, name };
        });
    }
  };
  Init();
</script>

<style scoped>
  .ant-upload-picture-card-wrapper {
    display: flex;
    justify-content: center;
  }

  .ant-radio-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .KnowImg-box img {
    width: 100%;
    border-radius: 5px;
    margin-right: 10px;
  }
  .KnowImg-Bigs {
    width: 120px;
    float: left;
    margin-right: 10px;
  }
  .KnowImg-Small {
    float: left;
  }
  .KnowImg-Small li {
    width: 40px;
    float: left;
    margin-right: 10px;
    cursor: pointer;
  }
</style>
