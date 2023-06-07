import {defineStore} from "pinia";
import {Binance} from "assets/classes/Binance";
import {BinanceData} from "~/composables/types";

const binance = new Binance();
export const useBinanceStore = defineStore('binance', {
    state() {
        return {
            coins: {} as Record<string, BinanceData>
        };
    },

    actions: {
        addCoin(coin: string) {
            this.coins[coin] = {coin, data: [0,0]};

            binance.addCoin(coin, (data: [number, number]) => {
                this.coins[coin] = {coin, data};
            });
        },

        removeCoin(coin: string){
            binance.removeCoin(coin);
            delete this.coins[coin];
        }
    }
});
