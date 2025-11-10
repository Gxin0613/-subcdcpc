<template>
  <BaseComponent ref="baseComp" :close-drawer-func="InitPage" :close-modal-func="InitPage">
    <Spin :spinning="loading">
      <!-- 内容 -->
      <div class="list-group">
        <Row type="flex" style="height: 100%" ref="groupRef" v-if="dataScreen.length > 0">
          <Col :span="6 * element.ColSpan" v-for="element in dataScreen" :key="element.No" :data-win-id="element.No">
            <div class="list-group-item">
              <div class="prop_top">
                <div class="icon">
                  <FireOutlined />
                  {{ element.Name }}
                </div>
              </div>
              <div class="item_body" @click="OpenUrlLink(element)">
                <!-- <component v-if="element.Docs" :is="getComponentByType(element as WindowTemplate)" /> -->
                <Empty v-if="element.hasOwnProperty('isEmpty') && element.isEmpty" />
                <ChartWindow v-else-if="isChartWindow(element.WinDocModel)" :options="element.ChartOptions" />
                <Table
                  v-else-if="element.WinDocModel == 'Table'"
                  :data-source="element.DataSource"
                  size="small"
                  :columns="element.Columns"
                  :scroll="{ x: 'max-content', y: 300 }"
                  :bordered="true"
                  :pagination="false"
                  style="width: 100%; height: 300px"
                />
                <div v-else-if="element.WinDocModel == 'HtmlVar'" style="width: 100%; display: flex; justify-content: space-around; flex-wrap: wrap">
                  <template v-if="Array.isArray(element.dtlData)">
                    <div v-for="el in element.dtlData" :key="el.MyPK" style="width: 33%; display: flex; flex-direction: column; align-items: center">
                      <div style="margin-bottom: 10px; font-size: 16px">
                        {{ el.Name }}
                      </div>
                      <div
                        :style="{
                          // @ts-ignore
                          color: el.FontColor.toLowerCase(),
                        }"
                        style="font-size: 20px; text-align: center"
                      >
                        <CountTo
                          v-if="isNum(parseInt(el?.Doc?.[0]?.Num))"
                          :start-val="0"
                          :end-val="parseFloat(el.Doc?.[0]?.Num) || 0"
                          :decimals="element.Decimal"
                          :duration="2000"
                        />
                      </div>
                    </div>
                  </template>
                </div>
                <div v-else v-html="element.Docs"></div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Spin>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { message, Empty, MenuProps, Spin, Row, Table, Col } from 'ant-design-vue';
  import { FireOutlined } from '@ant-design/icons-vue';
  import { onMounted, ref } from 'vue';
  import { WindowTemplates, WindowTemplateAttr, WindowTemplate } from '../Windows/Admin/WindowTemplate';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { shallowRef } from 'vue';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import useComponentLoader from '/@/hooks/ens/useComponentLoader';
  import DBAccess from '/@/utils/gener/DBAccess';
  import ChartWindow from './ChartWindow.vue';
  import { onUnmounted } from 'vue';
  import { WinDocModel } from '../Windows/Admin/WinDocModel';
  import { HtmlVarDtlAttr, HtmlVarDtls } from '../Windows/HtmlVarDtl';
  import { ClassFactoryOfDataV } from '/@/WF/Comm/UIEntity/ClassFactoryOfDataV';
  import { DataVBase } from '/@/bp/UIEntity/DataVBase';
  import CountTo from '/@/components/CountTo/src/CountTo.vue';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { useRoute } from 'vue-router';

  // 处理基础组件
  const { loadComponent } = useComponentLoader();
  const baseComp = shallowRef<InstanceType<typeof BaseComponent>>();

  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
    edit: {
      type: [Boolean, String],
      default: '',
    },
    className: {
      type: String,
      default: '',
    },
  });
  const disabledFrmGuide = ref(true);

  const current = ref<string[]>(['']);
  const isNum = (val) => {
    return typeof val === 'number';
  };

  // 判断当前是否为图表
  const isChartWindow = (type: string) => ['ChartLine', 'ChartChina', 'ChartPie', 'ChartRate', 'ChartRing', 'ChartZZT'].includes(type);
  //数组-集合
  const dataScreen = ref<WindowTemplates>(new WindowTemplates());
  const groupRef = shallowRef<typeof Row>();
  const emit = defineEmits(['update-title']);
  let dataVInst: Nullable<DataVBase> = null;
  const loading = ref(false);
  const route = useRoute();
  const InitPage = async () => {
    try {
      loading.value = true;
      if (props.className.trim().length > 0) {
        const dataVObj = await ClassFactoryOfDataV.GetEn(props.className);
        await dataVObj.Init();
        dataScreen.value = dataVObj.ChartList;
        dataVInst = dataVObj;
        emit('update-title', dataVObj.PageTitle);
      } else {
        const PageID = props.params?.PageID || route.query.PageID;
        if (!PageID) {
          message.error('没有传入PageID');
          return;
        }
        await dataScreen.value.Retrieve(WindowTemplateAttr.PageID, PageID, 'Idx');
      }
      console.log(dataScreen.value);
      //富文本样式修改.
      for (const win of dataScreen.value) {
        try {
          win.disabled = false;
          if (win.WinDocModel === WinDocModel.Html) {
            win.Docs = win.Docs.replace(/<li/g, "<li style='margin-top:8px;font-size:16px;'").replace(/<b/g, "<b style='font-size:16px'");
          }
          if (win.WinDocModel === WinDocModel.HtmlVar) {
            if (dataVInst) {
              const dtls = dataVInst.DtlList.filter((item) => item.RefPK === win.No);
              const results = dtls.map((en) => DBAccess.RunSQLReturnTable(en.Exp0, en.DBSrc || 'local'));
              await Promise.all(results);
              for (let i = 0; i < dtls.length; i++) {
                dtls[i].Doc = results[i];
              }
              for (const en of dtls) {
                en.SetValByKey('Doc', await DBAccess.RunSQLReturnTable(en.Exp0));
              }
              win.dtlData = dtls;
            } else {
              const dtl = new HtmlVarDtls();
              await dtl.Retrieve(HtmlVarDtlAttr.RefPK, win.No);
              for (const dt of dtl) {
                dt.SetValByKey('Doc', await DBAccess.RunSQLReturnTable(dt.Exp0, dt.DBSrc || 'local'));
              }
              //渲染文本变量样式
              win.dtlData = dtl;
            }
          }
          //表格
          if (win.WinDocModel === WinDocModel.Table) {
            const data = await DBAccess.RunSQLReturnTable(win.Docs, win.DBSrc || 'local');

            const keys = Object.keys(data[0]);
            win.Columns = keys.map((key) => {
              return {
                title: key,
                dataIndex: key,
                key: key,
              };
            });
            win.DataSource = data;
          }

          //  中国地图
          if (win.WinDocModel === WinDocModel.ChartChina) {
            // const data = await DBAccess.RunSQLReturnTable(win.Docs);
            win.ChartOptions = {
              backgroundColor: 'rgb(121, 145, 209)',
              geo: {
                map: 'china',
                aspectScale: 0.75, // scale地图长宽比
                zoom: 1.1,
                itemStyle: {
                  normal: {
                    areaColor: {
                      type: 'radial',
                      x: 0.5,
                      y: 0.5,
                      r: 0.8,
                      colorStops: [
                        {
                          offset: 0,
                          color: '#09132c', // 0%处的颜色
                        },
                        {
                          offset: 1,
                          color: '#274d68', // 100%处的颜色
                        },
                      ],
                      globalCoord: true,
                    },
                    shadowColor: 'rgb(58, 115, 192)',
                    shadowOffsetX: 10,
                    shadowOffsetY: 11,
                  },
                },
                regions: [
                  {
                    name: '南海诸岛',
                    itemStyle: {
                      opacity: 0,
                    },
                  },
                ],
              },
              series: [
                {
                  // 配置地图相关参数,绘制地图,这个对象是关于地图图表的相关设置
                  type: 'map',
                  label: {
                    normal: {
                      show: true,
                      textStyle: {
                        color: '#1DE9B6',
                      },
                    },
                    emphasis: {
                      textStyle: {
                        color: 'rgb(183, 185, 14)',
                      },
                    },
                  },
                  zoom: 1.1,
                  map: 'china',
                  itemStyle: {
                    normal: {
                      backgroundColor: 'rgb(147, 235, 248)',
                      borderWidth: 1,
                      areaColor: {
                        type: 'radial',
                        x: 0.5,
                        y: 0.5,
                        r: 0.8,
                        colorStops: [
                          {
                            offset: 0,
                            color: 'rgb(31, 54, 150)', // 0%处的颜色
                          },
                          {
                            offset: 1,
                            color: 'rgb(89, 128, 142)', // 100%处的颜色
                          },
                        ],
                        globalCoord: true,
                      },
                    },
                    emphasis: {
                      areaColor: 'rgb(46, 229, 206)',
                      borderWidth: 0.1,
                    },
                  },
                },
              ],
            };
          }
          //  百分比扇形图
          if (win.WinDocModel === WinDocModel.ChartRate) {
            const data = await DBAccess.RunSQLReturnTable(win.Docs, win.DBSrc || 'local');
            const dataRate = data.map((item) => {
              return {
                name: item.FK_Dept,
                value: item.Num,
              };
            });
            win.ChartOptions = {
              tooltip: {
                show: true,
                formatter: '{a} <br/>{b} : {c} ({d}%)',
              },
              series: [
                {
                  name: '访问来源',
                  type: 'pie',
                  radius: ['10%', '50%'],
                  center: ['50%', '40%'],
                  label: {
                    narmal: {
                      show: true,
                      formatter: '{a} <br/>{b} : {c} ({d}%)',
                    },
                  },
                  roseType: 'area',
                  itemStyle: {
                    borderRadius: 8,
                  },
                  data: dataRate,
                },
              ],
            };
          }
          //  柱状图
          if (win.WinDocModel === WinDocModel.ChartZZT) {
            // let docs = GloWF.DealExp(win.Docs, {});
            console.log(win.No, win.Name, win.Docs);
            const data = await DBAccess.RunSQLReturnTable(win.Docs, win.DBSrc || 'local');

            let dataC0Ens: Recordable[] = [];
            if (!!win.C0Ens) {
              dataC0Ens = (await DBAccess.RunSQLReturnTable(win.C0Ens, win.DBSrc || 'local')) || [];
            }
            // 先拿到keys
            if (data.length === 0) {
              win.isEmpty = true;
              continue;
            }
            const keys = Object.keys(data[0]);
            let nonNullData = data.filter((item) => item[keys[0]] !== -1 && item[keys[0]] !== '');
            //获取下拉数据数组dataC0Ens，遍历dataC0Ens并替换数组data中的获取到的枚举值
            const dataSource = nonNullData.map((item) => {
              if (Array.isArray(dataC0Ens) && dataC0Ens.length > 0) {
                return dataC0Ens.find((C0En) => C0En.No === item[keys[0]])?.Name;
              }
              return item[keys[0]];
            });
            const fenxiData = Object.keys(data[0]).slice(1);
            const dataSeries = fenxiData.map((item) => {
              return {
                name: item,
                type: 'bar',
                data: nonNullData.map((arr) => arr[item]),
              };
            });
            // 至少需要两个维度
            if (keys.length < 2) {
              return;
            }
            win.ChartOptions = {
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'shadow',
                },
              },
              grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true,
              },
              xAxis: [
                {
                  type: 'category',
                  data: dataSource,
                  axisTick: {
                    alignWithLabel: true,
                  },
                },
              ],
              yAxis: [
                {
                  type: 'value',
                },
              ],
              series: dataSeries,
            };
          }
          //  圆环比率
          if (win.WinDocModel === WinDocModel.ChartRing) {
            const data = await DBAccess.RunSQLReturnTable(win.Docs, win.DBSrc || 'local');
            const dataRing = data.map((item) => {
              return {
                name: item.FK_Dept,
                value: item.Num,
              };
            });
            win.ChartOptions = {
              tooltip: {
                trigger: 'item',
              },
              legend: {
                top: '5%',
                left: 'center',
              },
              series: [
                {
                  name: '数据',
                  type: 'pie',
                  radius: ['40%', '70%'],
                  avoidLabelOverlap: false,
                  label: {
                    show: false,
                    position: 'center',
                  },
                  labelLine: {
                    show: false,
                  },
                  data: dataRing,
                },
              ],
            };
          }
          //  饼图
          if (win.WinDocModel === WinDocModel.ChartPie) {
            const data = await DBAccess.RunSQLReturnTable(win.Docs, win.DBSrc || 'local');
            console.log({ data });
            let dataC0Ens: Recordable[] = [];
            if (!!win.C0Ens) {
              dataC0Ens = (await DBAccess.RunSQLReturnTable(win.C0Ens, win.DBSrc || 'local')) || [];
            }
            if (data.length === 0) {
              continue;
            }
            const keys = Object.keys(data[0]);
            if (keys.length > 2) {
              continue;
            }

            let dataPie: { name: string; value: unknown }[] = [];
            if (Array.isArray(dataC0Ens) && dataC0Ens.length > 0) {
              dataPie = dataC0Ens.map((item) => {
                return {
                  name: item.Name,
                  value: data.find((en) => item.No === en[keys[0]])?.[keys[1]],
                };
              });
            } else {
              dataPie = data.map((item) => {
                return {
                  name: item[keys[0]],
                  value: item[keys[1]],
                };
              });
            }
            win.ChartOptions = {
              title: {
                left: 'center',
              },
              tooltip: {
                trigger: 'item',
              },
              series: [
                {
                  // name: 'Access From',
                  type: 'pie',
                  radius: '50%',
                  data: dataPie,
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                  },
                },
              ],
            };
          }
          //  折线图
          if (win.WinDocModel === WinDocModel.ChartLine) {
            const data = await DBAccess.RunSQLReturnTable(win.Docs);
            let dataC0Ens: Recordable[] = [];
            if (!!win.C0Ens) {
              dataC0Ens = (await DBAccess.RunSQLReturnTable(win.C0Ens, win.DBSrc || 'local')) || [];
            }
            // 先拿到keys
            if (data.length === 0) {
              continue;
            }
            const keys = Object.keys(data[0]);
            let nonNullData = data.filter((item) => item[keys[0]] !== -1 && item[keys[0]] !== '');
            //获取下拉数据数组dataC0Ens，遍历dataC0Ens并替换数组data中的获取到的枚举值
            const dataSource = nonNullData.map((item) => {
              if (Array.isArray(dataC0Ens) && dataC0Ens.length > 0) {
                return dataC0Ens.find((C0En) => C0En.No === item[keys[0]])?.Name;
              }
              return item[keys[0]];
            });
            const fenxiData = Object.keys(data[0]).slice(1);
            const dataSeries = fenxiData.map((item) => {
              return {
                name: item,
                type: 'line',
                data: nonNullData.map((arr) => arr[item]),
              };
            });
            // 至少需要两个维度
            if (keys.length < 2) {
              continue;
            }
            win.ChartOptions = {
              xAxis: {
                type: 'category',
                data: dataSource,
              },
              yAxis: {
                type: 'value',
              },
              series: dataSeries,
              tooltip: {
                trigger: 'axis',
              },
            };
          }
        } catch (e) {
          win.isEmpty = true;
          continue;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };
  const CurrentNo = ref<string>();
  const handleMenuClick: MenuProps['onClick'] = async (e) => {
    const en = new WindowTemplate();
    en.No = CurrentNo.value;
    await en.RetrieveFromDBSources();
    if (e.key == 'Edit') {
      let model = en.WinDocModel;
      if (model == 'Table') {
        model = 'WinTable';
      }
      console.log(model);
      const url = GloComm.UrlEn('TS.CCFast.Windows.' + model, en.No);
      const cb = new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, '编辑');
      baseComp.value?.handleGPNCallback(cb);
      return;
    }
    if (e.key == 'Col1') {
      en.ColSpan = 1;
      await en.Update();
      await InitPage();
      return;
    }
    if (e.key == 'Col2') {
      en.ColSpan = 2;
      await en.Update();
      await InitPage();
      return;
    }
    if (e.key == 'Col3') {
      en.ColSpan = 3;
      await en.Update();
      await InitPage();
      return;
    }
    if (e.key == 'Col4') {
      en.ColSpan = 4;
      await en.Update();
      await InitPage();
      return;
    }
    if (e.key == 'Delete') {
      if (window.confirm('您确定要删除吗?') == false) return;
      await en.Delete();
      await InitPage();
      return;
    }
    if (e.key == 'Power') {
      message.error('没权限！');
    }
  };

  const handleSelfUrl = (MoreUrl: string) => {
    const urlPrefix = window.location.origin + '/#/';
    return MoreUrl.replace('self://', urlPrefix);
  };

  const MoreUrl = ref<string>('');

  //打开url链接
  const OpenUrlLink = (origin) => {
    const MoreLab = origin.MoreLab; //更多链接标签
    MoreUrl.value = origin.MoreUrl; //更多链接
    const MoreLinkModel = origin.MoreLinkModel; //弹窗模式
    if (MoreUrl.value === '') {
      // message.info('请正确配置链接.');
      return;
    }
    if (MoreUrl.value.startsWith('self://')) {
      MoreUrl.value = handleSelfUrl(MoreUrl.value);
    }
    switch (MoreLinkModel) {
      case 0:
        // 新窗口打开
        if (MoreUrl.value.startsWith(`http://`) || MoreUrl.value.startsWith('https://')) {
          window.open(MoreUrl.value);
          return;
        }
        baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, MoreUrl.value, MoreLab));
        break;
      case 1:
        // 当前Model打开
        baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenIframeByModal, MoreUrl.value, MoreLab));
        break;
      case 2:
        // 覆盖当前窗口打开
        baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByTab, MoreUrl.value, MoreLab));
        break;
    }
  };
  // onUnmounted(() => {
  //   sortabeljsInst?.destroy();
  //   sortabeljsInst = null;
  // });
  // 页面数据
  onMounted(async () => {
    // 没有FrmID则禁止表单向导
    const hasFrmID = props.params.hasOwnProperty('FrmID');
    disabledFrmGuide.value = !hasFrmID;
    await InitPage();
  });
</script>

<style lang="less" scoped>
  .select-guide {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-direction: column;
    height: 100px;
    width: 100%;

    :deep(.ant-btn) {
      width: 100%;
    }
  }

  .add-btn {
    width: 80px;
    height: 80px;
    color: #ccc;
    text-align: center;
    line-height: 80px;
    cursor: pointer;
    font-size: 40px;
    position: absolute;
    bottom: 40px;
    right: 30px;
    background-color: white;
    border-radius: 50%;
    border: 2px solid #ccc;

    &:hover {
      border-color: #459dff;
      color: #459dff;
    }
  }

  .header {
    width: 100vw;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30px;
    background: var(--system-bg-color);
    color: #fff;
    .navHome {
      width: 60px;
      height: 60px;
      background-color: rgba(0, 0, 0, 0.2);
      line-height: 60px;
      font-size: 16px;
      text-align: center;
      margin-left: 1rem;
    }
  }
  .headerths {
    width: 100vw;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background: var(--system-bg-color);
    color: #fff;
  }
  .navleft {
    width: 40vw;
    display: flex;
    align-items: center;
  }
  .menulist {
    width: 100vw;
    background: var(--system-active-bg-color) !important;
    color: #fff;
  }
  :where(.css-dev-only-do-not-override-1hsjdkk).ant-menu-light {
    background: transparent;
    color: #fff;
  }
  :where(.css-dev-only-do-not-override-1hsjdkk).ant-menu-light:hover {
    background: transparent;
    color: #fff;
  }
  :where(.css-dev-only-do-not-override-1hsjdkk).ant-badge {
    color: #fff;
  }
  :where(.css-dev-only-do-not-override-1hsjdkk).ant-menu-light .ant-menu-submenu-selected > .ant-menu-submenu-title {
    color: #ffffff !important;
  }
  .Mcontent {
    width: 100vw;
    min-height: 88vh;
  }
  .Avatorleft {
    width: 10vw;
    height: var(--viewport-height);
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 9;
    background: rgba(255, 255, 255, 0.4);
    .logo {
      width: 100%;
      height: 100px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .userDiv {
      width: 100%;
      height: 40%;
      text-align: center;
    }
  }
  .footer {
    width: 100vw;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--system-active-bg-color);
    color: #fff;
  }

  .list-group {
    width: 100%;
    height: 100%;
    min-height: 500px;
    position: relative;
    box-sizing: border-box;
    font: 14px 'Helvetica Neue', Helvetica, 'PingFang SC', Tahoma, Arial, sans-serif;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;

    .list-group-item {
      min-height: 20px;
      margin: 10px;
      height: 360px;
      cursor: move;
      background-color: white;

      .prop_top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 0px 12px 0 12px;
        height: 30px;
        border-bottom: 1px solid #eee;
        box-sizing: border-box;

        .icon {
          white-space: nowrap;
          text-overflow: ellipsis;

          .icon_fire {
            margin-right: 8px;
            font-family: 'simple-line-icons';
            // speak: none;
            font-style: normal;
            font-weight: normal;
            font-variant: normal;
            text-transform: none;
            line-height: 1;
            -webkit-font-smoothing: antialiased;
          }
        }

        .demo-dropdown-wrap :deep(.ant-dropdown-button) {
          margin-right: 8px;
          margin-bottom: 8px;
        }
      }

      .item_body {
        padding: 6px;
        height: 330px;
        overflow-y: auto;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;

        .fa {
          display: inline-block;
          font: normal normal normal 14px/1 FontAwesome;
          font-size: inherit;
          text-rendering: auto;
          -webkit-font-smoothing: antialiased;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
        }

        i {
          cursor: pointer;
        }
      }
    }

    .flip-list-move {
      transition: transform 0.5s;
    }

    .no-move {
      transition: transform 0s;
    }

    .ghost {
      opacity: 0.5;
      background: #c8ebfb;
    }
  }
</style>
