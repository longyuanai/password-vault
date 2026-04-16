import { generate, evaluateStrength } from '../utils/passwordGenerator.js'
import { EntryService } from '../services/entryService.js'
import { AuthService } from '../services/authService.js'
import { catchAsync, AppError } from '../utils/AppError.js'
import { successResponse } from '../utils/response.js'

export const generatePassword = catchAsync(async (req, res) => {
  const password = generate(req.body)
  const strength = evaluateStrength(password)
  successResponse(res, { password, strength })
})

export const exportEntries = catchAsync(async (req, res) => {
  const derivedKey = AuthService.getKey()
  const entries = EntryService.exportAll(derivedKey)

  const format = req.query.format || 'json'
  if (format === 'csv') {
    const csv = convertToCsv(entries)
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=vault-export.csv')
    return res.send(csv)
  }

  successResponse(res, entries)
})

export const importEntries = catchAsync(async (req, res) => {
  const derivedKey = AuthService.getKey()
  const { entries, format } = req.body

  if (!entries) {
    throw new AppError('缺少导入数据', 400, 'MISSING_DATA')
  }

  let parsed = entries
  if (format === 'csv' && typeof entries === 'string') {
    parsed = parseCsv(entries)
  }

  if (!Array.isArray(parsed)) {
    throw new AppError('导入数据格式错误', 400, 'INVALID_FORMAT')
  }

  const count = EntryService.importEntries(parsed, derivedKey)
  successResponse(res, { imported: count }, `成功导入 ${count} 条记录`)
})

function convertToCsv(entries) {
  const headers = ['title', 'username', 'password', 'url', 'category', 'tags', 'notes']
  const lines = [headers.join(',')]
  for (const entry of entries) {
    const row = headers.map(h => {
      const val = (entry[h] || '').toString().replace(/"/g, '""')
      return `"${val}"`
    })
    lines.push(row.join(','))
  }
  return lines.join('\n')
}

function parseCsv(csvString) {
  const lines = csvString.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const entries = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/("([^"]*("")*)*"|[^,]*)/g) || []
    const entry = {}
    headers.forEach((h, idx) => {
      entry[h] = (values[idx] || '').replace(/^"|"$/g, '').replace(/""/g, '"')
    })
    entries.push(entry)
  }

  return entries
}
