// Given a selected date (YYYY-MM-DD), returns the three date ranges.
// Pure string/UTC maths, so timezones can't shift anything.
function getRanges(date) {
  const [y, m] = date.split('-').map(Number);
  const iso = (d) => d.toISOString().slice(0, 10);

  const monthStart = iso(new Date(Date.UTC(y, m - 1, 1)));
  const prevStart = iso(new Date(Date.UTC(y, m - 2, 1)));
  const prevEnd = iso(new Date(Date.UTC(y, m - 1, 0))); // day 0 = last day of previous month

  return {
    daily: { from: date, to: date },
    monthToDate: { from: monthStart, to: date },
    previousMonth: { from: prevStart, to: prevEnd },
  };
}

module.exports = { getRanges };