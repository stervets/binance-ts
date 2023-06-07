export default {
    methods: {
        async alignWidgets(this: any) {
            await this.$refs.dash.alignWidgets();
            this.toggleAlignButton(true);
        },

        onWidgetsLoaded(this: any, widgets: any) {
            for (let id in widgets) {
                let widget = widgets[id];
                widget.type === 'binance' &&
                this.$refs.panel.moveToHidden(widget.data?.coin);
            }
        },

        onAddNewWidget(this: any, value: any) {
            this.$refs.dash.addNewWidget(value);
        },

        onDeleteWidget(this: any, widget: any) {
            this.$refs.panel.moveToShown(widget.data.coin);
        },

        toggleAlignButton(this: any, isAlignButtonDisabled: boolean) {
            this.$refs.panel.isAlignButtonDisabled = isAlignButtonDisabled;
        }
    }
};
