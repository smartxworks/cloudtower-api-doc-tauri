/** Convert an internal CloudTower version to its public display version. */
export const getDisplayVersion = (version: string): string => {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return version;
  const [, major, minor, patch] = match;
  const majorNumber = Number(major);
  const minorNumber = Number(minor);
  const patchNumber = Number(patch);
  const is4_7PatchRelease = majorNumber === 4 && minorNumber === 7 && patchNumber >= 2;
  const isAtLeast4_8_1 =
    majorNumber > 4 ||
    (majorNumber === 4 && (minorNumber > 8 || (minorNumber === 8 && patchNumber >= 1)));

  if (!is4_7PatchRelease && !isAtLeast4_8_1) return version;
  return patchNumber === 0 ? `${major}.${minor}` : `${major}.${minor} P${patch}`;
};
