<template>
  <Spin :spinning="loading">
    <ThemeWrapper>
      <div v-if="errorObj.hasError" class="ant-tag-red">{{ errorObj.tips }} </div>
      <!-- 记事本 -->
      <div v-else>
        <div> </div>
        <Form :layout="formState.layout" :model="formState" v-bind="formItemLayout">
          <FormItem style="width: 100%; padding: 10px; background: #fff; border-bottom: 1px solid var(--system-bg-color)">
            <div>
              <PageHeader title="记事本" style="padding: 5px 0" />
              <p>记录想法、文章、心情。</p>
            </div>
          </FormItem>
          <FormItem label="写记事" style="padding: 10px; font-size: 15px; margin-bottom: 5px">
            <Textarea v-model:value="formState.Docs" placeholder="请输入记事内容..." :rows="4" />
          </FormItem>
          <FormItem style="margin: 0 10px 10px">
            <Button type="primary" @click="editSave" class="btn-style">保存</Button>
            <Button type="default" @click="reset" style="margin: 0 10px" class="btn-style">重置</Button>
          </FormItem>
          <div style="background-color: #ececec; padding: 20px">
            <Row :gutter="16">
              <Col :span="12">
                <Card title="最近记事" :bordered="false">
                  <div v-for="item in dataDcos" :key="item.MyPK" class="recent">
                    <div style="display: flex; justify-content: space-between">
                      <div>
                        <!-- 是否转为星标 -->
                        <Rate v-model:value="item.IsStar" :count="count" @click="IsStar(item.MyPK)" />
                        {{ item.Name }}
                      </div>
                      <div>
                        <!-- 按钮 -->
                        <Button type="primary" @click.stop="EidtNote(item.MyPK)" style="margin: 0 5px" class="btn-style">编辑</Button>
                        <Button type="primary" @click.stop="DeleteNode(item.MyPK)" style="margin: 0 5px" class="btn-style" danger>删除</Button>
                      </div>
                    </div>
                    <div class="timer"> {{ item.RDT }}</div>
                    <div class="content_docs"> {{ item.Docs }} </div>
                  </div>
                </Card>
              </Col>
              <Col :span="12">
                <Card title="星标记事" :bordered="false">
                  <div v-for="item in dataDcosStars" :key="item.MyPK" class="recent">
                    <div style="display: flex; justify-content: space-between">
                      <div>
                        <!-- 是否转为星标 -->
                        <Rate v-model:value="item.IsStar" :count="count" @click="IsStar(item.MyPK)" v-if="item.IsStar === 1 ? true : false" />
                        {{ item.Name }}
                      </div>
                      <div>
                        <!-- 按钮 -->
                        <Button type="primary" @click.stop="EidtNote(item.MyPK)" style="margin: 0 5px" class="btn-style">编辑</Button>
                        <Button type="primary" @click.stop="DeleteNode(item.MyPK)" style="margin: 0 5px" class="btn-style" danger>删除</Button>
                      </div>
                    </div>
                    <div class="timer"> {{ item.RDT }}</div>
                    <div class="content_docs"> {{ item.Docs }} </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </Form>
        <Modal v-model:open="isVisible" title="编辑记事本" @ok="handleOk">
          <Form :model="formState" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }" class="edit_txt">
            <FormItem label="主题">
              <Input v-model:value="editdata.Name" :rows="4" />
            </FormItem>
            <FormItem label="正文">
              <Textarea v-model:value="editdata.Docs" :rows="4" />
            </FormItem>
            <FormItem class="star_notepad">
              <Checkbox v-model:checked="checked">星标记事</Checkbox>
            </FormItem>
          </Form>

          <template #footer>
            <Button @click="EditSave(editdata.MyPK)" class="btn-style">保存</Button>
            <Button type="primary" @click="cancel" class="btn-style">取消</Button>
          </template>
        </Modal>
      </div>
    </ThemeWrapper>
  </Spin>
</template>

<script setup lang="ts">
  import { Form, FormItem, Button, Textarea, message, Row, Col, Card, Spin, Modal, Input, Rate, Checkbox, PageHeader } from 'ant-design-vue';
  import { UnwrapRef, computed, createVNode, reactive, ref } from 'vue';
  import BSEntities from '/@/utils/gener/BSEntities';
  import BSEntity from '/@/utils/gener/BSEntity';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import WebUser from '/@/bp/web/WebUser';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  //表单配置
  interface FormState {
    layout: 'vertical';
    Name: '';
    Docs: string;
  }
  const formState: UnwrapRef<FormState> = reactive({
    layout: 'vertical',
    Name: '',
    Docs: '',
  });
  const formItemLayout = computed(() => {
    const { layout } = formState;
    return layout === 'vertical'
      ? {
          labelCol: { span: 4 },
          wrapperCol: { span: 14 },
        }
      : {};
  });
  const buttonItemLayout = computed(() => {
    const { layout } = formState;
    return layout === 'vertical'
      ? {
          wrapperCol: { span: 14, offset: 4 },
        }
      : {};
  });
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  //星标
  const count = 1;
  //最近记事
  const dataDcos = ref<any>([]);
  //星标记事
  const dataDcosStars = ref<any>([]);
  const loading = ref(false);

  const InitPage = async () => {
    try {
      loading.value = true;
      const ens = new BSEntities('BP.CCOA.Notepads');
      //最近记事
      dataDcos.value = await ens.DoMethodReturnJSON('RetrieveTop30');
      //星标记事
      dataDcosStars.value = await ens.DoMethodReturnJSON('RetrieveTop30Stars');
      console.log('本模块：', dataDcos.value);
      console.log('星标文本', dataDcosStars.value);
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      message.error('获取数据失败');
      loading.value = false;
      return;
    } finally {
      loading.value = false;
    }
  };
  InitPage();
  //保存
  const editSave = async () => {
    const en = new BSEntity('BP.CCOA.Notepad');
    console.log('保存操作', en);
    if (formState.Docs == '') return;
    en.setVal('Name', formState.Docs);
    en.setVal('Docs', formState.Docs);
    en.Insert();
    InitPage();
    formState.Docs = '';
  };
  //重置
  const reset = () => {
    formState.Docs = '';
  };
  const isVisible = ref<boolean>(false);
  const handleOk = () => {
    loading.value = true;
    isVisible.value = false;
  };
  //编辑
  const editdata = ref<any>([]);
  const EidtNote = async (MyPK) => {
    const en = new BSEntity('BP.CCOA.Notepad', MyPK);
    await en.Init();
    await en.Retrieve();
    if (en.IsStar == 1) checked.value = true;
    else checked.value = false;
    editdata.value = en;
    isVisible.value = true;
  };

  //获取数据
  const checked = ref<Boolean>(false);
  //弹出层编辑保存
  const isStar = ref<Number>(0);
  const EditSave = async (MyPK) => {
    if (checked.value == false) {
      isStar.value = 0;
    } else {
      isStar.value = 1;
    }
    const ens = new BSEntity('BP.CCOA.Notepad', MyPK);
    ens.setVal('Name', editdata.value.Name);
    ens.setVal('Docs', editdata.value.Docs);
    ens.setVal('NianYue', editdata.value.NianYue);
    ens.setVal('IsStar', isStar.value);
    ens.setVal('OrgNo', editdata.value.OrgNo);
    ens.setVal('RDT', editdata.value.RDT);
    ens.setVal('Rec', WebUser.No);
    await ens.Update();
    InitPage();
    isVisible.value = false;
  };
  //删除
  const DeleteNode = (MyPK) => {
    const endel = new BSEntity('BP.CCOA.Notepad', MyPK);
    Modal.confirm({
      title: '您确定想删除该记事吗?',
      icon: createVNode(ExclamationCircleOutlined),
      okText: '确认',
      cancelText: '取消',
      onOk() {
        endel.Delete();
        InitPage();
      },
    });
  };
  //是否为星标记事
  const IsStar = async (MyPK) => {
    const enstar = new BSEntity('BP.CCOA.Notepad', MyPK);
    await enstar.Init();
    await enstar.Retrieve();
    if (enstar.IsStar == 0) {
      enstar.IsStar = 1;
      enstar.Update();
    } else {
      enstar.IsStar = 0;
      enstar.Update();
    }
    await InitPage();
  };
  //关闭弹出层
  const cancel = () => {
    isVisible.value = false;
  };
</script>

<style lang="less" scoped>
  .btn-style {
    height: 30px;
    border-radius: 5px;
    margin: 0 10px;
  }
  .recent {
    padding: 10px;
    margin-bottom: 5px;
    box-shadow: 0 0 5px 2px #cdcdcd;
    .timer {
      margin-left: 25px;
      font-size: 12px;
    }
    .content_docs {
      margin-left: 25px;
    }
  }
  .edit_txt {
    margin: 20px 0;
  }
  .star_notepad {
    margin-left: 50px;
  }
</style>
