const routes = require("./routers")
const app = async (req, res) => {
  routes(req, res);
};

module.exports = app;