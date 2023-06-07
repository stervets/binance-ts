//@ts-ignore
import DashboardWorker from '#service-worker';

import {initializeApp} from "firebase/app";
import {getDatabase, ref as dbReference, onValue, update, remove} from "firebase/database";
import {genId, timeout} from "~/composables/const";
import {Widget, Widgets} from "~/composables/types";
import {useDashboardStore} from "~/composables/dashboardStore";

const TABLE_WIDTH = 36;
const DEFAULT_COINS = ['btc', 'eth', 'bnb', 'doge', 'ada', 'xrp'];
const FirebaseConfig = {
    databaseURL: "https://binance-8098a-default-rtdb.europe-west1.firebasedatabase.app/"
}

export default {
    setup() {
        const app = initializeApp(FirebaseConfig),
            db = getDatabase(app),
            widgetsRef = dbReference(db, `/${user.id}/widgets`);

        return {
            db,
            worker: null,
            widgetsRef,
            dashboardStore: useDashboardStore(),
            widgets: ref({} as Widgets),
            workerHandlers: {},
            promises: {},
            isInitialLoading: true
        };
    },

    created(this: any) {

    },

    async mounted(this: any) {
        await navigator.serviceWorker.register(DashboardWorker.url, { type: 'module' });

        this.worker = new Worker(DashboardWorker.url);
        this.worker.onmessage = this.onWorkerMessage;
        this.registerWorkerHandler('moveWidgets', this.moveWidgets);

        _.extend(this, {
            $$el: $(this.$el),
            $grid: $(this.$refs.grid),
            $image: $(this.$refs.image)
        });


        $(window).on('resize', this.throttledResize);

        onValue(this.widgetsRef, this.onDbRefValue);

        if (user.firstStart) {
            for (let coin of DEFAULT_COINS) {
                await this.addNewWidget(coin);
            }
        }

        return this.resize();
    },

    unmounted(this: any) {
        this.worker.terminate();
        $(window).off('resize', this.throttledResize);
    },

    methods: {
        getWidgetView(this: any, id: string) {
            return this.$refs[`w_${id}`] && this.$refs[`w_${id}`][0];
        },

        onDbRefValue(this: any, snapshot: any) {
            let widgets = snapshot.val();
            _.extend(this.widgets, widgets);

            if (this.isInitialLoading) {
                this.calculateTableHeight();
                this.correctHeight();
                this.$emit('widgetsLoaded', this.widgets);
                this.alignWidgets(true);
                this.isInitialLoading = false;
            } else {
                Object.keys(this.widgets).forEach((key) => {
                    if (!widgets[key]) {
                        delete this.widgets[key];
                    }
                });
            }
        },

        async resize(this: any): Promise<void> {
            this.dashboardStore.tableWidth = this.$$el.width();
            this.dashboardStore.cellWidth = this.dashboardStore.tableWidth / TABLE_WIDTH;
            this.$grid.css('background-size', this.dashboardStore.cellWidth);

            $(this.$refs.image).height(this.$el.scrollHeight);
            for (let id in this.widgets) {
                let widget = this.getWidgetView(id);
                widget && widget.resize();
                await timeout(100);
            }
        },

        throttledResize: _.throttle(async function (this: any): Promise<void> {
            return this.resize();
        }, 100, {
            leading: false,
            trailing: true
        }),

        correctHeight(this: any) {
            let heightPx = this.dashboardStore.gridToPx(this.tableHeight + 10);
            this.$grid.height(heightPx);
            this.$image.height(heightPx);
        },

        calculateTableHeight(this: any, additionalWidget: Widget) {
            let height = 0,
                checkWidgetBottom = (widget: Widget) => {
                    let widgetBottom = widget.y + widget.h;
                    if (widgetBottom > height) {
                        height = widgetBottom;
                    }
                }

            for (let id in this.widgets) {
                checkWidgetBottom(this.widgets[id]);
            }

            additionalWidget && checkWidgetBottom(additionalWidget);

            return (this.tableHeight = height);
        },

        scrollToWidgetBottom(this: any, widget: Widget, noAdditionalHeight: Boolean = false) {
            let widgetBottom = this.dashboardStore.gridToPx(widget.y + widget.h),
                tableHeight = this.$$el.height();

            if (widgetBottom > tableHeight + this.$el.scrollTop) {
                this.$el.scrollTop = widgetBottom - tableHeight +
                    (noAdditionalHeight ? 0 : this.dashboardStore.gridToPx(4));
            }
        },

        getCollision(this: any, widget: Widget) {
            let widgets = _.clone(this.widgets);
            delete widgets[widget.id];
            this.calculateTableHeight(widget);
            this.correctHeight();

            this.scrollToWidgetBottom(widget, true);
            return this.postMessage({
                com: 'getCollision',
                widget,
                widgets: _.values(widgets),
                tableWidth: TABLE_WIDTH
            });
        },

        async addNewWidget(this: any, value: string, noSaveWidgets: Boolean = false) {
            const w = 12, h = 8,

                widget = {
                    id: genId(),
                    x: Math.round(TABLE_WIDTH / 2 - w / 2),
                    y: -100,
                    w,
                    h,
                    type: value === 'help' ? 'help' : 'binance',
                    data: {
                        coin: value
                    }
                };

            this.widgets[widget.id] = widget;
            await nextTick();
            let view = this.getWidgetView(widget.id);
            view && (view.movingWidget = _.pick(widget, 'id', 'x', 'y'));
            await nextTick();
            await this.postMessage({
                com: 'getFreePlace',
                widget,
                widgets: _.values(this.widgets),
                tableWidth: TABLE_WIDTH
            });
            return this.saveWidgets(noSaveWidgets);
        },

        async alignWidgets(this: any, noSaveWidgets: Boolean = false) {
            this.dashboardStore.widgetIsMoving = true;
            await this.postMessage({
                com: 'arrangeWidgets',
                widgets: _.values(this.widgets),
                tableWidth: TABLE_WIDTH
            });
            setTimeout(() => {
                this.dashboardStore.widgetIsMoving = false;
            }, 500);

            return this.saveWidgets(noSaveWidgets);
        },

        moveWidgets(this: any, data: any) {
            data.widgets && data.widgets.forEach((widget: Widget) => {
                const widgetView = this.getWidgetView(widget.id);
                widgetView && (widgetView.movingWidget = {
                    x: widget.x,
                    y: widget.y
                });
            });
            this.tableHeight = data.tableHeight;
        },

        saveWidgets(this: any, noSaveWidgets: Boolean = false) {
            let data = Object.keys(this.widgets).reduce((res: any, id) => {
                let view = this.getWidgetView(id),
                    originalWidget = _.pick(view.widget, 'x', 'y', 'w', 'h'),
                    movingWidget = _.pick(view.movingWidget, 'x', 'y', 'w', 'h');

                movingWidget = _.defaults(movingWidget, originalWidget);

                if (!_.isEqual(originalWidget, movingWidget)) {
                    if (!noSaveWidgets) {
                        _.extend(view.widget, movingWidget);
                        view.movingWidget.id && this.scrollToWidgetBottom(movingWidget);
                    }

                    res[id] = view.widget;
                    view.movingWidget = {};
                }

                return res;
            }, {});

            let isEmptyData = _.isEmpty(data);
            this.$emit('toggleAlignButton', isEmptyData);

            if (!isEmptyData && !noSaveWidgets) {
                this.correctHeight();
                return update(this.widgetsRef, data);
            }
        },

        deleteWidget(this: any, id: string) {
            this.$emit('deleteWidget', this.widgets[id]);
            delete this.widgets[id];
            this.$emit('toggleAlignButton', false);
            return remove(dbReference(this.db, `/${user.id}/widgets/${id}`));
        },

        registerWorkerHandler(this: any, command: string, handler: Function) {
            !this.workerHandlers[command] && (this.workerHandlers[command] = []);
            this.workerHandlers[command].push(handler);
        },

        postMessage(this: any, message: {}): Promise<void> {
            let deferId = genId();
            return new Promise((resolve, reject) => {
                this.promises[deferId] = {resolve, reject};
                this.worker.postMessage(JSON.parse(JSON.stringify(_.extend(message, {deferId}))));
            });
        },

        onWorkerMessage(this: any, e: any) {
            let data = e.data

            this.workerHandlers[data.com] && this.workerHandlers[data.com].forEach((handler: Function) => {
                handler(data);
            });


            let promise = this.promises[data.deferId];
            promise && (data.error ? promise.reject(data) : promise.resolve(data));
            delete this.promises[data.deferId];
        }
    }
};
