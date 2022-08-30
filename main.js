import Vue from "vue";
import App from "./App";
import store from "@/store";

async function bootstrap() {
    App.mpType = "app";
    const app = new Vue({
        store,
        ...App,
    });
    app.$mount();
}

bootstrap();
