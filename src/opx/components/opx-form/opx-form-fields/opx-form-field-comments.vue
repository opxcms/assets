<template>
    <div v-if="canView()" class="opx-form-field">
        <div class="opx-form-field__caption">
            <span>{{ getCaption() }}</span>
            <span class="opx-form-field__caption-hint" v-if="hints">[{{ getName() }}]</span>
        </div>
        <span class="opx-form-field__info" v-if="getInfo()">{{ getInfo() }}</span>
        <div class="opx-form-field__value">
            <div class="opx-comments">
                <!-- Comments toolbar -->
                <div class="opx-comments__toolbar">
                    <!-- refresh -->
                    <!-- change order -->
                </div>
                <!-- End of comments toolbar -->

            </div>

            <!-- Comments -->
            <!-- End of comments -->

            <!-- Comment add form -->
            <div class="opx-comments__add">
                <div class="opx-comments__add-to">

                </div>
                <textarea class="opx-form-field-text"
                          v-model="commentText"
                          :disabled="!canEdit()"
                ></textarea>
                <div class="opx-comments__add-buttons">
                    <opx-button :class="'success'" :caption="$trans('actions.add')" @click="addComment"></opx-button>
                </div>
            </div>
            <!-- End of comment add form -->
        </div>
    </div>
</template>

<script>
    import client from "../../../api-client/api-client";
    import OpxFormAbstractField from "./opx-form-abstract-field";

    export default {
        mixins: [OpxFormAbstractField],
        data: () => ({
            comments: [],
            commentText: '',
            replyTo: null,
        }),
        methods: {
            addComment() {
                client.post(this.controllerBase + 'comments', {
                    id: this.id,
                    reply_to: this.replyTo,
                    comment_text: this.commentText,
                })
                    .then(response => {
                        // update comments
                    })
                    .catch(error => {
                        // handle error
                    })
            },
        }
    }
</script>