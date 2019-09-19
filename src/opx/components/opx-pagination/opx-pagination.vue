<template>
    <div class="opx-pagination" v-if="pagination.last > 1">
        <span class="opx-pagination__info">
            <span
                    v-if="pagination.last > 1 && pagination.current > 1"
                    @click="setPage(1)"
            >
            <opx-icon :icon="'arrow-left'"></opx-icon>
            </span>
            <span> {{ pagination.from }} - {{ pagination.to }} / {{ pagination.total }} </span>
            <span
                    v-if="pagination.last > 1 && pagination.current !== pagination.last"
                    @click="setPage(pagination.last)"
            >
            <opx-icon :icon="'arrow-right'"></opx-icon>
            </span>
        </span>
        <div class="opx-pagination__links">
            <span class="opx-pagination__links-item"
                  :class="{'disabled': Number(pagination.current) === 1}"
                  @click="setPage(pagination.current - 1)"
            ><opx-icon :icon="'arrow-left'"></opx-icon></span>
            <span class="opx-pagination__links-item" v-for="page in pages()"
                  :key="page"
                  :class="{'active': page === pagination.current}"
                  @click="setPage(page)"
            >{{ page }}</span>
            <span class="opx-pagination__links-item"
                  :class="{'disabled': pagination.current === pagination.last}"
                  @click="setPage(pagination.current + 1)"
            ><opx-icon :icon="'arrow-right'"></opx-icon></span>
        </div>
    </div>
</template>

<script>
    export default {
        name: "opx-pagination",
        props: {
            pagination: Object,
        },
        methods: {
            pages() {
                let pages = [];
                if (this.pagination.last <= 10) {
                    for (let i = 1; i <= this.pagination.last; i++) {
                        pages.push(i);
                    }
                } else {
                    let start = this.pagination.current - 4;
                    if (start < 1) {
                        start = 1;
                    }
                    if (start + 9 > this.pagination.last) {
                        start = this.pagination.last - 8;
                    }
                    for (let i = start; i <= start + 8; i++) {
                        pages.push(i);
                    }
                }
                return pages;
            },
            setPage(page) {
                if (page < 1 || page > this.pagination.last || page === this.pagination.current) {
                    return;
                }
                this.$emit('update', 'page', page);
            }
        }
    }
</script>