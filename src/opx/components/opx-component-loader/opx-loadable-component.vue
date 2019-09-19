<script>
    import uuid from 'uuid';

    export default {
        name: "opx-loadable-component",
        props: {
            original: Object,
        },
        data() {
            return {
                uuid: null,
            }
        },
        created() {
            this.uuid = uuid();
        }
    }
</script>