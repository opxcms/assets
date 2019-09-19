import store from "../store/store";
import router from "../router";
import client from "../api-client/api-client";
import Vue from "vue";

const Navigation = function () {

    this.init = () => {
        return store.dispatch('navigation/initialize');
    };

    this.menu = {
        favoriteEdit: false,
        currentSection: null,
        currentMenu: null,
        getCurrentSection: () => {
            return this.menu.currentSection ? this.menu.currentSection : store.getters['navigation/getHome'];
        },
        setCurrentSection: (section) => {
            let newSection = store.getters['navigation/getSection'](section);
            if (newSection) {
                this.menu.currentSection = section;
                this.menu.currentMenu = null;
                if (newSection.route) {
                    let route = store.getters['navigation/getRoute'](newSection.route);
                    router.push(route.route);
                    return true;
                }
            }
            return false;
        },
        setCurrentMenu: (menu) => {
            let newMenu = store.getters['navigation/getMenuItem'](menu);
            if (newMenu) {
                this.menu.currentMenu = menu;
                if (newMenu.route) {
                    let route = store.getters['navigation/getRoute'](newMenu.route);
                    router.push(route.route);
                    return true;
                }
            }
            return false;
        },
        getSections: () => {
            return store.getters['navigation/getSections'];
        },
        currentSectionHasMenus: () => {
            return Object.keys(store.getters['navigation/getMenuItems'](this.menu.getCurrentSection(), null)).length > 0;
        },
        getCurrentSectionMenu: () => {
            return store.getters['navigation/getMenuItems'](this.menu.getCurrentSection(), null);
        },
        menuItemChildren: (item) => {
            return store.getters['navigation/getMenuItems'](null, item);
        },
        menuItemHasChildren: (item) => {
            return Object.keys(this.menu.menuItemChildren(item)).length > 0;
        },
        switchFavoriteEditMode: () => {
            if (this.menu.favoriteEdit === true) {
                let favorites = store.getters['navigation/getFavorites'];
                client.post("/manage/api/navigation/favorites", favorites)
                    .then(() => {
                        this.menu.favoriteEdit = false;
                    })
            } else {
                this.menu.favoriteEdit = true;
            }
        },
        isItemFavorite: (item) => {
            return store.getters['navigation/isMenuFavorite'](item);
        },
        toggleItemFavorite: (name) => {
            store.dispatch('navigation/switchFavorite', name);
        },
    };

    this.routes = {
        register: () => {
            let routes = store.getters['navigation/getRoutes'];
            let routesCollection = [];
            Object.keys(routes).map(route => {
                routesCollection.push({
                    path: routes[route].route,
                    name: route,
                    component: Vue.component('opx-component-loader'),
                    meta: {
                        loader: routes[route].loader,
                    },
                });
            });
            router.addRoutes(routesCollection);
        },
    };

    return this;
};

export default Navigation;