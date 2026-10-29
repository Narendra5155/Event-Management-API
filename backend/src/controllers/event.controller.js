import * as eventService from '../services/event.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export async function list(req, res) {
  return ApiResponse.ok(res, await eventService.listEvents(req.query));
}

export async function mine(req, res) {
  return ApiResponse.ok(res, await eventService.listMyEvents(req.user, req.query));
}

export async function get(req, res) {
  const event = await eventService.getEvent(req.params.id, req.user);
  return ApiResponse.ok(res, { event });
}

export async function create(req, res) {
  const event = await eventService.createEvent(req.body, req.user);
  return ApiResponse.created(res, { event }, 'Event created successfully');
}

export async function update(req, res) {
  const event = await eventService.updateEvent(req.params.id, req.body, req.user);
  return ApiResponse.ok(res, { event }, 'Event updated successfully');
}

export async function remove(req, res) {
  await eventService.deleteEvent(req.params.id, req.user);
  return ApiResponse.ok(res, null, 'Event deleted successfully');
}

export async function register(req, res) {
  const result = await eventService.registerForEvent(req.params.id, req.user);
  return ApiResponse.created(res, result, "You're registered! See you there.");
}

export async function cancelRegistration(req, res) {
  const result = await eventService.cancelRegistration(req.params.id, req.user);
  return ApiResponse.ok(res, result, 'Your registration has been cancelled');
}

export async function attendees(req, res) {
  return ApiResponse.ok(res, await eventService.listAttendees(req.params.id, req.user));
}
