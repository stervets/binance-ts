export class BinanceCoin {
    ws: WebSocket;

    constructor(coin: string, handler: Function) {
        this.ws = new WebSocket(`wss://stream.binance.com:9443/ws/${coin}usdt@trade`);
        this.ws.onmessage = (event) => {
            const parsedData = JSON.parse(event.data);
            handler([parsedData.E, parseFloat(parsedData.p)]);
        };
    }

    terminate() {
        this.ws.close();
    }
}

