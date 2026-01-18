"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const User_1 = require("../../models/User");
const errorHandler_1 = require("../../middleware/errorHandler");
async function login(body) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const user = await User_1.User.findOne({
        where: { email: body.email, role: body.role },
    });
    if (!user) {
        throw new errorHandler_1.HttpError(401, 'Invalid email or password');
    }
    const valid = await bcryptjs_1.default.compare(body.password, user.passwordHash);
    if (!valid) {
        throw new errorHandler_1.HttpError(401, 'Invalid email or password');
    }
    const token = jsonwebtoken_1.default.sign({
        sub: user.id,
        role: user.role,
    }, env_1.env.jwtSecret, { expiresIn: '8h' });
    const responseUser = {
        id: String(user.id),
        email: user.email,
        role: user.role,
        name: user.name,
        phone: (_a = user.phone) !== null && _a !== void 0 ? _a : undefined,
        address: (_b = user.address) !== null && _b !== void 0 ? _b : undefined,
        image: (_c = user.image) !== null && _c !== void 0 ? _c : undefined,
        username: (_d = user.username) !== null && _d !== void 0 ? _d : undefined,
        teacherId: (_e = user.teacherId) !== null && _e !== void 0 ? _e : undefined,
        classTeacherOf: (_f = user.classTeacherOf) !== null && _f !== void 0 ? _f : undefined,
        assignedClasses: (_g = user.assignedClasses) !== null && _g !== void 0 ? _g : undefined,
        class: (_h = user.class) !== null && _h !== void 0 ? _h : undefined,
        rollNumber: (_j = user.rollNumber) !== null && _j !== void 0 ? _j : undefined,
        needsPasswordChange: user.needsPasswordChange,
    };
    return { user: responseUser, token };
}
//# sourceMappingURL=auth.service.js.map