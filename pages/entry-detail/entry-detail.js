const { getEntryById, deleteEntry } = require('../../utils/api')
const { formatDate } = require('../../utils/helpers')

Page({
  data: {
    entry: null,
    loading: true,
    showPassword: false,
    entryId: null,
    createdAt: '',
    updatedAt: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ entryId: options.id })
      this.loadEntry(options.id)
    } else {
      this.setData({ loading: false })
    }
  },

  onShow() {
    // Reload when returning from edit page
    if (this.data.entryId) {
      this.loadEntry(this.data.entryId)
    }
  },

  async loadEntry(id) {
    this.setData({ loading: true })
    try {
      const entry = await getEntryById(id)
      if (entry) {
        this.setData({
          entry,
          loading: false,
          createdAt: entry.createdAt ? formatDate(entry.createdAt) : '',
          updatedAt: entry.updatedAt ? formatDate(entry.updatedAt) : ''
        })
      } else {
        this.setData({ entry: null, loading: false })
      }
    } catch (err) {
      console.error('Failed to load entry:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword })
  },

  toggleFavorite() {
    if (!this.data.entry) return
    const entry = { ...this.data.entry, favorite: !this.data.entry.favorite }
    this.setData({ entry })
  },

  copyField(e) {
    const { value, field } = e.currentTarget.dataset
    if (!value) return
    wx.setClipboardData({
      data: value,
      success() {
        const fieldNames = {
          username: '用户名',
          password: '密码',
          url: '网址'
        }
        wx.showToast({
          title: (fieldNames[field] || '内容') + '已复制',
          icon: 'success'
        })
      }
    })
  },

  openUrl() {
    const url = this.data.entry && this.data.entry.url
    if (!url) return
    wx.setClipboardData({
      data: url,
      success() {
        wx.showToast({ title: '网址已复制，请在浏览器中打开', icon: 'none' })
      }
    })
  },

  onEdit() {
    if (!this.data.entryId) return
    wx.navigateTo({
      url: '/pages/entry-form/entry-form?id=' + this.data.entryId
    })
  },

  onDelete() {
    const that = this
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除该条目吗？',
      confirmColor: '#f56c6c',
      success: async (res) => {
        if (res.confirm) {
          try {
            await deleteEntry(that.data.entryId)
            wx.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => {
              wx.navigateBack()
            }, 500)
          } catch (err) {
            console.error('Failed to delete entry:', err)
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }
})
