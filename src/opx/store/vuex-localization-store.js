import client from '../api-client/api-client';
import Vue from 'vue';
import Promise from 'promise-polyfill';

export default {
    namespaced: true,

    state: {
        installed_locales: {},
        current_locale: "",
        localizations: {},
    },

    mutations: {
        set_installed_locales(state, payload) {
            state.installed_locales = payload;
        },
        set_current_locale(state, payload) {
            state.current_locale = payload;
        },
        set_localizations(state, payload) {
            state.localizations = payload;
        },
        set_localization(state, payload) {
            Vue.set(state.localizations, payload.key, payload.value);
        },
    },

    actions: {
        initialize({commit}, lang = null) {
            return new Promise((resolve, reject) => {
                client.post('/manage/api/localization/translations', {lang: lang})
                    .then(response => {
                        commit('set_current_locale', response.data['current_locale']);
                        commit('set_installed_locales', response.data['installed_locales']);

                        let localizations = response.data['localizations'];

                        commit('set_localizations', localizations);

                        resolve();
                    })
                    .catch(() => {
                        reject();
                    });
            });
        },
    },
    getters: {
        localize: (state) => (key) => {
            if (!state.localizations[key]) {
                return key;
            }

            return state.localizations[key];
        }
    },
};