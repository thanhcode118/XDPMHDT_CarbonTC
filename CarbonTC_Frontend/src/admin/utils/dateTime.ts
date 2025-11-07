/* eslint-disable prettier/prettier */
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

import 'dayjs/locale/vi';
import 'dayjs/locale/en';

dayjs.extend(calendar);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
// dayjs.locale('vi');

type DayjsInput = string | Date | null | undefined;

// === HÀM CƠ BẢN (CORE FUNCTION) ===
/**
 * Hàm định dạng ngày tháng gốc, linh hoạt nhất.
 * Tất cả các hàm khác nên được xây dựng dựa trên hàm này.
 */
export const formatCustom = (date: DayjsInput, formatString: string): string => {
  if (!date) return '-';
  return dayjs(date).format(formatString);
};

export const formatDate = (date: DayjsInput): string => {
  return formatCustom(date, 'DD/MM/YYYY');
};

export const formatDateTime = (date: DayjsInput): string => {
  return formatCustom(date, 'DD/MM/YYYY HH:mm:ss');
};

export const formatTime = (date: DayjsInput): string => {
  return formatCustom(date, 'HH:mm:ss');
};

export const formatRelativeTime = (date: DayjsInput): string => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

export const formatCalendar = (
  date: DayjsInput,
  lang: 'en' | 'vi',
): string => {
  if (!date) return '-';

  const dayjsDate = dayjs(date).locale(lang);
  return dayjsDate.calendar(undefined, {
    sameDay: lang === 'vi' ? '[Hôm nay lúc] H:mm' : '[Today at] h:mm A',
    lastDay: lang === 'vi' ? '[Hôm qua lúc] H:mm' : '[Yesterday at] h:mm A',
    lastWeek: lang === 'vi' ? 'dddd [lúc] H:mm' : 'dddd [at] h:mm A',
    sameElse: lang === "vi" ? 'DD/MM/YYYY [lúc] H:mm' : 'MM/DD/YYYY [at] h:mm A',
  });
};

/** === HÀM PHÂN TÍCH (PARSING) === */
export const parseDate = (
  dateString: string,
  format: string = 'DD/MM/YYYY',
): Date => {
  return dayjs(dateString, format).toDate();
};
