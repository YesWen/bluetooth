<template>
    <div class="page">
        <div class="hint">查找附近的设备</div>

        <div class="tips">
            <div class="big-circle flex-center"><div class="sm-circle"></div></div>
            <text v-if="connectData.connected">已连接上{{ connectData.name }}设备</text>
            <text v-else>自动搜寻附近设备中...</text>
        </div>

        <div class="device-list">
            <div v-if="foundDevices.length > 0">
                <div class="device-wrap">
                    <div
                        v-for="(item, index) in foundDevices"
                        :key="index"
                        @tap="connect(item)"
                        :class="{ activeDevice: connectData.connected && item.name == connectData.name }"
                        class="item-device"
                    >
                        {{ item.name }}
                    </div>
                </div>
            </div>
            <u-empty v-else text="暂无设备" mode="list"></u-empty>
        </div>

        <div class="add-text">添加设备</div>

        <div class="add">
            <div class="binding" @tap="send">发送</div>
        </div>
        <div>
            接收的数据->
            {{ hex }}
        </div>
        <!-- <w-bl-connection></w-bl-connection> -->
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import { tryOpenAdapter, arrayBufferToHex } from "@/common/bluetooth";

export default {
    data() {
        return {
            available: true,
        };
    },
    onShow() {
        this.openAdapter();
    },
    computed: {
        ...mapGetters(["foundDevices", "connectData", "hex"]),
    },
    methods: {
        openAdapter() {
            tryOpenAdapter()
                .then((res) => {
                    this.available = true;
                })
                .catch((e) => {
                    console.log(e);
                    this.available = false;
                    setTimeout(() => {
                        this.openAdapter();
                    }, 2000);
                });
        },
        async connect(e) {
            uni.showLoading();
            if (this.connectData.connected) {
                if (this.connectData.name != e.name) {
                    let [fail, { confirm }] = await uni.showModal({
                        title: "提示",
                        content: `已连接设备${this.connectData.name}是否要更换其他设备`,
                    });
                    if (confirm) {
                        uni.closeBLEConnection({ deviceId: this.connectData.deviceId })
                            .then((res) => {
                                this.$store.dispatch("createBLEConnection", e);
                            })
                            .catch((e) => {
                                console.log(e);
                            });
                    }
                    uni.hideLoading();
                    return;
                }
                uni.hideLoading();
                return;
            }

            this.$store.dispatch("createBLEConnection", e);
        },
        send() {
            this.$store.dispatch("asyncSetHex", "");
            this.$store.dispatch("writeBLECharacteristicValue", "4D000005FF55000001");
            this.$store.dispatch("writeBLECharacteristicValue", "4D000005FF55000002");
        },
    },
};
</script>

<style lang="less" scoped>
.page {
    background: #fff;
    padding: 0 30rpx;
    min-height: 100vh;
    .hint {
        color: #2c2c2c;
        font-size: 52rpx;
        font-weight: 700;
        height: 200rpx;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding-bottom: 20rpx;
    }
    .tips {
        display: flex;
        align-items: center;
        color: #707070;
        font-size: 22rpx;
        font-family: Microsoft YaHei;
        .big-circle {
            width: 50rpx;
            height: 50rpx;
            background: rgb(202, 231, 245);
            border-radius: 50%;
            margin-right: 20rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            .sm-circle {
                width: 25rpx;
                height: 25rpx;
                background: rgb(80, 193, 235);
                border-radius: 50%;
            }
        }
        image {
            width: 80rpx;
            height: 80rpx;
        }
    }
    .device-list {
        padding: 50rpx;
        border-bottom: 1rpx solid #e6e6e6;
        .device-wrap {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            .item-device {
                background: #f6f6f6;
                border-radius: 20rpx;
                width: calc(100% / 2 - 40rpx);
                margin-bottom: 20rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 23rpx;
                font-weight: 700;
                height: 60rpx;
            }
            image {
                width: 160rpx;
                height: 95rpx;
            }
        }
    }
    .add-text {
        font-size: 26rpx;
        color: #707070;
        padding: 50rpx 0;
    }
    .add {
        display: flex;
        justify-content: flex-end;
        .binding {
            display: flex;
            align-items: center;
            justify-items: center;
            padding: 0 10rpx;
            box-sizing: border-box;
            width: 295rpx;
            height: 95rpx;
            background: linear-gradient(90deg, #7dd17c, #72bc6e);
            box-shadow: 0rpx 12rpx 13rpx 2rpx rgba(75, 125, 73, 0.1);
            border-radius: 42rpx;
            font-size: 30rpx;
            color: #fff;
        }
    }
    .activeDevice {
        background: rgb(43, 182, 252) !important;
        color: #fff !important;
    }
}
</style>
