// Development firmware is stamped as vX.Y.Z-N. Releases drop the suffix.
export function isDevBuild(version) {
  const value = String(version || '').trim();
  return /^v?\d+\.\d+\.\d+-.+/.test(value);
}
