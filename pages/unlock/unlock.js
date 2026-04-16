var api = require('../../utils/api')

Page({
  data: {
    masterPassword: '',
    loading: false,
    error: ''
  },

  onInput: function (e) {
    this.setData({ masterPassword: e.detail.value })
  },

  onSubmit: function () {
    var that = this
    var pwd = this.data.masterPassword
    if (!pwd) {
      this.setData({ error: '请输入主密码' })
      return
    }

    this.setData({ loading: true, error: '' })
    api.unlock(pwd).then(function (res) {
      var app = getApp()
      app.setSession(res.data.sessionToken)
      wx.switchTab({ url: '/pages/index/index' })
    }).catch(function (err) {
      that.setData({ error: err.error ? err.error.message : '解锁失败' })
    }).finally(function () {
      that.setData({ loading: false })
    })
  }
})
