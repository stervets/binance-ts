export default {
    name: 'Dropdown',
    props: ['state', 'position'],

    setup() {
        return {
            Coins
        };
    },

    computed: {
        sortedCoins(this: any) {
            const items = this.state.items;
            return Object.keys(items).sort((keyA, keyB) => items[keyA] > items[keyB] ? 1 : -1);
        }
    },

    async mounted(this: any) {
        $('body').on('mouseup', this.closeDropdown);
    },

    unmounted(this: any) {
        $('body').off('mouseup', this.closeDropdown);
    },

    methods: {
        closeDropdown(this: any) {
            this.state.showDropdown = false;
        },

        select(this: any, value: string) {
            this.$emit('select', value);
        }
    }
};
