// 用户数据模块
import { stopBluetooth, getAllDeviceCharacteristics, notifyBLECharacteristicValueChange } from "@/common/bluetooth";
import { hexToArrayBuffer, fillZero, proofTestValue, stringTo16Arr, arr16ToString } from "@/common/bluetooth/helper.js";
import Stack from "@/utils/stack";

const state = {
    isConnect: false,
    connectedDeviceIds: [],
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
    hex: "",
};

const getters = {
    isConnect: (state) => state.isConnect,
    foundDevices: (state) => state.foundDevices,
    connectData: (state) => state.connectData,
    hex: (state) => state.hex,
};

const actions = {
    asyncSetHex({ dispatch, commit }, data) {
        commit("setHexData", data);
    },
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
                    uni.hideLoading();
                    uni.showToast({ title: "连接失败请重新连接", icon: "none", duration: 2000 });
                }
            )
            .catch((e) => {
                uni.hideLoading();
                uni.showToast({ title: "连接失败请重新连接", icon: "none", duration: 2000 });
            });
    },
    onBLEConnectionStateChange({ state, commit }) {
        uni.onBLEConnectionStateChange(({ deviceId, connected }) => {
            commit("SET_IS_CONNECT", !connected);
            commit("setConnectData", { ...state.connectData, name: state.connectData.name, connected: connected });
            console.log(connected, "连接状态------------");
            // router.replaceAll("/pages/index/index");
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
    setHexData(state, data) {
        state.hex = data;
    },
};

export default {
    state,
    mutations,
    actions,
    getters,
};
