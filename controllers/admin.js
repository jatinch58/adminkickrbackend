const Joi = require("joi");
const admindb = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
////////////////===================admin login======================///////////
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
          console.log(p, token);
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
