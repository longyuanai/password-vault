function formatDate(dateStr) {
  if (!dateStr) return '—'
  var d = new Date(dateStr)
  var y = d.getFullYear()
  var m = ('0' + (d.getMonth() + 1)).slice(-2)
  var day = ('0' + d.getDate()).slice(-2)
  return y + '-' + m + '-' + day
}

function debounce(fn, delay) {
  delay = delay || 300
  var timer = null
  return function () {
    var args = arguments
    var ctx = this
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(ctx, args)
    }, delay)
  }
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

module.exports = { formatDate, debounce, deepClone }
