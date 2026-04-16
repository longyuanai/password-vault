var api = require('../../utils/api')
var helpers = require('../../utils/helpers')

var app = getApp()

Page({
  data: {
    entries: [],
    loading: false,
    loadingMore: false,
    searchText: '',
    activeCategory: '',
    page: 1,
    hasMore: true,
    categories: [
      { label: '全部', value: '' },
      { label: '社交媒体', value: '社交媒体' },
      { label: '邮箱', value: '邮箱' },
      { label: '工作', value: '工作' },
      { label: '购物', value: '购物' },
      { label: '金融', value: '金融' },
      { label: '游戏', value: '游戏' },
      { label: '其他', value: '其他' }
    ]
  },

  _debouncedSearch: null,

  onLoad: function () {
    var that = this
    this._debouncedSearch = helpers.debounce(function (val) {
      that.setData({ searchText: val, page: 1, entries: [], hasMore: true })
      that.loadEntries()
    }, 300)

    this.checkAuth()
  },

  onShow: function () {
    // 每次显示页面时重新加载（用户可能编辑或新增了条目）
    if (app.globalData.isUnlocked) {
      this.setData({ page: 1, entries: [], hasMore: true })
      this.loadEntries()
    }
  },

  checkAuth: function () {
    var that = this
    api.getStatus().then(function (res) {
      var data = res.data || res
      if (!data.isSetup) {
        wx.redirectTo({ url: '/pages/setup/setup' })
        return
      }
      if (!data.isUnlocked) {
        wx.redirectTo({ url: '/pages/unlock/unlock' })
        return
      }
      app.globalData.isSetup = true
      app.globalData.isUnlocked = true
      that.setData({ page: 1, entries: [], hasMore: true })
      that.loadEntries()
    }).catch(function () {
      wx.redirectTo({ url: '/pages/unlock/unlock' })
    })
  },

  loadEntries: function () {
    var that = this
    var isFirstPage = this.data.page === 1

    if (isFirstPage) {
      this.setData({ loading: true })
    } else {
      this.setData({ loadingMore: true })
    }

    var params = {
      page: this.data.page,
      limit: 20
    }
    if (this.data.searchText) {
      params.search = this.data.searchText
    }
    if (this.data.activeCategory) {
      params.category = this.data.activeCategory
    }

    api.getEntries(params).then(function (res) {
      var data = res.data || res
      var list = data.entries || data || []
      var newEntries = isFirstPage ? list : that.data.entries.concat(list)
      that.setData({
        entries: newEntries,
        hasMore: list.length >= 20,
        loading: false,
        loadingMore: false
      })
    }).catch(function () {
      that.setData({ loading: false, loadingMore: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  onSearchInput: function (e) {
    var val = e.detail.value
    if (this._debouncedSearch) {
      this._debouncedSearch(val)
    }
  },

  onClearSearch: function () {
    this.setData({ searchText: '', page: 1, entries: [], hasMore: true })
    this.loadEntries()
  },

  onCategoryTap: function (e) {
    var category = e.currentTarget.dataset.category
    this.setData({
      activeCategory: category,
      page: 1,
      entries: [],
      hasMore: true
    })
    this.loadEntries()
  },

  onEntryTap: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/entry-detail/entry-detail?id=' + id })
  },

  onAdd: function () {
    wx.navigateTo({ url: '/pages/entry-form/entry-form' })
  },

  onLoadMore: function () {
    if (this.data.loadingMore || !this.data.hasMore) return
    this.setData({ page: this.data.page + 1 })
    this.loadEntries()
  }
})
