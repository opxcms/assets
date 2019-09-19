<template>
    <svg class="opx-icon" version="1.1" xmlns="http://www.w3.org/2000/svg"
         v-bind:x="x"
         v-bind:y="y"
         v-bind:viewBox="viewBox"
         v-bind:style="style"
         xml:space="preserve">
    </svg>
</template>

<script>
    import client from "../../api-client/api-client";

    export default {
        props: {
            icon: String,
        },
        data() {
            return {
                x: '0px',
                y: '0px',
                viewBox: '0 0 100 100',
                style: 'enable-background:new 0 0 100 100',
            }
        },
        created() {
            client.get(this.icon)
                .then(response => {
                    if (response.status === 200) {
                        let el = document.createElement("span");
                        el.innerHTML = response.data;
                        const svg = el.getElementsByTagName("svg")[0];
                        this.x = svg.getAttribute('x');
                        this.y = svg.getAttribute('y');
                        this.viewBox = svg.getAttribute('viewBox');
                        this.style = svg.getAttribute('style');
                        this.$el.innerHTML = svg.innerHTML;
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }
</script>