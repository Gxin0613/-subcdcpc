<template>
  <base-component ref="baseComponent" :close-drawer-func="InitPage">
    <div class="content">
      <div :style="typeStyle" v-if="isAdmin">
        <div class="checkbox_group">
          <Card title="日历类型" style="width: 100%">
            <template #extra>
              <i class="icon-plus" @click="newAdd"></i>
            </template>
            <CheckboxGroup v-model:value="CheckVal" style="width: 100%" @change="CheckboxChange">
              <Row>
                <Col :span="24">
                  <Checkbox v-for="item of dataStorage" :value="item.No" :key="item.No">{{ item.Name }}</Checkbox>
                </Col>
              </Row>
            </CheckboxGroup>
          </Card>
        </div>
      </div>
      <div style="border-radius: 4px; background-color: #fff" :style="monthStyle">
        <template v-if="IsShowDate">
          <Calendar v-model:value="value" @select="onPanelSelect" :mode="'year'">
            <template #headerRender="{ value: current, onChange }">
              <div style="padding: 10px">
                <Row type="flex" justify="space-between">
                  <Col>
                    <Select
                      size="small"
                      :dropdown-match-select-width="false"
                      :value="String(current.year())"
                      @change="
                        (newYear) => {
                          onChange(current.year(newYear));
                        }
                      "
                    >
                      <SelectOption v-for="val in getYears(current)" :key="String(val)" class="year-item">
                        {{ val }}
                      </SelectOption>
                    </Select>
                  </Col>
                </Row>
              </div>
            </template>
            <template #monthCellRender="{ current }">
              <ul class="events">
                <li v-for="item in getListData(current)" :key="item.content">
                  <Badge :text="item.content" :color="item.color" :style="{ color: item.color }" />
                </li>
              </ul>
            </template>
          </Calendar>
        </template>
        <template v-else>
          <Button class="calender-btn" type="primary" @click="goBack">
            <i class="icon-action-undo"> </i>
            <span> 返回</span>
          </Button>
          <Empty v-if="Array.isArray(filteredGroupedData) && filteredGroupedData.length == 0" description="暂无数据" />
          <div v-else style="overflow-y: auto; height: calc(100vh - 185px)">
            <Timeline>
              <TimelineItem v-for="(group, idx) in filteredGroupedData" :key="idx" :class="TypeMap.get(group.type)?.Color" :color="TypeMap.get(group.type)?.Color">
                <!-- 分组标题 -->
                <div class="group-header">
                  <span class="type-badge" :style="({ color: TypeMap.get(group.type)?.Color } as StyleValue)">
                    {{ TypeMap.get(group.type)?.SearchName || group.type }}
                  </span>
                </div>
                <!-- 分组内容列表 -->
                <ul class="doc-list">
                  <li v-for="(item, itemIdx) in group.items" :key="itemIdx">
                    {{ item.Title }}
                    <template v-if="!!item.Docs"> - {{ item.Docs }}</template>
                  </li>
                </ul>
              </TimelineItem>
            </Timeline>
          </div>
        </template>
      </div>
    </div>
  </base-component>
</template>
<script lang="ts" setup>
  import { Calendar, Select, SelectOption, Row, Col, Badge, CheckboxGroup, Checkbox, Timeline, TimelineItem, Button, message, Card, Empty } from 'ant-design-vue';
  import { computed, ref, shallowRef, StyleValue } from 'vue';
  import dayjs, { Dayjs } from 'dayjs';
  import localeData from 'dayjs/plugin/localeData';
  import { CalendarDBSrcs } from './CalendarDBSrc';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '/@/store/modules/user';

  const router = useRouter();

  dayjs.extend(localeData);

  const value = ref<Dayjs>();

  const CheckVal = ref([]);

  const IsShowDate = ref(true);

  const dataSource: any = ref([]);

  const dataStorage = ref<any>();

  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();

  const TypeMap = new Map();

  //处理日期
  const getMonths = (value: Dayjs) => {
    const dayjsValue = dayjs(value);
    const months: string[] = []; // 明确指定返回类型

    for (let i = 0; i < 12; i++) {
      const monthName = dayjsValue.localeData().monthsShort(dayjsValue.month(i));
      months.push(monthName);
    }

    return months;
  };

  const getYears = (value: Dayjs) => {
    const year = dayjs(value).year();
    const years: number[] = [];

    for (let i = year - 10; i < year + 10; i++) {
      years.push(i);
    }

    return years;
  };

  const typeStyle = computed(() => {
    return {
      width: isAdmin.value ? '25%' : 0,
    };
  });

  const monthStyle = computed(() => {
    return {
      width: isAdmin.value ? '74%' : '100%',
    };
  });

  //end
  const thatDay = ref();
  const thatMonth = ref();
  const onPanelSelect = (date: Dayjs, info: { source: 'year' | 'month' | 'date' | 'customize' }) => {
    debugger;
    switch (info?.source) {
      case 'month':
        IsShowDate.value = false;
        thatMonth.value = date.format('YYYY-MM');
        thatDay.value = date.format('YYYY-MM-DD');
        break;
    }
  };
  const goBack = () => {
    IsShowDate.value = true;
  };
  //日历显示
  const getListData = (value: Dayjs) => {
    let count = 0;
    const targetDate = value.format('YYYY-MM-DD');
    // 1. 按日期过滤
    const dateEvents = dataSource.value.filter((item) => item.RDT.substring(0, 7) === targetDate.substring(0, 7));
    // 2. 按类型分组统计
    const typeCounts = new Map<string, number>();
    if (Array.isArray(dateEvents) && dateEvents.length > 0) {
      dateEvents.forEach((event) => {
        count = typeCounts.get(event.SrcNo) || 0;
        typeCounts.set(event.SrcNo, count + 1);
      });
      // 3. 转换为日历显示格式
      return Array.from(typeCounts.entries()).map(([type, count]) => {
        const typeInfo = TypeMap.get(type) || {
          SearchName: type,
          Color: 'blue',
        };
        return {
          content: `${typeInfo.SearchName}: ${count}条`,
          color: typeInfo.Color,
        };
      });
    }
  };

  const CheckboxChange = async (selectedKeys) => {
    try {
      const checkselect = selectedKeys.join(',');
      const selectedItems = dataStorage.value.filter((item) => checkselect.includes(item.No));
      const searchNoString = selectedItems
        .map((item) => item.SearchNo) // 提取每个对象的 SearchNo
        .join(',');
      const ens = new HttpHandler('BP.CCOA.HttpHandler.CCOA_Handler');
      ens.AddPara('Ids', checkselect);
      ens.AddPara('NY', thatMonth.value);
      ens.AddPara('SearchNo', searchNoString);
      dataSource.value = await ens.DoMethodReturnJson('CalendarDBSrc_Init');
    } catch (e: any) {
      message.error(e.toString());
      console.trace(e);
    }
  };
  const InitPage = async () => {
    try {
      const calenderDB = new CalendarDBSrcs();
      await calenderDB.Init();
      await calenderDB.RetrieveAll();

      dataStorage.value = calenderDB;

      if (!isAdmin.value) {
        const checkselect = dataStorage.value.map((item) => item.No).join(',');
        // 提取SearchNo并拼接
        const searchNoString = dataStorage.value.map((item) => item.SearchNo).join(',');
        const ens = new HttpHandler('BP.CCOA.HttpHandler.CCOA_Handler');
        ens.AddPara('Ids', checkselect);
        ens.AddPara('NY', thatMonth.value);
        ens.AddPara('SearchNo', searchNoString);
        dataSource.value = await ens.DoMethodReturnJson('CalendarDBSrc_Init');
      }

      dataStorage.value.forEach((da) => {
        TypeMap.set(da.SearchNo, {
          SearchName: da.SearchName,
          // Url: 'yyyyyy',
          Color: da.LabColor,
        });
      });
    } catch (e: any) {
      message.error(e.toString());
      console.trace(e);
    }
  };

  // 计算分组数据
  const groupedData = computed(() => {
    const groups = new Map();
    // 类型分组
    dataSource.value.forEach((item) => {
      // 提取日期部分 (YYYY-MM-DD)

      const date = item.RDT.substring(0, 10);
      // 创建分组键: 日期 + 类型
      const groupKey = `${date}_${item.SrcNo}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          date,
          type: item.SrcNo,
          items: [],
        });
      }
      // 将当前项添加到分组
      groups.get(groupKey)!.items.push(item);
    });
    return Array.from(groups.values()).sort((a, b) => a.date.localeCompare(b.date));
  });
  // 根据选中的日期筛选分组数据
  const filteredGroupedData = computed(() => {
    if (!thatDay.value) return [];
    return (
      groupedData.value
        .filter((group) => group.date.substring(0, 7) === thatDay.value.substring(0, 7))
        // 对分组内的项目按时间排序
        .map((group) => ({
          ...group,
          items: [...group.items].sort((a, b) => a.RDT.localeCompare(b.RDT)),
        }))
        .sort((a, b) => a.type.localeCompare(b.type))
    );
  });

  const newAdd = () => {
    try {
      const url = '/@/WF/Comm/Search.vue?EnName=TS.CCOA.CalendarDBSrc';
      // router.push(url);
      baseComponent.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url));
    } catch (e: any) {
      message.error(e.toString());
      console.trace(e);
    }
  };

  const user = useUserStore();
  const userInfo = user.userInfo as unknown as Record<string, any>;
  const isAdmin = computed(() => {
    return userInfo?.IsAdmin === 1;
  });

  InitPage();
</script>
<style lang="less" scoped>
  .content {
    padding: 10px;
    display: flex;
    justify-content: space-between;
  }
  .checkbox_group {
    // padding: 30% 20%;
    border: 1px solid #d9d9d9;
    background-color: #fff;
    // height: 55%;
  }
  .events {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .events .ant-badge-status {
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
    text-overflow: ellipsis;
    font-size: 12px;
  }
  .notes-month {
    text-align: center;
    font-size: 28px;
  }
  .notes-month section {
    font-size: 28px;
  }
  .calender-btn {
    margin: 20px;
    display: flex;
    margin-left: auto;
    align-items: center;
  }

  .icon-plus {
    font-size: 22px;
  }
  :deep(.ant-col-24) {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
  }
  :deep(.ant-card-body) {
    // padding: 15% 20%;
    height: 100%;
  }
  :deep(.ant-card-extra) {
    display: flex;
  }
  :deep(.ant-checkbox-wrapper) {
    padding: 12px;
  }
  :deep(.ant-timeline) {
    padding: 10px 50px;
  }
</style>
