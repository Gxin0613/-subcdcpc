/**
 * @1900-2100区间内的公历、农历互转
 * @charset UTF-8
 * @Author  jiangjiazhi
 * @公历转农历：calendar.solar2lunar(1987,11,01); //[you can ignore params of prefix 0]
 * @农历转公历：calendar.lunar2solar(1987,09,10); //[you can ignore params of prefix 0]
 */
/**
 * 农历1900-2100的润大小信息表
 * @Array Of Property
 * @return Hex
 */
const lunarInfo: number[] = [
  0x04bd8,
  0x04ae0,
  0x0a570,
  0x054d5,
  0x0d260,
  0x0d950,
  0x16554,
  0x056a0,
  0x09ad0,
  0x055d2, // 1900-1909
  0x04ae0,
  0x0a5b6,
  0x0a4d0,
  0x0d250,
  0x1d255,
  0x0b540,
  0x0d6a0,
  0x0ada2,
  0x095b0,
  0x14977, // 1910-1919
  0x04970,
  0x0a4b0,
  0x0b4b5,
  0x06a50,
  0x06d40,
  0x1ab54,
  0x02b60,
  0x09570,
  0x052f2,
  0x04970, // 1920-1929
  0x06566,
  0x0d4a0,
  0x0ea50,
  0x06e95,
  0x05ad0,
  0x02b60,
  0x186e3,
  0x092e0,
  0x1c8d7,
  0x0c950, // 1930-1939
  0x0d4a0,
  0x1d8a6,
  0x0b550,
  0x056a0,
  0x1a5b4,
  0x025d0,
  0x092d0,
  0x0d2b2,
  0x0a950,
  0x0b557, // 1940-1949
  0x06ca0,
  0x0b550,
  0x15355,
  0x04da0,
  0x0a5b0,
  0x14573,
  0x052b0,
  0x0a9a8,
  0x0e950,
  0x06aa0, // 1950-1959
  0x0aea6,
  0x0ab50,
  0x04b60,
  0x0aae4,
  0x0a570,
  0x05260,
  0x0f263,
  0x0d950,
  0x05b57,
  0x056a0, // 1960-1969
  0x096d0,
  0x04dd5,
  0x04ad0,
  0x0a4d0,
  0x0d4d4,
  0x0d250,
  0x0d558,
  0x0b540,
  0x0b6a0,
  0x195a6, // 1970-1979
  0x095b0,
  0x049b0,
  0x0a974,
  0x0a4b0,
  0x0b27a,
  0x06a50,
  0x06d40,
  0x0af46,
  0x0ab60,
  0x09570, // 1980-1989
  0x04af5,
  0x04970,
  0x064b0,
  0x074a3,
  0x0ea50,
  0x06b58,
  0x05ac0,
  0x0ab60,
  0x096d5,
  0x092e0, // 1990-1999
  0x0c960,
  0x0d954,
  0x0d4a0,
  0x0da50,
  0x07552,
  0x056a0,
  0x0abb7,
  0x025d0,
  0x092d0,
  0x0cab5, // 2000-2009
  0x0a950,
  0x0b4a0,
  0x0baa4,
  0x0ad50,
  0x055d9,
  0x04ba0,
  0x0a5b0,
  0x15176,
  0x052b0,
  0x0a930, // 2010-2019
  0x07954,
  0x06aa0,
  0x0ad50,
  0x05b52,
  0x04b60,
  0x0a6e6,
  0x0a4e0,
  0x0d260,
  0x0ea65,
  0x0d530, // 2020-2029
  0x05aa0,
  0x076a3,
  0x096d0,
  0x04afb,
  0x04ad0,
  0x0a4d0,
  0x1d0b6,
  0x0d250,
  0x0d520,
  0x0dd45, // 2030-2039
  0x0b5a0,
  0x056d0,
  0x055b2,
  0x049b0,
  0x0a577,
  0x0a4b0,
  0x0aa50,
  0x1b255,
  0x06d20,
  0x0ada0, // 2040-2049
  0x14b63,
  0x09370,
  0x049f8,
  0x04970,
  0x064b0,
  0x168a6,
  0x0ea50,
  0x06b20,
  0x1a6c4,
  0x0aae0, // 2050-2059
  0x0a2e0,
  0x0d2e3,
  0x0c960,
  0x0d557,
  0x0d4a0,
  0x0da50,
  0x05d55,
  0x056a0,
  0x0a6d0,
  0x055d4, // 2060-2069
  0x052d0,
  0x0a9b8,
  0x0a950,
  0x0b4a0,
  0x0b6a6,
  0x0ad50,
  0x055a0,
  0x0aba4,
  0x0a5b0,
  0x052b0, // 2070-2079
  0x0b273,
  0x06930,
  0x07337,
  0x06aa0,
  0x0ad50,
  0x14b55,
  0x04b60,
  0x0a570,
  0x054e4,
  0x0d160, // 2080-2089
  0x0e968,
  0x0d520,
  0x0daa0,
  0x16aa6,
  0x056d0,
  0x04ae0,
  0x0a9d4,
  0x0a2d0,
  0x0d150,
  0x0f252, // 2090-2099
  0x0d520,
]; // 2100

/**
 * 天干地支之天干速查表
 * @Array Of Property trans["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]
 * @return Cn string
 */
const Gan: string[] = [
  '甲',
  '乙',
  '丙',
  '丁',
  '戊',
  '己',
  '庚',
  '辛',
  '壬',
  '癸',
];

/**
 * 天干地支之地支速查表
 * @Array Of Property
 * @trans["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]
 * @return Cn string
 */
const Zhi: string[] = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
];

/**
 * 数字转中文速查表
 * @Array Of Property
 * @trans ['日','一','二','三','四','五','六','七','八','九','十']
 * @return Cn string
 */

const nStr1: string[] = [
  '日',
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
  '七',
  '八',
  '九',
  '十',
];

/**
 * 日期转农历称呼速查表
 * @Array Of Property
 * @trans ['初','十','廿','卅']
 * @return Cn string
 */

const nStr2: string[] = [
  '初',
  '十',
  '廿',
  '卅',
];

/**
 * 月份转农历称呼速查表
 * @Array Of Property
 * @trans ['正','一','二','三','四','五','六','七','八','九','十','冬','腊']
 * @return Cn string
 */

const nStr3: string[] = [
  '正',
  '二',
  '三',
  '四',
  '五',
  '六',
  '七',
  '八',
  '九',
  '十',
  '冬',
  '腊',
];

/**
 * 返回农历y年一整年的总天数
 * @param lunar Year
 * @return Number
 * @eg:var count = calendar.lYearDays(1987) ;//count=387
 */

function lYearDays(year: number) {
  let i;

  let sum = 348;

  for (i = 0x8000; i > 0x8; i >>= 1) {
    sum += lunarInfo[year - 1900] & i ? 1 : 0;
  }

  return sum + leapDays(year);
}

/**
 * 返回农历y年闰月是哪个月；若y年没有闰月 则返回0
 * @param lunar Year
 * @return Number (0-12)
 * @eg:var leapMonth = calendar.leapMonth(1987) ;//leapMonth=6
 */

function leapMonth(year) {
  // 闰字编码 \u95f0

  return lunarInfo[year - 1900] & 0xf;
}

/**
 * 返回农历y年闰月的天数 若该年没有闰月则返回0
 * @param lunar Year
 * @return Number (0、29、30)
 * @eg:var leapMonthDay = calendar.leapDays(1987) ;//leapMonthDay=29
 */

function leapDays(year) {
  if (leapMonth(year)) {
    return lunarInfo[year - 1900] & 0x10000 ? 30 : 29;
  }
  return 0;
}

/**
 * 返回农历y年m月（非闰月）的总天数，计算m为闰月时的天数请使用leapDays方法
 * @param lunar Year
 * @return Number (-1、29、30)
 * @eg:var MonthDay = calendar.monthDays(1987,9) ;//MonthDay=29
 */

function monthDays(year, month) {
  if (month > 12 || month < 1) {
    return -1;
  } // 月份参数从1至12，参数错误返回-1

  return lunarInfo[year - 1900] & (0x10000 >> month) ? 30 : 29;
}

/**
 * 农历年份转换为干支纪年
 * @param  lYear 农历年的年份数
 * @return Cn string
 */

function toGanZhiYear(lYear) {
  let ganKey = (lYear - 3) % 10;

  let zhiKey = (lYear - 3) % 12;

  if (ganKey === 0) ganKey = 10; // 如果余数为0则为最后一个天干

  if (zhiKey === 0) zhiKey = 12; // 如果余数为0则为最后一个地支

  return Gan[ganKey - 1] + Zhi[zhiKey - 1];
}

/**
 * 传入offset偏移量返回干支
 * @param offset 相对甲子的偏移量
 * @return Cn string
 */

function toGanZhi(offset) {
  return Gan[offset % 10] + Zhi[offset % 12];
}

/**
 * 传入农历数字月份返回汉语通俗表示法
 * @param lunar month
 * @return Cn string
 * @eg:var cnMonth = calendar.toChinaMonth(12) ;//cnMonth='腊月'
 */

function toChinaMonth(month) {
  // 月 => \u6708

  if (month > 12 || month < 1) {
    return -1;
  } // 若参数错误 返回-1

  let s = nStr3[month - 1];

  s += '月'; // 加上月字

  return s;
}

/**
 * 传入农历日期数字返回汉字表示法
 * @param lunar day
 * @return Cn string
 * @eg:var cnDay = calendar.toChinaDay(21) ;//cnMonth='廿一'
 */

function toChinaDay(day) {
  // 日 => \u65e5

  let s;

  switch (day) {
    case 10:
      s = '初十';

      break;

    case 20:
      s = '二十';

      break;

    case 30:
      s = '三十';

      break;

    default:
      s = nStr2[Math.floor(day / 10)];

      s += nStr1[day % 10];
  }

  return s;
}

/**
 * 传入阳历年月日获得详细的公历、农历object信息 <=>JSON
 * @param y  solar year
 * @param m  solar month
 * @param d  solar day
 * @return JSON object
 * @eg:console.log(calendar.solar2lunar(1987,11,01));
 */

function solar2lunar(gy, gm, gd) {
  // 参数区间1900.1.31~2100.12.31

  // 年份限定、上限

  if (gy < 1900 || gy > 2100) {
    return -1; // undefined转换为数字变为NaN
  }

  // 公历传参最下限

  if (gy === 1900 && gm === 1 && gd < 31) {
    return -1;
  }

  // 未传参  获得当天

  let objDate;

  if (!gy) {
    objDate = new Date();
  } else {
    objDate = new Date(gy, parseInt(gm) - 1, gd);
  }

  let i;

  let leap = 0;

  let temp = 0;

  // 修正ymd参数

  gy = objDate.getFullYear();

  gy = objDate.getMonth() + 1;

  gy = objDate.getDate();

  let offset = (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) - Date.UTC(1900, 0, 31)) / 86400000;

  for (i = 1900; i < 2101 && offset > 0; i++) {
    temp = lYearDays(i);

    offset -= temp;
  }

  if (offset < 0) {
    offset += temp;
    i--;
  }
  // 是否今天
  const isTodayObj = new Date();

  let isToday = false;

  if (isTodayObj.getFullYear() === gy && isTodayObj.getMonth() + 1 === gm && isTodayObj.getDate() === gy) {
    isToday = true;
  }

  // 星期几

  let nWeek = objDate.getDay();

  const cWeek = nStr1[nWeek];

  // 数字表示周几顺应天朝周一开始的惯例

  if (nWeek === 0) {
    nWeek = 7;
  }

  // 农历年

  const year = i;

  leap = leapMonth(i); // 闰哪个月

  let isLeap = false;

  // 效验闰月

  for (i = 1; i < 13 && offset > 0; i++) {
    // 闰月

    if (leap > 0 && i === leap + 1 && isLeap === false) {
      --i;

      isLeap = true;
      temp = leapDays(year); // 计算农历闰月天数
    } else {
      temp = monthDays(year, i); // 计算农历普通月天数
    }

    // 解除闰月

    if (isLeap === true && i === leap + 1) {
      isLeap = false;
    }

    offset -= temp;
  }

  // 闰月导致数组下标重叠取反

  if (offset === 0 && leap > 0 && i === leap + 1) {
    if (isLeap) {
      isLeap = false;
    } else {
      isLeap = true;
      --i;
    }
  }

  if (offset < 0) {
    offset += temp;
    --i;
  }

  // 农历月

  const month = i;

  // 农历日

  const day = offset + 1;

  // 天干地支处理

  const sm = gm - 1;

  const gzY = toGanZhiYear(year);

  // // 当月的两个节气

  // // bugfix-2017-7-24 11:03:38 use lunar Year Param `y` Not `year`

  // const firstNode = getTerm(gy, gm * 2 - 1); // 返回当月「节」为几日开始

  // const secondNode = getTerm(gy, gm * 2); // 返回当月「节」为几日开始

  // 依据12节气修正干支月

  const gzM = toGanZhi((gy - 1900) * 12 + gm + 11);

  // if (gd >= firstNode) {
  //   gzM = toGanZhi((gy - 1900) * 12 + gm + 12);
  // }

  // 传入的日期的节气与否

  // let isTerm = false;

  // let Term = null;

  // if (firstNode === gd) {
  // isTerm = true;
  // Term = solarTerm[gm * 2 - 2];
  // }

  // if (secondNode === gd) {
  // isTerm = true

  // Term = solarTerm[gm * 2 - 1]

  // }

  // 日柱 当月一日与 1900/1/1 相差天数

  const dayCyclical = Date.UTC(gy, sm, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10;
  const gzD = toGanZhi(dayCyclical + gd - 1);

  return {
    lYear: year,
    lMonth: month,
    lDay: day,
    IMonthCn: (isLeap ? '闰' : '') + toChinaMonth(month),
    IDayCn: toChinaDay(day),
    cYear: gy,
    cMonth: gm,
    cDay: gd,
    gzYear: gzY,
    gzMonth: gzM,
    gzDay: gzD,
    isToday: isToday,
    isLeap: isLeap,
    nWeek: nWeek,
    ncWeek: '星期' + cWeek,
  };
}

const calendarFormatter = {
  // 传入阳历年月日获得详细的公历、农历object信息 <=>JSON

  solar2lunar: function (y, m, d) {
    // 参数区间1900.1.31~2100.12.31

    return solar2lunar(y, m, d);
  },

  /**
   * 传入农历年月日以及传入的月份是否闰月获得详细的公历、农历object信息 <=>JSON
   * @param y  lunar year
   * @param m  lunar month
   * @param d  lunar day
   * @param isLeapMonth  lunar month is leap or not.[如果是农历闰月第四个参数赋值true即可]
   * @return JSON object
   * @eg:console.log(calendar.lunar2solar(1987,9,10));
   */

  lunar2solar: function (gy, gm, gd, isLeapMonth) {
    // 参数区间1900.1.31~2100.12.1

    isLeapMonth = !!isLeapMonth;

    if (isLeapMonth && leapMonth !== gm) {
      return -1;
    } // 传参要求计算该闰月公历 但该年得出的闰月与传参的月份并不同

    if ((gy === 2100 && gm === 12 && gd > 1) || (gy === 1900 && gm === 1 && gd < 31)) {
      return -1;
    } // 超出了最大极限值

    const day = monthDays(gy, gm);

    let _day = day;

    // bugFix 2016-9-25

    // if month is leap, _day use leapDays method

    if (isLeapMonth) {
      _day = leapDays(gy);
    }

    if (gy < 1900 || gy > 2100 || gd > _day) {
      return -1;
    } // 参数合法性效验

    // 计算农历的时间差

    let offset = 0;

    // eslint-disable-next-line no-var
    for (var i = 1900; i < gy; i++) {
      offset += lYearDays(i);
    }

    let leap = 0;

    let isAdd = false;

    for (i = 1; i < gm; i++) {
      leap = leapMonth(gy);

      if (!isAdd) {
        // 处理闰月

        if (leap <= i && leap > 0) {
          offset += leapDays(gy);
          isAdd = true;
        }
      }

      offset += monthDays(gy, i);
    }

    // 转换闰月农历 需补充该年闰月的前一个月的时差

    if (isLeapMonth) {
      offset += day;
    }

    // 1900年农历正月一日的公历时间为1900年1月30日0时0分0秒(该时间也是本农历的最开始起始点)

    const stmap = Date.UTC(1900, 1, 30, 0, 0, 0);

    const calObj = new Date((offset + gd - 31) * 86400000 + stmap);

    const cY = calObj.getUTCFullYear();

    const cM = calObj.getUTCMonth() + 1;

    const cD = calObj.getUTCDate();

    return solar2lunar(cY, cM, cD);
  },
  getCurrentDate: function () {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以要加1
    const day = String(date.getDate()).padStart(2, '0'); // 确保日期是两位数
    return `${year}-${month}-${day}`;
  },
};

export default calendarFormatter;
