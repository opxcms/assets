<template>
    <div class="opx-manage__navigation-wrapper"
         :class="{'opx-manage__navigation-wrapper-no-menu': !navigation.menu.currentSectionHasMenus()}">
        <div class="opx-manage__navigation-container"
             :class="{
                'opx-manage__navigation-container-no-menu': !navigation.menu.currentSectionHasMenus(),
                'opx-manage__navigation-container-expanded': expanded
             }">

            <div class="opx-manage__navigation-container-expand" @click="expand"></div>

            <!-- Navigation header -->
            <div class="opx-manage__navigation-header">

                <!-- Favorites switch -->
                <div class="opx-manage__navigation-header-button"
                     :class="{ active: navigation.menu.favoriteEdit }"
                     @click="navigation.menu.switchFavoriteEditMode"
                >
                    <opx-icon v-bind:icon="'settings'"></opx-icon>
                </div>
                <!-- End of favorites switch -->

                <!-- Logout button -->
                <div class="opx-manage__navigation-header-button" @click="logout">
                    <opx-icon v-bind:icon="'logout'"></opx-icon>
                </div>
                <!-- End of logout button -->
            </div>
            <!-- End of navigation header -->

            <!-- Sections block -->
            <opx-scroll-box
                    :containerClass="'opx-manage__navigation-sections'"
                    :scrollableClass="'opx-manage__navigation-sections-container'"
                    :mode="'vertical'"
            >
                <!-- Sections list -->
                <div class="opx-manage__navigation-sections-item"
                     v-for="(section, name) in navigation.menu.getSections()"
                     :key="name"
                     :class="{ active: name === navigation.menu.getCurrentSection() }"
                     @click="expanded = !navigation.menu.setCurrentSection(name)"
                >
                    <span class="opx-manage__navigation-sections-item-icon"><opx-icon-external
                            :icon="section.icon"></opx-icon-external></span>
                    <div class="opx-manage__navigation-sections-item-caption"><span>{{ $trans(section.caption) }}</span>
                    </div>
                </div>
                <!-- End of sections list -->
            </opx-scroll-box>
            <!-- End of sections block -->

            <!-- Menus -->
            <opx-scroll-box
                    :containerClass="'opx-manage__navigation-menus'"
                    :scrollableClass="'opx-manage__navigation-menus-container'"
                    :mode="'vertical'"
            >
                <ul class="opx-manage-menu">
                    <opx-navigation-menu-item
                            v-for="(item, key) in navigation.menu.getCurrentSectionMenu()"
                            :key="key"
                            :name="key"
                            :item="item"
                            :navigation="navigation"
                            @routed="expanded = false"
                    ></opx-navigation-menu-item>
                </ul>
            </opx-scroll-box>
            <!-- End of menus -->

            <div class="opx-manage__navigation-footer">
            </div>
        </div>
    </div>

</template>

<script>
    import client from "../../api-client/api-client";

    export default {
        name: 'opx-navigation',
        props: {
            navigation: Object,
        },

        data: () => ({
            expanded: false,
        }),

        methods: {
            logout() {
                client.post('/manage/logout', {})
                    .then((response) => {
                        const to = !!response.data['redirect'] ? response.data['redirect'] : '/manage';
                        location.assign(to);
                    })
                    .catch(error => {
                        this.$toast.error('Error logging out.');
                        console.log(error);
                    });
            },

            expand() {
                this.expanded = !this.expanded;
            }
        }
    }
</script>