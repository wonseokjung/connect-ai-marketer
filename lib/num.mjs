// Numbers the way sites print them, read back as plain numbers. Shared by benchmarker and analyst.
// count:  1,234 · 24K · 5.7M views · 조회수 3.4만회 · 구독자 2.1만명 · 6.1천개  (0 when there is no number)
// ageDays: 16h ago · 1d ago · 2w ago · 3mo ago · 1y ago · 3 days ago · 2주 전 · 1년 전  (9999 when unknown)
// seconds: 11:11 · 1:02:03  (0 when it is not a clock, e.g. a Shorts or LIVE badge)
export function count(t) {
  t = String(t ?? '').replace(/,/g, '').toLowerCase();
  let m = t.match(/(\d+(?:\.\d+)?)\s*(천|만|억)/);
  if (m) return Math.round(+m[1] * {'천': 1e3, '만': 1e4, '억': 1e8}[m[2]]);
  m = t.match(/(\d+(?:\.\d+)?)\s*([kmb])(?![a-z])/);
  if (m) return Math.round(+m[1] * {k: 1e3, m: 1e6, b: 1e9}[m[2]]);
  m = t.match(/(\d+(?:\.\d+)?)/);
  return m ? Math.round(+m[1]) : 0;
}

const UNIT = {second: 0, sec: 0, s: 0, minute: 0, min: 0, m: 0, hour: 0, hr: 0, h: 0, day: 1, d: 1, week: 7, wk: 7, w: 7, month: 30, mo: 30, year: 365, yr: 365, y: 365,
  '초': 0, '분': 0, '시간': 0, '일': 1, '주': 7, '개월': 30, '달': 30, '년': 365};
export function ageDays(t) {
  t = String(t ?? '').toLowerCase();
  const m = t.match(/(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|weeks?|wks?|months?|mo|years?|yrs?|s|m|h|d|w|y)\b/) || t.match(/(\d+)\s*(초|분|시간|일|주|개월|달|년)/);
  if (!m) return 9999;
  const k = m[2].length > 2 ? m[2].replace(/s$/, '') : m[2];
  return +m[1] * (UNIT[k] ?? 9999);
}

export function seconds(t) {
  const m = String(t ?? '').trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return 0;
  return m[3] === undefined ? +m[1] * 60 + +m[2] : +m[1] * 3600 + +m[2] * 60 + +m[3];
}
export const clock = (s) => !s ? '' : s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
export const median = (xs) => { const a = xs.filter((x) => Number.isFinite(x)).sort((p, q) => p - q); if (!a.length) return 0; const i = Math.floor(a.length / 2); return a.length % 2 ? a[i] : Math.round((a[i - 1] + a[i]) / 2); };

// A value still holding the example text from config.example.json counts as not set.
export const unset = (v) => !v || /^your[_ ]|yourchannel|your product|your brand/i.test(String(v));
