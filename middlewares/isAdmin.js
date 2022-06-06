const admindb = require("../models/admin");

exports.isAdmin = async (req, res, next) => {
  const isAdmin = admindb.findById(req.user._id);
  if (!isAdmin) {
    return res.status().send("You are not admin");
  } else {
    next();
  }
};
