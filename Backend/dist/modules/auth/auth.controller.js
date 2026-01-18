"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHandler = loginHandler;
const zod_1 = require("zod");
const auth_service_1 = require("./auth.service");
const errorHandler_1 = require("../../middleware/errorHandler");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
    role: zod_1.z.enum(['admin', 'teacher', 'student']),
});
async function loginHandler(req, res, next) {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new errorHandler_1.HttpError(400, 'Invalid request body', parsed.error.flatten());
        }
        const result = await (0, auth_service_1.login)(parsed.data);
        return res.json(result);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=auth.controller.js.map