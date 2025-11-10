<template>
  <div>
    <!-- :left-text="'返回'" -->
    <NavBar v-if="isIntegration()" :title="title" :fixed="true" left-arrow @click-left="onClickLeft" />
    <div class="vant-content" :class="vantCont">
      <!-- show-action :取消-->
      <div>
        <Search
          v-model="searchKey"
          :placeholder="'请输入搜索关键词'"
          background="#2970FF"
          class="search"
          :class="vantSearch"
          :left-icon="search"
          @search="onSearch"
          @cancel="onSearch"
          :style="getTimeShow()"
          @update:model-value="onSearch"
        />
        <div class="search-sort" :style="getSortShow()">
          <Icon name="ascending" @click.stop="TableSortAsc" />
          <Icon name="descending" @click.stop="TableSortDesc" />
        </div>
        <template v-if="showRDT">
          <Field
            v-model="dateRangeLabel"
            name="calendar"
            :label="'日期'"
            :placeholder="'点击选择日期范围'"
            @click="showCalendar = true"
            style="margin-bottom: 10px"
          >
            <template #button>
              <Icon name="cross" @click.stop="clearDate" />
            </template>
          </Field>
          <Calendar v-model:show="showCalendar" :value="selectedDate" :min-date="minDate" :allow-same-day="true" type="range" @close="onSearch" @confirm="onConfirm" />
        </template>
      </div>
      <!-- 暂时去掉移动端GL按钮操作 -->
      <!-- <template v-if="Array.isArray(toolBars) && toolBars.length > 0">
        <div v-for="btn in toolBars" :key="btn" style="margin-top: 5px; background-color: white; display: flex">
          <Button color="linear-gradient(to right, rgb(156 187 250), rgb(41 112 255))" @click="toolBarOper(btn)" style="border: 0px; margin: 0 3px">{{ btn }}</Button>
        </div>
      </template> -->
      <!--      <PullRefresh v-model="loading" @refresh="onRefresh" :disabled="refreshDisabled">-->
      <!--        <Empty v-show="tableData.length === 0" :description="'暂无数据'" style="margin-top: 150px" />-->
      <!--        <div v-if="tableData.length != 0 && showModel === GenerListPageShowModel.Table">-->
      <!--          <template v-if="glEn">-->
      <!--            <Collapse v-if="defaultGroupField != ''" v-model="activeNames" :border="false" :accordion="true">-->
      <!--              <template v-for="(item, index) in tableData" :key="index">-->
      <!--                <CollapseItem :title="item[collapseKey]" :name="item[collapseKey]">-->
      <!--                  <template v-for="(child, idx) in item.children" :key="idx">-->
      <!--                    <div class="vant-address-item" @click="LinkFieldClick(child)">-->
      <!--                      <div class="vant-cell vant-cell&#45;&#45;borderless">-->
      <!--                        <div class="vant-cell__value vant-cell__value&#45;&#45;alone">-->
      <!--                          <span v-for="column in columns" :key="column.Key">-->
      <!--                            <div v-if="column.Key === glEn.LinkField" class="vant-gl-link-text">-->
      <!--                              <img :src="GLtongyong" alt="" width="30" style="margin-right: 5px" /> {{ column.Name }}:{{ child[column.Key] }}-->
      <!--                            </div>-->
      <!--                            <template v-else-if="glEn.LabFields.includes(column.Key) && child[column.Key]">-->
      <!--                              <template v-for="tag in GetTextTags(child[column.Key])" :key="tag.name">-->
      <!--                                <Tag :color="tag.color" class="vant-gl-tag" style="margin-right: 0.5em; margin-bottom: 0.5em"> {{ tag.name }}</Tag>-->
      <!--                              </template>-->
      <!--                            </template>-->
      <!--                            <div v-else class="vant-gl-text">-->
      <!--                              <span style="color: #808399"> {{ column.Name }}</span>-->
      <!--                              <span>{{ child[column.Key] }}</span>-->
      <!--                            </div>-->
      <!--                          </span>-->
      <!--                        </div>-->
      <!--                      </div>-->
      <!--                    </div>-->
      <!--                  </template>-->
      <!--                </CollapseItem>-->
      <!--              </template>-->
      <!--            </Collapse>-->
      <!--            <div v-else style="background-color: white; margin: 10px; padding: 5px">-->
      <!--              <template v-for="(child, idx) in tableData" :key="idx">-->
      <!--                <div class="vant-address-item" @click="LinkFieldClick(child)">-->
      <!--                  <div class="vant-cell vant-cell&#45;&#45;borderless">-->
      <!--                    <div class="vant-cell__value vant-cell__value&#45;&#45;alone">-->
      <!--                      <span v-for="column in columns" :key="column.Key">-->
      <!--                        <div v-if="column.Key === glEn.LinkField" class="vant-gl-link-text">{{ column.Name }}:{{ child[column.Key] }}</div>-->
      <!--                        <template v-else-if="glEn.LabFields.includes(column.Key) && child[column.Key]">-->
      <!--                          <template v-for="tag in GetTextTags(child[column.Key])" :key="tag.name">-->
      <!--                            <Tag :color="tag.color" style="margin-right: 0.5em; margin-bottom: 0.5em"> {{ tag.name }}</Tag>-->
      <!--                          </template>-->
      <!--                        </template>-->
      <!--                        <div v-else class="vant-gl-text">{{ column.Name }}:{{ child[column.Key] }}</div>-->
      <!--                      </span>-->
      <!--                      <template v-if="enName === 'GL_LinkRefFlow'">-->
      <!--                        <Button color="linear-gradient(to right, rgb(52 128 255), rgb(10 150 238))" size="small" @click="SelectIt(child)" style="width: 100px">{{'选择'}}</Button>-->
      <!--                      </template>-->
      <!--                    </div>-->
      <!--                  </div>-->
      <!--                </div>-->
      <!--              </template>-->
      <!--            </div>-->
      <!--          </template>-->
      <!--        </div>-->
      <!--        <div v-else-if="tableData.length != 0" style="padding: 0 16px">-->
      <!--          <template v-if="glEn && glEn.GroupFieldDefault != ''">-->
      <!--            <template v-for="(item, index) in tableData" :key="index">-->
      <!--              <h5 class="van-h5">{{ item[collapseKey] }}</h5>-->
      <!--              <div class="van-doc-card">-->
      <!--                <Grid :column-num="3" :border="false">-->
      <!--                  <GridItem v-for="(child, index) in item.children" :key="child[collapseKey]" @click="LinkFieldClick(child)" :class="getGridItemClass(index)">-->
      <!--                    <div class="van-select" :style="{ backgroundColor: item.color?.bgcolor }">-->
      <!--                      <i v-if="child.Icon.startsWith('icon')" :class="child.Icon" style="margin-bottom: 5px; font-size: 24px" :style="{ color: item.color?.color }"></i>-->
      <!--                      <img v-else-if="child.Icon.endsWith('svg')" :src="child.Icon" style="margin-bottom: 5px; width: 45px" @error="defaultIcon" />-->
      <!--                      <i v-else class="icon-drop" style="margin-bottom: 5px; font-size: 24px" :style="{ color: item.color?.color }"></i>-->
      <!--                    </div>-->
      <!--                    <div v-html="child[collapseKey]" class="grid-title"></div>-->
      <!--                  </GridItem>-->
      <!--                </Grid>-->
      <!--              </div>-->
      <!--            </template>-->
      <!--          </template>-->
      <!--        </div>-->
      <!--      </PullRefresh>-->

      <Empty v-show="tableData.length === 0" :description="'暂无数据'" style="margin-top: 150px" />
      <div v-if="tableData.length != 0 && showModel === GenerListPageShowModel.Table">
        <template v-if="glEn">
          <Collapse v-if="defaultGroupField != ''" v-model="activeNames" :border="false" :accordion="true">
            <template v-for="(item, index) in tableData" :key="index">
              <CollapseItem :title="item[collapseKey]" :name="item[collapseKey]">
                <template v-for="(child, idx) in item.children" :key="idx">
                  <div class="vant-address-item" @click="LinkFieldClick(child)">
                    <div class="vant-cell vant-cell--borderless">
                      <div class="vant-cell__value vant-cell__value--alone">
                        <span v-for="column in columns" :key="column.Key">
                          <div v-if="column.Key === glEn.LinkField" class="vant-gl-link-text">
                            <img :src="GLtongyong" alt="" width="30" style="margin-right: 5px" /> {{ column.Name }}:{{ child[column.Key] }}
                          </div>
                          <template v-else-if="glEn.LabFields.includes(column.Key) && child[column.Key]">
                            <template v-for="tag in GetTextTags(child[column.Key])" :key="tag.name">
                              <Tag :color="tag.color" class="vant-gl-tag" style="margin-right: 0.5em; margin-bottom: 0.5em"> {{ tag.name }}</Tag>
                            </template>
                          </template>
                          <div v-else class="vant-gl-text">
                            <span style="color: #808399"> {{ column.Name }}</span>
                            <span>{{ child[column.Key] }}</span>
                          </div>
                        </span>
                      </div>
                    </div>
                  </div>
                </template>
              </CollapseItem>
            </template>
          </Collapse>
          <div v-else style="background-color: white; margin: 10px; padding: 5px">
            <template v-for="(child, idx) in tableData" :key="idx">
              <div class="vant-address-item" @click="LinkFieldClick(child)">
                <div class="vant-cell vant-cell--borderless">
                  <div class="vant-cell__value vant-cell__value--alone">
                    <span v-for="column in columns" :key="column.Key">
                      <div v-if="column.Key === glEn.LinkField" class="vant-gl-link-text">{{ column.Name }}:{{ child[column.Key] }}</div>
                      <template v-else-if="glEn.LabFields.includes(column.Key) && child[column.Key]">
                        <template v-for="tag in GetTextTags(child[column.Key])" :key="tag.name">
                          <Tag :color="tag.color" style="margin-right: 0.5em; margin-bottom: 0.5em"> {{ tag.name }}</Tag>
                        </template>
                      </template>
                      <div v-else class="vant-gl-text">{{ column.Name }}:{{ child[column.Key] }}</div>
                    </span>
                    <template v-if="enName === 'GL_LinkRefFlow'">
                      <Button color="linear-gradient(to right, rgb(52 128 255), rgb(10 150 238))" size="small" @click="SelectIt(child)" style="width: 100px">{{
                        '选择'
                      }}</Button>
                    </template>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>
      <div v-else-if="tableData.length != 0" style="padding: 0 16px">
        <template v-if="glEn && glEn.GroupFieldDefault != ''">
          <template v-for="(item, index) in tableData" :key="index">
            <h5 class="van-h5">{{ item[collapseKey] }}</h5>
            <div class="van-doc-card">
              <Grid :column-num="3" :border="false">
                <GridItem v-for="(child, index) in item.children" :key="child[collapseKey]" @click="LinkFieldClick(child)" :class="getGridItemClass(index)">
                  <div class="van-select" :style="{ backgroundColor: item.color?.bgcolor }">
                    <i v-if="child.Icon.startsWith('icon')" :class="child.Icon" style="margin-bottom: 5px; font-size: 24px" :style="{ color: item.color?.color }"></i>
                    <img v-else-if="child.Icon.endsWith('svg')" :src="child.Icon" style="margin-bottom: 5px; width: 45px" @error="defaultIcon" />
                    <i v-else class="icon-drop" style="margin-bottom: 5px; font-size: 24px" :style="{ color: item.color?.color }"></i>
                  </div>
                  <div v-html="child[collapseKey]" class="grid-title"></div>
                </GridItem>
              </Grid>
            </div>
          </template>
        </template>
      </div>

      <!-- pop弹窗 -->
      <Popup v-model:show="replaceCompInfo.visible" position="right" :style="{ width: '100%', height: '100%', backgroundColor: '#fafafd' }">
        <div class="after-create-view">
          <NavBar :title="replaceCompInfo.title" :fixed="true" left-arrow @click-left="onClickLeftUpdate" />
          <div class="back-btn" v-drag style="margin: 12px" type="primary"
            ><span @click="resetCallback">{{ '返回' }}</span>
          </div>
          <component
            v-if="replaceCompInfo.visible"
            :is="replaceCompInfo.component"
            :params="replaceCompInfo.params"
            @trigger-close="resetReplaceComp"
            @update-title="(title: string) => (replaceCompInfo.title = title)"
          />
        </div>
      </Popup>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Collapse, CollapseItem, Empty, Grid, GridItem, NavBar, PullRefresh, Search, showToast, Tag, Button, Popup, Icon, Field, DatePicker, Cell, Calendar } from 'vant';
  import { reactive, ref, UnwrapRef, markRaw, watch, onMounted } from 'vue';
  import { ClassFactoryOfGenerList } from '/@/WF/GenerList/ClassFactoryOfGenerList';
  import { useRoute, useRouter } from 'vue-router';
  import { GenerListPageShowModel } from '/@/bp/UIEntity/PageBaseGenerList';
  import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { message } from 'ant-design-vue';
  import { splitAtString } from '/@/bp/tools/ParamUtils';
  import useCachedComponentLoader from '/@/hooks/ens/useCachedComponentLoader';
  import useComponentLoader from '../hooks/ens/useComponentLoader';
  import search from '/@/assets/images/search.png';
  import GLtongyong from '/@/assets/images/gltongyong.png';
  import { IsDingDing } from '/@/utils/gener/StringUtils';
  import vDrag from '/@/directives/drag';
  import dayjs, { Dayjs } from 'dayjs';

  const vantCont = ref('');
  const vantSearch = ref('');
  //判断钉钉是否开启
  const isIntegration = () => {
    if (IsDingDing()) {
      vantCont.value = 'vantCont';
      vantSearch.value = 'vantSearch';
      return false;
    } else if (!!route.query.isShowBar) {
      if (route.query.isShowBar === true || route.query.isShowBar === 'true') return true;
      return false;
    } else {
      vantCont.value = '';
      vantSearch.value = '';
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

  const refreshDisabled = ref(false);

  interface OpenLayerArgs {
    title: string;
    component: any;
    params: Recordable;
    showFooter: boolean;
  }
  type RangeValue = [Dayjs, Dayjs];
  const route = useRoute();
  const router = useRouter();
  const title = ref(route.query.Title);
  const loading = ref(false);
  const searchKey = ref('');
  //实体类
  const glEn = ref(); // Proxy => .value 才是实际的对象，不加.value 是Proxy是代理对象
  //实体类对应的EnName
  const enName = ref<UnwrapRef<string>>('');
  //工具栏操作
  const toolBars = ref();
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
  const activeNames = ref<string>('');
  const collapseKey = ref('');
  //页面显示方式
  const showModel = ref(0);
  //分组
  const groupFields = ref<string[]>([]); //分组集合
  const defaultGroupField = ref(''); //默认的分组字段

  //日期查询字段
  const showRDT = ref(false); // 是否显示时间字段的查询条件
  const DTFieldOfSearch = ref('');

  //列边框显示
  const getGridItemClass = (Idx) => {
    if (Idx % 3 !== 0 && Idx !== 0) {
      return 'vant-setBorder';
    } else {
      return '';
    }
  };

  //判断是否有RDT,进行排序
  const TableSortAsc = () => {
    message.info('升序排序');
    sortTableData(tableData.value, 'asc');
  };
  const TableSortDesc = () => {
    message.info('降序排序');
    sortTableData(tableData.value, 'desc');
  };

  // 转换日期字符串为Date对象以便比较
  const parseDate = (dateString) => {
    return new Date(dateString);
  };

  // 对children数组进行排序，direction参数指定排序方向
  const sortChildren = (children, direction = 'asc') => {
    children.sort((a, b) => {
      let dateA: any = parseDate(a.RDT);
      let dateB: any = parseDate(b.RDT);
      if (direction === 'asc') {
        return dateA - dateB;
      } else if (direction === 'desc') {
        return dateB - dateA;
      } else {
        throw new Error('排序方向错误: ' + direction);
      }
    });
  };

  // 对整个tableData进行排序，基于children中最早或最晚的RDT，direction指定排序方向
  const sortTableData = (Data, direction = 'asc') => {
    // 先对每个子项的children进行排序
    Data.forEach((item) => {
      sortChildren(item.children, direction);
    });

    // 然后基于每个子项children中最早或最晚的RDT对整个数组进行排序
    // 这里我们假设使用children中的第一个元素来决定整个条目的排序顺序
    Data.sort((a, b) => {
      let dateA: any = parseDate(a.children[0].RDT);
      let dateB: any = parseDate(b.children[0].RDT);
      if (direction === 'asc') {
        return dateA - dateB;
      } else if (direction === 'desc') {
        return dateB - dateA;
      } else {
        throw new Error('Invalid direction: ' + direction);
      }
    });

    return tableData;
  };

  const InitPage = async () => {
    enName.value = (route.query.EnName as string) || props.params?.EnName || '';
    //获得实体.
    const entity = await ClassFactoryOfGenerList.GetEn(enName.value);
    entity.setParams(props.params || {});
    await entity.Init(); //获得数据.
    glEn.value = entity;
    showModel.value = glEn.value.HisGLShowModel;
    columns.value = glEn.value.Columns.filter((column) => column.IsShowMobile == undefined || column.IsShowMobile === true);
    innerData.value = glEn.value.Data;
    parseData.value = innerData.value;
    //日期查询字段
    DTFieldOfSearch.value = glEn.value.DTFieldOfSearch;
    //分组字段集合
    const gfs = glEn.value.GroupFields || '';
    groupFields.value = gfs == '' ? [] : gfs.split(',');
    toolBars.value = glEn.value.BtnOfToolbar == '' ? [] : glEn.value.BtnOfToolbar.split(',');
    //默认分组字段
    defaultGroupField.value = glEn.value.GroupFieldDefault || '';
    if (defaultGroupField.value == '' && groupFields.value.length > 0) defaultGroupField.value = groupFields.value[0];
    tableParseData();
    if (glEn.value.GroupFields != '') {
      collapseKey.value = columns.value[0]?.key || 'Title';
      if (tableData.value.length > 0) activeNames.value = tableData.value[0][collapseKey.value];
    }
    setDateTime();
  };

  //没有发起Icon图片时获取默认图片
  const defaultIcon = (e) => {
    const img = e.srcElement;
    img.src = DefaultSvgIcon;
    img.onerror = null;
  };

  //处理数据Data
  const tableParseData = () => {
    const startIdx = ref(0);
    const endIdx = ref(0);
    const curretPageData = ref();
    glEn.value.PageSize = 0;
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
        if (!map.has(item[defaultGroupField.value])) {
          map.set(
            item[defaultGroupField.value],
            arr.filter((a) => a[defaultGroupField.value] == item[defaultGroupField.value]),
          );
        }
      });
      const data = Array.from(map).map((item) => [...item[1]]);
      let dataItem: Record<string, any> = {};
      const treeKey = columns.value[0]?.key || 'Title';
      tableData.value = [];
      data.forEach((item) => {
        dataItem = {};
        dataItem[treeKey] = item[0][defaultGroupField.value];
        dataItem['color'] = SetColorType(item[0]['MobileColorType']);
        dataItem['children'] = item;
        tableData.value.push(dataItem as never);
      });
    }
  };
  InitPage();
  const getTimeShow = () => {
    console.log('DTFieldOfSearch.value', DTFieldOfSearch.value);
    return {
      width: DTFieldOfSearch.value === 'RDT' ? '85%' : '100%',
    };
  };
  const getSortShow = () => {
    return {
      width: DTFieldOfSearch.value === 'RDT' ? '15%' : '0',
      display: DTFieldOfSearch.value === 'RDT' ? 'flex' : 'none',
    };
  };
  const setDateTime = () => {
    columns.value.forEach((item) => {
      if (DTFieldOfSearch.value != '' && item.Key === DTFieldOfSearch.value) showRDT.value = true;
    });
  };

  /**
   * 时间查询
   */
  const dateRange = ref<RangeValue>();
  const dateRangeLabel = ref('');
  const showCalendar = ref(false);
  const formatDT = (dt: string) => {
    return dt ? dayjs(dt).format('YYYY-MM-DD') : '';
  };
  const minDate = dayjs().subtract(2, 'year').toDate();

  /**
   * 清空并重新加载
   */
  //start
  const selectedDate = ref<any>([]);
  const clearDate = () => {
    selectedDate.value = [];
    onSearch();
    dateRangeLabel.value = '';
  };
  //end

  /**
   * 获取Calendar日历数组内容
   */
  //start
  const onConfirm = (date) => {
    selectedDate.value = date;
    showCalendar.value = false;
  };
  //end

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

    //Calendar数据
    let date: any = selectedDate.value;
    dateRange.value = [dayjs(date[0]), dayjs(date[1])];
    showCalendar.value = false;
    dateRangeLabel.value = `${formatDT(date[0])} ~ ${formatDT(date[1])}`;
    const dtFrom = dateRange.value?.[0] || '';
    const dtTo = dateRange.value?.[1] || '';
    if (showRDT.value == true) {
      //开始时间和结束时间同时有值时
      if (!!date[0] && !!date[1]) {
        //+new Date()目的是将数据类型转换为Number类型
        list.value.forEach((item) => {
          if (+new Date(item[glEn.value.DTFieldOfSearch]) >= +dtFrom.toDate() && +new Date(item[glEn.value.DTFieldOfSearch]) <= +dtTo.add(1, 'day').toDate()) {
            parseData.value.push(item);
          }
        });
      } else if (!!date[0]) {
        list.value.forEach((item) => {
          if (+new Date(item[glEn.value.DTFieldOfSearch]) >= +dtFrom.toDate()) {
            parseData.value.push(item);
          }
        });
      } else if (!!date[1]) {
        list.value.forEach((item) => {
          if (+new Date(item[glEn.value.DTFieldOfSearch]) <= +dtTo.toDate()) {
            parseData.value.push(item);
          }
        });
      } else {
        parseData.value = list.value;
      }
    } else {
      parseData.value = list.value;
    }
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

  function GetTextTags(text) {
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
   * 工具栏操作
   * @param name
   */
  async function toolBarOper(name) {
    try {
      loading.value = true;
      const result = await glEn.value.BtnClick(name, null);
      if (!!result) afterOper(name, result);
    } catch (e: any) {
      message.error(e.toString());
    } finally {
      setTimeout(() => {
        loading.value = false;
      }, 100);
    }
  }

  /**
   * 执行点击超链接事件
   * @param record
   * @constructor
   */
  const LinkFieldClick = async (record) => {
    if (glEn.value.LinkField === '') return;
    if (enName.value === 'GL_LinkRefFlow') return;
    const result = await glEn.value.LinkFieldClick(record);
    if (!!result) afterOper(record[glEn.value.LinkField], result);
  };

  //执行完的操作
  async function afterOper(_, result) {
    if (result.data == undefined || result.data == '') return;
    // const oldFetureData = result.data.replace('/#/WF/', '/CCMobile/');
    result.data = result.data.replace('/#/WF/', '/CCMobile/');
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
      case GPNReturnType.OpenUrlByDrawer75: //抽屉的模式打开.
      case GPNReturnType.OpenUrlByDrawer90: //抽屉的模式打开.
      case GPNReturnType.OpenUrlByDrawer30: //抽屉的模式打开.
      case GPNReturnType.OpenUrlByTab:
      case GPNReturnType.OpenUrlByModal:
        const param = result.data.split('?');
        if (param[0].endsWith('.vue')) {
          if (param.length > 1) {
            const compName = param[0].endsWith('.vue') ? param[0] : param[0] + '.vue';
            replaceContent({
              title: title,
              width: GPNDefWidth[result.ReturnType],
              params: getComponentParamsByUrl(result.data.substring(5)),
              component: markRaw(useCachedComponentLoader(compName)),
            });
          }
        } else {
          router.push(result.data);
        }

        break;
      case GPNReturnType.OpenUrlByNewWindow: //重新绑定
        await router.push(result.data);
        break;
      case GPNReturnType.DoNothing: //重新绑定
        break;
      default:
        message.warning('类型:' + result.ReturnType + '还未解析');
        break;
    }
  }
  watch(
    () => route.path,
    (newPath, oldPath) => {
      // 当路由发生变化时，根据条件显示或隐藏Popup
      if (newPath === '/WF/GenerList') {
        replaceCompInfo.visible = true;
      } else if (oldPath === '/Dtl') {
        replaceCompInfo.visible = true;
      }
    },
    { immediate: true },
  );
  // 返回值定义的宽度
  const GPNDefWidth = {
    // iframe宽度
    [GPNReturnType.OpenIframeByDrawer100]: '100%',
    [GPNReturnType.OpenIframeByDrawer90]: '90%',
    [GPNReturnType.OpenIframeByDrawer75]: '75%',
    [GPNReturnType.OpenIframeByDrawer30]: '30%',
    [GPNReturnType.OpenIframeByDrawer]: '60%',
    // 普通组件宽度
    [GPNReturnType.OpenUrlByDrawer90]: '90%',
    [GPNReturnType.OpenUrlByDrawer75]: '75%',
    [GPNReturnType.OpenUrlByDrawer30]: '30%',
    [GPNReturnType.OpenUrlByDrawer]: '60%',
    [GPNReturnType.OpenUrlByDrawer100]: '100%',
  };

  interface replaceCompInfo {
    title: string;
    visible: boolean;
    width: string;
    component: Object;
    params: Object;
  }
  const replaceCompInfo = reactive<replaceCompInfo>({
    title: '',
    visible: false,
    width: '70%',
    component: {},
    params: {},
  });
  const { getComponentParamsByUrl } = useComponentLoader();
  const replaceContent = (args: Partial<OpenLayerArgs>) => {
    const { title, width, component, params } = args;
    replaceCompInfo.title = title || ' ';
    replaceCompInfo.params = params || {};
    replaceCompInfo.width = width || '70%';
    replaceCompInfo.component = component || {};
    replaceCompInfo.visible = true;
  };
  const resetReplaceComp = async () => {
    replaceCompInfo.visible = false;
    replaceCompInfo.title = '';
    replaceCompInfo.params = {};
    replaceCompInfo.width = '70%';
    replaceCompInfo.component = {};
  };
  /**
   * 取消查询
   */
  const onCancel = () => {
    searchKey.value = '';
  };
  /**
   * 设置图标背景色、字体颜色
   */
  const ColorType = reactive({
    color: '',
    bgcolor: '',
  });
  const SetColorType = (type) => {
    switch (type) {
      case 0: //蓝色
        return {
          color: '#0BA5EC',
          bgcolor: '#F0F9FF',
        };
      case 1: //橘色
        return {
          color: '#FF4405',
          bgcolor: '#FFF4ED',
        };
      case 2: //绿色
        return {
          color: '#17B26A',
          bgcolor: '#ECFDF3',
        };
      default: //默认蓝色
        return {
          color: '#0BA5EC',
          bgcolor: '#F0F9FF',
        };
    }
  };

  /**
   * 返回上一级
   */
  const onClickLeft = () => {
    history.back();
  };
  const onClickLeftUpdate = () => {
    replaceCompInfo.visible = false;
    InitPage();
  };
  const emit = defineEmits(['modalIsShow', 'LinkTitle']);
  const SelectIt = (record) => {
    let LinkTitle = '';
    if (enName.value === 'GL_LinkRefFlow') LinkTitle = '@Title=' + record.Title + ',FlowNo=' + record.FK_Flow + ',WorkID=' + record.WorkID;
    else LinkTitle = record.Title;
    emit('modalIsShow', false, LinkTitle);
  };
  /**
   * 下拉刷新
   */
  // const scrollTop = ref(0);
  // const onRefresh = () => {
  //   //到达顶部时，在执行刷新,否则就禁用刷新
  //   if (scrollTop.value == 0) {
  //     setTimeout(() => {
  //       showToast('刷新成功');
  //       loading.value = false;
  //     }, 1000);
  //   } else {
  //     refreshDisabled.value = true;
  //     loading.value = false;
  //   }
  // };
  //获取距离头部高度
  // const scrollNum = () => {
  //   scrollTop.value = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
  //   if (scrollTop.value > 0) {
  //     refreshDisabled.value = false;
  //   }
  // };
  const resetCallback = () => {
    replaceCompInfo.visible = false;
    InitPage();
  };

  // onMounted(() => {
  //   //监听scroll事件
  //   window.addEventListener('scroll', scrollNum, true);
  // });
</script>

<style lang="less" scoped>
  .grid-title {
    text-align: center;
    // height: 30px;
    margin-top: 12px;
    font-size: 17px;
    // overflow-y: hidden;
  }
  .vant-content {
    box-sizing: border-box;
    height: var(--viewport-height);
    padding-top: 110px;
    // margin-top: 110px; //变量,是钉钉模式的时候是65px,正常模式110px
    // background-color: #fafafa;
    background-color: #f2f4f7;
  }
  .vant-address-item {
    padding: 10px;
    box-shadow: 0px 0px 4px 0px #cccccc57;
    margin-bottom: 10px;
    background-color: #fff;
    border-radius: 10px;
  }
  .vant-collapse-item__title {
    background: #fafafa !important;
  }
  .vant-collapse-item__content {
    background: #fafafa !important;
  }
  .vant-gl-link-text {
    display: flex;
    align-items: center;
    margin-bottom: var(--van-padding-xs);
    font-size: var(--van-font-size-mg);
    line-height: var(--van-line-height-lg);
    font-weight: bold;
  }
  .vant-gl-tag {
    width: 15%;
    display: flex;
    justify-content: center;
    margin-left: auto;
  }
  .vant-gl-text {
    color: var(--van-address-list-item-text-color);
    font-size: 14px;
    line-height: 24px;
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
  }
  .vant-cell__value {
    position: relative;
    overflow: hidden;
    color: var(--van-cell-value-color);
    text-align: left;
    vertical-align: middle;
    word-wrap: break-word;
  }
  .vant-doc-card {
    margin-bottom: 24px;
    padding: 24px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 8px 12px #ebedf0;
    overflow: auto;
  }
  .van-doc-card {
    margin-bottom: 12px;
    padding: 12px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 8px 12px #ebedf0;
    overflow: auto;
  }
  .van-h5 {
    padding: 15px 0 10px;
    margin-bottom: 0;
    font-size: 17px;
    font-weight: 500;
  }
  .van-h5::before {
    content: '';
    position: absolute;
    top: 30%;
    left: 0px;
    width: 5px;
    height: 18px;
    border-radius: 10px;
    background-color: transparent;
  }
  .vant-h5 {
    color: #9ca3af;
  }

  .van-nav-bar--fixed {
    background-color: #4356ff;
    color: #fff;
    z-index: 99;
  }
  :deep(.van-nav-bar__title) {
    color: #fff;
  }
  :deep(.van-nav-bar .van-icon) {
    color: #fff;
    font-size: 20px;
    font-weight: 700;
  }
  .van-search__content {
    background-color: #fff;
  }
  .vant-setBorder {
    position: relative;
  }
  .vant-setBorder::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 0;
    width: 0.5px;
    height: 30%;
    background-color: #e0e0e0;
    z-index: 1;
  }
  .van-hairline--top:after {
    border-top: 1px solid #e0e0e0;
  }
  .van-grid {
    align-items: flex-start;
  }
  .van-grid-item__content:after {
    border: 0;
  }
  //待办
  :deep(.van-collapse-item__content) {
    background-color: #f2f4f7;
  }
  //发起
  :deep(.van-pull-refresh) {
    background-color: #f2f4f7;
  }
  .van-select {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    text-align: center;
    width: 48px;
    height: 48px;
    margin: auto;
    border-radius: 15px;
    background-color: #f2f5ff;
  }
  .vantCont {
    padding-top: 65px !important;
  }
  .vantSearch {
    padding-top: 0 !important;
  }

  .toolbar-wrapper {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 0.25rem;
    height: 100%;
  }

  .custom-icon-style {
    margin-right: 8px;
  }

  .messageStyle {
    margin-left: auto;
    margin-top: 40px;
    background-color: #e5e7eb;
    padding: 20px;
    border: 1px solid #cccc;
    margin-right: auto;
    width: 70%;
  }
  .btn-type:hover {
    background-color: #4356ff;
    color: #fff;
  }
  .van-tabbar-item--active {
    background-color: #4356ff;
    color: #fff;
  }
  .van-nav-bar--fixed {
    background-color: #2970ff;
    color: #fff;
    z-index: 99;
  }
  .van-hairline--bottom:after {
    border-bottom-width: 0;
  }
  .after-create-view {
    position: relative;

    .back-btn {
      position: absolute;
      left: 10px;
      bottom: 60px;
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
      &:hover {
        background: #1296bdcc;
      }
    }
  }
  .search {
    //margin-top: 45px;
    padding: 12px 15px;
    position: fixed;
    top: 45px;
    left: 0;
    width: 100%;
    z-index: 999;
  }
  .search-sort {
    height: 64px;
    position: fixed;
    top: 45px;
    right: 0;
    width: 15%;
    z-index: 999;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    background-color: #2970ff;
    color: #fff;
  }
  :deep(.van-search__content) {
    border-radius: 10px;
  }
  :deep(.van-search__field) {
    height: 40px;
  }
  :deep(.van-icon__image) {
    width: 24px;
    height: 24px;
  }
</style>
