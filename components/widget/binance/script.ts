import * as Highcharts from 'highcharts';
import moment from 'moment';

import {useBinanceStore} from "~/composables/binanceStore";
import {useDashboardStore} from "~/composables/dashboardStore";
import {BinanceData} from "~/composables/types";

const DATA_LENGTH = 200;

export default {
    props: ['widgetView'],
    setup(data: any) {
        const binanceStore = useBinanceStore(),
            widget = data.widgetView.widget,
            coin = widget.data.coin;

        binanceStore.addCoin(coin);

        return {
            coin,
            widget,
            binanceStore,
            dashboardStore: useDashboardStore(),
            chart: null,
            min: 0,
            max: 0,
            isLoaded: ref(false),
            cache: [],
            extremum: coin === 'btc' ? 5 : 1
        }
    },

    created(this: any) {
        this.widgetView.title = Coins[this.coin] + ':';
    },

    mounted(this: any) {
        this.chart = Highcharts.chart(this.$refs.chartView, {
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    }
                }
            },
            chart: {
                backgroundColor: '#202123',
                spacing: [5, 5, 5, 5],
                animation: true
            },
            title: {
                text: null
            },

            xAxis: {
                type: 'linear',
                labels: {
                    rotation: 0,
                    formatter: function (this: any) {
                        return moment(this.value).format('HH:mm:ss');
                    },
                    style: {
                        color: '#9F9C97'
                    }
                },
                gridLineColor: '#444653',
                tickWidth: 1
            },

            yAxis: {
                title: {
                    text: null
                },
                labels: {
                    formatter: function (this: any) {
                        return this.value.toFixed(2) + '$';
                    },
                    style: {
                        color: '#9F9C97'
                    },
                },
                gridLineColor: '#444653'
            },
            series: [{
                name: 'Price',
                data: this.data,
                color: this.genColor(this.coin),
                tooltip: {
                    pointFormatter: function (this: any) {
                        return `USDT Price: ${this.y.toFixed(2)}$`;
                    }
                }
            }],
            legend: {
                enabled: false
            }
        } as any);
        $(this.$el).find('.highcharts-credits').hide();

        this.$watch(`binanceStore.coins.${this.coin}`, this.onDataReceived);
    },

    unmounted(this: any) {
        clearTimeout(this.updateChartTimer);
        this.binanceStore.removeCoin(this.coin);
    },

    methods: {
        getCeilTime(time: number) {
            return Math.ceil(time / 1000) * 1000;
        },

        updateTitle(this: any, price: number) {
            this.widgetView.title = `${Coins[this.coin]}: <span class="price">${price.toFixed(2)}$</span>`;
        },

        updateChart(this: any, lastPrice: [number, number]) {
            if (!this.dashboardStore.widgetIsMoving) {
                while (this.cache.length) {
                    const point = this.cache.shift();
                    this.chart.series[0].addPoint(point, false, true);
                }
                this.chart.redraw();
            }
            this.updateChartTimer = setTimeout(this.updateChart, 1000);
        },

        async onDataReceived(this: any, binanceData: BinanceData) {
            let data = binanceData.data,
                price = data[1];

            this.updateTitle(price);

            if (!this.isLoaded) {
                this.min = price - this.extremum;
                this.min < 0 && (this.min = 0);
                this.chart.yAxis[0].setExtremes(this.min, this.max = price + this.extremum);
                this.chart.series[0].setData(
                    _.range(DATA_LENGTH).map((index: number) => {
                        return [data[0] - ((DATA_LENGTH - index) * 100), price];
                    })
                );
                this.isLoaded = true;
                this.updateChart();
                return;
            }

            price < this.min && this.chart.yAxis[0].setExtremes(this.min = price - this.extremum, this.max);
            price > this.max && this.chart.yAxis[0].setExtremes(this.min, this.max = price + this.extremum);
            this.cache.push(data);
        },

        resize(this: any) {
            this.chart.reflow();
        },

        genColor(str: string) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            const color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777216)).toString(16);
            return '#' + '0'.repeat(6 - color.length) + color;
        }
    }
};
