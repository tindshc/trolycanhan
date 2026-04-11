import * as data from './lunar-data';

export interface LunarDateInfo {
  day: number;
  month: number;
  year: number;
  leap: number;
  jd: number;
}

function jdn(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const year = yy + 4800 - a;
  const month = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * month + 2) / 5) + 365 * year + Math.floor(year/4) - Math.floor(year/100) + Math.floor(year/400) - 32045;
  if (jd < 2299161) jd = dd + Math.floor((153 * month + 2) / 5) + 365 * year + Math.floor(year/4) - 32083;
  return jd;
}

function jd2date(jd: number): { d: number, m: number, y: number } {
  let z = jd;
  let a: number;
  if (z < 2299161) {
    a = z;
  } else {
    let alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  let b = a + 1524;
  let c = Math.floor((b - 122.1) / 365.25);
  let d = Math.floor(365.25 * c);
  let e = Math.floor((b - d) / 30.6001);
  let dd = Math.floor(b - d - Math.floor(30.6001 * e));
  let mm = e < 14 ? e - 1 : e - 13;
  let yyyy = mm > 2 ? c - 4716 : c - 4715;
  return { d: dd, m: mm, y: yyyy };
}

function decodeLunarYear(yy: number, k: number): LunarDateInfo[] {
  let monthLengths = [29, 30];
  let regularMonths: number[] = new Array(12);
  let offsetOfTet = k >> 17;
  let leapMonth = k & 0xf;
  let leapMonthLength = monthLengths[(k >> 16) & 0x1];
  let solarNY = jdn(1, 1, yy);
  let currentJD = solarNY + offsetOfTet;
  let j = k >> 4;
  
  for (let i = 0; i < 12; i++) {
    regularMonths[11 - i] = monthLengths[j & 0x1];
    j >>= 1;
  }

  let ly: LunarDateInfo[] = [];
  if (leapMonth === 0) {
    for (let mm = 1; mm <= 12; mm++) {
      ly.push({ day: 1, month: mm, year: yy, leap: 0, jd: currentJD });
      currentJD += regularMonths[mm - 1];
    }
  } else {
    for (let mm = 1; mm <= leapMonth; mm++) {
      ly.push({ day: 1, month: mm, year: yy, leap: 0, jd: currentJD });
      currentJD += regularMonths[mm - 1];
    }
    ly.push({ day: 1, month: leapMonth, year: yy, leap: 1, jd: currentJD });
    currentJD += leapMonthLength;
    for (let mm = leapMonth + 1; mm <= 12; mm++) {
      ly.push({ day: 1, month: mm, year: yy, leap: 0, jd: currentJD });
      currentJD += regularMonths[mm - 1];
    }
  }
  return ly;
}

export function getYearInfo(yyyy: number): LunarDateInfo[] {
  let yearCode: number;
  if (yyyy < 1900) yearCode = data.TK19[yyyy - 1800];
  else if (yyyy < 2000) yearCode = data.TK20[yyyy - 1900];
  else if (yyyy < 2100) yearCode = data.TK21[yyyy - 2000];
  else yearCode = data.TK22[yyyy - 2100];
  return decodeLunarYear(yyyy, yearCode);
}

export function getLunarDate(dd: number, mm: number, yyyy: number): LunarDateInfo {
  let ly, jd;
  ly = getYearInfo(yyyy);
  jd = jdn(dd, mm, yyyy);
  if (jd < ly[0].jd) {
    ly = getYearInfo(yyyy - 1);
  }
  
  // Find index
  let i = ly.length - 1;
  while (jd < ly[i].jd) i--;
  let off = jd - ly[i].jd;
  return { day: ly[i].day + off, month: ly[i].month, year: ly[i].year, leap: ly[i].leap, jd: jd };
}

export function getSolarDate(day: number, month: number, year: number, isLeapMonth = 0): Date {
  const ly = getYearInfo(year);
  for (const item of ly) {
    if (item.month === month && item.leap === isLeapMonth) {
      const jd = item.jd + day - 1;
      const res = jd2date(jd);
      return new Date(res.y, res.m - 1, res.d);
    }
  }
  // Fallback if month not found (not possible with valid data)
  return new Date(year, month - 1, day);
}
