<template>
  <div class="weather-container">
    <!-- 动态背景元素 -->
    <div class="dynamic-background">
      <div class="weather-elements-container" v-if="!loading && !errorObj.hasError">
        <!-- 天气元素将根据当前天气状况动态生成 -->
        <div v-for="n in particleCount" :key="n" :class="['weather-element', weatherElementClass]" :style="getRandomElementStyle()"> </div>
      </div>
    </div>

    <template v-if="!loading">
      <div v-if="errorObj.hasError" class="error-message">
        <span class="error-icon">⚠️</span>
        <span>{{ errorObj.tips }}</span>
      </div>

      <template v-else>
        <div
          v-if="currentWeather"
          class="weather-card"
          :style="({
            background: backgroundGradient,
          } as StyleValue)"
        >
          <!-- 顶部城市信息和日期 -->
          <div class="header">
            <div class="location">
              <span class="city-name">{{ currentCity }}</span>
              <div class="date-wrapper">
                <span class="date">{{ formatDate(currentWeather?.dt) }}</span>
                <span class="lunar-date">{{ formatLunarDate(currentWeather?.dt) }}</span>
                <span class="week">{{ formatWeek(currentWeather?.dt) }}</span>
              </div>
            </div>
          </div>

          <!-- 当前天气信息 -->
          <div class="current-weather">
            <div class="weather-icon-container">
              <img :src="getWeatherIcon(currentWeather?.weather[0].icon)" :alt="'天气图标'" class="weather-icon" />
            </div>
            <div class="temp-container">
              <span class="temp">{{ currentWeather?.main?.temp }}<span class="temp-unit">°C</span></span>
            </div>
          </div>

          <!-- 天气详情 -->
          <div class="weather-details">
            <!-- 详情内容保持不变 -->
            <div class="detail-item">
              <div class="detail-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="pressure-svg-icon"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                  <path d="M7 12h5" />
                  <path d="M20 12h-3" />
                </svg>
              </div>
              <div class="detail-info">
                <div class="detail-value">{{ currentWeather?.main.pressure }}hpa</div>
                <div class="detail-label">{{ '气压' }}</div>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="humidity-svg-icon"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
              <div class="detail-info">
                <div class="detail-value">{{ currentWeather?.main.humidity }}%</div>
                <div class="detail-label">{{ '湿度' }}</div>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="wind-svg-icon"
                >
                  <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                </svg>
              </div>
              <div class="detail-info">
                <div class="detail-value">{{ currentWeather?.wind.speed }}m/s</div>
                <div class="detail-label">{{ '风速' }}</div>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="humidity-svg-icon"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
              <div class="detail-info">
                <div class="detail-value">{{ currentWeather?.main?.feels_like }}°C</div>
                <div class="detail-label">{{ '体感温度' }}</div>
              </div>
            </div>
          </div>

          <!-- 预报区域 -->
          <div class="forecast">
            <h3 class="forecast-title">{{ '5日预报' }}</h3>
            <div class="forecast-container">
              <div v-for="item in forecastWeather" :key="item?.dt" class="forecast-day">
                <div class="forecast-date">{{ formatDayShort(item.dt) }} / {{ formatWeek(item.dt) }}</div>
                <img :src="getWeatherIcon(item.weather[0].icon)" :alt="'天气图标'" class="forecast-icon" />
                <div class="forecast-desc">{{ item.weather[0].description }}</div>
                <div class="forecast-temp">{{ item?.main?.temp }}°C</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
    <template v-else>
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">正在获取天气数据...</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, watch, StyleValue } from 'vue';
  import axios from 'axios';
  import calendarFormatter from '/@/utils/date/calendarUtil';
  import { getUserIP } from '/@/api/getIp';
  import HttpHandler from '/@/utils/gener/HttpHandler';

  interface Weather {
    dt: number;
    dt_txt: string;
    weather: Recordable[];
    main: Recordable;
    wind: Recordable;
  }

  // 错误提示
  const errorObj = reactive({
    hasError: false,
    tips: '',
  });
  const loading = ref(false);

  // 当前天气
  const currentWeather = ref<Weather>();

  // 未来天气预报
  const forecastWeather = ref<Weather[]>([]);

  const currentCity = ref<string>('');

  const API_KEY = '0b8b45d8760750602d2c3524cb0e462a';
  const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

  const userIp = ref();

  const particleCount = ref(50);

  const weatherElementClass = computed(() => {
    if (!currentWeather.value?.weather?.[0]?.id) return 'element-clear';
    const weatherId = currentWeather.value.weather[0].id;
    const weatherMain = currentWeather.value.weather[0].main?.toLowerCase();

    // 根据OpenWeatherMap的天气代码分类
    if (weatherId >= 200 && weatherId < 300) return 'element-thunderstorm'; // 雷暴
    if (weatherId >= 300 && weatherId < 400) return 'element-drizzle'; // 毛毛雨
    if (weatherId >= 500 && weatherId < 600) return 'element-rain'; // 雨
    if (weatherId >= 600 && weatherId < 700) return 'element-snow'; // 雪
    if (weatherId >= 700 && weatherId < 800) return 'element-mist'; // 雾等
    if (weatherId === 800) return 'element-clear'; // 晴天
    if (weatherId > 800) return 'element-clouds'; // 多云

    if (weatherMain.includes('rain')) return 'element-rain';
    if (weatherMain.includes('snow')) return 'element-snow';
    if (weatherMain.includes('cloud')) return 'element-clouds';
    if (weatherMain.includes('clear')) return 'element-clear';
    if (weatherMain.includes('thunder')) return 'element-thunderstorm';
    return 'element-clear'; // 默认
  });

  // 获取随机元素样式
  const getRandomElementStyle = () => {
    // 根据不同天气提供不同的随机样式
    const randomSize = Math.floor(Math.random() * 10) + 5; // 5-15px
    const randomLeft = Math.random() * 100; // 0-100%
    const randomDuration = Math.random() * 10 + 10; // 10-20s
    const randomDelay = Math.random() * 5; // 0-5s
    const randomOpacity = Math.random() * 0.5 + 0.3; // 0.3-0.8

    // 基本样式
    const style = {
      left: `${randomLeft}%`,
      animationDuration: `${randomDuration}s`,
      animationDelay: `${randomDelay}s`,
      opacity: randomOpacity,
    };

    // 根据天气类型添加特定样式
    if (weatherElementClass.value === 'element-rain' || weatherElementClass.value === 'element-drizzle') {
      return {
        ...style,
        width: `${randomSize / 5}px`,
        height: `${randomSize * 2}px`,
        animationDuration: `${randomDuration / 2}s`, // 雨滴下落更快
      };
    } else if (weatherElementClass.value === 'element-snow') {
      return {
        ...style,
        width: `${randomSize}px`,
        height: `${randomSize}px`,
        animationDuration: `${randomDuration * 1.5}s`, // 雪花下落更慢
      };
    } else if (weatherElementClass.value === 'element-clouds') {
      return {
        ...style,
        width: `${randomSize * 5}px`,
        height: `${randomSize * 3}px`,
        opacity: randomOpacity - 0.1, // 云朵更透明
      };
    } else {
      return {
        ...style,
        width: `${randomSize}px`,
        height: `${randomSize}px`,
      };
    }
  };

  // 调整粒子数量基于天气状况
  watch(
    () => weatherElementClass.value,
    (newValue) => {
      if (newValue === 'element-rain' || newValue === 'element-drizzle') {
        particleCount.value = 80; // 更多雨滴
      } else if (newValue === 'element-snow') {
        particleCount.value = 70; // 较多雪花
      } else if (newValue === 'element-clouds') {
        particleCount.value = 15; // 较少云朵
      } else if (newValue === 'element-thunderstorm') {
        particleCount.value = 60; // 雷暴
      } else {
        particleCount.value = 30; // 默认
      }
    },
  );

  // 计算背景色渐变，基于当前天气和温度
  const backgroundGradient = computed(() => {
    if (!currentWeather.value?.main?.temp) return 'linear-gradient(135deg, #4f8df9, #3f87ff)';

    const temp = currentWeather.value.main.temp;
    const weatherId = currentWeather.value.weather[0].id;
    const isDay = currentWeather.value.weather[0].icon?.includes('d');

    // 晴天
    if (weatherId === 800) {
      if (isDay) {
        // 温度影响颜色强度
        if (temp > 30) return 'linear-gradient(135deg, #ff7e00, #ffb76b)'; // 炎热
        if (temp > 20) return 'linear-gradient(135deg, #4a90e2, #87ceeb)'; // 温暖
        return 'linear-gradient(135deg, #56ccf2, #2f80ed)'; // 适中
      } else {
        return 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'; // 夜晚
      }
    }

    // 多云
    if (weatherId > 800) {
      if (isDay) {
        return 'linear-gradient(135deg, #8e9eab, #eef2f3)';
      } else {
        return 'linear-gradient(135deg, #2c3e50, #4c6c8c)';
      }
    }

    // 雨
    if ((weatherId >= 300 && weatherId < 400) || (weatherId >= 500 && weatherId < 600)) {
      if (isDay) {
        return 'linear-gradient(135deg, #616161, #9bc5c3)';
      } else {
        return 'linear-gradient(135deg, #1e3c72, #2a5298)';
      }
    }

    // 雪
    if (weatherId >= 600 && weatherId < 700) {
      if (isDay) {
        return 'linear-gradient(135deg, #e6dada, #274046)';
      } else {
        return 'linear-gradient(135deg, #2C3E50, #4e637b)';
      }
    }

    // 雷暴
    if (weatherId >= 200 && weatherId < 300) {
      return 'linear-gradient(135deg, #283E51, #4B79A1)';
    }

    // 雾霾等
    if (weatherId >= 700 && weatherId < 800) {
      return 'linear-gradient(135deg, #757F9A, #D7DDE8)';
    }

    // 默认
    return 'linear-gradient(135deg, #4f8df9, #3f87ff)';
  });

  /**
   *getCurrentWeather
   *获取当前日期天气预报
   **/
  async function getCurrentWeather(city: string): Promise<any> {
    const response = await axios.get(`${BASE_URL}weather?q=${city}&appid=${API_KEY}&units=metric&lang=zh_cn`);
    currentWeather.value = response.data;
  }

  // 获取天气预报
  async function getForecastWeather(city: string): Promise<any> {
    const response = await axios.get(`${BASE_URL}forecast?q=${city}&appid=${API_KEY}&units=metric&lang=zh_cn`);
    const data = response.data;
    forecastWeather.value = data.list.filter((item) => item.dt_txt.endsWith('00:00:00'));
  }

  // 获取天气图标 - 使用更现代的图标
  const getWeatherIcon = (iconCode: string) => {
    // 这里可以使用更现代的天气图标，例如从其他图标库获取
    // 但为保持功能一致，暂时仍使用OpenWeatherMap的图标
    return `https://openweathermap.org/img/w/${iconCode}.png`;
  };

  // 格式化星期
  const formatWeek = (dataNumber: any): string => {
    const date = new Date(dataNumber * 1000);
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    const dayOfWeek = dayNames[date.getDay()];
    return `星期${dayOfWeek}`;
  };

  // 格式化日期 (月/日)
  const formatDate = (dataNumber: any): string => {
    const date = new Date(dataNumber * 1000);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}月${day}日`;
  };

  // 格式化简短日期（仅日期）
  const formatDayShort = (dataNumber: any): string => {
    const date = new Date(dataNumber * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}日`;
  };

  // 格式化农历日期
  const formatLunarDate = (dataNumber: any): any => {
    const date = new Date(dataNumber * 1000);
    const year = parseInt(String(date.getFullYear()).padStart(2, '0'));
    const month = parseInt(String(date.getMonth() + 1).padStart(2, '0'));
    const day = parseInt(String(date.getDate()).padStart(2, '0'));
    const dateTime = calendarFormatter.solar2lunar(year, month, day) as any;
    return `${dateTime?.IMonthCn}${dateTime?.IDayCn}`;
  };

  // 数据初始化
  const initWhearther = async () => {
    try {
      loading.value = true;
      await getUserIP().then(async (ip) => {
        console.log('ip', ip);
        userIp.value = ip;
      });
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
      handler.AddPara('ip', userIp.value);
      const data: any = await handler.DoMethodReturnJson('GetCityByIp');
      currentCity.value = data.city.endsWith('市') ? data.city : data.city + '市' || '北京市';
      // currentCity.value = '北京市';
      await Promise.all([getCurrentWeather(currentCity.value), getForecastWeather(currentCity.value)]);
    } catch (e: any) {
      console.trace(e.toString());
      errorObj.hasError = true;
      if (e.toString().includes('404')) {
        errorObj.tips = '请检查您的网络是否正常，或是否有网络拦截操作。';
      } else {
        errorObj.tips = '天气预报服务器错误，请检查服务器。' as string;
      }
    } finally {
      loading.value = false;
    }
  };

  initWhearther();
</script>

<style scoped lang="less">
  .weather-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    padding: 0;
    margin: 0;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    position: relative;

    // =========== 动态背景样式 ===========
    .dynamic-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 2;

      .weather-elements-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }

      .weather-element {
        position: absolute;
        top: 70px;
        animation: fall linear infinite;
        opacity: 0.9;

        &.element-rain {
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.5));
          border-radius: 0;
          transform: rotate(20deg);
          animation-name: rain-fall;
          box-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
        }

        &.element-drizzle {
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.4));
          border-radius: 0;
          transform: rotate(15deg);
          animation-name: rain-fall;
          height: 10px !important;
          width: 1px !important;
        }

        &.element-snow {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation-name: snow-fall;
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
        }

        &.element-clouds {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          filter: blur(10px);
          animation-name: cloud-drift;
          opacity: 0.3;
        }

        &.element-clear {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          animation-name: sparkle;
          width: 2px !important;
          height: 2px !important;
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
        }

        &.element-thunderstorm {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 0;
          animation-name: lightning;
          transform: rotate(20deg);
        }

        &.element-mist {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          filter: blur(15px);
          animation-name: mist-drift;
          opacity: 0.2;
        }
      }

      @keyframes rain-fall {
        0% {
          transform: translateY(-10px) rotate(20deg);
          opacity: 1;
        }
        10% {
          opacity: 0.7;
        }
        90% {
          opacity: 0.7;
        }
        100% {
          transform: translateY(calc(100% + 50px)) rotate(20deg);
          opacity: 0;
        }
      }

      @keyframes snow-fall {
        0% {
          transform: translateY(-10px) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: 0.7;
        }
        90% {
          opacity: 0.7;
        }
        100% {
          transform: translateY(calc(100vh + 50px)) rotate(360deg);
          opacity: 0;
        }
      }

      @keyframes cloud-drift {
        0% {
          transform: translateX(-50px);
          opacity: 0;
        }
        10% {
          opacity: 0.6;
        }
        90% {
          opacity: 0.7;
        }
        100% {
          transform: translateX(calc(100% + 50px));
          opacity: 0;
        }
      }

      @keyframes sparkle {
        0%,
        100% {
          opacity: 0;
          transform: scale(0.3);
        }
        50% {
          opacity: 0.8;
          transform: scale(1);
        }
      }

      @keyframes lightning {
        0%,
        100% {
          opacity: 0;
        }
        48%,
        52% {
          opacity: 0;
        }
        50% {
          opacity: 0.9;
        }
      }

      @keyframes mist-drift {
        0% {
          transform: translateX(-50px) translateY(0);
          opacity: 0;
        }
        10% {
          opacity: 0.2;
        }
        90% {
          opacity: 0.2;
        }
        100% {
          transform: translateX(calc(100vw + 50px)) translateY(20px);
          opacity: 0;
        }
      }
    }

    .error-message {
      display: flex;
      align-items: center;
      padding: 12px;
      background-color: #fff2f0;
      border-radius: 12px;
      color: #f5222d;
      font-size: 14px;
      margin: 10px;
      box-shadow: 0 2px 8px rgba(245, 34, 45, 0.1);
      position: relative;
      z-index: 1;

      .error-icon {
        margin-right: 8px;
        font-size: 18px;
      }
    }

    .loading-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #4f8df9, #3f87ff);
      color: white;
      position: relative;
      z-index: 1;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        animation: spin 1s linear infinite;
        margin-bottom: 12px;
      }

      .loading-text {
        font-size: 14px;
        letter-spacing: 1px;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    }

    .weather-card {
      height: 100%;
      background: linear-gradient(135deg, #4f8df9, var(--system-bg-color));
      padding: 16px;
      color: white;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      transition: background 1s ease; // 平滑过渡背景色变化
      z-index: 1; // 确保在动态背景之上

      &::before {
        content: '';
        position: absolute;
        top: -50px;
        right: -50px;
        width: 200px;
        height: 200px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        z-index: 0;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: -80px;
        left: -80px;
        width: 300px;
        height: 300px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 50%;
        z-index: 0;
      }

      .header {
        position: relative;
        z-index: 1;
        margin-bottom: 10px;

        .location {
          display: flex;
          flex-direction: column;

          .city-name {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
            letter-spacing: 1px;
          }

          .date-wrapper {
            display: flex;
            align-items: center;
            font-size: 13px;
            opacity: 0.9;

            .date,
            .lunar-date,
            .week {
              margin-right: 8px;
            }

            .lunar-date {
              padding: 2px 6px;
              background-color: rgba(255, 255, 255, 0.2);
              border-radius: 12px;
              font-size: 12px;
            }
          }
        }
      }

      .current-weather {
        position: absolute;
        right: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 12px;
        padding: 0 12px;
        z-index: 2;

        .temp-container {
          display: flex;
          flex-direction: column;

          .temp {
            font-size: 32px;
            font-weight: 700;
            line-height: 1;
            margin-bottom: 4px;
            color: #f0f0f0;
            font-family: Arial, Helvetica, sans-serif;

            .temp-unit {
              font-size: 16px;
              font-weight: 400;
              opacity: 0.7;
              margin-left: 8px;
            }
          }
        }

        .weather-icon-container {
          .weather-icon {
            width: 80px;
            height: 80px;
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.4));
          }
        }
      }

      .weather-details {
        display: flex;
        justify-content: space-between;
        border-radius: 12px;
        padding: 10px;
        position: relative;
        z-index: 1;
        margin-top: 16px;
        margin-bottom: 16px;
        backdrop-filter: blur(4px);
        background-color: rgba(255, 255, 255, 0.1);

        .detail-item {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 0 8px;
          justify-content: center;

          &:not(:last-child) {
            border-right: 1px solid rgba(255, 255, 255, 0.2);
          }

          .detail-icon {
            font-size: 20px;
            margin-right: 8px;
            opacity: 0.9;
          }

          .detail-info {
            .detail-value {
              font-size: 16px;
              font-weight: 600;
            }

            .detail-label {
              font-size: 12px;
              opacity: 0.8;
            }
          }
        }
      }

      .forecast {
        position: relative;
        z-index: 1;
        margin-top: auto;

        .forecast-title {
          font-size: 18px;
          margin: 0 0 12px 0;
          font-weight: 600;
          opacity: 0.9;
        }

        .forecast-container {
          display: flex;
          justify-content: space-between;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 8px;
          backdrop-filter: blur(4px);

          .forecast-day {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: transform 0.2s ease;

            &:hover {
              transform: translateY(-2px);
            }

            .forecast-date {
              font-size: 12px;
              margin-bottom: 6px;
              opacity: 0.9;
            }

            .forecast-icon {
              width: 48px;
              height: 48px;
              margin-bottom: 4px;
            }

            .forecast-desc {
              font-size: 12px;
              font-weight: 600;
              margin-bottom: 4px;
            }

            .forecast-temp {
              font-size: 16px;
              font-weight: 600;
            }
          }
        }
      }
    }
  }
</style>
