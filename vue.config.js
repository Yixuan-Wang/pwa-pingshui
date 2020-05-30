module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/pwa-pingshui" : "/",
  pwa: {
    name: 'Pingshui',
    themeColor: '#2c3e50',
    msTileColor: '#2c3e50',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black-translucent',

    manifestOptions: {
      start_url: '.',
      background_color: '#2c3e50'
    },
    iconPaths: {
      favicon16: 'favicon.ico',
      favicon32: 'favicon.ico',
      appleTouchIcon: 'img/icons/apple-touch-icon-152x152.png',
      msTileImage: 'img/icons/msapplication-icon-144x144.png'
    },
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      runtimeCaching: [
        {
          urlPattern: /.*/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'pingshui',
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    }
  }
}