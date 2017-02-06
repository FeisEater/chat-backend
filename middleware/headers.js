"use strict";

/**
 * Unmade middleware for parsing headers if it's needed
 */
module.exports.parseHeader = (req, res, next) => {
  if (req.method === 'OPTIONS') {
      console.log("hello");
      var headers = {};
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
      headers["Access-Control-Allow-Credentials"] = false;
      headers["Access-Control-Max-Age"] = '86400'; // 24 hours
      headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-Access-Token";
      res.writeHead(200, headers);
      res.end();
  }
  // if (!req.headers["x-access-token"]) {
  //   return res.status(401).send({
  //     message: "Please make sure your request has X-Access-Token header",
  //   });
  // } else {
  //   next();
  // }
};
