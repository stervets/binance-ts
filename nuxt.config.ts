export default defineNuxtConfig({
    app: {
        head: {
            meta: [
                {name: 'viewport', content: 'width=device-width, initial-scale=1'},
                {charset: 'utf-8'}
            ],

            link: [
                {rel: 'icon', type: 'image/png', href: '/favicon.png'}
            ],

            title: 'Dashboard demo'
        }
    },

    modules: [
        '@pinia/nuxt',
        'nuxt-icon',
        'nuxt3-service-worker'
    ],

    devtools: {
        enabled: false
    },

    css: [
        "roboto-fontface/css/roboto/roboto-fontface.css"
    ],

    serviceWorker: {
        entryPoint: 'assets/dashboard.worker.ts'
    },

    sourcemap: true,
    mode: 'spa'
} as any)
