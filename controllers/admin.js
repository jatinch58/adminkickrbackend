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
//========================================== admin login===========================================//
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
//=========================================== admin signup=========================================//
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
//========================================== isAdmin =============================================//
exports.isAdmin = async (req, res) => {
  try {
    res.status(200).send({ message: "OH!! HEY admin..." });
  } catch (e) {
    res.status(400).send({ message: e.name });
  }
};
//====================================== add category ============================================//
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
///==================================== get category =============================================//
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
// ==================================== update category Name =====================================//
exports.updateCategoryName = async (req, res) => {
  try {
    const { body } = req;
    const categorySchema = Joi.object()
      .keys({
        id: Joi.string().hex().length(24).required(),
        categoryName: Joi.string().required(),
      })
      .required();
    const result1 = categorySchema.validate(body);
    if (result1.error) {
      res.status(400).send({ message: result1.error.details[0].message });
    } else {
      const result = await categorydb.findByIdAndUpdate(req.body.id, {
        categoryName: req.body.categoryName,
      });
      if (result) {
        res.status(200).send({ message: "Done" });
      } else {
        res.status(500).send({ message: "Something went wrong" });
      }
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
//====================================== update category icon ====================================//
exports.updateCategoryIcon = async (req, res) => {
  try {
    let myFile = req.file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuidv4()}.${fileType}`,
      Body: req.file.buffer,
    };
    s3.upload(params, async (error, data1) => {
      if (error) {
        return res.status(500).send(error);
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
                    const result = await categorydb.findByIdAndUpdate(
                      req.body.id,
                      { iconUrl: data1.Location }
                    );
                    if (result) {
                      res.status(200).send({
                        message: "icon updated",
                      });
                    } else {
                      res.status(404).send({
                        message: "somthing went wrong",
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
    });
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
//=========================== delete category using category_id ==================================//
exports.deleteCategory = async (req, res) => {
  try {
    const { body } = req;
    const adminSchema = Joi.object()
      .keys({
        categoryId: Joi.string().hex().length(24).required(),
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
//===================================== add sub-category =========================================//
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
//==================================== get sub-category ==========================================//
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
//============================ get sub-category using category ====================================//
exports.getSubCatWithCat = async (req, res) => {
  try {
    const subCategories = await subcategorydb.find({ category: req.params.id });
    if (subCategories) {
      res.status(200).send(subCategories);
    } else {
      res.status(500).send({ message: "Something went wrong" });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
//================================= update sub-category details ===================================//
exports.updateSubCategory = async (req, res) => {
  try {
    const { body } = req;
    const categorySchema = Joi.object()
      .keys({
        id: Joi.string().hex().length(24).required(),
        subCategoryName: Joi.string().required(),
        category: Joi.string().hex().length(24).required(),
      })
      .required();
    const result1 = categorySchema.validate(body);
    if (result1.error) {
      res.status(400).send({ message: result1.error.details[0].message });
    } else {
      const result = await subcategorydb.findByIdAndUpdate(req.body.id, {
        subCategoryName: req.body.subCategoryName,
        category: req.body.category,
      });
      if (result) {
        res.status(200).send({ message: "Done" });
      } else {
        res.status(500).send({ message: "Something went wrong" });
      }
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
//=============================== update only sub-category icon ===================================//
exports.updateSubCategoryIcon = async (req, res) => {
  try {
    let myFile = req.file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuidv4()}.${fileType}`,
      Body: req.file.buffer,
    };
    s3.upload(params, async (error, data1) => {
      if (error) {
        return res.status(500).send(error);
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
                    const result = await subcategorydb.findByIdAndUpdate(
                      req.body.id,
                      { iconUrl: data1.Location }
                    );
                    if (result) {
                      res.status(200).send({
                        message: "icon updated",
                      });
                    } else {
                      res.status(404).send({
                        message: "somthing went wrong",
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
    });
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
//=============================== delete sub-category with icon also ==============================//
exports.deleteSubCategory = async (req, res) => {
  try {
    const deleteSchema = Joi.object()
      .keys({
        subCategoryId: Joi.string().hex().length(24).required(),
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
//=========================== add product and it's main image only ================================//
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
//======================= add product other images(other than main image) =========================//
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
//=============================== get all product as array ========================================//
exports.getProduct = async (req, res) => {
  try {
    const products = await productdb
      .find(
        {},
        { __v: 0, productReview: 0 },
        { skip: req.query.skip, limit: req.query.limit }
      )
      .populate(["productCategory", "productSubCategory"]);
    if (products) {
      res.status(200).send(products);
    } else {
      res.status(500).send({ message: "Something bad happened" });
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
//================================ update product details only ====================================//
exports.updateProduct = async (req, res) => {
  try {
    const { body } = req;
    const categorySchema = Joi.object()
      .keys({
        id: Joi.string().hex().length(24).required(),
        productName: Joi.string().required(),
        productPrice: Joi.number().required(),
        productOfferPrice: Joi.number().required(),
        productCategory: Joi.string().hex().length(24).required(),
        productSubCategory: Joi.string().hex().length(24).required(),
        productStock: Joi.boolean().required(),
        productDescription: Joi.string().required(),
        demolink: Joi.string(),
      })
      .required();
    const result1 = categorySchema.validate(body);
    if (result1.error) {
      res.status(400).send({ message: result1.error.details[0].message });
    } else {
      const result = await productdb.findByIdAndUpdate(req.body.id, {
        productName: req.body.productName,
        productPrice: req.body.productPrice,
        productOfferPrice: req.body.productOfferPrice,
        productCategory: req.body.productCategory,
        productSubCategory: req.body.productSubCategory,
        productStock: req.body.productStock,
        productDescription: req.body.productDescription,
        demolink: req.body.demolink,
      });
      if (result) {
        res.status(200).send({ message: "Done" });
      } else {
        res.status(500).send({ message: "something went wrong" });
      }
    }
  } catch (e) {
    res.status(500).send({ message: e.name });
  }
};
//================================= delete product and images also ================================//
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
//================================= update main  image of product =================================//
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
//========================== delete product images other than main image ==========================//
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
//============================ get product using id ===============================================//
exports.getProductById = async (req, res) => {
  try {
    const product = await productdb.findById(req.params.productId, {
      productReview: { $slice: [0, 3] },
    });
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
//========================= get product by category and sub-category ==============================//
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
//============================= get all users as array ============================================//
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
//============================= get all user's cart as array ======================================//
exports.showCarts = async (req, res) => {
  try {
    const cartCount = await cartdb.find({}).count();
    const carts = await cartdb
      .find({}, { __v: 0 }, { skip: req.query.skip, limit: req.query.limit })
      .populate(["cartBy", "cart.productId"]);
    if (carts) {
      res.status(200).send({ count: cartCount, result: carts });
    } else {
      res.status(500).send({ message: "Something bad happenned" });
    }
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    if (!req.query.productId || !req.query.start || !req.query.end) {
      return res
        .status(400)
        .send({ message: "Please provide productId, start and end" });
    }
    const review = await productdb.findById(req.query.productId, {
      productReview: {
        $slice: [Number(req.query.start), Number(req.query.end)],
      },
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
      productName: 0,
      productOfferPrice: 0,
      productPrice: 0,
      productCategory: 0,
      productSubCategory: 0,
      productDescription: 0,
      productStock: 0,
      productMainImgUrl: 0,
      productImgUrl: 0,
      demolink: 0,
    });
    if (review) {
      res.status(200).send(review);
    } else {
      res
        .status(404)
        .send({ message: "No product found of id: " + req.params.productId });
    }
  } catch (e) {
    res.status(500).send({ message: e });
  }
};
exports.getProductRatings = async (req, res) => {
  try {
    const product = await productdb.findById(req.params.id);
    if (product) {
      const result = {
        star1: 0,
        star2: 0,
        star3: 0,
        star4: 0,
        star5: 0,
        overall: 0,
        numberOfReview: 0,
      };
      product.productReview.map((val) => {
        if (val.review === 1) result.star1 = result.star1 + 1;
        else if (val.review === 2) result.star2 = result.star2 + 1;
        else if (val.review === 3) result.star3 = result.star3 + 1;
        else if (val.review === 4) result.star4 = result.star4 + 1;
        else if (val.review === 5) result.star5 = result.star5 + 1;
        result.overall += val.review;
      });
      result.numberOfReview = product.productReview.length;
      result.overall = result.overall / product.productReview.length;
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: "not found" });
    }
  } catch (e) {
    res.status(500).send({ message: e });
  }
};
