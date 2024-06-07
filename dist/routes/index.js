"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contactHandler_1 = require("../handler/contactHandler");
const router = (0, express_1.Router)();
router.get("/healthcheck", (_req, res) => {
    res.send({ success: true });
});
router.post("/identify", contactHandler_1.identify);
exports.default = router;
