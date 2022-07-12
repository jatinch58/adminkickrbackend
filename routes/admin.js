const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middlewares/isAdmin");
const { verifyToken } = require("../middlewares/auth");
const { upload } = require("../middlewares/fileUpload");
const admin = require("../controllers/admin");
router.post("/admin/login", admin.login);
router.post("/admin/signup", admin.signup);
router.get("/admin/check", verifyToken, isAdmin, admin.isAdmin);
router.post(
  "/admin/addCategory",
  verifyToken,
  isAdmin,
  upload,
  admin.addCategory
);
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
  upload,
  admin.addSubCategory
);
router.get("/admin/getSubCategory", verifyToken, isAdmin, admin.getSubCategory);
router.delete(
  "/admin/deleteSubCategory",
  verifyToken,
  isAdmin,
  admin.deleteSubCategory
);
router.post(
  "/admin/addProduct",
  verifyToken,
  isAdmin,
  upload,
  admin.addProducts
);
router.get("/admin/getProducts", verifyToken, isAdmin, admin.getProduct);
router.put(
  "/admin/addProductImages",
  verifyToken,
  isAdmin,
  upload,
  admin.addProductImages
);
router.delete(
  "/admin/deleteProductImages",
  verifyToken,
  isAdmin,
  admin.deleteProductImage
);
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
router.get("/admin/getUsers", verifyToken, isAdmin, admin.getUsers);
router.get("/admin/getCarts", verifyToken, isAdmin, admin.showCarts);
router.get(
  "/admin/getDetailedCart/:id",
  verifyToken,
  isAdmin,
  admin.showDetailedCart
);
router.delete(
  "/admin/deleteProduct/:id",
  verifyToken,
  isAdmin,
  admin.deleteProduct
);
router.put(
  "/admin/updateMainImage",
  verifyToken,
  isAdmin,
  upload,
  admin.updateMainImage
);
module.exports = router;
