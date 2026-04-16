import { EntryService } from '../services/entryService.js'
import { AuthService } from '../services/authService.js'
import { catchAsync } from '../utils/AppError.js'
import { successResponse } from '../utils/response.js'

export const getAll = catchAsync(async (req, res) => {
  const { search, category, page, limit } = req.query
  const derivedKey = AuthService.getKey()
  const result = EntryService.getAll(
    { search, category, page: Number(page) || 1, limit: Number(limit) || 20 },
    derivedKey
  )
  successResponse(res, result)
})

export const getById = catchAsync(async (req, res) => {
  const derivedKey = AuthService.getKey()
  const entry = EntryService.getById(req.params.id, derivedKey)
  successResponse(res, entry)
})

export const create = catchAsync(async (req, res) => {
  const derivedKey = AuthService.getKey()
  const entry = EntryService.create(req.body, derivedKey)
  successResponse(res, entry, '条目创建成功', 201)
})

export const update = catchAsync(async (req, res) => {
  const derivedKey = AuthService.getKey()
  const entry = EntryService.update(req.params.id, req.body, derivedKey)
  successResponse(res, entry, '条目更新成功')
})

export const remove = catchAsync(async (req, res) => {
  EntryService.remove(req.params.id)
  successResponse(res, null, '条目删除成功')
})

export const healthCheck = catchAsync(async (req, res) => {
  const derivedKey = AuthService.getKey()
  const report = EntryService.healthCheck(derivedKey)
  successResponse(res, report)
})
