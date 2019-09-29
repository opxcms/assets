<script>
    export default {
        props: {
            original: Object,
            id: {
                type: String,
                default: null,
            },
            value: {
                type: [String, Object, Array, Number, Boolean],
                default: null,
            },
            modified: {
                type: Boolean,
                default: false,
            },
            valid: {
                type: Boolean,
                default: true,
            },
            hints: {
                type: Boolean,
                default: true,
            },
            errors: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            saveUrl: {
                type: String,
                default: '',
            },
            controllerBase: {
                type: String,
                default: null,
            },
            globalLock: {
                type: Boolean,
                default: false,
            },
        },

        data() {
            return {
                locks: 0,
            }
        },

        methods: {
            canEdit() {
                return this.original['can_edit'] && !this.globalLock;
            },

            canView() {
                return this.original['can_view'];
            },

            getName() {
                return this.original['name'];
            },

            getDefault() {
                return (this.original['default']) ? this.original['default'] : null;
            },

            getOptions() {
                return (this.original['options']) ? this.original['options'] : {};
            },

            getCaption() {
                return (this.original['caption']) ? this.$trans(this.original['caption']) : this.name();
            },

            getErrors() {
                return this.errors;
            },

            getInfo() {
                return !!this.original['info'] ? this.$trans(this.original['info']) : null;
            },

            isRequired() {
                return (!!this.original['validation'] && (this.original['validation'].search(/.*(required(\||$|\Z))/gm) !== -1))
            },

            isValid() {
                return this.valid;
            },

            isModified() {
                return this.modified;
            },

            getValue() {
                return this.value;
            },

            setValue(value) {
                this.$emit('update', this.getName(), value);

                if (!!this.original['needs_reload']) {
                    this.$emit('call-reload', this.getName());
                }

                return value;
            },

            lock() {
                this.locks += 1;
                if (this.locks === 1) this.$emit('lock', true);
            },

            unlock() {
                this.locks -= 1;
                if (this.locks === 0) this.$emit('lock', false);
            },
        },
    }
</script>