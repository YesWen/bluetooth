// 补零
const fillZero = (string, length) => {
    return (Array(length).join(0) + string).slice(-length);
};

// 16 进制截取部分
const subHex = (hex, first, last) => {
    return hex
        .split(" ")
        .filter((item, index) => index >= first && index <= last)
        .join(" ");
};

// 按 length 个字符一组分割字符串
const splitString = (string, length = 2) => {
    const ret = [];

    for (let i = 0; i < string.length / length; i++) {
        ret.push(string.substr(i * length, length));
    }

    return ret.join(" ");
};

// 10 进制转 16 进制
const decimalToHex = (decimal, length = 2, unsigned = false) => {
    var num = parseInt(decimal);
    var hex = "";
    var hexLength = length * 2; //1个字节=2个16进制字符
    var min = 0;
    var max = 0;
    if (!unsigned) {
        //带符号位
        min = -1 * Math.pow(2, 8 * length - 1);
        max = Math.pow(2, 8 * length - 1) - 1;
        if (num < min || num > max) {
            //数字超出转换范围
            console.warn(`out of range,min is ${min},max is ${max},but decimal is ${num}.`);
        } else if (num < 0) {
            //传入合法负数
            //计算补码
            hex = (Math.pow(2, 8 * length) + num).toString(16);
            if (hex.length < hexLength) {
                hex = "f".repeat(hexLength - hex.length) + hex;
            }
        } else {
            //传入合法正数
            hex = num.toString(16);
            if (hex.length < hexLength) {
                hex = "0".repeat(hexLength - hex.length) + hex;
            }
        }
    } else {
        //不带符号位
        min = 0;
        max = Math.pow(2, 8 * length) - 1;
        if (num < min || num > max) {
            //数字超出转换范围
            console.warn(`out of range,min is ${min},max is ${max},but decimal is ${num}.`);
        } else {
            //传入合法正数
            hex = num.toString(16);
            if (hex.length < hexLength) {
                hex = "0".repeat(hexLength - hex.length) + hex;
            }
        }
    }

    return splitString(hex, length);
};

// 16 进制转有符号 10 进制
const hexToDecimal = (hex, unsigned = false) => {
    if (unsigned) {
        return parseInt(hex.split(" ").join(""), 16);
    } else {
        let binary = parseInt(hex.split(" ").join(""), 16).toString(2);

        const binaryLength = hex.split(" ").join("").length * 4;

        if (binary.length < binaryLength) {
            while (binary.length < binaryLength) {
                binary = "0" + binary;
            }
        }

        if (binary.substring(0, 1) === "0") {
            return parseInt(binary, 2);
        } else {
            let unsignedBinary = "";

            binary = parseInt(binary, 2) - 1;
            binary = binary.toString(2);

            unsignedBinary = binary.substring(1, binaryLength);
            unsignedBinary = unsignedBinary.replace(/0/g, "z");
            unsignedBinary = unsignedBinary.replace(/1/g, "0");
            unsignedBinary = unsignedBinary.replace(/z/g, "1");

            return parseInt(-unsignedBinary, 2);
        }
    }
};

// 16 进制转 2 进制
const hexToBinary = (hex) => {
    return hexToDecimal(hex).toString(2);
};

// 16 进制转 10 进制数组
const hexToDecimalArray = (hex) => {
    return hex.split(" ").map((item) => hexToDecimal(item, true));
};

// 16 进制求和
const sumHex = (hex) => {
    return hexToDecimalArray(hex).reduce((prev, current) => prev + current);
};

// 校验位
const cs = (hex) => {
    return fillZero(parseInt(sumHex(hex) % 256).toString(16), 2);
};

// 拼接上校验位
const joinWithCs = (hex) => {
    return hex + " " + cs(hex);
};

// 校验 16 进制数据是否合法
const isAvailableHex = (hex) => {
    return hex.substr(-2).toLowerCase() === cs(hex.substr(0, hex.length - 3)).toLowerCase();
};
// 蓝牙数据转字符串
const arrayBufferToHex = (arrayBuffer) => {
    const hexArr = Array.prototype.map.call(new Uint8Array(arrayBuffer), (bit) => {
        return ("00" + bit.toString(16)).slice(-2) + " ";
    });
    return hexArr.join("").toUpperCase();
};
//字符串转
const hexToArrayBuffer = (data) => {
    let arrayBuffer = new Uint8Array(
        data.match(/[\da-f]{2}/gi).map(function (h) {
            return parseInt(h, 16);
        })
    );
    return arrayBuffer.buffer;
};

const reversalStr = (s) => {
    return `${s[2]}${s[3]}${s[0]}${s[1]}`;
};

const stringTo16Arr = (str) => {
    let start = 0;
    let end = 2;
    let byte = "";
    let arr = [];
    for (let i = 0; i < str.length / 2; i++) {
        byte = str.substring(start, end);
        arr.push(parseInt(byte, 16));
        start += 2;
        end += 2;
    }
    return arr;
};

const arr16ToString = (arr) => {
    return arr.map((item) => fillZero(item.toString(16).toUpperCase()));
};

export {
    fillZero,
    subHex,
    hexToDecimal,
    hexToDecimalArray,
    decimalToHex,
    hexToBinary,
    sumHex,
    cs,
    joinWithCs,
    isAvailableHex,
    arrayBufferToHex,
    hexToArrayBuffer,
    stringTo16Arr,
    arr16ToString,
};
