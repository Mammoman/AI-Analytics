import { formatCompact } from './format';

describe('formatCompact', () => {
  it('formats millions', () => {
    expect(formatCompact(8_900_000)).toBe('8.9M');
  });

  it('formats billions', () => {
    expect(formatCompact(512_000_000_000)).toBe('512B');
  });

  it('formats thousands', () => {
    expect(formatCompact(12_500)).toBe('12.5K');
  });

  it('leaves small numbers unchanged', () => {
    expect(formatCompact(42)).toBe('42');
  });

  it('handles the K/M boundary', () => {
    expect(formatCompact(1_000_000)).toBe('1M');
    expect(formatCompact(999_999)).toBe('1000K');
  });
});
