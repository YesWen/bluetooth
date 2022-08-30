import store from "@/store";
import { eachSeries } from "async";
import { arrayBufferToHex } from "@/common/bluetooth/helper.js";

const tryOpenAdapter = () => {
    return new Promise((resolve, reject) => {
        uni.openBluetoothAdapter()
            .then((res) => {
                if (res[0]) {
                    uni.showToast({ title: "请开启手机蓝牙", icon: "none", duration: 1000 });
                    reject(res);
                    return;
                }
                getBluetoothAdapterState();
                resolve(res);
            })
            .catch((err) => {
                if (err.errCode === 10001) {
                    uni.showToast({ title: "请开启手机蓝牙", icon: "none", duration: 1000 });
                }
                reject(err);
            });
    });
};

const getBluetoothAdapterState = async () => {
    const [isNull, { available, discovering }] = await uni.getBluetoothAdapterState();
    if (available) {
        onBluetoothDeviceFound();
        startBluetoothDevicesDiscovery();
        if (discovering) {
            closeBluetooth();
        }
    } else {
        uni.showToast({ title: "请开启手机蓝牙", icon: "none", duration: 1000 });
    }
};
//查找附近设备
const onBluetoothDeviceFound = async () => {
    uni.onBluetoothDeviceFound(({ devices }) => {
        devices
            .filter(({ name, localName }) => name || localName)
            .forEach((device) => {
                store.dispatch("addFoundDevice", { device });
            });
    });
};

const repetitionServices = async (deviceId) => {
    // console.log("重复获取有用特征值", deviceId);
    return new Promise(async (resolve, reject) => {
        const [fail, { services }] = await uni.getBLEDeviceServices({ deviceId });
        let servicesList = services.filter((item) => {
            return !/^000018/.test(item.uuid);
        });
        servicesList.length == 0 ? resolve(repetitionServices(deviceId)) : resolve(servicesList);
    });
};

//获取特征值
const getAllDeviceCharacteristics = async ({ deviceId }) => {
    return new Promise(async (resolve, reject) => {
        const ret = { notify: {}, indicate: {}, read: {}, write: {} };
        const services = await repetitionServices(deviceId);
        setTimeout(async () => {
            await eachSeries(
                services,
                async (service, cb) => {
                    const [fail, { characteristics }] = await uni.getBLEDeviceCharacteristics({
                        deviceId,
                        serviceId: service.uuid,
                    });
                    characteristics.forEach((characteristic) => {
                        Object.keys(ret).forEach((property) => {
                            if (!ret[property].uuid && characteristic.properties[property]) {
                                ret[property] = {
                                    serviceId: service.uuid,
                                    uuid: characteristic.uuid,
                                };
                            }
                        });
                    });
                    cb && cb();
                },
                (e, res) => {
                    resolve(ret);
                }
            );
        }, 100);
    });
};

const notifyBLECharacteristicValueChange = async ({ deviceId, serviceId, characteristicId }) => {
    let [fail, { errMsg }] = await uni.notifyBLECharacteristicValueChange({
        deviceId: deviceId,
        serviceId: serviceId,
        characteristicId: characteristicId,
        state: true,
    });
    if (errMsg == "notifyBLECharacteristicValueChange:ok") {
        onBLECharacteristicValueChange();
    }
};

const onBLECharacteristicValueChange = () => {
    uni.onBLECharacteristicValueChange((characteristic) => {
        const hex = arrayBufferToHex(characteristic.value).trim();
        store.dispatch("asyncSetHex", hex);
        console.log(hex, "--------返回值");
    });
};

const startBluetoothDevicesDiscovery = async () => {
    await uni.startBluetoothDevicesDiscovery();
};

const closeBluetooth = () => {
    stopBluetooth();
    uni.closeBluetoothAdapter();
};

const stopBluetooth = () => {
    uni.stopBluetoothDevicesDiscovery();
};

export { tryOpenAdapter, closeBluetooth, stopBluetooth, getAllDeviceCharacteristics, notifyBLECharacteristicValueChange };
