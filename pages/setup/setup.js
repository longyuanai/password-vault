var api = require('../../utils/api')

Page({
  data: {
    masterPassword: '',
    confirmPassword: '',
    loading: false,
    error: ''
  },

  onPasswordInput: function (e) {
    this.setData({ masterPassword: e.detail.value })
  },

  onConfirmInput: function (e) {
    this.setData({ confirmPassword: e.detail.value })
  },

  onSubmit: function () {
    var that = this
    var pwd = this.data.masterPassword
    var confirm = this.data.confirmPassword

    if (!pwd) {
      this.setData({ error: '请输入主密码' })
      return
    }
    if (pwd.length < 8) {
      this.setData({ error: '密码长度不能少于 8 个字符' })
      return
    }
    if (pwd !== confirm) {
      this.setData({ error: '两次输入的密码不一致' })
      return
    }

    this.setData({ loading: true, error: '' })
    api.setup(pwd).then(function (res) {
      var app = getApp()
      app.setSession(res.data.sessionToken)
      app.globalData.isSetup = true
      wx.switchTab({ url: '/pages/index/index' })
    }).catch(function (err) {
      that.setData({ error: err.error ? err.error.message : '初始化失败' })
    }).finally(function () {
      that.setData({ loading: false })
    })
  }
})
