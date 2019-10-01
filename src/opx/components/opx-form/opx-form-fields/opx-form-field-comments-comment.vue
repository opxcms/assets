<template>
    <div class="opx-comments__comment">
        <div class="opx-comments__comment-header" @click="replyTo(id)"
             :class="{'opx-comments__comment-selected': id === selectedId}">
            <span class="opx-comments__comment-commentator" v-if="commentator.id">{{ commentator.name }} <span
                    class="opx-comments__comment-commentator-hint">[{{ commentator.id }}]</span></span>
        </div>
        <div class="opx-comments__comment-text" :class="{'opx-comments__comment-selected': id === selectedId}"
             v-html="comment.text"></div>
        <div class="opx-comments__comment-footer" @click="replyTo(id)"
             :class="{'opx-comments__comment-selected': id === selectedId}">
            <span class="opx-comments__comment-date">{{ date }}</span>
            <span class="opx-comments__comment-reply">({{ $trans('actions.reply_to') }})</span>
        </div>
        <div class="opx-comments__comment-replies">
            <div is="opx-form-field-comments-comment" v-for="(comment, key) in getComments()"
                 :key="key"
                 :id="comment['id']"
                 :comments="comments"
                 :selectedId="selectedId"
                 :showCommentator="showCommentator"
                 @reply-to="replyTo"
            ></div>
        </div>
    </div>
</template>

<script>
    import ParseDates from "../../_mixins/parse-dates";

    export default {
        mixins: [ParseDates],

        props: {
            comments: Array,
            id: Number,
            selectedId: {
                type: Number,
                default: 0,
            },
            showCommentator: {
                type: Boolean,
                default: true,
            },
        },

        data: () => ({
            comment: {
                text: null,
            },
            commentator: {
                id: null,
                name: null,
            },
            date: null,
            format: 'dd MMMM yyyy, HH:mm',
        }),

        created() {
            this.comments.some(item => {
                if (item['id'] === this.id) {
                    let text = item.comment['text'].split(/(?:\r\n|\r|\n)/g);
                    this.comment.text = '<p>' + text.join('</p><p>') + '</p>';
                    this.commentator.id = item.commentator['id'];
                    this.commentator.name = item.commentator['name'];
                    const date = this.parseDate(item.date);
                    this.date = date.toFormat(this.format);
                    return true;
                }
                return false;
            });
        },

        methods: {
            getComments() {
                return this.comments.filter(item => item['comment']['parent'] === this.id);
            },

            replyTo(id) {
                this.$emit('reply-to', id);
            },
        },
    }
</script>