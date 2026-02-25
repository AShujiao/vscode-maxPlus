/**
 * 小黑盒 API 签名计算模块
 * 算法: HMAC-SHA512 + CRC32
 */
import * as crypto from 'crypto';

const HMAC_KEY = Buffer.from('LFEJGJJOKCEHODNMNFIKKONFBKIHJFKB', 'utf-8');
const NONCE_CHARS = '6ELSZjqx';

/**
 * 生成随机 nonce 字符串
 * @param length nonce 长度，默认 32
 * @returns nonce 字符串（字符集: 6ELSZjqx）
 */
export function generateNonce(length: number = 32): string {
    let nonce = '';
    for (let i = 0; i < length; i++) {
        nonce += NONCE_CHARS.charAt(Math.floor(Math.random() * NONCE_CHARS.length));
    }
    return nonce;
}

/**
 * CRC32 计算
 */
function crc32(buffer: Buffer): number {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buffer.length; i++) {
        crc = crc ^ buffer[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
        }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * 计算 hkey 签名
 * 算法: HMAC-SHA512 + CRC32
 * @param path API 路径（必须以 / 结尾）
 * @param timestamp 时间戳
 * @param debugInfo 调试信息（格式: "imei-1"）
 * @returns hkey 签名字符串（8位大写十六进制）
 */
export function computeHkey(path: string, timestamp: number, debugInfo: string): string {
    // 确保 path 以 / 结尾
    const signPath = path.endsWith('/') ? path : path + '/';

    // 构建签名数据
    const data = `${signPath}${timestamp}${debugInfo}`;

    // HMAC-SHA512
    const hmac = crypto.createHmac('sha512', HMAC_KEY);
    hmac.update(data);
    const hashBytes = hmac.digest();

    // CRC32
    const crc = crc32(hashBytes);

    // 返回 8 位大写十六进制
    const hex = crc.toString(16).toUpperCase();
    return hex.length < 8 ? '0'.repeat(8 - hex.length) + hex : hex;
}
