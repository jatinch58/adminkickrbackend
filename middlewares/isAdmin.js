const admindb = require("../models/admin");

exports.isAdmin = async (req, res, next) => {
  const isAdmin = await admindb.findById(req.user._id);
  if (!isAdmin) {
    return res.status(403).send("You are not admin");
  } else {
    next();
  }
};
