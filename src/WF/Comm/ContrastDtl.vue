<template>
  <BaseComponent ref="baseComponent" :close-drawer-func="InitSearch" :close-modal-func="InitSearch">
    <ThemeWrapper>
      <NConfigProvider :theme-overrides="GlobalThemeOverrides" :locale="zhCN" :date-locale="dateZhCN">
        <div class="p-4">
          <Spin :spinning="loading" :tip="loadingTips">
            <div v-if="errorObj.hasError" class="ant-tag-red">
              {{ errorObj.tips }}
            </div>
            <template v-else>
              <Card ref="tableCardWrapper" class="card-of-table">
                <NDataTable
                  :loading="loadingData"
                  :columns="columns"
                  :data="dataSource"
                  :row-key="rowKey"
                  :pagination="paginationReactive"
                  :on-update:page="handlePageChange"
                  :scroll-x="0"
                  flex-height
                  :style="{
                    height: `${dynamicHeight}px`,
                  }"
                  striped
                />
              </Card>
            </template>
          </Spin>
        </div>
      </NConfigProvider>
    </ThemeWrapper>
  </BaseComponent>
</template>
<script lang="ts" setup>
  import { reactive, ref, shallowRef, unref, h, watch } from 'vue';
  import { Card, message, Spin } from 'ant-design-vue';
  import { DataTableColumns, NDataTable, NConfigProvider, zhCN, dateZhCN } from 'naive-ui';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { useRoute } from 'vue-router';
  import { Entity } from '/@/bp/en/Entity';
  import { Attr } from '/@/bp/en/Map/Attr';
  import { Entities } from '/@/bp/en/Entities';
  import { EnCfg } from '/@/bp/sys/EnCfg';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { UAC } from '/@/bp/en/Map/UAC';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { RowData } from 'naive-ui/es/data-table/src/interface';
  import GlobalThemeOverrides from '/@/theme/naive-ui/GlobalThemeOverrides';
  import 'dayjs/locale/zh-cn';
  import { getAppEnvConfig } from '/@/utils/env';
  import ThemeWrapper from './ThemeWrapper.vue';
  // 基础能力容器，处理弹窗，抽屉等
  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });

  interface SearchResult {
    Attrs: Attr[];
    DT: Recordable[];
    Sys_MapData: Entity;
    dtM: Recordable[];
  }

  const route = useRoute();

  const EnName = props.params.EnName || props.params.EnsName || (route.query.EnName as string);
  const loading = ref(false);
  const loadingTips = ref('');
  const loadingData = ref(false);
  const errorObj = reactive({
    tips: '',
    hasError: false,
  });
  const paginationReactive = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 15, 20],
    pageCount: 1,
    itemCount: 1,
  });
  const handlePageChange = (curPage) => {
    paginationReactive.page = curPage;
  };

  // cfg
  const enCfg = reactive<EnCfg>(new EnCfg());
  const initEnCfg = async () => {
    await enCfg.Init();
    enCfg.SetValByKey('No', EnName);
    if (!(await enCfg.RetrieveFromDBSources())) {
      try {
        await enCfg.Insert();
        await enCfg.Retrieve();
      } catch (e: any) {
        if (window.confirm('查询页面初始化失败，是否重试？')) {
          await InitSearch();
        }
      }
    }
  };

  let ensInst: Nullable<Entities> = null;
  let enInst: Nullable<Entity> = null;

  const rowKey = (rowData: RowData) => {
    const keys = Object.keys(rowData);
    const rKey = enInst?.PK;
    if (!rKey) return '';
    if (keys.includes(rKey)) return rowData[rKey];
  };

  // 表单列
  const columns = ref<DataTableColumns<RowData>>([]);
  const dataSource = ref<Recordable[]>([]);

  const query = async () => {
    try {
      loadingData.value = true;
      //查询集合
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
      handler.AddPara('EnsName', EnName);
      delete props.params['Title'];
      handler.AddJson(props.params);
      const data = await handler.DoMethodReturnJson<SearchResult>('ContrastDtl_Init');
      InitColumn(data['Sys_MapAttrs']);
      dataSource.value = data['Group_Dtls'];
      paginationReactive.itemCount = dataSource.value.length;
      paginationReactive.pageCount = Math.ceil(dataSource.value.length / paginationReactive.pageSize);
    } catch (e: any) {
      console.trace(e);
      message.error(e.toString());
    } finally {
      loadingData.value = false;
    }
  };
  const InitColumn = () => {
    const { attrs } = ensInst.GetNewEntity._enMap;
    // 实现隐藏字段
    let hideAttrs: string[] = [];
    if (enCfg.HideAttrModel != 0) {
      hideAttrs = enCfg?.HideAttrs?.split(',') || [];
    }
    const { VITE_GLOB_API_URL } = getAppEnvConfig();
    columns.value = [];
    columns.value = attrs
      .filter((attr: Attr) => attr.UIVisible && !hideAttrs.includes(attr.Key))
      .map((attr: Attr) => {
        const obj: Recordable = {
          title: attr.Desc,
          width: attr.UIWidth < 50 ? 50 : attr.UIWidth,
          key: attr.Key,
        };
        if (attr.IsDateField) {
          obj.width = 150;
          obj.render = (row) => {
            let time = row[attr.Key];
            let renderStr = '[错误的日期数据]';
            if (typeof time === 'string') {
              if (time.length > 16) {
                renderStr = time.substring(0, 16);
              } else {
                renderStr = time;
              }
            }
            return h('span', renderStr);
          };
        }
        if (attr.Key === enInst.PK) {
          obj.fixed = 'left';
        }
        if (attr.IsDDL) {
          obj.render = (row) => {
            const textBox = row[attr.Key + 'Text'] || row[attr.Key + 'T'];
            return h('span', textBox);
          };
        }
        if (attr.IsBoolean) {
          obj.render = (row) => {
            const textBox = row[attr.Key] == 1 ? '是' : '否';
            return h(
              'span',

              textBox,
            );
          };
        }

        if (attr.Key === 'WebPath') {
          obj.render = (row: Recordable) => {
            const path = row['WebPath'] || '';
            if (!path) {
              return h('span', {}, '无');
            }
            const filePath = VITE_GLOB_API_URL + path;
            const fileName = row['MyFileName'] || '';
            if (/\.(jpg|jpeg|png|GIF|JPG|PNG)$/.test(filePath)) {
              return h('img', {
                src: filePath,
                onClick: () => {
                  baseComponent.value?.previewImg(fileName, filePath);
                },
                style: { width: '120px', height: '120px', objectFit: 'cover' },
              });
            }
            return h(
              'span',

              '文件:' + fileName,
            );
          };
        }

        return obj;
      });
  };
  const uac = ref<UAC>(new UAC());
  // 初始化Search页面
  const InitSearch = async () => {
    try {
      const ens = await ClassFactory.GetEns(EnName as string);
      ensInst = ens;
      enInst = ens.GetNewEntity;
      await enInst?.Init();
      uac.value = enInst?.HisUAC;
      await initEnCfg();
      await query();
      // updateTitle(route);
    } catch (e: any) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
      console.trace(e);
    }
  };

  InitSearch();
  const tableCardWrapper = shallowRef<InstanceType<typeof Card>>();
  const dynamicHeight = ref(500);
  const calcTableHeight = () => {
    setTimeout(() => {
      const elem = tableCardWrapper.value?.$el;
      if (elem) {
        const rect = elem.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        dynamicHeight.value = windowHeight - rect.top - 45;
      }
    }, 50);
  };

  watch(
    () => unref(dataSource),
    () => {
      calcTableHeight();
    },
  );
</script>

<style lang="less" scoped>
  :deep(.ant-card-body) {
    padding: 10px;
  }
  .card-of-head {
    border-radius: 0;
    background-color: #fff;
  }
  .card-of-table {
    border-radius: 0;
    margin-top: 12px;
  }

  .search-container {
    align-items: center;

    .search-keys {
      flex: 3;
      display: flex;
      align-items: center;

      .search-key {
        align-items: center;
        width: 33%;
        flex-shrink: 0;
        padding: 4px 10px 4px 0;
        .column-setting {
          font-size: 17px;
          margin: 0 10px;
          display: flex;
          align-items: center;
        }

        .label {
          min-width: 80px;
          text-align: right;
          height: 32px;
          line-height: 32px;
          padding-right: 12px;
          box-sizing: border-box;
          font-weight: 550; //关键字 数据源字体加粗
        }
        .input-search {
          border-radius: 5px;
        }
        :deep(.ant-select-selector) {
          border-radius: 5px;
        }
      }
    }

    .search-buttons {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      .column-setting {
        font-size: 17px;
        margin: 0 10px;
        display: flex;
        align-items: center;
      }
    }

    .toggle-btn {
      margin-left: 12px;
      font-size: 12px;
      color: #459dff;
      cursor: pointer;
    }
  }
  //列名加粗
  :deep(.n-data-table .n-data-table-th .n-data-table-th__title-wrapper .n-data-table-th__title) {
    font-weight: 550;
  }
</style>
