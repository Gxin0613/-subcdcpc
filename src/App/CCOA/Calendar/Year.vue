<template>
  <div class="year-picker">
    <!-- 头部导航 -->
    <div class="year-picker-header">
      <Button type="text" @click="prevDecade" :disabled="isFirstDecade" class="nav-button">
        <template #icon><LeftOutlined /></template>
      </Button>
      <span class="decade-range">{{ decadeStart }} - {{ decadeEnd }}</span>
      <Button type="text" @click="nextDecade" :disabled="isLastDecade" class="nav-button">
        <template #icon><RightOutlined /></template>
      </Button>
    </div>

    <!-- 年份网格 - 模仿月份选择器的3x4布局 -->
    <div class="year-grid">
      <div
        v-for="year in visibleYears"
        :key="year"
        class="year-cell"
        :class="{
          'current-year': year === currentYear,
          'selected-year': year === selectedYear,
          'other-decade': !isInCurrentDecade(year),
        }"
        @click="selectYear(year)"
      >
        <div class="year-cell-content">
          {{ year }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import { Button } from 'ant-design-vue';
  import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
  import dayjs from 'dayjs';
  const currentYear = ref(new Date().getFullYear());
  const props = defineProps({
    setYear: {
      type: [Object, String, Number],
      default: null,
    },
  });

  const emit = defineEmits(['getYearDate']);
  // 当前显示的十年
  const currentDecade = ref(Math.floor(new Date().getFullYear() / 10) * 10);
  const selectedYear = ref(null);

  // 计算显示的年份范围 (模仿月份选择器的12个格子，但只显示10个年份+2个空白或相邻十年的年份)
  const visibleYears = computed(() => {
    const years = [];
    // 当前十年的10个年份
    for (let i = 0; i < 10; i++) {
      years.push(currentDecade.value + i);
    }
    // 添加相邻十年的2个年份，凑齐12个格子
    years.push(currentDecade.value - 1); // 前一个十年的最后一年
    years.push(currentDecade.value + 10); // 下一个十年的第一年
    return years.sort((a, b) => a - b);
  });

  // 判断年份是否在当前十年范围内
  const isInCurrentDecade = (year) => {
    return year >= currentDecade.value && year < currentDecade.value + 10;
  };

  //  emit('ChangeLoading', true, null);

  // 计算十年范围显示文本
  const decadeStart = computed(() => currentDecade.value);
  const decadeEnd = computed(() => currentDecade.value + 9);

  // 判断是否是第一个十年
  const isFirstDecade = computed(() => currentDecade.value <= 1900);

  // 判断是否是最后一个十年
  const isLastDecade = computed(() => currentDecade.value >= new Date().getFullYear() + 50);

  // 选择年份
  const selectYear = (year) => {
    if (year < currentDecade.value - 1) {
      prevDecade();
    } else if (year > currentDecade.value + 10) {
      nextDecade();
    }
    selectedYear.value = year;
    emit('getYearDate', selectedYear.value);
  };

  watch(
    () => props.setYear,
    (val) => {
      const year = String(val.year());
      selectedYear.value = year;
      currentYear.value = dayjs(val).year();
      if (year < currentDecade.value - 1) {
        prevDecade();
      } else if (year > currentDecade.value + 10) {
        nextDecade();
      }
    },
  );

  // 切换到上十年
  const prevDecade = () => {
    currentDecade.value -= 10;
  };

  // 切换到下十年
  const nextDecade = () => {
    currentDecade.value += 10;
  };
</script>

<style scoped>
  .year-picker {
    width: 100%;
    padding: 8px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  }

  .year-picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px 8px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 8px;
  }

  .decade-range {
    font-size: 14px;
    font-weight: 500;
  }

  .nav-button {
    width: 24px;
    height: 24px;
  }

  .year-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding: 4px;
  }

  .year-cell {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 2px;
    transition: all 0.3s;
  }

  .year-cell:hover {
    background: #e6f7ff;
  }

  .year-cell-content {
    font-size: 14px;
    text-align: center;
  }

  .current-year {
    color: #1890ff;
    font-weight: 500;
  }

  .selected-year {
    background: #1890ff;
    color: #fff !important;
  }

  .other-decade {
    color: rgba(0, 0, 0, 0.25);
  }

  .year-picker-footer {
    display: flex;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid #f0f0f0;
    margin-top: 8px;
  }
</style>
