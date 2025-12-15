const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

type ArrayBufferOrArray = ArrayBuffer | Uint8Array;

export function arrayBufferEquals(ab1: ArrayBuffer, ab2: ArrayBuffer): boolean {
    if (ab1.byteLength !== ab2.byteLength) {
        return false;
    }
    const arr1 = new Uint8Array(ab1);
    const arr2 = new Uint8Array(ab2);
    for (let i = 0, len = arr1.length; i < len; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

export function bytesToString(arr: ArrayBufferOrArray): string {
    if (arr instanceof ArrayBuffer) {
        arr = new Uint8Array(arr);
    }
    return textDecoder.decode(arr);
}

export function stringToBytes(str: string): Uint8Array {
    return textEncoder.encode(str);
}

export function base64ToBytes(str: string): Uint8Array {
    if (typeof atob === 'function') {
        const byteStr = atob(str);
        const arr = new Uint8Array(byteStr.length);
        for (let i = 0; i < byteStr.length; i++) {
            arr[i] = byteStr.charCodeAt(i);
        }
        return arr;
    } else {
        const buffer = Buffer.from(str, 'base64');
        return new Uint8Array(buffer);
    }
}

export function bytesToBase64(arr: ArrayBufferOrArray): string {
    const intArr = arr instanceof ArrayBuffer ? new Uint8Array(arr) : arr;
    if (typeof btoa === 'function') {
        let str = '';
        for (let i = 0; i < intArr.length; i++) {
            str += String.fromCharCode(intArr[i]);
        }
        return btoa(str);
    } else {
        // Ensure we pass a Uint8Array / ArrayLike<number> to Buffer.from so
        // TypeScript matches the node types. Use the earlier created intArr
        // which is a Uint8Array when arr is ArrayBuffer.
        const buffer = Buffer.from(intArr);
        return buffer.toString('base64');
    }
}

export function hexToBytes(hex: string): Uint8Array {
    const arr = new Uint8Array(Math.ceil(hex.length / 2));
    for (let i = 0; i < arr.length; i++) {
        arr[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return arr;
}

export function bytesToHex(arr: ArrayBufferOrArray): string {
    const intArr = arr instanceof ArrayBuffer ? new Uint8Array(arr) : arr;
    let str = '';
    for (let i = 0; i < intArr.length; i++) {
        const byte = intArr[i].toString(16);
        if (byte.length === 1) {
            str += '0';
        }
        str += byte;
    }
    return str;
}

export function arrayToBuffer(arr: ArrayBufferOrArray): ArrayBuffer {
    // Always return a plain ArrayBuffer (not SharedArrayBuffer). If input
    // already is an ArrayBuffer, return it directly. If input is a
    // Uint8Array (a view), construct a new Uint8Array copy and return its
    // underlying buffer — this guarantees an ArrayBuffer and avoids TS
    // complaints about SharedArrayBuffer.
    if (arr instanceof ArrayBuffer) {
        return arr;
    }
    // Create a copy into a fresh ArrayBuffer and return that buffer.
    return new Uint8Array(arr).buffer;
}

export function zeroBuffer(arr: ArrayBufferOrArray): void {
    const intArr = arr instanceof ArrayBuffer ? new Uint8Array(arr) : arr;
    intArr.fill(0);
}
