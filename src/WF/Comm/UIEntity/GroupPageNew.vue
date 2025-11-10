<template>
  <BaseComponent ref="baseComp">
    <ThemeWrapper>
      <div v-if="errorObj.hasError" class="ant-tag-red">
        {{ errorObj.tips }}
      </div>
      <div v-else class="content" @keydown.stop>
        <template v-if="!hasCreated">
          <GroupLayout :list="modeList" @pick-node="(groupNo, itemNo) => pickNode(groupNo, itemNo)" ref="layoutRef">
            <div class="step-form-card">
              <div class="form-main">
                <div class="content-area">
                  <div class="form-title">
                    <Steps v-if="steps && steps.length > 1" :current="currentStep">
                      <Step v-for="(step, index) in steps" :key="step.page.No || index" :title="step.title" />
                    </Steps>
                    <div v-else-if="steps && steps.length === 1">
                      {{ steps[0].title }}
                    </div>
                  </div>
                  <div class="custom">
                    <div class="header" v-if="Array.isArray(typeOptions) && typeOptions.length > 0 && currentStep === 0">
                      <div class="title">请选择 {{ currentPage?.Title || '类型' }}</div>
                      <Select v-model:value="activeType" style="flex: 1" :placeholder="'请选择'">
                        <SelectOption v-for="option in typeOptions" :key="option.No" :value="option.No">
                          {{ option.Name }}
                        </SelectOption>
                      </Select>
                    </div>

                    <template v-if="currentPage">
                      <component
                        v-if="currentPage.HisPageModelNew === PageModelNew.SelfComponent"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.SelfComponent"
                        :is="currentPage.Component"
                        :params="currentPage.Tag6 || {}"
                        ref="customComp"
                      />
                      <div
                        class="text-sql"
                        v-else-if="currentPage.HisPageModelNew === PageModelNew.TextSQL"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.TextSQL"
                      >
                        <div class="select-src">
                          <span class="title">{{ '数据源' }}</span>
                          <Select v-model:value="textSQLVal.dbsrc" style="flex: 1">
                            <SelectOption v-for="option in textSQLVal.dbOptions" :key="option.No">{{ option.Name }} </SelectOption>
                          </Select>
                        </div>
                        <p style="color: #666666; width: 100%; margin: 10px 12px; text-align: left"> 请输入执行内容(支持表达式,比如:@WebUser.*,@字段名,@参数名)</p>
                        <Textarea
                          style="width: 100%; height: 100%; border: 1px solid #cccccc"
                          type="text"
                          :rows="4"
                          v-model:value="textSQLVal.sql"
                          :placeholder="currentPage.Tag3"
                        />
                      </div>
                      <Textarea
                        v-else-if="currentPage.HisPageModelNew === PageModelNew.Textarea"
                        style="width: 100%; height: 100%; border: 1px solid #cccccc"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.Textarea"
                        type="text"
                        :rows="4"
                        v-model:value="tb1Value.name"
                        :placeholder="currentPage.Tag3"
                      />
                      <div
                        v-else-if="currentPage.HisPageModelNew === PageModelNew.Text1Name"
                        class="gpn-input-item input-box"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.Text1Name"
                      >
                        <div class="label"> <span style="color: red" v-if="!currentPage.Tag4"> * </span>{{ currentPage.Tag2 || '名称' }} </div>
                        <Input type="text" v-model:value="tb1Value.name" :placeholder="currentPage.Tag3" />
                      </div>
                      <div
                        v-else-if="currentPage.HisPageModelNew === PageModelNew.Text2NoName"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.Text2NoName"
                        class="input-box"
                      >
                        <div class="gpn-input-item">
                          <div class="label"> <span style="color: red" v-if="!currentPage.Tag4"> * </span>{{ currentPage.Tag2 || '名称' }} </div>
                          <Input type="text" v-model:value="tb2Value.name" @change="generatePinyin($event, tb2Value)" :placeholder="currentPage.Tag5" />
                        </div>
                        <div class="gpn-input-item">
                          <div class="label"> <span style="color: red" v-if="!currentPage.Tag4"> * </span>{{ currentPage.Tag1 || '编号' }} </div>
                          <Input type="text" v-model:value="tb2Value.no" :placeholder="currentPage.Tag6" />
                        </div>
                        <div v-if="typeof currentPage?.Tag0 == 'string'" style="display: flex; justify-content: flex-end; margin-top: 12px">
                          <RadioGroup v-model:value="pinyinMode" @change="changePinyin($event, tb2Value)" name="radioGroup">
                            <Radio :value="'simple'">{{ '简拼' }}</Radio>
                            <Radio :value="'full'">{{ '全拼' }}</Radio>
                          </RadioGroup>
                        </div>
                      </div>
                      <div
                        v-else-if="currentPage.HisPageModelNew === PageModelNew.Text2NameNote"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.Text2NameNote"
                        class="input-box"
                      >
                        <div class="gpn-input-item">
                          <div class="label"> <span style="color: red" v-if="!currentPage.Tag4"> * </span>{{ currentPage.Tag2 || '名称' }} </div>
                          <Input type="text" v-model:value="tb2NameNote.name" :placeholder="currentPage.Tag5" />
                        </div>
                        <div class="gpn-input-item gpn-input-textarea">
                          <div class="label"> <span style="color: red" v-if="!currentPage.Tag4"> * </span>{{ currentPage.Tag3 || '备注' }} </div>
                          <Textarea
                            type="text"
                            style="width: 100%; height: 100%; border: 1px solid #cccccc"
                            :rows="4"
                            v-model:value="tb2NameNote.note"
                            :placeholder="currentPage.Tag6"
                          />
                        </div>
                      </div>
                      <div
                        v-else-if="currentPage.HisPageModelNew === PageModelNew.NameAndDDL"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.NameAndDDL"
                        class="input-box"
                      >
                        <div class="gpn-input-item">
                          <div class="label"> <span style="color: red" v-if="!currentPage.Tag4"> * </span>{{ currentPage.Tag1 || '名称' }} </div>
                          <Input type="text" v-model:value="nameAndDDLValue.flowName" :placeholder="currentPage.Tag5" />
                        </div>
                        <div class="gpn-input-item">
                          <div class="label"> <span style="color: red" v-if="!currentPage.Tag4"> * </span>{{ currentPage.Tag2 || '选项' }} </div>
                          <Select
                            v-model:value="nameAndDDLValue.selectedValue"
                            @select="
                              (_, option) => {
                                nameAndDDLValue.selectedLabel = option.label;
                              }
                            "
                            style="width: 100%"
                            :placeholder="currentPage.Tag3 || '请选择'"
                            allowClear
                          >
                            <SelectOption v-for="item in currentPage?.ex_params?.options" :key="item.value" :value="item.value" :label="item.label">
                              {{ item.label }}
                            </SelectOption>
                          </Select>
                        </div>
                      </div>
                      <div
                        v-else-if="currentPage.HisPageModelNew === PageModelNew.Text3NoNameNote"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.Text3NoNameNote"
                        class="input-box"
                      >
                        <div class="gpn-input-item">
                          <div class="label"> <span style="color: red" v-if="!currentPage.Tag4"> * </span>{{ currentPage.Tag2 || '名称' }} </div>
                          <Input type="text" v-model:value="tb3Value.name" @change="generatePinyin($event, tb3Value)" :placeholder="currentPage.Tag5" />
                        </div>
                        <div class="gpn-input-item">
                          <div class="label"> <span style="color: red" v-if="!currentPage.Tag4"> * </span>{{ currentPage.Tag1 || '编号' }} </div>
                          <Input type="text" v-model:value="tb3Value.no" :placeholder="currentPage.Tag6" />
                        </div>
                        <div class="gpn-input-item">
                          <div class="label"> <span style="color: red" v-if="!currentPage.Tag4"> * </span>{{ currentPage.Tag3 || '物理表' }} </div>
                          <Input type="text" v-model:value="tb3Value.pTable" :placeholder="currentPage.Tag0?.startsWith('note:') ? currentPage.Tag0.substring(5) : ''" />
                        </div>
                        <div
                          v-if="typeof currentPage?.Tag0 == 'string' && !currentPage.Tag0?.startsWith('note:')"
                          style="display: flex; justify-content: flex-end; margin-top: 12px"
                        >
                          <RadioGroup v-model:value="pinyinMode" @change="changePinyin($event, tb3Value)" name="radioGroup">
                            <Radio :value="'simple'">{{ '简拼' }}</Radio>
                            <Radio :value="'full'">{{ '全拼' }}</Radio>
                          </RadioGroup>
                        </div>
                      </div>
                      <Upload
                        v-else-if="currentPage.HisPageModelNew === PageModelNew.FileUpload"
                        v-model:file-list="fileList"
                        :max-count="1"
                        :remove="handleRemove"
                        :before-upload="beforeUpload"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.FileUpload"
                      >
                        <Button> <upload-outlined />{{ '点击上传' }}</Button>
                      </Upload>
                      <div
                        v-else-if="currentPage.HisPageModelNew === PageModelNew.FolderUpload"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.FolderUpload"
                      >
                        <Input v-model:value="FolderName" :placeholder="'请填写文件夹名称'" style="width: 200px; margin-bottom: 8px" />
                        <Upload v-model:file-list="fileList" :remove="handleRemove" :before-upload="beforeUpload" directory>
                          <Button> <upload-outlined />{{ '点击上传文件夹' }}</Button>
                        </Upload>
                      </div>
                      <PopTreeEns
                        v-else-if="currentPage.HisPageModelNew === PageModelNew.SelectItemsByTreeEns"
                        ref="treeEns"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.SelectItemsByTreeEns"
                        :list-sql="currentPage.Tag2"
                        :tree-sql="currentPage.Tag0"
                        :parent-no="currentPage.Tag1"
                        :is-multi-select="currentPage.IsMultiSelect"
                        :selected-items="cacheSelectedData"
                        :is-lazily="currentPage.IsLazily"
                        :is-ShowSearch="currentPage.enableSearch"
                        :search-sql="currentPage.Tag4"
                      />
                      <PopTree
                        ref="tree"
                        v-else-if="currentPage.HisPageModelNew === PageModelNew.SelectItemsByTree"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.SelectItemsByTree"
                        :tree-sql="currentPage.Tag0"
                        :parent-no="currentPage.Tag1"
                        :is-multi-select="currentPage.IsMultiSelect"
                        :selected-items="cacheSelectedData"
                        :is-show-search="currentPage.enableSearch"
                        :is-lazily="currentPage.IsLazily"
                      />
                      <PopList
                        ref="list"
                        v-else-if="currentPage.HisPageModelNew === PageModelNew.SelectItemsByList"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.SelectItemsByList"
                        :list-sql="currentPage.Tag0"
                        :is-multi-select="currentPage.IsMultiSelect"
                        :is-show-no="currentPage.labelVisible"
                        :selected-items="cacheSelectedData"
                        :is-show-search="currentPage.enableSearch"
                      />
                      <SelectByTable
                        v-else-if="currentPage.HisPageModelNew === PageModelNew.SelectItemsByTable"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.SelectItemsByTable"
                        ref="tableRef"
                        :list-sql="currentPage.Tag0"
                        :is-multi-select="currentPage.IsMultiSelect"
                        :columns="currentPage.ex_params?.columns"
                        :selected-items="cacheSelectedData"
                        :current-page="currentPage"
                        :page-obj="pageObj"
                      />
                      <PopGroupList
                        v-else-if="currentPage.HisPageModelNew === PageModelNew.SelectItemsByGroupList"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.SelectItemsByGroupList"
                        ref="groupList"
                        :list-sql="currentPage.Tag1"
                        :group-list-sql="currentPage.Tag0"
                        :is-multi-select="currentPage.IsMultiSelect"
                        :selected-items="cacheSelectedData"
                        :is-show-search="currentPage.enableSearch"
                        :ref-key="currentPage.Tag4"
                      />
                      <Result
                        v-else-if="currentPage.HisPageModelNew === PageModelNew.Finish"
                        :key="currentPage.GroupNo + '_' + currentPage.No + '_' + PageModelNew.Finish"
                        status="success"
                        :title="'创建成功'"
                        :sub-title="currentPage.Tag0"
                      />
                      <div v-else :key="currentPage.No || 'unknown'">
                        <p style="padding: 60px 20px; text-align: center; color: #999">
                          {{ currentPage.Tag0 || '当前为空白页，请查看帮助文档或点击下一步继续' }}
                        </p>
                      </div>
                    </template>
                    <div v-else style="padding: 50px; text-align: center; color: #ccc"> 请在左侧选择一个创建类型开始... </div>
                  </div>

                  <div class="form-footer">
                    <ShowHelp v-if="!gloHideHelpDoc" @change-show-help="changeShowHelp" :isGPNShowHelp="isGPNShowHelp" />
                    <div v-else class="place-holder"></div>
                    <div>
                      <template v-if="currentPage && currentPage.HisPageModelNew !== PageModelNew.Finish">
                        <Button class="btn btn-default" :disabled="loading" @click="prevStep" v-if="currentStep > 0" style="margin-right: 8px">上一步</Button>
                        <Button type="primary" class="btn btn-active" @click="saveNewNode" :loading="loading">
                          {{ currentStep === steps.length - 1 ? '创建' : '下一步' }}
                        </Button>
                      </template>
                      <template v-else-if="currentPage && currentPage.HisPageModelNew === PageModelNew.Finish">
                        <Button type="primary" style="margin-right: 12px" @click="reCreate">{{ '再次创建' }}</Button>
                        <Button type="primary" @click="setupForm">{{ '关闭' }}</Button>
                      </template>
                    </div>
                  </div>
                </div>
                <template v-if="!gloHideHelpDoc">
                  <Transition name="slide-fade">
                    <div v-if="isGPNShowHelp" class="inner-help-docs">
                      <v-md-preview
                        v-if="currentPage?.HelpDocs && currentPage?.HisPageModelNew !== PageModelNew.SelfComponent"
                        :text="appTitleHelper(currentPage.HelpDocs)"
                        preview-class="vuepress-markdown-body"
                        height="400px"
                      />
                      <div v-else-if="!currentPage?.HelpDocs" style="padding: 20px; text-align: center; color: #999">{{ '当前步骤无帮助文档。' }}</div>
                    </div>
                  </Transition>
                </template>
              </div>
            </div>
          </GroupLayout>
        </template>
        <template v-else>
          <div class="after-create-view">
            <div class="back-btn" style="margin: 12px" @click="resetCallback">
              <span :title="'返回创建页'">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="1em"
                  height="1em"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
            </div>
            <component :is="loadComponent(jumpUrl)" :params="getComponentParamsByUrl(jumpUrl)" />
          </div>
        </template>
      </div>
    </ThemeWrapper>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { Button, Input, message, Result, Select, SelectOption, Step, Steps, Textarea, Upload, RadioGroup, Radio } from 'ant-design-vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import { useRoute } from 'vue-router';
  import { reactive, Ref, ref, shallowRef, provide, PropType } from 'vue';
  import { ClassFactoryOfGroupPageNew } from '/@/WF/Comm/UIEntity/ClassFactoryOfGroupPageNew';
  import { useDataConvert } from '/@/hooks/ens/useDataConvert';
  import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { Page } from '/@/bp/UIEntity/Page';
  import { PageModelNew } from '/@/bp/UIEntity/EnumLab';
  import { FlowSort } from '../../TSClass/Admin/FlowSort';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import PopTreeEns from '/@/WF/Comm/subComponents/PopTreeEns.vue';
  import PopTree from '/@/WF/Comm/subComponents/PopTree.vue';
  import PopList from '/@/WF/Comm/subComponents/PopList.vue';
  import PopGroupList from '/@/WF/Comm/subComponents/PopGroupList.vue';
  import SelectByTable from '../subComponents/SelectByTable.vue';
  import { windowOpen } from '/@/utils/windowOpen';
  import { type UploadFile } from 'ant-design-vue/es/upload/interface';
  import ThemeWrapper from '/@/WF/Comm/ThemeWrapper.vue';
  import ShowHelp from '/@/WF/Comm/UIEntity/ShowHelp.vue';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { type BaseListData, GroupLayout } from '/@/components/BaseCreateForm';
  import { usePinYinGenerator } from '/@/components/BaseCreateForm/src/useIDGenerator';
  import { isHttpLink } from '/@/components/BaseCreateForm/src/util';
  import { useStepFormModel } from '/@/components/BaseCreateForm/src/useStepFormModel';
  import { appTitleHelper } from '/@/utils/helper/appTitleHelper';
  import { getAppEnvConfig } from '/@/utils/env';

  const props = defineProps({
    params: {
      type: Object as PropType<Recordable>,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['editClosed', 'close-self', 'update-title', 'trigger-close']);
  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();
  const layoutRef = shallowRef<InstanceType<typeof GroupLayout>>();
  const route = useRoute();

  const loading = ref(false);
  const loadingTips = ref<string>('加载中...');
  const errorObj = reactive({ tips: '', hasError: false });

  const hasCreated = ref(false);
  const jumpUrl = ref('');
  const sideMenuVisible = ref(true);

  const pageObj = ref<PageBaseGroupNew>();
  const modeList = ref<BaseListData[]>([]);
  const stepFormPages = ref<Array<Page>>([]);

  const typeOptions = ref<Array<{ No: string | number; Name: string }>>([]);
  const activeType = ref<string | number>('');

  const fileList = ref<UploadFile[]>([]);
  const FolderName = ref('');

  const treeEns = shallowRef<InstanceType<typeof PopTreeEns>>();
  const tree = shallowRef<InstanceType<typeof PopTree>>();
  const list = shallowRef<InstanceType<typeof PopList>>();
  const groupList = shallowRef<InstanceType<typeof PopGroupList>>();
  const tableRef = shallowRef<InstanceType<typeof SelectByTable>>();
  const customComp = shallowRef<any>();

  const selectionRefs = { treeEns, tree, list, groupList, tableRef };
  const fileUploadState = { fileList, FolderName };

  const {
    tb1Value,
    tb2Value,
    tb3Value,
    tb2NameNote,
    textSQLVal,
    cacheSelectedData,
    nameAndDDLValue,
    currentPage,
    currentStep,
    steps,
    createStepForm,
    afterFormCreate,
    loadPageData,
    saveCurrentStep,
    resetFormStates,
  } = useStepFormModel(pageObj, stepFormPages as Ref<Array<Page>>, handleCallBackUrl, emit, props.params, selectionRefs, fileUploadState, customComp);

  const getSortNo = (optionKey: unknown): string | number => {
    if (!props.params.SortNo) return '';
    let sortNo = String(props.params.SortNo)
      .trim()
      .replace(/[\n\b\t\s+]/g, '');
    if (typeof optionKey === 'string') {
      return sortNo;
    } else if (typeof optionKey === 'number') {
      const num = parseInt(sortNo);
      return isNaN(num) ? 0 : num;
    }
    return sortNo;
  };

  const nextStep = async () => {
    if (currentStep.value < steps.value.length - 1) {
      currentStep.value++;
      await loadPageData();
      await afterFormCreate();
    }
  };
  const prevStep = async () => {
    if (currentStep.value > 0) {
      currentStep.value--;
      await loadPageData();
      await afterFormCreate();
    }
  };

  const { VITE_GLOB_HIDE_HELP_DOCS } = getAppEnvConfig();
  const gloHideHelpDoc = ref(VITE_GLOB_HIDE_HELP_DOCS);
  const isGPNShowHelp = ref(true);
  const changeShowHelp = (_GPEHelp: boolean, GPNHelp: boolean) => {
    isGPNShowHelp.value = GPNHelp;
  };

  function reCreate() {
    currentStep.value = 0;
    currentPage.value = undefined;
    loadPageData();
  }

  async function setupForm() {
    if (typeOptions.value.length > 0) {
      const optionsFirstKey = typeOptions.value[0].No;
      activeType.value = props.params?.SortNo ? getSortNo(optionsFirstKey) : optionsFirstKey;
    } else {
      activeType.value = props.params?.SortNo ? getSortNo('') : '';
    }

    steps.value = [];
    currentPage.value = undefined;
    currentStep.value = 0;
    resetFormStates();

    pageObj.value?.ClearCache();
    hasCreated.value = false;
    jumpUrl.value = '';
    // emit('close-self', false);
    layoutRef.value?.closeModal();
  }

  const activeMode = ref<string[]>([]);
  const pickNode = (groupNo: string, itemNo: string) => {
    activeMode.value = [itemNo];
    const selectedPage = pageObj.value?.SubPages.find((dtl) => dtl.No === itemNo && dtl.GroupNo === groupNo);
    if (selectedPage) {
      switchNode(selectedPage);
    } else {
      console.error(`无法找到页面: GroupNo=${groupNo}, No=${itemNo}`);
      message.error('选择的页面配置不存在，请联系管理员。');
    }
  };

  const switchNode = async (page?: Page) => {
    if (!page) {
      return;
    }
    createStepForm(page);
    if (currentStep.value !== 0) {
      currentStep.value = 0;
    }
    await loadPageData();
    await afterFormCreate();
  };

  const resetCallback = () => {
    setupForm();
  };

  async function handleCallBackUrl(result: GPNReturnObj | string | void) {
    if (result === undefined || result === null) {
      await nextStep();
      return;
    }
    if (typeof result === 'string' && result.startsWith('url@')) {
      jumpUrl.value = result.replace('url@', '');
      hasCreated.value = true;
      await nextStep();
      return;
    }
    if (typeof result === 'object' && 'ReturnType' in result) {
      const returnObj = result as GPNReturnObj;
      if (returnObj.ReturnType != GPNReturnType.Error) {
        await nextStep();
      }
      switch (returnObj.ReturnType) {
        case GPNReturnType.Error:
          message.error(returnObj.data || '操作失败');
          console.error('Callback returned an error:', returnObj.data);
          return;
        case GPNReturnType.Close:
          emit('close-self', false);
          return;
        case GPNReturnType.Message:
          message.open({ content: returnObj.data, style: { 'white-space': 'pre-wrap' } as any, duration: 5 });
          break;
        case GPNReturnType.GoToUrl:
          const url = returnObj.data.replace('url@', '').replace('//DataUser', '/DataUser');
          if (isHttpLink(url)) {
            window.open(url);
          } else {
            jumpUrl.value = url;
            hasCreated.value = true;
          }
          return;
        case GPNReturnType.CloseAndReload:
          // emit('close-self', true);
          layoutRef.value?.closeModal();
          emit('trigger-close');
          return;
        case GPNReturnType.DoNothing:
          return;
        case GPNReturnType.OpenUrlByNewWindow:
          windowOpen(returnObj.data.replace('url@', ''));
          break;
        default:
          baseComp.value?.handleGPNCallback(result);
          break;
      }
    }
  }

  const saveNewNode = async () => {
    loading.value = true;
    loadingTips.value = '保存中，请稍候...';
    try {
      if (typeOptions.value.length > 0 && !activeType.value && currentStep.value === 0) {
        message.warn(`请先选择${currentPage.value?.Title || '类型'}`);
        return;
      }
      const result = await saveCurrentStep(String(activeType.value));
      await handleCallBackUrl(result);
    } catch (error: any) {
      console.error('Error caught in saveNewNode wrapper:', error);
      message.error(error.message || String(error));
    } finally {
      loading.value = false;
      loadingTips.value = '加载中...';
    }
  };

  const handleRemove = (file: UploadFile): Promise<boolean> => {
    const index = fileList.value.findIndex((f) => f.uid === file.uid);
    if (index !== -1) {
      const newFileList = fileList.value.slice();
      newFileList.splice(index, 1);
      fileList.value = newFileList;
    }
    return Promise.resolve(true);
  };
  const beforeUpload = (file: UploadFile, _list: UploadFile[]): boolean => {
    if (currentPage.value?.HisPageModelNew === PageModelNew.FileUpload) {
      fileList.value = [file];
    } else {
      if (!fileList.value.some((f) => f.uid === file.uid)) {
        fileList.value = [...fileList.value, file];
      }
    }
    return false;
  };

  const convert = useDataConvert();
  const { loadComponent, getComponentParamsByUrl } = useComponentLoader();
  const { pinyinMode, generatePinyin, changePinyin } = usePinYinGenerator();

  async function InitPage() {
    loading.value = true;
    loadingTips.value = '初始化页面配置...';
    try {
      const EnName = props.params?.EnName || (route.query?.EnName as string);
      if (!EnName) {
        throw new Error('缺少必要的参数 EnName');
      }
      const entity = await ClassFactoryOfGroupPageNew.GetEn(EnName as string);
      entity.setParams(props.params);
      await entity.Init();
      pageObj.value = entity;

      const { Groups, SubPages } = entity;
      if (!Groups || !SubPages) {
        throw new Error('初始化后未能获取到 Groups 或 SubPages');
      }
      const normalPages = SubPages.filter((page) => !page.No?.includes?.('.'));
      stepFormPages.value = SubPages.filter((page) => page.No?.includes?.('.'));
      modeList.value = convert(Groups, normalPages, 'GroupNo');
      if (modeList.value.length === 1 && modeList.value[0]?.children.length === 1) {
        sideMenuVisible.value = false;
      }

      const SystemNo = props.params?.SystemNo || '';
      loadingTips.value = '加载分类...';
      const types = await entity.GenerSorts(SystemNo);
      if (Array.isArray(types) && types.length > 0) {
        typeOptions.value = types.map((data: FlowSort) => ({ No: data.No, Name: data.Name }));
        const optionsFirstKey = typeOptions.value[0].No;
        activeType.value = props.params?.SortNo ? getSortNo(optionsFirstKey) : optionsFirstKey;
      } else {
        typeOptions.value = [];
        activeType.value = props.params?.SortNo ? getSortNo('') : '';
      }
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = `页面初始化失败: ${e.message || String(e)}`;
      console.error('InitPage Error:', e);
    } finally {
      loading.value = false;
      loadingTips.value = '加载中...';
    }
  }
  InitPage();

  provide('gpnInstance', pageObj);

  defineExpose({ resetCallback });
</script>

<style scoped lang="less">
  .slide-fade-enter-active {
    transition: all 0.2s ease;
  }
  .slide-fade-leave-active {
    transition: all 0.2s ease;
  }
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(30px);
    opacity: 0;
  }

  :deep(.ant-col-6) {
    flex: 0;
  }
  :deep(.ant-col-18) {
    flex: 1;
    max-width: 100%;
  }
  .p-8 {
    padding: 0 0 10px 0;
  }
  .right-card {
    padding: 24px;
  }

  :deep(.ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-icon) {
    background-color: var(--system-active-bg-color);
    border-color: var(--system-active-bg-color);
  }
  :deep(.ant-steps .ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title) {
    color: var(--system-active-bg-color);
  }
  :deep(.ant-input-group-addon) {
    background: #fff;
    border: 0;
    min-width: 0px !important;
  }

  .after-create-view {
    position: relative;
    height: 100%;
    overflow: auto;

    .back-btn {
      position: absolute;
      left: 10px;
      top: 10px;
      bottom: auto;
      z-index: 999;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #abbacc;
      cursor: pointer;
      color: white;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

      &:hover {
        background: #1296bdcc;
      }
    }
    & > :deep(component) {
      height: 100%;
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 16px;
    padding: 0 12px;
    box-sizing: border-box;

    .title {
      font-size: 14px;
      text-align: left;
      box-sizing: border-box;
      width: auto;
      flex-shrink: 0;
      margin-right: 10px;
      font-weight: 500;
      color: #333;
      line-height: 32px;
    }
    :deep(.ant-select) {
      flex: 1;
    }
  }

  .text-sql {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
    margin-top: 10px;
  }
  .select-src {
    width: 100%;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding: 0 12px;
    box-sizing: border-box;

    .title {
      font-size: 14px;
      text-align: left;
      width: auto;
      box-sizing: content-box;
      margin-right: 10px;
      flex-shrink: 0;
      line-height: 32px;
    }
    :deep(.ant-select) {
      flex: 1;
    }
  }

  .content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: white;
    overflow: hidden;

    .step-form-card {
      display: flex;
      justify-content: flex-start;
      background-color: #f2f5f7;
      height: 100%;
      border-radius: 0 0 8px 8px;
      overflow: hidden;

      :deep(.ant-result-icon > span) {
        color: var(--system-bg-color);
      }

      .form-main {
        flex: 1;
        display: flex;
        justify-content: flex-start;
        background-color: #e3e3e3;
        overflow: hidden;

        .content-area {
          background-color: white;
          flex-grow: 1;
          flex-shrink: 1;
          min-width: 480px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          padding: 0;
          border-right: 1px solid #e6e9ed;

          .form-title {
            padding: 12px 24px;
            border-bottom: 1px solid #e6e9ed;
            background-color: #f8f9fa;
            font-size: 16px;
            font-weight: 500;
            color: #606060;
            margin: 0;
            flex-shrink: 0;
          }
          .custom {
            width: 100%;
            padding: 20px 24px;
            flex-grow: 1;
            overflow-y: auto;
            box-sizing: border-box;

            .ant-input-group-wrapper {
              margin-top: 6px;
              margin-bottom: 6px;
            }
            :deep(.ant-input-group-addon) {
              min-width: 80px;
              text-align: left;
            }
          }
          .form-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 24px;
            border-top: 1px solid #e6e9ed;
            background-color: #f8f9fa;
            flex-shrink: 0;

            :deep(.ant-btn) {
              border-radius: 4px;
            }
            .btn-default {
              margin-right: 8px;
            }
            .btn-active {
              background-color: var(--system-bg-color);
              color: white;
              border-color: var(--system-bg-color);
            }
            & > div:last-child {
              display: flex;
              align-items: center;
            }
          }
        }

        .inner-help-docs {
          background-color: white;
          flex-basis: 400px;
          flex-shrink: 0;
          max-width: 45%;
          overflow-y: auto;
          padding: 20px;
          box-sizing: border-box;

          :deep(.vuepress-markdown-body) {
            font-size: 13px;
            line-height: 1.6;
          }
        }
      }
    }
  }

  .input-box {
    background-color: #f2f5f7;
    padding: 24px;
  }

  .gpn-input-item {
    display: block;
    margin-bottom: 18px;

    .label {
      display: block;
      width: 100%;
      text-align: left;
      margin-bottom: 8px;
      padding: 0;
      line-height: 1.5;
      padding-top: 0;
      color: #333;
      font-weight: 500;
      font-size: 14px;

      span {
        color: red;
        margin-right: 4px;
      }
    }
  }

  @media (max-width: 900px) {
    .content .step-form-card .form-main {
      flex-direction: column;
    }
    .content .step-form-card .form-main .content-area {
      min-width: 100%;
      margin-right: 0;
      border-right: none;
      border-bottom: 1px solid #e6e9ed;
      max-height: 60vh;
      flex-basis: auto;
      flex-shrink: 1;
      padding: 0;
    }
    .content .step-form-card .form-main .content-area .form-title {
      padding: 12px 16px;
    }
    .content .step-form-card .form-main .content-area .custom {
      padding: 16px;
    }
    .content .step-form-card .form-main .content-area .form-footer {
      padding: 12px 16px;
    }

    .content .step-form-card .form-main .inner-help-docs {
      flex-basis: auto;
      max-width: 100%;
      max-height: 35vh;
      flex-shrink: 1;
      padding: 16px;
    }
  }

  @media (max-width: 576px) {
    .gpn-input-item {
      flex-direction: column;
      align-items: stretch;
      margin-bottom: 12px;
    }
    .gpn-input-item .label {
      width: 100%;
      text-align: left;
      margin-right: 0;
      margin-bottom: 4px;
      padding: 0;
      line-height: 1.5;
      padding-top: 0;
    }
    .header {
      flex-direction: column;
      align-items: stretch;
    }
    .header .title {
      width: 100%;
      margin-bottom: 8px;
      text-align: left;
    }
    .select-src {
      flex-direction: column;
      align-items: stretch;
    }
    .select-src .title {
      width: 100%;
      margin-bottom: 8px;
      text-align: left;
    }
  }
</style>
