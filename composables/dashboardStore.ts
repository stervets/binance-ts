import {defineStore} from "pinia";

export const useDashboardStore = defineStore('dashboard', {
    state() {
        return {
            widgetIsMoving: false,
            showGrid: false,
            tableWidth: 0,
            cellWidth: 0
        };
    },

    actions: {
        pxToGrid(this: any, px: number): number {
            return Math.round((px - 1) / this.cellWidth);
        },

        gridToPx(this: any, grid: number): number {
            return Math.round(grid * this.cellWidth) + 1;
        }
    }
});
