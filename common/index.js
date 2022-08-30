// 挂载变量
import { API_URL, IMG_URL } from "../env.js";
import store from "@/store/index";

const install = (Vue) => {
    Vue.prototype.$API_URL = API_URL;
    Vue.prototype.$IMG_URL = IMG_URL;
    // 挂载请求
    Vue.prototype.$http = http;

    Vue.prototype.toPage = function (path, parmas) {
        router.push({ path: path, query: parmas });
    };
    Vue.prototype.stopRequest = function (page) {
        let currentPages = getCurrentPages();
        let routes = currentPages[currentPages.length - 1].route;
        if (routes != page) return true;
    };
};

export async function init(options) {
    store.dispatch("onBLEConnectionStateChange");
}

export default {
    install,
};
