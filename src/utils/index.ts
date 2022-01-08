export function capitalize(string: string): string {
  return string
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function ellipseText(text = '', maxLength = 9999): string {
  if (text.length <= maxLength) {
    return text;
  }
  const _maxLength = maxLength - 3;
  let ellipse = false;
  let currentLength = 0;
  const result =
    text
      .split(' ')
      .filter((word) => {
        currentLength += word.length;
        if (ellipse || currentLength >= _maxLength) {
          ellipse = true;
          return false;
        } else {
          return true;
        }
      })
      .join(' ') + '...';
  return result;
}

export function ellipseAddress(address = '', width = 6): string {
  return `${address.slice(0, width)}...${address.slice(-width)}`;
}

export function padLeft(n: string, width: number, z?: string): string {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export function sanitizeHex(hex: string): string {
  hex = hex.substring(0, 2) === '0x' ? hex.substring(2) : hex;
  if (hex === '') {
    return '';
  }
  hex = hex.length % 2 !== 0 ? '0' + hex : hex;
  return '0x' + hex;
}

export function removeHexPrefix(hex: string): string {
  return hex.toLowerCase().replace('0x', '');
}

export function getDataString(func: string, arrVals: any[]): string {
  let val = '';
  for (let i = 0; i < arrVals.length; i++) {
    val += padLeft(arrVals[i], 64);
  }
  const data = func + val;
  return data;
}

export function formatBigNumWithDecimals(
  num: bigint,
  decimals: number
): string {
  const singleUnit = BigInt('1' + '0'.repeat(decimals));
  const wholeUnits = num / singleUnit;
  const fractionalUnits = num % singleUnit;

  return (
    wholeUnits.toString() +
    '.' +
    fractionalUnits.toString().padStart(decimals, '0')
  );
}
