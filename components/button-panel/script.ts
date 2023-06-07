export default {
    name: 'ButtonPanel',

    setup() {
        return {
            state: ref({
                showDropdown: false,
                items: _.clone(Coins),
                hidden: {}
            }),

            dropdownPosition: {
                left: 0,
                top: 0,
            },

            isAlignButtonDisabled: ref(false)
        };
    },

    computed: {
        isAddButtonDisabled(this: any) {
            return _.isEmpty(this.state.items);
        }
    },

    mounted(this: any) {
        this.$addButton = $(this.$refs.addButton);
    },

    methods: {
        moveToHidden(this: any, value: string) {
            if (this.state.items[value]) {
                this.state.hidden[value] = this.state.items[value];
                delete this.state.items[value];
            }
        },

        moveToShown(this: any, value: string) {
            if (this.state.hidden[value]) {
                this.state.items[value] = this.state.hidden[value];
                delete this.state.hidden[value];
            }
        },

        showDropdown(this: any) {
            let position = this.$addButton.position();
            _.extend(this.dropdownPosition, {
                left: position.left,
                top: position.top + this.$addButton.outerHeight()
            });
            this.state.showDropdown = true;
        },

        addNewWidget(this: any, value: string) {
            if (this.isAddButtonDisabled) return;
            this.moveToHidden(value);
            this.$emit('addNewWidget', value);
        },

        alignWidgets(this: any) {
            this.$emit('alignWidgets');
        }
    }
};
