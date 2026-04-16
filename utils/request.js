function request(options) {
  var app = getApp()
  return new Promise(function (resolve, reject) {
    var header = {
      'Content-Type': 'application/json'
    }
    if (options.header) {
      Object.keys(options.header).forEach(function (k) {
        header[k] = options.header[k]
      })
    }

    // Inject session token
    if (app && app.globalData && app.globalData.sessionToken) {
      header['x-session-token'] = app.globalData.sessionToken
    }

    var baseUrl = (app && app.globalData && app.globalData.baseUrl) || 'http://localhost:5000'
    wx.request({
      url: baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: header,
      timeout: 15000,
      success: function (res) {
        if (res.statusCode === 401) {
          if (app && app.clearSession) {
            app.clearSession()
          }
          wx.redirectTo({ url: '/pages/unlock/unlock' })
          reject({ success: false, error: { code: 'UNAUTHORIZED', message: '会话已过期，请重新解锁' } })
          return
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          var errCode = (res.data && res.data.error && res.data.error.code) || 'REQUEST_ERROR'
          var errMsg = (res.data && res.data.error && res.data.error.message) || '请求失败'
          reject({
            success: false,
            error: {
              code: errCode,
              message: errMsg
            }
          })
        }
      },
      fail: function (err) {
        reject({
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: err.errMsg || '网络异常，请稍后重试'
          }
        })
      }
    })
  })
}

function get(url, data) {
  return request({ url: url, method: 'GET', data: data })
}

function post(url, data) {
  return request({ url: url, method: 'POST', data: data })
}

function put(url, data) {
  return request({ url: url, method: 'PUT', data: data })
}

function del(url, data) {
  return request({ url: url, method: 'DELETE', data: data })
}

module.exports = { request: request, get: get, post: post, put: put, del: del }
