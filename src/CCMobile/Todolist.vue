<template>
  <div>
    <NavBar v-if="isIntegration()" :title="title" :left-text="'返回'" left-arrow @click-left="onClickLeft" />
    <div class="van-content" :class="vantCont">
      <Search v-model="searchKey" show-action :placeholder="'请输入搜索关键词'" @search="onSearch" @cancel="onCancel" />
      <PullRefresh v-model="loading" @refresh="onRefresh">
        <Empty v-show="tableData.length === 0" :description="'暂无信息'" style="margin-top: 150px" />
        <div v-if="tableData.length != 0 && showModel === GenerListPageShowModel.Table">
          <template v-if="glEn && glEn.GroupFieldDefault != ''">
            <Collapse v-model="activeNames" :border="false" :accordion="true">
              <template v-for="item in tableData">
                <CollapseItem :title="item[collapseKey]" :name="item[collapseKey]">
                  <template v-for="child in item.children">
                    <div class="van-address-item" @click="LinkFieldClick(child)">
                      <div class="van-cell van-cell--borderless">
                        <div class="van-cell__value van-cell__value--alone">
                          <span v-for="column in columns">
                            <div v-if="column.Key === glEn.LinkField" class="van-gl-link-text">{{ column.Name }}:{{ child[column.Key] }}</div>
                            <template v-else-if="glEn.LabFields.includes(column.Key) && child[column.Key]">
                              <template v-for="tag in GetTextTags(child[column.Key])">
                                <Tag :color="tag.color" style="margin-right: 0.5em"> {{ tag.name }}</Tag>
                              </template>
                            </template>
                            <div v-else class="van-gl-text">{{ column.Name }}:{{ child[column.Key] }}</div>
                          </span>
                        </div>
                      </div>
                    </div>
                  </template>
                </CollapseItem>
              </template>
            </Collapse>
          </template>
        </div>
      </PullRefresh>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { NavBar, PullRefresh, Search, Collapse, CollapseItem, Empty, Tag, Toast } from 'vant';
  import { markRaw, reactive, ref, UnwrapRef } from 'vue';
  import { ClassFactoryOfGenerList } from '/@/WF/GenerList/ClassFactoryOfGenerList';
  import { useRoute } from 'vue-router';
  import { GenerListPageShowModel } from '/@/bp/UIEntity/PageBaseGenerList';
  import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { message } from 'ant-design-vue';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import { IsDingDing } from '/@/utils/gener/StringUtils';
  const vantCont = ref('');
  //判断钉钉是否开启
  const isIntegration = () => {
    if (IsDingDing()) {
      vantCont.value = 'vantCont';
      return false;
    } else {
      vantCont.value = '';
      return true;
    }
  };

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });
  const route = useRoute();
  const title = ref('发起');
  const loading = ref(false);
  const searchKey = ref('');
  //实体类
  const glEn = ref(); // Proxy => .value 才是实际的对象，不加.value 是Proxy是代理对象
  //实体类对应的EnName
  const enName = ref<UnwrapRef<string>>('');
  //分页信息
  let pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    itemsPerPage: 10,
  });
  //数据集合
  const tableData = ref<Record<string, string>[]>([]);
  const innerData = ref<Record<string, string>[]>([]); //查询的结果数据集合
  const parseData = ref<Record<string, string>[]>([]); //处理后的数据结果集合

  const columns = ref<Record<string, string>[]>([]);
  const activeNames = ref<string[]>([]);
  const collapseKey = ref('');
  //页面显示方式
  const showModel = ref(0);

  const InitPage = async () => {
    enName.value = (route.query.EnName as string) || props.params?.EnName || '';
    //获得实体.
    const entity = await ClassFactoryOfGenerList.GetEn(enName.value);
    entity.setParams(props.params || {});
    await entity.Init(); //获得数据.
    glEn.value = entity;
    showModel.value = glEn.value.HisGLShowModel;
    columns.value = glEn.value.Columns.filter((column) => column.IsShowMobile === true);
    innerData.value = glEn.value.Data;
    parseData.value = innerData.value;
    tableParseData();
    if (glEn.value.GroupFields != '') {
      collapseKey.value = columns.value[0]?.key || 'Title';
      activeNames.value = [tableData.value[0][collapseKey.value]];
    }
  };
  //处理数据Data
  const tableParseData = () => {
    const startIdx = ref(0);
    const endIdx = ref(0);
    const curretPageData = ref();
    if (glEn.value.PageSize != 0) {
      pagination.totalItems = parseData.value.length;
      //处理前台逻辑分页问题
      startIdx.value = (pagination.currentPage - 1) * pagination.itemsPerPage;
      endIdx.value = pagination.currentPage * pagination.itemsPerPage;
      if (parseData.value.length < endIdx.value) endIdx.value = parseData.value.length;
      curretPageData.value = parseData.value.slice(startIdx.value, endIdx.value);
    } else {
      curretPageData.value = parseData.value;
    }
    curretPageData.value.forEach((item) => (item.visible = false));
    //不存在分组直接显示数据
    if (glEn.value.GroupFields === '') {
      tableData.value = curretPageData.value;
    } else {
      //获取分组的集合
      const map = new Map();
      curretPageData.value.forEach((item, index, arr) => {
        if (!map.has(item[glEn.value.GroupFieldDefault])) {
          map.set(
            item[glEn.value.GroupFieldDefault],
            arr.filter((a) => a[glEn.value.GroupFieldDefault] == item[glEn.value.GroupFieldDefault]),
          );
        }
      });
      const data = Array.from(map).map((item) => [...item[1]]);
      let dataItem: Record<string, any> = {};
      const treeKey = columns.value[0]?.key || 'Title';
      data.forEach((item) => {
        dataItem = {};
        dataItem[treeKey] = item[0][glEn.value.GroupFieldDefault];
        dataItem['children'] = item;
        tableData.value.push(dataItem as never);
      });
    }
  };
  InitPage();
  /**
   * 查询
   */
  const onSearch = () => {
    tableData.value = [];
    parseData.value = [];
    //匹配关键字段值
    const list = ref<any[]>([]);
    if (searchKey.value) {
      const ar = JSON.parse(JSON.stringify(innerData.value));
      const str = new RegExp(searchKey.value, 'i');
      ar.forEach((item) => {
        for (const key in item) {
          if (str.test(item[key])) {
            list.value.push(item);
            break;
          }
        }
      });
    } else {
      list.value = innerData.value;
    }
    /*   const dtFrom = searchDt.value?.[0] || '';
    const dtTo = searchDt.value?.[1] || '';
    if (showRDT.value == true) {

      //开始时间和结束时间同时有值时
      if (dtFrom != '' && dtTo != '') {
        //+new Date()目的是将数据类型转换为Number类型
        list.value.forEach((item) => {
          if (+new Date(item[glEn.value.DTFieldOfSearch]) >= +dtFrom.toDate()
            && +new Date(item[glEn.value.DTFieldOfSearch]) <= +dtTo.toDate()) {
            parseData.value.push(item);
          }
        });
      } else if (dtFrom != '') {
        list.value.forEach((item) => {
          if (+new Date(item[glEn.value.DTFieldOfSearch]) >= +dtFrom.toDate()) {
            parseData.value.push(item);
          }
        });
      } else if (dtTo != '') {
        list.value.forEach((item) => {
          if (+new Date(item[glEn.value.DTFieldOfSearch]) <= +dtTo.toDate()) {
            parseData.value.push(item);
          }
        });
      } else {
        parseData.value = list.value;
      }
    } else {*/
    parseData.value = list.value;
    //}
    pagination.currentPage = 1;
    tableParseData();
  };
  /**
   * 获取标签表示的内容
   * @param text
   * @constructor
   */
  interface TagExt {
    name: string;
    color: string;
  }

  function GetTextTags(text: string) {
    const tags = ref<TagExt[]>([]);
    splitAtString(text).forEach((item) => {
      tags.value.push({
        name: item.split('=')[0],
        color: item.split('=')[1],
      });
    });
    return tags.value;
  }
  /**
   * 执行点击超链接事件
   * @param record
   * @constructor
   */
  const LinkFieldClick = async (record) => {
    if (glEn.value.LinkField === '') return;
    const result = await glEn.value.LinkFieldClick(record);
    if (!!result) afterOper(record[glEn.value.LinkField], result);
  };

  //执行完的操作
  async function afterOper(btnName, result) {
    if (result.data == undefined || result.data == '') return;
    switch (result.ReturnType) {
      case GPNReturnType.Message:
        message.info(result.data);
        break;
      case GPNReturnType.Error:
        message.error(result.data);
        break;
      case GPNReturnType.GoToUrl: //转到url.
        window.location.replace(result.data);
        break;
      case GPNReturnType.Close: //关闭.
        break;
      case GPNReturnType.CloseAndReload: //关闭并重载
        break;
      case GPNReturnType.Reload: //刷新
        await InitPage();
        break;
      case GPNReturnType.ReBind: //重新绑定
        innerData.value = result.data;
        parseData.value = result.data;
        onSearch();
        break;
      case GPNReturnType.OpenUrlByDrawer: //重新绑定
      case GPNReturnType.OpenUrlByDrawer: //重新绑定
      case GPNReturnType.OpenUrlByDrawer75: //抽屉的模式打开.
      case GPNReturnType.OpenUrlByDrawer90: //抽屉的模式打开.
      case GPNReturnType.OpenUrlByDrawer30: //抽屉的模式打开.
        window.location.replace(result.data);
        break;
      case GPNReturnType.OpenUrlByNewWindow: //重新绑定
        window.location.replace(result.data);
        break;
      case GPNReturnType.DoNothing: //重新绑定
        break;
      default:
        message.warning('类型:' + result.ReturnType + '还未解析');
        break;
    }
  }

  /**
   * 取消查询
   */
  const onCancel = () => {
    searchKey.value = '';
  };
  /**
   * 返回上一级
   */
  const onClickLeft = () => {
    history.back();
  };
  /**
   * 下拉刷新
   */
  const onRefresh = () => {
    setTimeout(() => {
      Toast('刷新成功');
      loading.value = false;
    }, 1000);
  };
</script>

<style lang="less" scoped>
  .van-content {
    box-sizing: border-box;
    min-height: calc(var(--viewport-height) - 46px);
    padding-bottom: 20px;
    background-color: #fafafa;
  }
  .van-collapse-item__title {
    background: #fafafa !important;
  }
  .van-collapse-item__content {
    background: #fafafa !important;
  }
  .van-gl-link-text {
    display: flex;
    align-items: center;
    margin-bottom: var(--van-padding-xs);
    font-size: var(--van-font-size-mg);
    line-height: var(--van-line-height-lg);
    font-weight: bold;
  }
  .van-gl-text {
    color: var(--van-address-list-item-text-color);
    font-size: 14px;
    line-height: 24px;
  }
  .van-nav-bar--fixed {
    background-color: #4356ff;
    color: #fff;
    z-index: 99;
  }
  .vantCont {
    margin-top: 0 !important;
  }
</style>
