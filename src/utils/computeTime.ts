import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isBetween from 'dayjs/plugin/isBetween';
import minMax from 'dayjs/plugin/minMax';
import BSEntity from '/@/utils/gener/BSEntity';
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);
dayjs.extend(minMax);

/**
 * 计算请假时长（按 8:30-17:30 为 1 天）
 * @param {string} start 请假开始时间 (e.g., '2025-08-07 10:00')
 * @param {string} end   请假结束时间 (e.g., '2025-08-09 15:00')
 * @param {string} startCT 计算的开始的时间(8:30)
 * @param {string} endCT 计算的结束的时间(17:30)
 * @param {bool} isHaveHoliday 是否排除节假日
 * @returns {number} 请假天数（含小数）
 */
export async function calculateLeaveDays(start, end, startCT, endCT, isHaveHoliday) {
  const startDay = dayjs(startCT, 'HH:mm');
  const endDay = dayjs(endCT, 'HH:mm');
  const WORK_START_HOUR = parseInt(startDay.hour());
  const WORK_START_MINUTE = parseInt(startDay.minute());
  const WORK_END_HOUR = parseInt(endDay.hour());
  const WORK_END_MINUTE = parseInt(endDay.minute());
  const DAILY_HOURS = dayjs(endCT, 'HH:mm').diff(dayjs(startCT, 'HH:mm'), 'hour'); // 9小时/天

  let current = dayjs(start);
  const endDate = dayjs(end);
  let totalMinutes = 0;
  let days = '';
  if (isHaveHoliday) {
    const holidayEn = new BSEntity('BP.Sys.GloVar');
    holidayEn.setPK('Holiday');
    const count = await holidayEn.RetrieveFromDBSources();
    if (count === 1) {
      const day = holidayEn.Val || '';
      days = day.split(',');
    }
  }

  // 逐天计算有效工作时间
  while (current.isSameOrBefore(endDate, 'day')) {
    //排除节假日
    if (!!days && days.includes(dayjs(current).format('MM-DD'))) continue;
    const dayStart = current.hour(WORK_START_HOUR).minute(WORK_START_MINUTE).second(0);
    const dayEnd = current.hour(WORK_END_HOUR).minute(WORK_END_MINUTE).second(0);

    let dayMinutes = 0;
    // 当前天是请假首日
    if (current.isSame(start, 'day')) {
      const leaveStart = dayjs(start);
      const effectiveStart = leaveStart.isAfter(dayStart) ? leaveStart : dayStart;
      const effectiveEnd = effectiveStart.isBefore(dayEnd) ? (endDate.isSame(current, 'day') ? dayjs.min(endDate, dayEnd) : dayEnd) : effectiveStart;
      dayMinutes = effectiveEnd.diff(effectiveStart, 'minute');
    }
    // 当前天是请假末日
    else if (current.isSame(endDate, 'day')) {
      const effectiveStart = dayStart;
      const effectiveEnd = endDate.isBefore(dayEnd) ? endDate : dayEnd;
      dayMinutes = effectiveEnd.diff(effectiveStart, 'minute');
    }
    // 整天请假
    else {
      dayMinutes = dayEnd.diff(dayStart, 'minute');
    }

    totalMinutes += Math.max(0, dayMinutes); // 避免负数
    current = current.add(1, 'day');
  }

  // 转换为天数（9小时=540分钟）
  return totalMinutes / (DAILY_HOURS * 60);
}
