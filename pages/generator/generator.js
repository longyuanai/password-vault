var api = require('../../utils/api')

Page({
  data: {
    password: '',
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeChars: '',
    strength: 0,
    loading: false,
    strengthLabels: ['', '弱', '较弱', '中等', '强']
  },

  onLoad: function () {
    this.generate()
  },

  generate: function () {
    if (this.data.loading) return

    var that = this
    var options = {
      length: that.data.length,
      uppercase: that.data.uppercase,
      lowercase: that.data.lowercase,
      numbers: that.data.numbers,
      symbols: that.data.symbols,
      excludeChars: that.data.excludeChars
    }

    // 至少选择一种字符类型
    if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
      wx.showToast({
        title: '请至少选择一种字符类型',
        icon: 'none'
      })
      return
    }

    that.setData({ loading: true })

    api.generatePassword(options).then(function (res) {
      var pwd = res.data && res.data.password ? res.data.password : (res.password || '')
      var strength = that.calcStrength(pwd)
      that.setData({
        password: pwd,
        strength: strength,
        loading: false
      })
    }).catch(function (err) {
      console.error('生成密码失败', err)
      // 降级到本地生成
      var pwd = that.localGenerate(options)
      var strength = that.calcStrength(pwd)
      that.setData({
        password: pwd,
        strength: strength,
        loading: false
      })
    })
  },

  localGenerate: function (options) {
    var chars = ''
    if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (options.numbers) chars += '0123456789'
    if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (options.excludeChars) {
      for (var i = 0; i < options.excludeChars.length; i++) {
        chars = chars.split(options.excludeChars[i]).join('')
      }
    }

    if (!chars) return ''

    var result = ''
    for (var j = 0; j < options.length; j++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  calcStrength: function (pwd) {
    if (!pwd) return 0

    var score = 0
    var len = pwd.length

    // 长度评分
    if (len >= 8) score += 1
    if (len >= 16) score += 1

    // 字符类型评分
    var types = 0
    if (/[A-Z]/.test(pwd)) types++
    if (/[a-z]/.test(pwd)) types++
    if (/[0-9]/.test(pwd)) types++
    if (/[^A-Za-z0-9]/.test(pwd)) types++

    score += types >= 3 ? 2 : (types >= 2 ? 1 : 0)

    // 映射到 0-4
    if (score >= 4) return 4
    if (score >= 3) return 3
    if (score >= 2) return 2
    if (score >= 1) return 1
    return 0
  },

  onLengthChange: function (e) {
    this.setData({
      length: e.detail.value
    })
  },

  toggleUppercase: function () {
    this.setData({ uppercase: !this.data.uppercase })
  },

  toggleLowercase: function () {
    this.setData({ lowercase: !this.data.lowercase })
  },

  toggleNumbers: function () {
    this.setData({ numbers: !this.data.numbers })
  },

  toggleSymbols: function () {
    this.setData({ symbols: !this.data.symbols })
  },

  onExcludeInput: function (e) {
    this.setData({ excludeChars: e.detail.value })
  },

  onCopy: function () {
    if (!this.data.password) return
    wx.setClipboardData({
      data: this.data.password,
      success: function () {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  }
})
