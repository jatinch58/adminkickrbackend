const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middlewares/isAdmin");
const { verifyToken } = require("../middlewares/auth");
const admin = require("../controllers/admin");
router.post("/admin/login", admin.login);
router.post("/admin/signup", admin.signup);
router.get("/admin/check", verifyToken, isAdmin, admin.isAdmin);
module.exports = router;
