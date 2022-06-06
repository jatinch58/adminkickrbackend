const Joi = require("joi");
const admindb = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const categorydb = require("../models/category");
const subcategorydb = require("../models/subCategory");
const productdb = require("../models/product");
const userdb = require("../models/user");
//============================================admin login===========================================//
exports.login = async (req, res) => {
  try {
    const { body } = req;
    const adminSchema = Joi.object()
      .keys({
        username: Joi.string().required(),
        password: Joi.string().required(),
      })
      .required();
    const result = adminSchema.validate(body);
    if (result.error) {
      res.status(400).send({ message: result.error.details[0].message });
    } else {
      const admin = await admindb.findOne({ username: req.body.username });
      if (admin) {
        const validPassword = await bcrypt.compare(
          req.body.password,
          admin.password
        );
        if (validPassword) {
          const p = admin._id.toString();
          const token = jwt.sign({ _id: p }, "123456", {
            expiresIn: "24h",
          });
          res.status(200).send({ message: "Login successful", token: token });
        } else {
          res.status(401).send({ message: "Invalid password" });
        }
      } else {
        res.status(401).send({ message: "Invalid username" });
      }
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
////////////////===================admin signup======================//
exports.signup = async (req, res) => {
  try {
    const { body } = req;
    const adminSchema = Joi.object()
      .keys({
        username: Joi.string().required(),
        password: Joi.string().required(),
      })
      .required();
    const result = adminSchema.validate(body);
    if (result.error) {
      res.status(400).send({ message: result.error.details[0].message });
    } else {
      const salt = await bcrypt.genSalt(10);
      hashpassword = await bcrypt.hash(req.body.password, salt);
      const createAdmin = new admindb({
        username: req.body.username,
        password: hashpassword,
      });
      createAdmin
        .save()
        .then(() => {
          res.status(200).send({ message: "Added admin sucessfully" });
        })
        .catch(() => {
          res.status(500).send({ message: "Something bad happened" });
        });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
//====================isAdmin==================================//
exports.isAdmin = async (req, res) => {
  try {
    res.status(200).send({ message: "OH!! HEY admin..." });
  } catch (e) {
    res.status(400).send({ message: e.name });
  }
};
//========================add category=========================//
exports.addCategory = async (req, res) => {
  try {
    const { body } = req;
    const categorySchema = Joi.object()
      .keys({
        categoryName: Joi.string().required(),
      })
      .required();
    const validate = categorySchema.validate(body);
    if (validate.error) {
      res.status(400).send({ message: validate.error.details[0].message });
    } else {
      const newCategory = new categorydb({
        categoryName: req.body.categoryName,
      });
      newCategory.save().then(() => {
        res.status(200).send({
          message: req.body.categoryName + " category added sucessfully",
        });
      });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
///=====================get category=========================//
exports.getCategory = async (req, res) => {
  try {
    const categories = await categorydb.find();
    if (categories) {
      res.status(200).send(categories);
    } else {
      res.status(404).send({ message: "Not found" });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
//=======================delete category====================//
exports.deleteCategory = async (req, res) => {
  try {
    const categorySchema = Joi.object()
      .keys({
        categoryId: Joi.string().required(),
      })
      .required();
    const validate = categorySchema.validate(req.body);
    if (validate.error) {
      res.status(400).send({ message: validate.error.details[0].message });
    } else {
      const result = await categorydb.findByIdAndDelete(req.body.categoryId);
      if (result) {
        res.status(200).send({
          message: "Category deleted sucessfully of id: " + req.body.categoryId,
        });
      } else {
        res
          .status(404)
          .send({ message: "No category found of id: " + req.body.categoryId });
      }
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};

exports.addSubCategory = async (req, res) => {
  try {
    const subCategorySchema = Joi.object()
      .keys({
        categoryName: Joi.string().required(),
        subCategoryName: Joi.string().required(),
        iconUrl: Joi.string().required(),
      })
      .required();
    const validate = subCategorySchema.validate(req.body);
    if (validate.error) {
      res.status(400).send({ message: validate.error.details[0].message });
    } else {
      const newSubCategory = new subcategorydb({
        categoryName: req.body.categoryName,
        subCategoryName: req.body.subCategoryName,
        iconUrl: req.body.iconUrl,
      });
      newSubCategory.save().then(() => {
        res.status(200).send({
          message:
            req.body.subCategoryName +
            " added sucessfully in category " +
            req.body.categoryName,
        });
      });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.getSubCategory = async (req, res) => {
  try {
    const subCategories = await subcategorydb.find();
    if (subCategories) {
      res.status(200).send(subCategories);
    } else {
      res.status(500).send({ message: "Somthing bad happened" });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.deleteSubCategory = async (req, res) => {
  try {
    const deleteSchema = Joi.object()
      .keys({
        subCategoryId: Joi.string().required(),
      })
      .required();
    const validate = deleteSchema.validate(req.body);
    if (validate.error) {
      res.status(400).send({ message: deleteSchema.error.details[0].message });
    } else {
      const result = await subcategorydb.findByIdAndDelete(
        req.body.subCategoryId
      );
      if (result) {
        res
          .status(200)
          .send({ message: req.body.subCategoryId + " deleted sucessfully" });
      } else {
        res.status(404).send({
          message: "No subCategory found of id: " + req.body.subCategoryId,
        });
      }
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.addProducts = async (req, res) => {
  try {
    const productSchema = Joi.object()
      .keys({
        productName: Joi.string().required(),
        productPrice: Joi.number().required(),
        productOfferPrice: Joi.number().required(),
        productMainImgUrl: Joi.string().required(),
        productImgUrl: Joi.array().items(Joi.string()).required(),
        productCategory: Joi.string().required(),
        productSubCategory: Joi.string().required(),
        productStock: Joi.boolean().required(),
        productDescription: Joi.string().required(),
        demolink: Joi.string().required(),
      })
      .required();
    const validate = productSchema.validate(req.body);
    if (validate.error) {
      res.status(400).send({ message: validate.error.details[0].message });
    } else {
      const newProduct = new productdb({
        productName: req.body.productName,
        productPrice: req.body.productPrice,
        productOfferPrice: req.body.productOfferPrice,
        productMainImgUrl: req.body.productMainImgUrl,
        productImgUrl: req.body.productImgUrl,
        productCategory: req.body.productCategory,
        productSubCategory: req.body.productSubCategory,
        productStock: req.body.productStock,
        productDescription: req.body.productDescription,
        demolink: req.body.demolink,
      });
      newProduct.save().then(() => {
        res
          .status(200)
          .send({ message: req.body.productName + " added sucessfully" });
      });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.getProduct = async (req, res) => {
  try {
    const products = await productdb.find();
    if (products) {
      res.status(200).send(products);
    } else {
      res.status(500).send({ message: "Something bad happened" });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.getProductById = async (req, res) => {
  try {
    const product = await productdb.findById(req.params.productId);
    if (product) {
      res.status(200).send(product);
    } else {
      res
        .status(404)
        .send({ message: "No product found of id: " + req.params.productId });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.getProductByCategory = async (req, res) => {
  try {
    const product = await productdb.find({
      productCategory: req.params.category,
      productSubCategory: req.params.subCategory,
    });
    if (product) {
      res.status(200).send(product);
    } else {
      res.status(500).send({ message: "Something bad happened" });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.getUsers = async (req, res) => {
  try {
    const getUsers = await userdb.find({}, { __v: 0 });
    if (getUsers) {
      return res.status(200).send(getUsers);
    } else {
      return res.status(500).send({ message: "Something bad happened" });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
