const api = require('../../utils/api')
const app = getApp()

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    passwordError: '',
    passwordSuccess: '',
    changingPassword: false,

    dataError: '',
    dataSuccess: '',
    exportingJSON: false,
    exportingCSV: false,
    importingJSON: false,

    version: '1.0.0'
  },

  // ---------- 修改密码 ----------

  onOldPasswordInput(e) {
    this.setData({ oldPassword: e.detail.value, passwordError: '', passwordSuccess: '' })
  },

  onNewPasswordInput(e) {
    this.setData({ newPassword: e.detail.value, passwordError: '', passwordSuccess: '' })
  },

  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value, passwordError: '', passwordSuccess: '' })
  },

  async onChangePassword() {
    const { oldPassword, newPassword, confirmPassword } = this.data

    if (!oldPassword) {
      this.setData({ passwordError: '请输入旧密码' })
      return
    }
    if (newPassword.length < 8) {
      this.setData({ passwordError: '新密码至少需要8位字符' })
      return
    }
    if (newPassword !== confirmPassword) {
      this.setData({ passwordError: '两次输入的新密码不一致' })
      return
    }

    this.setData({ changingPassword: true, passwordError: '', passwordSuccess: '' })

    try {
      await api.changePassword(oldPassword, newPassword)
      this.setData({
        passwordSuccess: '密码修改成功',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      this.setData({ passwordError: err.message || '密码修改失败，请重试' })
    } finally {
      this.setData({ changingPassword: false })
    }
  },

  // ---------- 导出 ----------

  async exportJSON() {
    this.setData({ exportingJSON: true, dataError: '', dataSuccess: '' })

    try {
      const data = await api.exportEntries('json')
      const content = JSON.stringify(data, null, 2)
      const filePath = `${wx.env.USER_DATA_PATH}/passwords_export.json`
      const fs = wx.getFileSystemManager()

      fs.writeFile({
        filePath: filePath,
        data: content,
        encoding: 'utf8',
        success: () => {
          wx.shareFileMessage({
            filePath: filePath,
            success: () => {
              this.setData({ dataSuccess: 'JSON 导出成功' })
            },
            fail: () => {
              wx.openDocument({
                filePath: filePath,
                showMenu: true,
                success: () => {
                  this.setData({ dataSuccess: 'JSON 导出成功' })
                },
                fail: () => {
                  this.setData({ dataSuccess: '文件已保存至: ' + filePath })
                }
              })
            }
          })
        },
        fail: (err) => {
          this.setData({ dataError: '写入文件失败: ' + (err.errMsg || '未知错误') })
        }
      })
    } catch (err) {
      this.setData({ dataError: err.message || 'JSON 导出失败' })
    } finally {
      this.setData({ exportingJSON: false })
    }
  },

  async exportCSV() {
    this.setData({ exportingCSV: true, dataError: '', dataSuccess: '' })

    try {
      const data = await api.exportEntries('csv')
      const filePath = `${wx.env.USER_DATA_PATH}/passwords_export.csv`
      const fs = wx.getFileSystemManager()

      fs.writeFile({
        filePath: filePath,
        data: data,
        encoding: 'utf8',
        success: () => {
          wx.shareFileMessage({
            filePath: filePath,
            success: () => {
              this.setData({ dataSuccess: 'CSV 导出成功' })
            },
            fail: () => {
              wx.openDocument({
                filePath: filePath,
                showMenu: true,
                success: () => {
                  this.setData({ dataSuccess: 'CSV 导出成功' })
                },
                fail: () => {
                  this.setData({ dataSuccess: '文件已保存至: ' + filePath })
                }
              })
            }
          })
        },
        fail: (err) => {
          this.setData({ dataError: '写入文件失败: ' + (err.errMsg || '未知错误') })
        }
      })
    } catch (err) {
      this.setData({ dataError: err.message || 'CSV 导出失败' })
    } finally {
      this.setData({ exportingCSV: false })
    }
  },

  // ---------- 导入 ----------

  importJSON() {
    this.setData({ dataError: '', dataSuccess: '' })

    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].path
        const fs = wx.getFileSystemManager()

        fs.readFile({
          filePath: tempFilePath,
          encoding: 'utf8',
          success: async (readRes) => {
            this.setData({ importingJSON: true })

            try {
              const entries = JSON.parse(readRes.data)
              await api.importEntries(entries, 'json')
              this.setData({ dataSuccess: '数据导入成功' })
            } catch (err) {
              this.setData({ dataError: err.message || '导入失败，请确认文件格式正确' })
            } finally {
              this.setData({ importingJSON: false })
            }
          },
          fail: () => {
            this.setData({ dataError: '读取文件失败' })
          }
        })
      },
      fail: () => {
        // 用户取消选择，不做处理
      }
    })
  },

  // ---------- 锁定 ----------

  onLock() {
    wx.showModal({
      title: '确认锁定',
      content: '锁定后需要重新输入主密码才能访问，确定要锁定保险库吗？',
      confirmText: '锁定',
      confirmColor: '#f56c6c',
      success: async (res) => {
        if (!res.confirm) return

        try {
          await api.lock()
          app.clearSession()
          wx.redirectTo({ url: '/pages/unlock/unlock' })
        } catch (err) {
          wx.showToast({ title: '锁定失败', icon: 'none' })
        }
      }
    })
  }
})
