const Joi = require("joi");
const admindb = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const categorydb = require("../models/category");
const subcategorydb = require("../models/subCategory");
const productdb = require("../models/product");
const userdb = require("../models/user");
const cartdb = require("../models/cart");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
  Bucket: process.env.BUCKET_NAME,
});
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
          const token = jwt.sign({ _id: p }, process.env.TOKEN_KEY, {
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
//============================================admin signup=========================================//
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
//=============================================isAdmin=============================================//
exports.isAdmin = async (req, res) => {
  try {
    res.status(200).send({ message: "OH!! HEY admin..." });
  } catch (e) {
    res.status(400).send({ message: e.name });
  }
};
//=============================================add category=========================================//
exports.addCategory = async (req, res) => {
  try {
    let myFile = req.file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuidv4()}.${fileType}`,
      Body: req.file.buffer,
    };

    s3.upload(params, async (error, data) => {
      if (error) {
        return res.status(500).send(error);
      } else {
        const newCategory = new categorydb({
          categoryName: req.body.categoryName,
          iconUrl: data.Location,
        });
        newCategory.save().then(() => {
          res.status(200).send({
            message: req.body.categoryName + " category added sucessfully",
          });
        });
      }
    });
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
///============================================get category=========================================//
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
//============================================delete category=======================================//
exports.deleteCategory = async (req, res) => {
  try {
    const { body } = req;
    const adminSchema = Joi.object()
      .keys({
        categoryId: Joi.string().required(),
        iconUrl: Joi.string().required(),
      })
      .required();
    const result = adminSchema.validate(body);
    if (result.error) {
      res.status(400).send({ message: result.error.details[0].message });
    } else {
      let p = req.body.iconUrl;
      p = p.split("/");
      p = p[p.length - 1];
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: p,
      };
      const s3delete = function (params) {
        return new Promise((resolve, reject) => {
          s3.createBucket(
            {
              Bucket: params.Bucket,
            },
            function () {
              s3.deleteObject(params, async function (err, data) {
                if (err) res.status(500).send({ message: err });
                else {
                  const result = await categorydb.findByIdAndDelete(
                    req.body.categoryId
                  );
                  if (result) {
                    res.status(200).send({
                      message:
                        "Category deleted sucessfully of id: " +
                        req.body.categoryId,
                    });
                  } else {
                    res.status(404).send({
                      message:
                        "No category found of id: " + req.body.categoryId,
                    });
                  }
                }
              });
            }
          );
        });
      };
      s3delete(params);
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
//===================================== add sub-category ===========================================//
exports.addSubCategory = async (req, res) => {
  try {
    let myFile = req.file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuidv4()}.${fileType}`,
      Body: req.file.buffer,
    };
    s3.upload(params, async (error, data) => {
      if (error) {
        return res.status(500).send(error);
      } else {
        const newSubCategory = new subcategorydb({
          category: req.body.category,
          subCategoryName: req.body.subCategoryName,
          iconUrl: data.Location,
        });
        newSubCategory.save().then(() => {
          res.status(200).send({
            message:
              req.body.subCategoryName +
              " added sucessfully in category " +
              req.body.category,
          });
        });
      }
    });
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.getSubCategory = async (req, res) => {
  try {
    const subCategories = await subcategorydb.find().populate("category");
    if (subCategories) {
      res.status(200).send(subCategories);
    } else {
      res.status(500).send({ message: "Something bad happened" });
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
        iconUrl: Joi.string().required(),
      })
      .required();
    const validate = deleteSchema.validate(req.body);
    if (validate.error) {
      res.status(400).send({ message: deleteSchema.error.details[0].message });
    } else {
      let p = req.body.iconUrl;
      p = p.split("/");
      p = p[p.length - 1];
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: p,
      };
      const s3delete = function (params) {
        return new Promise((resolve, reject) => {
          s3.createBucket(
            {
              Bucket: params.Bucket,
            },
            function () {
              s3.deleteObject(params, async function (err, data) {
                if (err) res.status(500).send({ message: err });
                else {
                  const result = await subcategorydb.findByIdAndDelete(
                    req.body.subCategoryId
                  );
                  if (result) {
                    res.status(200).send({
                      message:
                        "Category deleted sucessfully of id: " +
                        req.body.subCategoryId,
                    });
                  } else {
                    res.status(404).send({
                      message:
                        "No category found of id: " + req.body.subCategoryId,
                    });
                  }
                }
              });
            }
          );
        });
      };
      s3delete(params);
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.addProducts = async (req, res) => {
  try {
    let myFile = req.file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuidv4()}.${fileType}`,
      Body: req.file.buffer,
    };
    s3.upload(params, async (error, data) => {
      if (error) {
        return res.status(500).send(error);
      } else {
        const newProduct = new productdb({
          productName: req.body.productName,
          productPrice: req.body.productPrice,
          productOfferPrice: req.body.productOfferPrice,
          productMainImgUrl: data.Location,
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
    });
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.addProductImages = async (req, res) => {
  try {
    let myFile = req.file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuidv4()}.${fileType}`,
      Body: req.file.buffer,
    };
    s3.upload(params, async (error, data) => {
      if (error) {
        return res.status(500).send(error);
      } else {
        const addImages = await productdb.findByIdAndUpdate(req.body.id, {
          $push: { productImgUrl: data.Location },
        });
        if (addImages) {
          res.status(200).send({ message: "Image uploaded successfully" });
        } else {
          res.status(500).send({ message: "Something bad happened" });
        }
      }
    });
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.getProduct = async (req, res) => {
  try {
    const products = await productdb.find(
      {},
      { __v: 0 },
      { skip: req.query.skip, limit: req.query.limit }
    );
    if (products) {
      res.status(200).send(products);
    } else {
      res.status(500).send({ message: "Something bad happened" });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.deleteProductImage = async (req, res) => {
  try {
    let p = req.body.fileUrl;
    p = p.split("/");
    p = p[p.length - 1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: p,
    };
    const s3delete = function (params) {
      return new Promise((resolve, reject) => {
        s3.createBucket(
          {
            Bucket: params.Bucket,
          },
          function () {
            s3.deleteObject(params, async function (err, data) {
              if (err) res.status(500).send({ message: err });
              else {
                const result = await productdb.findByIdAndUpdate(req.body.id, {
                  $pull: { productImgUrl: req.body.fileUrl },
                });
                if (result) {
                  res.status(200).send({ message: "Deleted successfully" });
                } else {
                  res.status(500).send({ message: "Something bad happened" });
                }
              }
            });
          }
        );
      });
    };
    s3delete(params);
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
    const getUserCount = await userdb.find().count();
    const getUsers = await userdb.find(
      {},
      { __v: 0 },
      { skip: req.query.skip, limit: req.query.limit }
    );
    if (getUsers) {
      return res.status(200).send({ count: getUserCount, result: getUsers });
    } else {
      return res.status(500).send({ message: "Something bad happened" });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
exports.showCarts = async (req, res) => {
  try {
    const cartCount = await cartdb.find({}).count();
    const carts = await cartdb.find(
      {},
      { __v: 0 },
      { skip: req.query.skip, limit: req.query.limit }
    );
    if (carts) {
      res.status(200).send({ count: cartCount, result: carts });
    } else {
      res.status(500).send({ message: "Something bad happenned" });
    }
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};
exports.showDetailedCart = async (req, res) => {
  try {
    const cart = await cartdb
      .findById(req.params.id)
      .populate(["cartBy", "cart.productId"]);
    if (cart) {
      res.status(200).send(cart);
    } else {
      res.status(500).send({ message: "Something bad happenned" });
    }
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};
exports.deleteProduct = async (req, res) => {
  try {
    const result = await productdb.findById(req.params.id);
    const objectKeys = result.productImgUrl;
    objectKeys.push(result.productMainImgUrl);

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: [],
      },
    };
    objectKeys.forEach((objectKey) => {
      let p = objectKey.split("/");
      p = p[p.length - 1];
      return params.Delete.Objects.push({
        Key: p,
      });
    });
    s3.deleteObjects(params, async function (err, data) {
      if (err) {
        res.status(404).send({ message: "Something bad happenned" });
      } else {
        const del = await productdb.findByIdAndDelete(req.params.id);
        if (del) {
          res.status(200).send({ message: "Deleted sucessfully" });
        } else {
          res.status(404).send({ message: "Id not found" });
        }
      }
    });
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};
exports.updateMainImage = async (req, res) => {
  try {
    let myFile = req.file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuidv4()}.${fileType}`,
      Body: req.file.buffer,
    };
    s3.upload(params, async (error, dataResult) => {
      if (error) {
        return res.status(500).send(error);
      } else {
        let p = req.body.fileUrl;
        p = p.split("/");
        p = p[p.length - 1];
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: p,
        };
        const s3delete = function (params) {
          return new Promise((resolve, reject) => {
            s3.createBucket(
              {
                Bucket: params.Bucket,
              },
              function () {
                s3.deleteObject(params, async function (err, data) {
                  if (err) res.status(500).send({ message: err });
                  else {
                    const result = await productdb.findByIdAndUpdate(
                      req.body.id,
                      {
                        productMainImgUrl: dataResult.Location,
                      }
                    );
                    if (result) {
                      res
                        .status(200)
                        .send({ message: "Image updated successfully" });
                    } else {
                      res
                        .status(500)
                        .send({ message: "Something bad happened" });
                    }
                  }
                });
              }
            );
          });
        };
        s3delete(params);
      }
    });
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
