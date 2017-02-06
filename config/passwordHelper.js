const bcrypt = require("bcrypt-nodejs");

module.exports.hashPassword = (password) => {
  return bcrypt.hashSync(password);
};

module.exports.comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};
