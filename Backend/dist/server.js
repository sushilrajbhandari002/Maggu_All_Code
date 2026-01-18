"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const database_1 = require("./config/database");
const auth_router_1 = require("./modules/auth/auth.router");
const student_router_1 = require("./modules/student/student.router");
const teacher_router_1 = require("./modules/teacher/teacher.router");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (env_1.env.corsOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
// Routers
app.use('/api/auth', auth_router_1.authRouter);
app.use('/api/students', student_router_1.studentRouter);
app.use('/api/teachers', teacher_router_1.teacherRouter);
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
async function start() {
    try {
        await (0, database_1.testDatabaseConnection)();
        app.listen(env_1.env.port, () => {
            console.log(`Backend listening on port ${env_1.env.port}`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
void start();
//# sourceMappingURL=server.js.map