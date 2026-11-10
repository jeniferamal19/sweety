const { validateReading } = require('./readingValidation');

const TODAY = '2026-11-10';
const ok = { date: '2026-11-10', slot: 'morning', value: 120 };

describe('validateReading', () => {
  test('accepts a good reading', () => {
    expect(validateReading(ok, TODAY)).toBeNull();
  });

  test('value is required', () => {
    expect(validateReading({ ...ok, value: '' }, TODAY)).toBe('Please enter a glucose value.');
    expect(validateReading({ ...ok, value: undefined }, TODAY)).toBe('Please enter a glucose value.');
  });

  test('value must be a whole number from 40 to 600', () => {
    const msg = 'Value must be between 40 and 600 mg/dl.';
    expect(validateReading({ ...ok, value: 39 }, TODAY)).toBe(msg);
    expect(validateReading({ ...ok, value: 601 }, TODAY)).toBe(msg);
    expect(validateReading({ ...ok, value: 120.5 }, TODAY)).toBe(msg);
    expect(validateReading({ ...ok, value: 'abc' }, TODAY)).toBe(msg);
    expect(validateReading({ ...ok, value: 40 }, TODAY)).toBeNull();
    expect(validateReading({ ...ok, value: 600 }, TODAY)).toBeNull();
  });

  test('slot must be one of the four', () => {
    expect(validateReading({ ...ok, slot: 'midnight' }, TODAY)).toBe('Please choose a time slot.');
  });

  test('date cannot be in the future', () => {
    expect(validateReading({ ...ok, date: '2026-11-11' }, TODAY)).toBe('Date cannot be in the future.');
    expect(validateReading({ ...ok, date: '2026-11-09' }, TODAY)).toBeNull();
  });

  test('date must be a real date', () => {
    expect(validateReading({ ...ok, date: '2026-02-31' }, TODAY)).toBe('Please choose a valid date.');
    expect(validateReading({ ...ok, date: undefined }, TODAY)).toBe('Please choose a valid date.');
  });
});