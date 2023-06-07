import {BinanceCoin} from "assets/classes/BinanceCoin";

export class Binance {
    coins: Record<string, BinanceCoin>

    constructor() {
        this.coins = {};
    }

    addCoin(coin: string, handler: Function) {
        this.coins[coin] = new BinanceCoin(coin, handler);
    }

    removeCoin(coin: string){
        this.coins[coin]?.terminate();
        delete this.coins[coin];
    }
}

