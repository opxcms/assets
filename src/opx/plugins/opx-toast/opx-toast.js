import ToastPlugin from './js/toaster';

const Toast = {
    install: (Vue, options) => {

        if(!options) {
            options = {};
        }

        let _toast = new ToastPlugin(options);

        Vue.toast = Vue.prototype.$toast = _toast;
    }
};

export default Toast