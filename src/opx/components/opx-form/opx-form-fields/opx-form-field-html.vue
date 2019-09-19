<template>
    <div v-if="canView()" class="opx-form-field"
         :class="{
            'opx-form-field__invalid': !isValid(),
            'opx-form-field__modified': isModified(),
            'opx-form-field__required': isRequired()
         }"
    >
        <div class="opx-form-field__caption">
            <span>{{ getCaption() }}</span>
            <span class="opx-form-field__caption-hint" v-if="hints">[{{ getName() }}]</span>
        </div>
        <span class="opx-form-field__info" v-if="getInfo()">{{ getInfo() }}</span>
        <div class="opx-form-field__value">
            <div type="text" class="opx-form-field-editor"
                 :class="{
                   'opx-form-field-text__required': isRequired(),
                   'opx-form-field-text__modified': isModified(),
                   'opx-form-field-text__invalid': !isValid(),
                }">
            </div>
        </div>
        <div class="opx-form-field__errors" v-if="!isValid()">
            <span class="opx-form-field__errors-text" v-for="message in getErrors()">{{ message }}</span>
        </div>
    </div>
</template>

<script>

    import OpxFormAbstractField from "./opx-form-abstract-field";
    import CodeMirror from "codemirror/lib/codemirror";
    import 'codemirror/mode/htmlmixed/htmlmixed';
    import 'codemirror/addon/edit/matchbrackets';
    import 'codemirror/addon/edit/matchtags';
    import 'codemirror/addon/edit/closebrackets';
    import './helpers/closetag';
    import 'codemirror/addon/selection/active-line';

    export default {
        mixins: [OpxFormAbstractField],

        watch: {
            'value': function(value) {
                if(!!this.codemirror && !this.codemirror_set_value) {
                    this.codemirror.doc.setValue(!!value ? value : '');
                }

                this.codemirror_set_value = false;
            }
        },

        mounted() {
            this.codemirror = CodeMirror(this.$el.querySelector('.opx-form-field-editor'), {
                value: !!this.getValue() ? this.getValue() : '',
                mode: 'htmlmixed',
                lineNumbers: true,
                theme: 'eclipse',
                lineWiseCopyCut: true,
                autoCloseTags: true,
                matchBrackets: true,
                matchTags: {bothTags: true},
                autoCloseBrackets: true,
                lint: true,
                styleActiveLine: true,
                lineWrapping: true,
            });

            this.codemirror.on('change', () => {
                this.codemirror_set_value = true;
                this.setValue(this.codemirror.doc.getValue());
            });
        },

        methods: {}
    }
</script>