const authenticate = require("./authenticate");
const checkSession = require("./checkSession");
const notFound = require("./404Page");

module.exports = {
  authenticate,
  checkSession,
  notFound
};
