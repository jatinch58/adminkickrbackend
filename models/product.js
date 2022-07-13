const { model, Schema } = require("mongoose");
const user = require("./user");
const productSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productOfferPrice: {
      type: Number,
      required: true,
    },
    productMainImgUrl: {
      type: String,
      required: true,
    },
    productImgUrl: [
      {
        type: String,
      },
    ],
    productCategory: {
      type: String,
      required: true,
    },
    productSubCategory: {
      type: String,
      required: true,
    },
    productStock: {
      type: Boolean,
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    demolink: {
      type: String,
    },
    productReview: [
      {
        review: {
          type: Number,
        },
        reviewBy: {
          type: Schema.Types.ObjectId,
          ref: user,
        },
      },
    ],
    productComments: [
      {
        comment: {
          type: String,
        },
        commentBy: {
          type: Schema.Types.ObjectId,
          ref: user,
        },
      },
    ],
  },
  { timestamps: true }
);
module.exports = model("product", productSchema);
