"use strict";

const expect = require("chai").expect;
const Sinon = require("sinon");

const TGclass = require("../../services/TokenGenerator").class;
const TokenG = new TGclass("testsecret");

const mockUser = require("../mockdata/db").user;

let calledParams = {};

describe("TokenGenerator", () => {
  describe("generateToken(user)", () => {
    it("should generate valid token", () => {
      const token = TokenG.generateToken(mockUser);
      const decoded = TokenG.decodeToken(token);
      expect(decoded.user.id).to.equal(mockUser.id);
      expect(decoded.user.role).to.equal(mockUser.role);
    });
  });
});
