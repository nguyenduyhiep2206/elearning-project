// routes/category.routes.js

const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

// (Giả sử bạn có middleware để xác thực admin/giáo viên)
// const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");

// Tạo danh mục mới (Chỉ Admin/Giáo viên)
// router.post("/", [verifyToken, isAdmin], categoryController.create);
router.post("/", categoryController.createCategory); // (Tạm thời chưa cần auth)

// Lấy tất cả danh mục (Công khai)
router.get("/", categoryController.getAllCategories);

// Lấy 1 danh mục (Công khai)
router.get("/:id", categoryController.getCategoryById);

// Cập nhật danh mục (Chỉ Admin/Giáo viên)
// router.put("/:id", [verifyToken, isAdmin], categoryController.update);
router.put("/:id", categoryController.updateCategory); // (Tạm thời chưa cần auth)

// Xóa danh mục (Chỉ Admin/Giáo viên)
// router.delete("/:id", [verifyToken, isAdmin], categoryController.delete);
router.delete("/:id", categoryController.deleteCategory); // (Tạm thời chưa cần auth)

module.exports = router;