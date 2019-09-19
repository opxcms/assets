import store from "../../store/store";

/**
 * Translator
 * core instance of translator
 *
 * @param _options
 * @returns {TranslatorPlugin}
 * @constructor
 */
const Translator = function (_options) {

    this.options = _options;

    this.init = (lang = null) => {
        return store.dispatch('localization/initialize', lang);
    };

    this.trans = (key) => {
        return store.getters['localization/localize'](key);
    };

    return this;
};

const TranslatorPlugin = {
    install: (Vue, options) => {

        if (!options) {
            options = {};
        }

        let translator = new Translator(options);
        Vue.translator = Vue.prototype.$translator = translator;
        Vue.trans = Vue.prototype.$trans = translator.trans;
    }
};

export default TranslatorPlugin