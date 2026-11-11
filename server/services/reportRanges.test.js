const { getRanges } = require('./reportRanges');

describe('getRanges', () => {
  test('matches the example in the assignment (15 Oct 2026)', () => {
    expect(getRanges('2026-10-15')).toEqual({
      daily: { from: '2026-10-15', to: '2026-10-15' },
      monthToDate: { from: '2026-10-01', to: '2026-10-15' },
      previousMonth: { from: '2026-09-01', to: '2026-09-30' },
    });
  });

  test('January looks back to December of the previous year', () => {
    expect(getRanges('2027-01-10').previousMonth).toEqual({ from: '2026-12-01', to: '2026-12-31' });
  });

  test('March looks back to February, including leap years', () => {
    expect(getRanges('2026-03-05').previousMonth).toEqual({ from: '2026-02-01', to: '2026-02-28' });
    expect(getRanges('2028-03-05').previousMonth).toEqual({ from: '2028-02-01', to: '2028-02-29' });
  });
});