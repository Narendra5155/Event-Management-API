export class ApiResponse {
  constructor(statusCode, data = null, message = 'Success') {
    this.statusCode = statusCode;
    this.body = { success: true, message, data };
  }

  send(res) {
    return res.status(this.statusCode).json(this.body);
  }

  static ok(res, data, message) {
    return new ApiResponse(200, data, message).send(res);
  }

  static created(res, data, message = 'Created') {
    return new ApiResponse(201, data, message).send(res);
  }
}
