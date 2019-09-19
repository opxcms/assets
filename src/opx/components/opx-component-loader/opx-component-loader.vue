<template>
    <div class="opx-overlay" v-if="isPopup">
        <div class="opx-overlay__close" @click="close"></div>
        <div class="opx-overlay__container">
            <component
                    :is="component"
                    :original="original"
                    @can-close="setCanClose"
                    @close="close"
            ></component>
        </div>
    </div>
    <component v-else
               :is="component"
               :original="original"
               @can-close="setCanClose"
               @close="close"
    ></component>
</template>

<script>
    import client from "../../api-client/api-client";
    import Vue from 'vue';

    export default {
        props: {
            url: {
                type: String,
                default: null,
            },
            popup: {
                type: Boolean,
                default: false,
            },
            params: {
                type: Object,
                default: () => {
                    return {}
                },
            }
        },
        data() {
            return {
                component: null,
                original: {},
                canBeClosed: true,
                isPopup: false,
                loader: '',
            }
        },
        created() {
            if (this.url !== null) {
                this.loader = this.url;
                this.isPopup = this.popup;
            } else {
                this.loader = this.$route.meta.loader;
                this.isPopup = typeof this.$route.meta.popup === 'undefined' ? false : this.$route.meta.popup;

                const params = [];

                Object.keys(this.$route.query).map(param => {
                    params.push(param + '=' + this.$route.query[param]);
                });

                Object.keys(this.$route.params).map(param => {
                    params.push(param + '=' + this.$route.params[param]);
                });

                if (params.length > 0) {
                    this.loader += '?' + params.join('&');
                }
            }

            this.fetch();
        },
        methods: {
            fetch() {
                client.get(this.loader)
                    .then((response) => {
                        this.original = response.data['data'];
                        this.component = Vue.component(response.data['component']);
                    })
                    .catch((error) => {
                        this.$toast.error(error.response.data.message);
                    });
            },
            setCanClose(canBeClosed) {
                this.canBeClosed = canBeClosed;
            },
            close() {
                this.$router.back();
            },
        },
        deactivated() {
            if (this.canBeClosed) {
                this.keepAlive = false;
                this.$destroy();
            }
        },
    }
</script>