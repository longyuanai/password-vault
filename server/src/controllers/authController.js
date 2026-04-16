import { AuthService } from '../services/authService.js'
import { catchAsync } from '../utils/AppError.js'
import { successResponse } from '../utils/response.js'

export const status = catchAsync(async (req, res) => {
  successResponse(res, {
    isSetup: AuthService.isSetup(),
    isUnlocked: AuthService.isUnlocked()
  })
})

export const setup = catchAsync(async (req, res) => {
  const { masterPassword } = req.body
  const sessionToken = await AuthService.setup(masterPassword)
  successResponse(res, { sessionToken }, '主密码设置成功', 201)
})

export const unlock = catchAsync(async (req, res) => {
  const { masterPassword } = req.body
  const sessionToken = await AuthService.unlock(masterPassword)
  successResponse(res, { sessionToken }, '保险库已解锁')
})

export const lock = catchAsync(async (req, res) => {
  AuthService.lock()
  successResponse(res, null, '保险库已锁定')
})

export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const sessionToken = await AuthService.changePassword(oldPassword, newPassword)
  successResponse(res, { sessionToken }, '主密码修改成功')
})
