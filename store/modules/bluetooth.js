// 用户数据模块
import { stopBluetooth, getAllDeviceCharacteristics, notifyBLECharacteristicValueChange } from "@/common/bluetooth";
import { hexToArrayBuffer, fillZero, proofTestValue, stringTo16Arr, arr16ToString, handleData } from "@/common/bluetooth/helper.js";
import Stack from "@/utils/stack";

const state = {
    isConnect: false,
    foundDevices: [],
    connectData: {
        name: "",
        deviceId: "",
        type: "",
        connected: false,
        characteristics: {},
        nickname: "",
        edit: false,
    },
};

const getters = {
    isConnect: (state) => state.isConnect,
    foundDevices: (state) => state.foundDevices,
    connectData: (state) => state.connectData,
};

const actions = {
    showBluetoothModal({ dispatch, commit }, data) {
        commit("SET_IS_CONNECT", data);
    },
    addFoundDevice({ commit }, { device }) {
        commit("_addFoundDevice", { device });
    },
    createBLEConnection({ dispatch, state, commit }, data) {
        uni.createBLEConnection({ deviceId: data.deviceId })
            .then(
                async (res) => {
                    stopBluetooth();
                    commit("setConnectData", {
                        connected: state.connectData.connected,
                        edit: data.edit,
                        nickname: data.nickname,
                        deviceId: data.deviceId,
                        name: data.name,
                        type: data.type,
                        characteristics: {},
                    });
                    dispatch("getCharacteristics");
                    uni.hideLoading();
                },
                (err) => {
                    console.log(err, "---连接失败");
                    uni.showToast({ title: "连接失败请重新连接", icon: "none", duration: 2000 });
                    uni.hideLoading();
                }
            )
            .catch((e) => {
                uni.showToast({ title: "连接失败请重新连接", icon: "none", duration: 2000 });
                uni.hideLoading();
            });
    },

    onBLEConnectionStateChange({ state, commit }) {
        uni.onBLEConnectionStateChange(({ deviceId, connected }) => {
            commit("SET_IS_CONNECT", !connected);
            commit("setConnectData", { ...state.connectData, name: state.connectData.name, connected: connected });
            if (!connected) {
                router.replaceAll("/pages/index/index");
            }
        });
    },

    async getCharacteristics({ dispatch, state, commit }) {
        const characteristics = await getAllDeviceCharacteristics({ deviceId: state.connectData.deviceId });
        [characteristics.notify, characteristics.indicate, characteristics.write].forEach(async (characteristic) => {
            if (characteristic.uuid) {
                commit("setCharacteristicId", {
                    serviceId: characteristic.serviceId,
                    characteristicId: characteristic.uuid,
                });
                setTimeout(() => {
                    notifyBLECharacteristicValueChange({
                        deviceId: state.connectData.deviceId,
                        serviceId: characteristic.serviceId,
                        characteristicId: characteristic.uuid,
                    });
                }, 100);
            }
        });
    },

    request({ dispatch, state, commit }, params) {
        var data;
        const T = state.gatewayData.is ? state.gatewayData.type : state.connectData.type;
        const length = fillZero(params.length ? "09" : "06");
        const type = fillZero(T, 2);
        const code = fillZero(Number(params.code).toString(16).toUpperCase(), 2);
        params.length ? (data = params.data) : (data = fillZero(Number(params.data).toString(16), 2));
        const end = "0D0A";
        if (params.length) {
            var calculate = ["5A", "5A", length, type, code, data.substring(0, 2), data.substring(2, 4), data.substring(4, 6), data.substring(6, 8)];
        } else {
            var calculate = ["5A", "5A", length, type, code, data];
        }
        let verify = proofTestValue(calculate).toString(16).toUpperCase();
        let str = "5A5A" + length + type + code + data + verify.substring(verify.length - 0, verify.length - 2) + end;
        console.log(parseInt(code, 16), parseInt(data, 16), str);
        if (uni.getStorageSync("gateway")) {
            // let arrByte = stringTo16Arr(str);
            // let sendData = {
            //     arrByte: arrByte,
            //     id: data.id
            // }
            // dispatch('sendGatewayData', sendData)
            dispatch("sendGatewayData", stringTo16Arr(str));

            // dispatch('sendTwoGatewayData', {
            //     action: fillZero(parseInt(code, 16)), dataStr: parseInt(data, 16).toString(), deviceType: state.gatewayData.type
            // })
            return;
        }

        Stack.on(str, data);

        // dispatch('writeBLECharacteristicValue', str)
    },

    async writeBLECharacteristicValue({ dispatch, state, commit }, data) {
        uni.writeBLECharacteristicValue({
            deviceId: state.connectData.deviceId,
            serviceId: state.connectData.characteristics.serviceId,
            characteristicId: state.connectData.characteristics.characteristicId,
            value: hexToArrayBuffer(data),
        });

        // if (errCode == 0) {
        //     console.log('发送成功')
        // }
    },
};

const mutations = {
    SET_IS_CONNECT: (state, data) => {
        state.isConnect = data;
    },
    _addFoundDevice(state, { device }) {
        if (!state.foundDevices.map(({ deviceId }) => deviceId).includes(device.deviceId)) {
            state.foundDevices.push(device);
        }
    },

    setConnectData(state, data) {
        state.connectData = data;
    },

    setCharacteristicId(state, data) {
        state.connectData.characteristics = data;
    },
};

export default {
    state,
    mutations,
    actions,
    getters,
};
