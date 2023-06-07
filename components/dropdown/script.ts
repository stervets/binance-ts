export default {
    name: 'Dropdown',
    props: ['state', 'position'],

    setup(){
        return {
            Coins
        };
    },

    computed: {
        sortedItems(this: any) {
            return Object.keys(this.state.items).sort();
        }
    },

    async mounted(this: any) {
        console.log(this.state);
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
