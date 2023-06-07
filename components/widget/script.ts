import {MIN_WIDGET_HEIGHT, MIN_WIDGET_WIDTH} from '~/composables/const';
import WidgetBinance from './binance/index.vue';
import {useDashboardStore} from "~/composables/dashboardStore";

export default {
    props: ['widget'],

    setup() {
        return {
            dashboardStore: useDashboardStore(),
            title: ref(''),
            movingWidget: ref({}),
            isClosing: ref(false),
            isOpened: ref(false),
            movingTip: ref(''),
            resizing: ref(false),
            content: WidgetBinance
        };
    },

    computed: {
        left(this: any) {
            return this.getPxCoordinate('left', 'x');
        },

        top(this: any) {
            return this.getPxCoordinate('top', 'y');
        },

        width(this: any) {
            return this.getPxCoordinate('width', 'w');
        },

        height(this: any) {
            return this.getPxCoordinate('height', 'h');
        }
    },

    async mounted(this: any) {
        _.extend(this, {
            $$el: $(this.$el),
            $title: $(this.$refs.widgetTitle),
            $resize: $(this.$refs.resize),
            $tip: $(this.$refs.tip),
            $body: $('body')
        });

        this.$title.on('mousedown', (e: any) => this.onMouseDown(e, this.onTitleMouseMove));
        this.$resize.on('mousedown', (e: any) => this.onMouseDown(e, this.onResizeMouseMove));

        await timeout(300);
        this.isOpened = true;
    },

    methods: {
        getPxCoordinate(this: any, propCSS: string, gridCoord: string) {
            let res = this.movingWidget[propCSS] == null ?
                this.dashboardStore.gridToPx(this.movingWidget[gridCoord] == null ?
                    this.widget[gridCoord] :
                    this.movingWidget[gridCoord]) :
                this.movingWidget[propCSS];

            return res;
        },

        onMouseDown(this: any, e: any, onMouseMove: Function) {
            this.resizing = onMouseMove === this.onResizeMouseMove;
            let tipLeft = e.offsetX - 30;
            tipLeft < 0 && (tipLeft = 0);
            !this.resizing && this.$tip.css('left', tipLeft);

            _.extend(this.movingWidget, {
                    startX: e.pageX,
                    startY: e.pageY,
                    startLeft: this.left,
                    startTop: this.top,
                    startWidth: this.width,
                    startHeight: this.height,
                    maxLeft: this.dashboardStore.tableWidth - this.width,
                    maxWidth: this.dashboardStore.tableWidth - this.left + 2,
                    minWidth: MIN_WIDGET_WIDTH * this.dashboardStore.cellWidth,
                    minHeight: MIN_WIDGET_HEIGHT * this.dashboardStore.cellWidth
                },
                _.pick(this.widget, 'id', 'x', 'y', 'w', 'h'),
                _.pick(this, 'left', 'top', 'width', 'height'));

            this.$body.on('mousemove', (this.onMouseMove = onMouseMove));
            this.$body.on('mouseup', this.onMouseUp);
            this.dashboardStore.showGrid = true;
        },

        onTitleMouseMove(this: any, e: any) {
            this.dashboardStore.widgetIsMoving = true;
            let left = e.pageX - this.movingWidget.startX + this.movingWidget.startLeft,
                top = e.pageY - this.movingWidget.startY + this.movingWidget.startTop;

            (left < 0) && (left = 0);
            (top < 0) && (top = 0);
            (left > this.movingWidget.maxLeft) && (left = this.movingWidget.maxLeft);

            let x = this.dashboardStore.pxToGrid(left),
                y = this.dashboardStore.pxToGrid(top),
                getCollision = !(x === this.movingWidget.x && y === this.movingWidget.y);

            _.extend(this.movingWidget, {x, y, left, top});
            this.movingTip = `${x}:${y}`;
            getCollision && this.$emit('getCollision', this.movingWidget);
        },

        onResizeMouseMove(this: any, e: any) {
            this.dashboardStore.widgetIsMoving = true;
            let width = e.pageX - this.movingWidget.startX + this.movingWidget.startWidth,
                height = e.pageY - this.movingWidget.startY + this.movingWidget.startHeight;

            (width < this.movingWidget.minWidth) && (width = this.movingWidget.minWidth);
            (height < this.movingWidget.minHeight) && (height = this.movingWidget.minHeight);
            (width > this.movingWidget.maxWidth) && (width = this.movingWidget.maxWidth);

            let w = this.dashboardStore.pxToGrid(width),
                h = this.dashboardStore.pxToGrid(height),
                getCollision = !(w === this.movingWidget.w && h === this.movingWidget.h);

            _.extend(this.movingWidget, {w, h, width, height});
            this.movingTip = `${w}x${h}`;
            getCollision && this.$emit('getCollision', this.movingWidget);
        },

        onMouseUp(this: any) {
            this.dashboardStore.widgetIsMoving = false;
            this.$body.off('mousemove', this.onMouseMove);
            this.$body.off('mouseup', this.onMouseUp);
            this.dashboardStore.showGrid = false;
            this.$emit('saveWidgets');
            this.forceMoveToOwnPlace();
        },

        resize(this: any) {
            this.$refs.widgetContent &&
            this.$refs.widgetContent.resize &&
            this.$refs.widgetContent.resize();
        },

        async forceMoveToOwnPlace(this: any) {
            this.movingWidget = _.pick(this.widget, 'x', 'y', 'w', 'h');
            await nextTick();
            this.movingWidget = {};
            await timeout(300);
            this.resize();
            this.resizing = false;
        },

        async onClose(this: any) {
            this.isClosing = true;
            await timeout(300);
            this.$emit('deleteWidget', this.widget.id);
        }
    }
};
