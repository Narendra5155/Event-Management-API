import * as userService from '../services/user.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export async function myRegistrations(req, res) {
  const registrations = await userService.listMyRegistrations(req.user._id, req.query);
  return ApiResponse.ok(res, { registrations });
}

export async function list(req, res) {
  return ApiResponse.ok(res, await userService.listUsers(req.query));
}

export async function updateRole(req, res) {
  const user = await userService.updateUserRole(req.params.id, req.body.role, req.user);
  return ApiResponse.ok(res, { user }, `Role updated to ${user.role}`);
}
