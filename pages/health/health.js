const api = require('../../utils/api')

Page({
  data: {
    score: 0,
    totalEntries: 0,
    weakPasswords: [],
    reusedPasswords: [],
    oldPasswords: [],
    loading: true,
    weakExpanded: true,
    reusedExpanded: true,
    oldExpanded: true,
    scoreLevel: 'red'
  },

  onShow() {
    this.loadHealthReport()
  },

  async loadHealthReport() {
    this.setData({ loading: true })
    try {
      const res = await api.getHealthReport()
      const score = res.score || 0
      let scoreLevel = 'red'
      if (score >= 70) {
        scoreLevel = 'green'
      } else if (score >= 40) {
        scoreLevel = 'orange'
      }
      this.setData({
        score,
        totalEntries: res.totalEntries || 0,
        weakPasswords: res.weakPasswords || [],
        reusedPasswords: res.reusedPasswords || [],
        oldPasswords: res.oldPasswords || [],
        scoreLevel,
        loading: false
      })
    } catch (err) {
      console.error('Failed to load health report:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  toggleSection(e) {
    const section = e.currentTarget.dataset.section
    const key = section + 'Expanded'
    this.setData({ [key]: !this.data[key] })
  },

  onEntryTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/entry-detail/entry-detail?id=' + id })
  }
})
