import store from "./store/store"
import router from "./router";
import Navigation from "./navigation/navigation";

const OpxApp = function () {
    return {
        el: '#opx-manage',
        store,
        router,

        data() {
            return {
                loaded: false,
                navigation: new Navigation(),
            }
        },

        created() {
            Promise.all([
                this.$translator.init(),
                this.navigation.init(),
            ])
                .then(() => {
                    this.navigation.routes.register();
                    this.loaded = true;
                });
        },
    }
};

export default OpxApp;

