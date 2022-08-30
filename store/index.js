import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import bluetooth from "./modules/bluetooth.js";

const store = new Vuex.Store({
    modules: {
        bluetooth,
    },
});

export default store;
