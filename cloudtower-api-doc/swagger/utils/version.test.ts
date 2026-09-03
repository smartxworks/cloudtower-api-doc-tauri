import { describe, expect, it } from 'vitest';
import { getDisplayVersion } from './version';

describe('getDisplayVersion', () => {
  it('uses public release names for supported release ranges', () => {
    expect(getDisplayVersion('4.9.0')).toBe('4.9');
    expect(getDisplayVersion('4.9.1')).toBe('4.9 P1');
    expect(getDisplayVersion('4.8.1')).toBe('4.8 P1');
    expect(getDisplayVersion('4.8.2')).toBe('4.8 P2');
    expect(getDisplayVersion('4.7.2')).toBe('4.7 P2');
    expect(getDisplayVersion('4.7.3')).toBe('4.7 P3');
  });

  it('preserves versions outside the supported ranges and prerelease versions', () => {
    expect(getDisplayVersion('4.8.0')).toBe('4.8.0');
    expect(getDisplayVersion('4.7.1')).toBe('4.7.1');
    expect(getDisplayVersion('4.8.1-rc-2025-12-10')).toBe('4.8.1-rc-2025-12-10');
    expect(getDisplayVersion('4.7.2-dev')).toBe('4.7.2-dev');
    expect(getDisplayVersion('3.4.x LTS')).toBe('3.4.x LTS');
  });
});
