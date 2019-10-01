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

                <!-- Comments -->
                <div is="opx-form-field-comments-comment" v-for="(comment, key) in getComments()"
                     :key="key"
                     :id="comment['id']"
                     :comments="comments"
                     :selectedId="selectedId"
                     :showCommentator="showCommentator"
                     @reply-to="replyTo"
                ></div>
                <!-- End of comments -->

                <!-- Comment add form -->
                <div class="opx-comments__add">
                    <div class="opx-comments__add-to" v-html="getReplyTitle()" @click="addToClick"></div>
                    <textarea class="opx-form-field-text"
                              v-model="commentText"
                              :disabled="!canEdit()"
                    ></textarea>
                    <div class="opx-comments__add-buttons">
                        <opx-button :class="'success'" :caption="$trans('actions.send')"
                                    @click="addComment"></opx-button>
                    </div>
                </div>
                <!-- End of comment add form -->
            </div>
        </div>
    </div>
</template>

<script>
    import client from "../../../api-client/api-client";
    import ParseDates from "../../_mixins/parse-dates";
    import OpxFormAbstractField from "./opx-form-abstract-field";

    export default {
        mixins: [OpxFormAbstractField, ParseDates],

        data: () => ({
            comments: [],
            commentText: '',
            selectedId: null,
            showCommentator: true,
            format: 'dd MMMM yyyy, HH:mm',
        }),

        created() {
            client.get(this.controllerBase + 'comments?id=' + this.id)
                .then(response => {
                    this.comments = response.data;
                })
                .catch(error => {
                    this.$toast.error(error.message);
                })
        },

        methods: {
            getComments() {
                return this.comments.filter(item => item['comment']['parent'] === 0);
            },

            addComment() {
                client.post(this.controllerBase + 'comments', {
                    id: this.id,
                    reply_to: this.selectedId,
                    comment_text: this.commentText,
                })
                    .then(response => {
                        // update comments
                        this.comments = response.data;
                    })
                    .catch(error => {
                        // handle error
                    })
            },

            getReplyTitle() {
                if (this.selectedId === null) {
                    return '<span class="opx-comments__comment-reply">' + this.$trans('actions.comment') + '</span>';
                }

                let comment = null;

                this.comments.some(item => {
                    if (item['id'] === this.selectedId) {
                        comment = item;
                        return true;
                    }
                    return false;
                });

                let title = '<span class="opx-comments__comment-reply">' + this.$trans('actions.reply_to') + ': </span>';

                if (comment.commentator.id !== null) {
                    title += '<span class="opx-comments__comment-commentator">' + comment.commentator.name +
                        ' <span class="opx-comments__comment-commentator-hint">[' + comment.commentator.id + ']</span> </span>';
                }
                const date = this.parseDate(comment.date);
                title += '<span class="opx-comments__comment-date">' + date.toFormat(this.format) + ' </span>';

                title += '<span class="opx-comments__add-to-clear"></span>';

                return title;
            },

            replyTo(id) {
                this.selectedId = id;
            },

            addToClick(e) {
                if(e.target.classList.contains('opx-comments__add-to-clear')) {
                    this.selectedId = null;
                }
            },
        }
    }
</script>