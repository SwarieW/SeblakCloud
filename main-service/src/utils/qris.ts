// CRC16-CCITT (0x1021, init 0xFFFF) calculation according to EMVCo QR specifications
function calculateCRC16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Converts a static merchant QRIS payload into a dynamic amount QRIS payload.
 * @param staticQris The raw string scanned from the owner's static QRIS card
 * @param amount The transaction amount (e.g., 28000)
 */
export function generateDynamicQRIS(staticQris: string, amount: number): string {
  // Strip existing checksum (Tag 63) if present at the end
  let basePayload = staticQris;
  const tag63Index = basePayload.indexOf('6304');
  if (tag63Index !== -1) {
    basePayload = basePayload.substring(0, tag63Index);
  }

  // Format Tag 54 (Transaction Amount): Tag 54 + 2-digit Length + Amount string
  const amountStr = Math.round(amount).toString();
  const tag54Length = amountStr.length.toString().padStart(2, '0');
  const tag54 = `54${tag54Length}${amountStr}`;

  // Remove any existing Tag 54 before injecting the new one
  basePayload = basePayload.replace(/54\d{2}\d+/, '');

  // Construct payload to be checksummed
  const payloadToSign = `${basePayload}${tag54}6304`;

  // Compute fresh CRC16
  const crc = calculateCRC16(payloadToSign);

  return `${payloadToSign}${crc}`;
}