"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const contact_1 = require("./models/contact");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
console.log("DATABASE_URL:", process.env.DATABASE_URL); // Debugging line
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api", routes_1.default);
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [contact_1.Contact],
    synchronize: true,
    logging: false,
    ssl: {
        rejectUnauthorized: false,
    },
});
exports.AppDataSource.initialize()
    .then(() => {
    app.listen(3000, () => {
        console.log("Server started on http://localhost:3000");
    });
})
    .catch((error) => console.log("Connection error:", error));
