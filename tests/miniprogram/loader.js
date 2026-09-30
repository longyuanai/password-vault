// 在 Node 中加载微信小程序的 CommonJS 源文件（仓库根 package.json 为 "type": "module"，
// 不能直接 require），并注入 wx / getApp / Page / App 等全局对象的替身。
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

const GLOBAL_NAMES = ['wx', 'getApp', 'Page', 'App']

/**
 * 加载一个小程序模块。
 * @param {string} relPath 相对仓库根目录的路径，如 'utils/helpers.js'
 * @param {object} [opts]
 * @param {object} [opts.globals] 注入的全局对象（wx、getApp、Page、App）
 * @param {object} [opts.mocks] 以仓库相对路径（不含 .js）为键的模块替身，如 { 'utils/api': {...} }
 */
export function loadModule(relPath, opts = {}) {
  const globals = opts.globals || {}
  const mocks = opts.mocks || {}
  const cache = new Map()

  function load(absPath) {
    const key = path.relative(ROOT, absPath).replace(/\\/g, '/').replace(/\.js$/, '')
    if (Object.prototype.hasOwnProperty.call(mocks, key)) return mocks[key]
    if (cache.has(absPath)) return cache.get(absPath).exports

    const module = { exports: {} }
    cache.set(absPath, module)
    const source = fs.readFileSync(absPath, 'utf8')
    const fn = vm.compileFunction(source, ['module', 'exports', 'require', ...GLOBAL_NAMES], {
      filename: absPath
    })
    const localRequire = (spec) => {
      let target = path.resolve(path.dirname(absPath), spec)
      if (!target.endsWith('.js')) target += '.js'
      return load(target)
    }
    fn(module, module.exports, localRequire, ...GLOBAL_NAMES.map((n) => globals[n]))
    return module.exports
  }

  return load(path.join(ROOT, relPath))
}

/**
 * 加载页面文件，返回一个带有简易 setData 的页面实例。
 */
export function loadPage(relPath, opts = {}) {
  let config = null
  const globals = { ...(opts.globals || {}), Page: (c) => { config = c } }
  loadModule(relPath, { ...opts, globals })
  if (!config) throw new Error(`${relPath} 未调用 Page()`)

  const page = { ...config, data: structuredClone(config.data || {}) }
  page.setData = function (patch) {
    for (const [keyPath, value] of Object.entries(patch)) {
      const parts = keyPath.split('.')
      let target = this.data
      for (let i = 0; i < parts.length - 1; i++) {
        if (typeof target[parts[i]] !== 'object' || target[parts[i]] === null) target[parts[i]] = {}
        target = target[parts[i]]
      }
      target[parts[parts.length - 1]] = value
    }
  }
  return page
}
