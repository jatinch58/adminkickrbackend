const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middlewares/isAdmin");
const { verifyToken } = require("../middlewares/auth");
const admin = require("../controllers/admin");
router.post("/admin/login", admin.login);
router.post("/admin/signup", admin.signup);
router.get("/admin/check", verifyToken, isAdmin, admin.isAdmin);
router.post("/admin/addcategory", verifyToken, isAdmin, admin.addCategory);
router.get("/admin/getCategory", verifyToken, isAdmin, admin.getCategory);
router.delete(
  "/admin/deleteCategory",
  verifyToken,
  isAdmin,
  admin.deleteCategory
);
router.post(
  "/admin/addSubCategory",
  verifyToken,
  isAdmin,
  admin.addSubCategory
);
router.get("/admin/getSubCategory", verifyToken, isAdmin, admin.getSubCategory);
router.delete(
  "/admin/deleteSubCategory",
  verifyToken,
  isAdmin,
  admin.deleteSubCategory
);
router.post("/admin/addProduct", verifyToken, isAdmin, admin.addProducts);
router.get("/admin/getProducts", verifyToken, isAdmin, admin.getProduct);
router.get(
  "/admin/getProductById/:productId",
  verifyToken,
  isAdmin,
  admin.getProductById
);
router.get(
  "/admin/getProductByCategory/:category/:subCategory",
  verifyToken,
  isAdmin,
  admin.getProductByCategory
);
module.exports = router;
