<template>
    <div class="opx-quick-nav" :class="{'opx-quick-nav__expanded': dropped}" tabindex="0" @blur="blur">

        <!-- current selected -->
        <div class="opx-quick-nav__head" @click="toggle">
            <span class="opx-quick-nav__value" v-html="getCurrentValueLabel()"></span>
            <opx-icon :icon="'arrow-bottom'" :class="['opx-quick-nav__head-button', {'opx-quick-nav__head-button-expanded': dropped}]"></opx-icon>
            <opx-icon :icon="'close'" :class="['opx-quick-nav__head-button', 'opx-quick-nav__head-button-close']" v-if="current !== null" @click="reset"></opx-icon>
        </div>
        <!-- end of current selected -->

        <div class="opx-quick-nav__list" v-if="dropped">
            <opx-scroll-box :mode="'vertical'">
                <!-- no parent item -->
                <span class="opx-quick-nav__list-value"
                      :class="{'opx-quick-nav__list-value-active': String(current) === '0'}"
                      @click="setNewValue(0)"
                >{{ $trans('forms.no_parent') }}</span>
                <!-- end of no parent item -->
                <div class="opx-quick-nav__list-container">
                    <opx-list-quick-nav-item
                            v-for="item in getList()"
                            :key="item['id']"
                            :item="item"
                            :options="nav"
                            :selected_id="current"
                            :level="0"
                            @selected="setNewValue"
                    ></opx-list-quick-nav-item>
                </div>
            </opx-scroll-box>
        </div>
    </div>
</template>

<script>

    export default {
        props: {
            nav: {
                type: Array,
                default: () => [],
            },
            current: {
                type: [String, Number],
                default: null,
            },
        },

        data() {
            return {
                dropped: false,
                edit: false,
            }
        },

        methods: {

            getCurrentValueLabel() {
                const value = this.current;

                if (String(value) === "" || value === null) {
                    return "";
                }

                if (String(value) === "0") {
                    return this.$trans('forms.no_parent');
                }

                const item = this.nav.filter(itm => String(itm['id']) === String(value))[0];

                return this.$trans(item['caption']) + '<span class="opx-quick-nav__value-id">' + item['id'] + '</span>';
            },

            getList() {
                const list = this.nav;

                return list.filter(item => !item['parent_id']);
            },

            setNewValue(value) {
                this.$emit('change-scope', value);
                this.dropped = false;
            },

            toggle() {
                this.dropped = !this.dropped;
                if (this.dropped) {
                    this.$nextTick(() => {
                        const el = this.$el.querySelector('.opx-quick-nav__list');
                        const height = el.clientHeight + 1;
                        el.style.height = height + 'px';
                        el.parentElement.focus();
                    });
                }
            },

            blur() {
                this.dropped = false;
            },

            reset(e) {
                e.stopPropagation();
                this.$emit('change-scope', null);
            }
        }
    }
</script>