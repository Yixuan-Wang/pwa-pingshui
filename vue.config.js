module.exports = {
  pwa: {
    name: 'Pingshui',
    themeColor: '#35495e',
    msTileColor: '#35495e',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    manifestOptions: {
      start_url: '.',
      background_color: '#4c89fe'
    },
    iconPaths: {
      favicon16: 'favicon.ico',
      appleTouchIcon: 'img/icons/apple-touch-icon-152x152.png',
      msTileImage: 'img/icons/msapplication-icon-144x144.png'
    }
  }
}