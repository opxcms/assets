<template>
    <div class="opx-form-field-audio__audio"
         @dragstart="dragstart"
         @dragenter="dragenter"
         @dragover="dragover"
         @drop="drop"
         @dragend="dragend"
    >
        <span class="opx-form-field-audio__audio-button" @click="play" v-if="!playing" title="Play">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path class="opx-form-field-audio__audio-button-icon"
                      d="M15,10.001c0,0.299-0.305,0.514-0.305,0.514l-8.561,5.303C5.51,16.227,5,15.924,5,15.149V4.852c0-0.777,0.51-1.078,1.135-0.67l8.561,5.305C14.695,9.487,15,9.702,15,10.001z"/>
            </svg>
        </span>
        <span class="opx-form-field-audio__audio-button" @click="pause" v-if="playing" title="Pause">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path class="opx-form-field-audio__audio-button-icon"
                      d="M15,3h-2c-0.553,0-1,0.048-1,0.6v12.8c0,0.552,0.447,0.6,1,0.6h2c0.553,0,1-0.048,1-0.6V3.6C16,3.048,15.553,3,15,3z M7,3H5C4.447,3,4,3.048,4,3.6v12.8C4,16.952,4.447,17,5,17h2c0.553,0,1-0.048,1-0.6V3.6C8,3.048,7.553,3,7,3z"/>
            </svg>
        </span>
        <span class="opx-form-field-audio__audio-button" @click="stop" title="Stop">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path class="opx-form-field-audio__audio-button-icon"
                      d="M16,4.995v9.808C16,15.464,15.464,16,14.804,16H4.997C4.446,16,4,15.554,4,15.003V5.196C4,4.536,4.536,4,5.196,4h9.808C15.554,4,16,4.446,16,4.995z"/>-->
            </svg>
        </span>
        <span class="opx-form-field-audio__audio-seek" @click="seek">
            <div class="opx-form-field-audio__audio-seek-progress">
                <div class="opx-form-field-audio__audio-seek-progress-complete"
                     :style="{ width: this.percentComplete + '%' }"></div>
            </div>
            <div class="opx-form-field-audio__audio-seek-time">{{ currentTime }} / {{ durationTime }}</div>
        </span>

        <audio :src="getFileName()" preload="auto" style="display:none;"></audio>

        <a :href="getDownloadUrl()" class="opx-form-field-file__file-name">{{ audio['name'] }}</a>

        <div class="opx-form-field-audio__audio-download" v-if="!audio['loading']"></div>
        <div class="opx-form-field-audio__audio-remove" v-if="!audio['loading'] && !audio['uploading']"
             @click.stop="$emit('discard', id)"></div>
        <div class="opx-progress" v-show="audio['uploading']">
            <div class="opx-progress__progress" :style="{width: audio['progress'] + '%'}"></div>
        </div>
    </div>
</template>

<script>

    import OpxFormAbstractField from "./opx-form-abstract-field";

    export default {
        mixins: [OpxFormAbstractField],

        props: {
            id: Number,
            audio: Object,
            nowPlaying: Number,
        },

        data: () => ({
            player: null,
            playing: false,
            currentSeconds: 0,
            durationSeconds: 0,
            loaded: false,

            showVolume: false,
            previousVolume: 35,
            volume: 100
        }),

        computed: {
            currentTime() {
                return this.convertTimeHHMMSS(this.currentSeconds);
            },
            durationTime() {
                return this.convertTimeHHMMSS(this.durationSeconds);
            },
            percentComplete() {
                return parseInt(this.currentSeconds / this.durationSeconds * 100);
            },
            muted() {
                return this.volume / 100 === 0;
            }
        },

        watch: {
            nowPlaying(id) {
                if (id !== this.id) {
                    this.pause();
                }
            }
        },

        mounted() {
            this.player = this.$el.querySelectorAll('audio')[0];
            this.player.addEventListener('timeupdate', this.update);
            this.player.addEventListener('loadeddata', this.load);
            this.player.addEventListener('pause', () => {
                this.playing = false;
            });
            this.player.addEventListener('play', () => {
                this.playing = true;
            });
            this.player.addEventListener('ended', () => {
                this.playing = false;
            });
        },

        methods: {
            play() {
                this.$emit('play', this.id);
                this.playing = true;
                this.player.play();
            },

            pause() {
                this.playing = false;
                this.player.pause();
            },

            stop() {
                this.playing = false;
                this.player.pause();
                this.player.currentTime = 0;
            },

            seek(event) {
                // if (!this.playing || event.target.tagName === 'SPAN') return;
                const el = event.target.getBoundingClientRect();
                const seekPos = (event.clientX - el.left) / el.width;
                this.player.currentTime = parseInt(this.player.duration * seekPos);
            },

            load() {
                if (this.player.readyState >= 2) {
                    this.loaded = true;
                    this.durationSeconds = parseInt(this.player.duration);
                } else {
                    throw new Error('Failed to load sound file.');
                }
            },

            update() {
                this.currentSeconds = parseInt(this.player.currentTime);
            },

            convertTimeHHMMSS(value) {
                let hhmmss = new Date(value * 1000).toISOString().substr(11, 8);
                return hhmmss.indexOf("00:") === 0 ? hhmmss.substr(3) : hhmmss;
            },

            getFileName() {
                return this.audio['src'];
            },

            getDownloadUrl() {
                return this.audio['src'] + '?name=' + this.audio['name'];
            },

            dragstart(event) {
                this.stop();
                this.$emit('ondragstart', event, this.id);
            },

            dragenter(event) {
                this.stop();
                this.$emit('ondragenter', event, this.id);
            },

            dragover(event) {
                event.preventDefault();
                return false;
            },

            drop(event) {
                this.$emit('ondrop', event, this.id);
            },

            dragend(event) {
                this.$emit('ondragend', event, this.id);
            },
        }
    }
</script>