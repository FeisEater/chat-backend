"use strict";

const errors = require("../config/errors");

module.exports.parseUpload = (maxMBFileSize) => (req, res, next) => {
  const parsedForm = {};
  const chunks = [];
  let dataSize = 0;

  new Promise((resolve, reject) => {
    req.pipe(req.busboy);
    req.busboy.on("error", (error) => {
      reject(error);
    });
    req.busboy.on("field", (key, value, keyTruncated, valueTruncated) => {
      parsedForm[key] = value ? JSON.parse(value) : undefined;
    });
    req.busboy.on("file", (fieldname, file, filename) => {
      file.on("data", (data) => {
        chunks.push(data);
        dataSize += data.length;
        if (dataSize > maxMBFileSize * 1000000) {
          reject(new errors.BadRequestError(`File was over ${maxFileSize} MB.`));
        }
      });
      file.on("end", () => {
        parsedForm.file = Buffer.concat(chunks);
        parsedForm.fileExt = filename.substr(filename.lastIndexOf(".") + 1);
      });
    });
    req.busboy.on("finish", () => {
      resolve(parsedForm);
    });
  })
  .then(data => {
    req.body = data;
    next();
  })
  .catch(err => next(err));
};
