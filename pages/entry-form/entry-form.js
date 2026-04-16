var api = require('../../utils/api')

Page({
  data: {
    isEdit: false,
    entryId: null,
    pageLoading: false,
    submitting: false,
    generating: false,
    showPassword: false,
    errorMsg: '',

    form: {
      title: '',
      username: '',
      password: '',
      url: '',
      category: '其他',
      tags: '',
      notes: '',
      favorite: false
    },

    categories: ['社交媒体', '邮箱', '工作', '购物', '金融', '游戏', '其他'],
    categoryIndex: 6,

    tagList: [],
    strengthLevel: 0,
    strengthPercent: 0,
    strengthLabel: ''
  },

  onLoad: function (options) {
    if (options && options.id) {
      this.setData({
        isEdit: true,
        entryId: options.id,
        pageLoading: true
      })
      wx.setNavigationBarTitle({ title: '编辑密码' })
      this.loadEntry(options.id)
    } else {
      wx.setNavigationBarTitle({ title: '新建密码' })
    }
  },

  loadEntry: function (id) {
    var that = this
    api.getEntryById(id).then(function (res) {
      var entry = res.data || res
      var categories = that.data.categories
      var catIndex = categories.indexOf(entry.category)
      if (catIndex === -1) catIndex = 6

      var tags = ''
      if (Array.isArray(entry.tags)) {
        tags = entry.tags.join(', ')
      } else if (typeof entry.tags === 'string') {
        tags = entry.tags
      }

      that.setData({
        form: {
          title: entry.title || '',
          username: entry.username || '',
          password: entry.password || '',
          url: entry.url || '',
          category: entry.category || '其他',
          tags: tags,
          notes: entry.notes || '',
          favorite: !!entry.favorite
        },
        categoryIndex: catIndex,
        pageLoading: false
      })
      that.updateTagList(tags)
      that.updateStrength(entry.password || '')
    }).catch(function (err) {
      that.setData({
        pageLoading: false,
        errorMsg: '加载失败: ' + (err.message || '未知错误')
      })
    })
  },

  onFieldInput: function (e) {
    var field = e.currentTarget.dataset.field
    var value = e.detail.value
    var key = 'form.' + field
    this.setData({ [key]: value })

    if (field === 'tags') {
      this.updateTagList(value)
    }
  },

  onPasswordInput: function (e) {
    var value = e.detail.value
    this.setData({ 'form.password': value })
    this.updateStrength(value)
  },

  togglePasswordVisibility: function () {
    this.setData({ showPassword: !this.data.showPassword })
  },

  generatePassword: function () {
    if (this.data.generating) return
    var that = this
    this.setData({ generating: true })
    api.generatePassword({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true
    }).then(function (res) {
      var password = res.data || res.password || res
      if (typeof password === 'object') {
        password = password.password || password.data || ''
      }
      that.setData({
        'form.password': password,
        showPassword: true,
        generating: false
      })
      that.updateStrength(password)
    }).catch(function (err) {
      that.setData({
        generating: false,
        errorMsg: '生成密码失败: ' + (err.message || '未知错误')
      })
    })
  },

  calcStrength: function (password) {
    if (!password) return 0
    var score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++
    if (score > 4) score = 4
    return score
  },

  updateStrength: function (password) {
    var level = this.calcStrength(password)
    var labels = ['', '弱', '较弱', '中等', '强']
    var percents = [0, 25, 50, 75, 100]
    var levelNames = ['none', 'weak', 'fair', 'medium', 'strong']
    this.setData({
      strengthLevel: levelNames[level],
      strengthPercent: percents[level],
      strengthLabel: labels[level]
    })
  },

  onCategoryChange: function (e) {
    var index = parseInt(e.detail.value)
    this.setData({
      categoryIndex: index,
      'form.category': this.data.categories[index]
    })
  },

  onFavoriteChange: function (e) {
    this.setData({ 'form.favorite': e.detail.value })
  },

  updateTagList: function (tagsStr) {
    if (!tagsStr) {
      this.setData({ tagList: [] })
      return
    }
    var list = tagsStr.split(/[,，]/).map(function (t) {
      return t.trim()
    }).filter(function (t) {
      return t.length > 0
    })
    this.setData({ tagList: list })
  },

  onSubmit: function () {
    var form = this.data.form
    if (!form.title || !form.title.trim()) {
      this.setData({ errorMsg: '请输入标题' })
      return
    }
    this.setData({ errorMsg: '', submitting: true })

    var data = {
      title: form.title.trim(),
      username: form.username.trim(),
      password: form.password,
      url: form.url.trim(),
      category: form.category,
      tags: this.data.tagList,
      notes: form.notes.trim(),
      favorite: form.favorite
    }

    var that = this
    var promise

    if (this.data.isEdit) {
      promise = api.updateEntry(this.data.entryId, data)
    } else {
      promise = api.createEntry(data)
    }

    promise.then(function () {
      wx.showToast({
        title: that.data.isEdit ? '更新成功' : '创建成功',
        icon: 'success'
      })
      setTimeout(function () {
        wx.navigateBack()
      }, 800)
    }).catch(function (err) {
      that.setData({
        submitting: false,
        errorMsg: (that.data.isEdit ? '更新' : '创建') + '失败: ' + (err.message || '未知错误')
      })
    })
  }
})