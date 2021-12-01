import { Product } from "../../models";
import multer from "multer";
import path from 'path';
import { CustomErrorHandler } from '../../services';
import Joi from 'joi';
import fs from 'fs';
import productSchema from "../../validators/productValidators";


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round() * 1E9}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const handleMultipartData = multer({
  storage,
  limits: {
    fileSize: 1000000 * 5 // 5 mb
  }
}).single('image');

const productController = {
  async store(req, res, next) {
    // Multipart form data
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message))
      }
      console.log(req.file);

      const filePath = req.file.path;

      // validation


      const { error } = productSchema.validate(req.body);

      if (error) {
        // delete upload image
        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          if (err) {
            return next(CustomErrorHandler.serverError());
          }
        });
        return next(error);
      }

      const { name, price, size } = req.body;
      let document;
      try {
        document = await Product.create({
          name,
          price,
          size,
          image: filePath
        });


      } catch (err) {
        return next(err);
      }
      res.status(201).json(document);

    });
  },

  async update(req, res, next) {
    //
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message))
      }
      //console.log(req.file);

      let filePath;

      if (req.file) {
        filePath = req.file.path;
      }

      // validation


      const { error } = productSchema.validate(req.body);

      if (error) {
        // delete upload image
        if (req.file) {
          fs.unlink(`${appRoot}/${filePath}`, (err) => {
            if (err) {
              return next(CustomErrorHandler.serverError(err.message));
            }
          });
        }
        return next(error);
      }

      const { name, price, size } = req.body;
      let document;
      try {
        document = await Product.findOneAndUpdate({
          _id: req.params.id
        }, {
          name,
          price,
          size,
          ...(req.file && {
            image: filePath
          })
        }, { new: true });
        console.log(document);
      } catch (err) {
        return next(err);
      }
      res.status(201).json(document);

    });
  },

  // delete
  async distroy(req, res, next) {

    // validation

    let document;
    try {
      document = await Product.findOneAndRemove({
        _id: req.params.id
      });
      if (!document) {
        return next(new Error("Nothing to delete!"));
      }
      // image delete
      const imagePath = document._doc.image;
      fs.unlink(`${appRoot}/${imagePath}`, (err) => {
        if (err) {
          return next(CustomErrorHandler.serverError());
        }
      });
    } catch (err) {
      return next(err);
    }
    res.json(document);

  },

  async index(req, res, next) {
    let documents;
    // pagination -- mongoose-pagination

    try {
      documents = await Product.find().select("-__v -updatedAt").sort({ createdAt: -1 });

    } catch (err) {

      return next(CustomErrorHandler.serverError());

    }

    return res.json(documents);
  },

  async show(req, res, next) {
    let documents;

    try {
      documents = await Product.findOne({ _id: req.params.id }).select("-__v -updatedAt");

    } catch (err) {

      return next(CustomErrorHandler.serverError());

    }

    return res.json(documents);
  }

}

export default productController;