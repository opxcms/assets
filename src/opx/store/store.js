import Vue from "vue";
import Vuex from "vuex";
import NavigationStore from "./vuex-navigation-store";
import LocalizationStore from "./vuex-localization-store";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        navigation: NavigationStore,
        localization: LocalizationStore,
    }
});