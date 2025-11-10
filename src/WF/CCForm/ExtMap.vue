<template>
  <div class="home_div">
    <div id="search" v-if="props.params.isReadonly == false">
      <Input v-model:value="searchValue" @keyup.enter="seachAddress" id="tipinput" :placeholder="'请输入要搜索的位置'" style="width: 200px; margin: -1px 2px 0 12px" />
      <Button type="primary" @click="seachAddress">{{ '查询' }}</Button>
      <Button type="primary" @click="btnsubmit" style="margin-left: 5px">{{ '确定' }}</Button>
    </div>
    <div id="container" class="map-box" style="height: 50vh; width: 100%"></div>
  </div>
</template>
<script setup>
  // 地图map
  import AMapLoader from '@amap/amap-jsapi-loader';
  import { reactive, ref, onMounted, nextTick, onUnmounted } from 'vue';
  import { Input, Button, message } from 'ant-design-vue';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import wx from 'weixin-js-sdk';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  /**实际生产中不要用 此处仅测试具体实际使用方法看官网*/
  window._AMapSecurityConfig = {
    securityJsCode: CommonConfig.MapJsCode, // 应用生成的秘钥
  };
  const props = defineProps({
    params: {
      type: Object,
      default: null,
    },
  });

  const searchValue = ref('');
  const state = reactive({
    map: null,
    placeSearch: null,
    autoComplete: null,
    marker: null,
    form: {
      address: '',
      lng: '',
      lat: '',
    },
  });

  const getLocation = async () => {
    try {
      const url = window.location.href;
      const handler = new HttpHandler('BP.WF.HttpHandler.CCMobile_CCForm');
      handler.AddPara('htmlPage', url);
      handler.AddPara('CorpID', CommonConfig.CorpID);
      handler.AddPara('CorpSecret', CommonConfig.CorpSecret);
      const config = await handler.DoMethodReturnString('GetWXConfigSetting');
      wx.config({
        beta: true,
        debug: false,
        appId: config.AppID,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: ['getLocation'],
      });

      wx.ready(() => {
        wx.getLocation({
          type: 'gcj02', // 返回的经纬度可以用于wx.openLocation
          success: (res) => {
            state.form.lng = res.longitude;
            state.form.lat = res.latitude;
          },
          fail: (err) => {
            console.error('获取位置失败: ', err);
          },
        });
      });

      wx.error((err) => {
        console.error('wx.error: ', err);
      });
    } catch (err) {
      console.error('获取签名配置信息失败: ', err);
    }
  };

  // 地图初始化
  function initMap(arr) {
    // 参数为中心点经纬度坐标
    AMapLoader.load({
      key: CommonConfig.MapKey,
      version: '2.0',
      plugins: ['AMap.ToolBar', 'AMap.ControlBar', 'AMap.AutoComplete', 'AMap.PlaceSearch', 'AMap.Geocoder', 'AMap.Marker', 'AMap.Geolocation'], // 地图插件 根据需求从高德开放平台添加
    })
      .then((AMap) => {
        state.map = new AMap.Map('container', {
          viewMode: '3D', //  是否为3D地图模式
          zoom: 10, //  地图显示的缩放级别
          zooms: [2, 22], // 地图缩放范围
          resizeEnable: true, //  是否监控地图容器尺寸变化
        });
        // 地图放大缩小插件
        let toolBar = new AMap.ToolBar({
          position: {
            top: '120px',
            right: '51px',
          },
        });
        // 3D地图插件
        let controlBar = new AMap.ControlBar({
          position: {
            top: '20px',
            right: '20px',
          },
        });

        state.geoCoder = new AMap.Geocoder({
          city: '全国', // 默认：“全国”
          radius: 1000, // 范围，默认：500
        });

        state.autoComplete = new AMap.AutoComplete({ city: '全国' });

        state.placeSearch = new AMap.PlaceSearch({
          map: state.map,
        });

        const geolocation = new AMap.Geolocation({
          enableHighAccuracy: true, // 是否使用高精度定位，默认:true
          timeout: 10000, // 超过10秒后停止定位，默认：无穷大
          // 定位按钮的停靠位置的偏移量，默认：Pixel(10, 20)
          buttonOffset: new AMap.Pixel(10, 20),
          //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
          zoomToAccuracy: true,
          //  定位按钮的排放位置,  RB表示右下
          buttonPosition: 'RB',
        });

        geolocation.getCurrentPosition((status, result) => {
          if (status == 'complete' && !state.form.lng) {
            state.form.lng = result.position.getLng();
            state.form.lat = result.position.getLat();
          } else {
            //message.error(result.message);
          }
        });

        state.map.on('click', clickMap);
        state.map.addControl(toolBar); // 添加右上角的放大缩小
        state.map.addControl(controlBar); // 添加右上角的放大缩小
        state.map.addControl(geolocation);
        if (!state.form.lng) {
          geolocation.getCurrentPosition();
        }
      })
      .catch((e) => {
        console.error(e); //加载错误提示
      })
      .finally(() => {
        if (state.form.lng != '' && state.form.lat != '') initCoord([state.form.lng, state.form.lat]);
      });
  }

  // 地图点击事件
  function clickMap(e) {
    // 点击地图事件
    if (!e && !e.lnglat) {
      return;
    }
    state.form.lng = e.lnglat.lng;
    state.form.lat = e.lnglat.lat;
    regeocoder();
    removeMarker(); // 先删除地图上标记点
    setMapMarker(); // 在添加新的标记点
  }

  // 关键字搜索
  const seachAddress = () => {
    if (searchValue.value != '') {
      //清除地图上的覆盖物
      state.map.clearMap();
      state.map.plugin('AMap.PlaceSearch', () => {
        let placeSearch = new AMap.PlaceSearch({
          // city 指定搜索所在城市，支持传入格式有：城市名、citycode和adcode
          city: '010',
          map: state.map,
        });
        placeSearch.search(searchValue.value, function (status, result) {
          // 查询成功时，result即对应匹配的POI信息
          let pois = result.poiList.pois;
          for (let i = 0; i < pois.length; i++) {
            let poi = pois[i];
            let marker = [];
            marker[i] = new AMap.Marker({
              position: poi.location, // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
              title: poi.name,
            });
            // 将创建的点标记添加到已有的地图实例：
            state.map.add(marker[i]);
          }
          state.map.setFitView();
          AMap.Event.addListener(placeSearch, 'markerClick', function (data) {
            let result = data;
            //经纬度
            state.form.lng = result.event.lnglat.lng;
            state.form.lat = result.event.lnglat.lat;
            toGetAddress();
          });
        });
      });
    } else {
      alert('请输入地址');
    }
  };

  // 自定义窗体
  function showInfoWindow(e) {
    //实例化信息窗体
    let title = e.target.title,
      content = e.target.content;
    let infoWindow = new AMap.InfoWindow({
      isCustom: true, //使用自定义窗体
      content: createInfoWindow(title, content.join('<br/>')),
      closeWhenClickMap: true,
      offset: new AMap.Pixel(16, -45),
    });
    infoWindow.open(state.map, e.target.getPosition());
  }

  //构建自定义信息窗体
  function createInfoWindow(title, content) {
    let info = document.createElement('div');
    info.className = 'custom-info input-card content-window-card';

    //可以通过下面的方式修改自定义窗体的宽高
    info.style.width = '400px';
    // 定义顶部标题
    let top = document.createElement('div');
    let titleD = document.createElement('div');
    top.className = 'info-top';
    titleD.innerHTML = title;
    top.appendChild(titleD);
    info.appendChild(top);

    // 定义中部内容
    let middle = document.createElement('div');
    middle.className = 'info-middle';
    middle.style.backgroundColor = 'white';
    middle.innerHTML = content;
    info.appendChild(middle);

    // 定义底部内容
    let bottom = document.createElement('div');
    bottom.className = 'info-bottom';
    bottom.style.position = 'relative';
    bottom.style.top = '0px';
    bottom.style.margin = '0 auto';
    // var sharp = document.createElement("img");
    // sharp.src = "https://webapi.amap.com/images/sharp.png";
    // bottom.appendChild(sharp);
    info.appendChild(bottom);
    return info;
  }

  // 坐标转换
  function initCoord(gps) {
    // 其他坐标转J02坐标
    AMap.convertFrom(gps, 'gps', function (status, result) {
      if (result.info === 'ok') {
        state.form.lng = result.locations[0].lng;
        state.form.lat = result.locations[0].lat;
        nextTick(function () {
          removeMarker();
          setMapMarker();
        });
      }
    });
  }

  // 设置标记
  function setMapMarker() {
    if (state.form.lng == '0' && state.form.lat == '0') {
      return;
    }
    state.map.setFitView();
    state.marker = new AMap.Marker({
      map: state.map,
      position: [state.form.lng, state.form.lat],
    });
    toGetAddress();
    state.map.add(state.marker);
    state.map.setFitView();
  }

  // 清除标记
  function removeMarker() {
    if (state.marker) {
      state.map.remove(state.marker);
    }
  }

  // 坐标位置转换
  function regeocoder() {
    let lnglat = [state.form.lng, state.form.lat];
    state.geoCoder.getAddress(lnglat, (status, result) => {
      if (status === 'complete' && result.regeocode) {
        state.form.address = result.regeocode.formattedAddress; // 返回位置信息
      }
    });
  }

  // 获取地址
  function toGetAddress() {
    let lnglat = [state.form.lng, state.form.lat];
    state.geoCoder.getAddress(lnglat, (status, result) => {
      if (status === 'complete' && result.regeocode) {
        // 此处写处理逻辑
        state.form.address = result.regeocode.formattedAddress;
      }
    });
  }
  onMounted(async () => {
    searchValue.value = props.params.address;
    //组件挂载
    state.form.lng = props.params.lng || '0';
    state.form.lat = props.params.lat || '0';
    /*if (!state.form.lng || !state.form.lat) {
      await getLocation();
    }*/
    await nextTick();
    try {
      initMap([116.397428, 39.90923]);
    } catch (e) {
      initMap([0, 0]);
    }
  });
  // 组件卸载时执行清理
  onUnmounted(() => {
    if (state.map) {
      state.map.destroy(); // 销毁地图实例
      state.map = null; // 释放内存引用
      window._AMapConfig = null;
      // document.querySelector('.map-box')?.remove();
    }
  });
  const emit = defineEmits(['MapAddress']);
  function btnsubmit() {
    emit('MapAddress', state.form.address, state.form.lng, state.form.lat);
  }
</script>
<style scoped>
  .home_div {
    height: 100%;
    width: 100%;
    padding: 0px;
    margin: 0px;
    position: relative;
  }
  #container {
    padding: 0px;
    margin: 0px;
  }

  html,
  body,
  #container {
    height: 100%;
    width: 100%;
    position: absolute;
  }

  .content-window-card {
    position: absolute;
    box-shadow: none;
    bottom: 0;
    left: 0;
    width: auto;
    padding: 0;
  }

  .content-window-card p {
    height: 2rem;
  }

  .custom-info {
    border: solid 1px silver;
  }

  div.info-top {
    position: relative;
    background: none repeat scroll 0 0 #f9f9f9;
    border-bottom: 1px solid #ccc;
    border-radius: 5px 5px 0 0;
  }

  div.info-top div {
    display: inline-block;
    color: #333333;
    font-size: 14px;
    font-weight: bold;
    line-height: 31px;
    padding: 0 10px;
  }

  div.info-top img {
    position: absolute;
    top: 10px;
    right: 10px;
    transition-duration: 0.25s;
  }

  div.info-top img:hover {
    box-shadow: 0px 0px 5px #000;
  }

  div.info-middle {
    font-size: 12px;
    padding: 10px 6px;
    line-height: 20px;
  }

  div.info-bottom {
    height: 0px;
    width: 100%;
    clear: both;
    text-align: center;
  }

  div.info-bottom img {
    position: relative;
    z-index: 104;
  }

  span {
    margin-left: 5px;
    font-size: 11px;
  }

  .info-middle img {
    float: left;
    margin-right: 6px;
  }
</style>
