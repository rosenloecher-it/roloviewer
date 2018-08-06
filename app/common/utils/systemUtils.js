

export function isWinOs() {
  if (process.platform.toLowerCase().indexOf('win') >= 0)
    return true;

  return false;
}
