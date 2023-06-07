import {ReadonlyRecordStrings} from "~/composables/types";
export const MIN_WIDGET_WIDTH = 8;
export const MIN_WIDGET_HEIGHT = 5;

export const Coins: ReadonlyRecordStrings = {
    btc: 'Bitcoin',
    eth: 'Ethereum',
    bnb: 'Binance Coin',
    ada: 'Cardano',
    xrp: 'Ripple',
    doge: 'Dogecoin',
    dot: 'Polkadot',
    sol: 'Solana',
    uni: 'Uniswap',
    link: 'Chainlink',
    matic: 'Polygon',
    bnx: 'BinaryX'
};

export const CoinsKeys: ReadonlyRecordStrings = Object.fromEntries(
    Object.entries(Coins).map(([key, value]) => [value, key])
);

export const genId = () => `${Date.now()}-${performance.now()}-${Math.random().toString().slice(2)}`
    .replaceAll('.', '-');

export const timeout = async (delay: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

const user: {
    id: string,
    firstStart: boolean
} = {
    id: process.server ? 'server' : (localStorage.getItem('userId') || ''),
    firstStart: false
};

if (!user.id) {
    _.extend(user, {
        id: genId(),
        firstStart: true
    });
    localStorage.setItem('userId', user.id);
}

export {user};


