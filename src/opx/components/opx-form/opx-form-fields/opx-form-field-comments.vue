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
                              v-model="valueModel"
                              :disabled="!canEdit()"
                    ></textarea>
                    <div class="hidden-div"
                         style="display: none; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; padding-top: 1.2rem; position: absolute; top: 0;"></div>
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
            height: null,
        }),

        computed: {
            valueModel: {
                get: function () {
                    return this.commentText;
                },
                set: function (value) {
                    this.commentText = value;
                    this.resize(value);
                },
            },
        },

        created() {
            client.get(this.controllerBase + 'comments?id=' + this.id)
                .then(response => {
                    this.comments = response.data;
                })
                .catch(error => {
                    this.$toast.error(error.message);
                });
        },

        mounted() {
            this.initResizer();
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
                        this.commentText = '';
                        this.selectedId = null;
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
                if (e.target.classList.contains('opx-comments__add-to-clear')) {
                    this.selectedId = null;
                }
            },

            initResizer() {
                const textarea = this.$el.querySelector('textarea');
                const hidden = this.$el.querySelector('.hidden-div');

                // Set original-height, if none
                if (this.height === null) {
                    this.height = textarea.clientHeight;
                }

                // Set font properties of hiddenDiv
                const style = window.getComputedStyle(textarea);

                let fontFamily = style.fontFamily;
                let fontSize = style.fontSize;
                let fontWeight = style.fontWeight;
                let lineHeight = style.lineHeight;
                let letterSpacing = style.letterSpacing;
                let padding = style.padding;

                if (fontSize) {
                    hidden.style.fontSize = fontSize;
                }
                if (fontFamily) {
                    hidden.style.fontFamily = fontFamily;
                }
                if (fontWeight) {
                    hidden.style.fontWeight = fontWeight;
                }
                if (lineHeight) {
                    hidden.style.lineHeight = lineHeight;
                }
                if (letterSpacing) {
                    hidden.style.letterSpacing = letterSpacing;
                }
                if (padding) {
                    hidden.style.padding = padding;
                }

                hidden.style.width = textarea.clientWidth + 'px';
                hidden.innerHTML = this.valueModel + '\n\n';
            },

            resize(value) {
                const textarea = this.$el.querySelector('textarea');
                const hidden = this.$el.querySelector('.hidden-div');

                hidden.innerHTML = value + '\n\n';

                // Resize if the new height is greater than the original height of the textarea
                hidden.style.display = 'block';
                const height = hidden.clientHeight;
                hidden.style.display = 'none';
                if (this.height <= height) {
                    textarea.style.height = height + 'px';
                }
            },
        }
    }
</script>