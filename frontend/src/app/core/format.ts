export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  const units: [number, string][] = [
    [1_000_000_000, 'B'],
    [1_000_000, 'M'],
    [1_000, 'K'],
  ];
  for (const [threshold, suffix] of units) {
    if (abs >= threshold) {
      const scaled = (n / threshold).toFixed(1);
      const trimmed = scaled.endsWith('.0') ? scaled.slice(0, -2) : scaled;
      return `${trimmed}${suffix}`;
    }
  }
  return String(n);
}
