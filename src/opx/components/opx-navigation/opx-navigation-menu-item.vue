<template>
    <li class="opx-manage-menu__item" :class="{ 'parent': navigation.menu.menuItemHasChildren(name) }">
        <!-- Expand arrow -->
        <div class="opx-manage-menu__item-expand"
             v-if="navigation.menu.menuItemHasChildren(name)"
             @click="expanded = !expanded"
             :class="{ 'expanded': expanded }"
        >
            <opx-icon :icon="'arrow-right'"></opx-icon>
        </div>
        <!-- End of expand arrow -->

        <!-- Caption -->
        <span class="opx-manage-menu__item-caption"
              :class="{ 'active': navigation.menu.currentMenu === name }"
              @click="click"
        ><opx-icon v-if="item.icon" :icon="item.icon"></opx-icon>{{ $trans(item.caption) }}</span>
        <!-- End of caption -->

        <!-- Favorite switch -->
        <div class="opx-manage-menu__item-favorite-switch" v-on:click="navigation.menu.toggleItemFavorite(name)"
             v-show="navigation.menu.favoriteEdit">
            <opx-icon :icon="navigation.menu.isItemFavorite(name) ? 'favorite-filled' : 'favorite-empty'"></opx-icon>
        </div>
        <!-- End of favorite switch -->

        <!-- Submenu -->
        <ul class="opx-manage-menu__submenu" v-if="navigation.menu.menuItemHasChildren(name)" v-show="expanded">
            <opx-navigation-menu-item
                    v-for="(item, key) in navigation.menu.menuItemChildren(name)"
                    :key="key"
                    :name="key"
                    :item="item"
                    :navigation="navigation"
                    @routed="routed"
            ></opx-navigation-menu-item>
        </ul>
        <!-- End of submenu -->
    </li>
</template>

<script>
    export default {
        props: {
            navigation: Object,
            item: Object,
            name: String,
        },
        data() {
            return {
                expanded: false
            }
        },

        methods: {
            click() {
                if (this.navigation.menu.setCurrentMenu(this.name)) {
                    this.$emit('routed');
                } else {
                    this.expanded = !this.expanded;
                }
            },

            routed() {
                this.$emit('routed');
            }
        }
    }
</script>