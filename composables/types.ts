export type ReadonlyRecordStrings = Readonly<Record<string, string>>;
export type Widget = {
    x: number,
    y: number,
    w: number,
    h: number,
    id: string,
    type: string,
    data: any
}
export type Widgets = Record<string, Widget>;
export type WidgetsArray = Widget[];

export type BinanceData = {
    coin: string,
    data: [number, number]
};
