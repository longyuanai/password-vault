App({
  globalData: {
    baseUrl: 'http://localhost:5000',
    sessionToken: '',
    isSetup: false,
    isUnlocked: false
  },

  onLaunch() {
    // 从本地存储恢复 session
    const token = wx.getStorageSync('session_token')
    if (token) {
      this.globalData.sessionToken = token
    }
  },

  setSession(token) {
    this.globalData.sessionToken = token
    this.globalData.isUnlocked = !!token
    if (token) {
      wx.setStorageSync('session_token', token)
    } else {
      wx.removeStorageSync('session_token')
    }
  },

  clearSession() {
    this.setSession('')
  }
})
