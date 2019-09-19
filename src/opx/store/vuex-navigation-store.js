import client from '../api-client/api-client';
import Vue from 'vue';
import Promise from "promise-polyfill";

export default {
    namespaced: true,
    state: {
        home: "",
        sections: {},
        items: {},
        routes: {},
        favorites: [],
    },
    mutations: {
        set_navigation(state, payload) {
            state.sections = payload.sections;
            state.items = payload.items;
            state.home = payload.home;
            state.favorites = payload.favorites;
            state.routes = payload.routes;
        },
        set_menu_to_favorites(state, payload) {
            state.favorites.push(payload);
        },
        remove_menu_form_favorites(state, payload) {
            state.favorites.splice(state.favorites.indexOf(payload), 1);
        },

        set_favorite_mode(state, payload) {
            state.favorite_mode = payload;
        },
    },
    actions: {
        /**
         * Load navigation structure and items from server.
         *
         * @param  commit
         *
         * @return  Promise
         */
        initialize({commit}) {
            return new Promise((resolve, reject) => {
                client.get("/manage/api/navigation/navigation")
                    .then(response => {
                        commit('set_navigation', {
                            favorites: response.data['favorites'],
                            home: response.data['home'],
                            sections: response.data['sections'],
                            items: response.data['items'],
                            routes: response.data['routes'],
                        });
                        resolve()
                    })
                    .catch(() => {
                        reject()
                    });
            });
        },

        /**
         * Switch menu to favorite or not.
         *
         * @param  commit
         * @param  state
         * @param  name
         *
         * @return  void
         */
        switchFavorite({commit, state}, name) {
            if (!name) {
                return;
            }
            let isFavorite = state.favorites.indexOf(name) !== -1;

            if (isFavorite) {
                commit("remove_menu_form_favorites", name);
            } else {
                commit("set_menu_to_favorites", name);
            }
        },
    },
    getters: {
        getFavorites(state) {
            return state.favorites;
        },

        getHome(state) {
            return state.home;
        },

        getSections(state) {
            return state.sections;
        },

        getSection: (state) => (section) => {
            return state.sections[section] ? state.sections[section] : null;
        },

        getRoute: (state) => (name) => {
            return state.routes[name] ? state.routes[name] : null;
        },

        getRoutes(state) {
            return state.routes;
        },

        getMenuItems: (state) => (section = null, item = null) => {
            if (!state.sections || !state.items || (section === null && item === null)) {
                return null;
            }

            let items = {};

            if (item === null) {
                // root menus
                let keys;
                let searchAll;

                if (section === 'system/favorites') {
                    keys = state.favorites;
                    searchAll = true;
                } else {
                    keys = Object.keys(state.items);
                    searchAll = false;
                }

                keys.map(function (key) {
                    if (searchAll || !!state.items[key]['section'] && state.items[key]['section'] === section && !state.items[key]['parent']) {
                        items[key] = Object.assign({}, state.items[key]);
                    }
                });
            } else {
                // children menus
                Object.keys(state.items).map(function (key) {
                    if (!!state.items[key]['parent'] && state.items[key]['parent'] === item) {
                        items[key] = Object.assign({}, state.items[key]);
                    }
                });
            }

            return items;
        },

        getMenuItem: (state) => (name) => {
            return !!state.items[name] ? state.items[name] : null;
        },

        isMenuFavorite: (state) => (name) => {
            return state.favorites.indexOf(name) !== -1;
        },
    },
}