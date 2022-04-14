const headers = require("./headers");
function errorHandle(res, data) {
  res.writeHead(400, headers);
  res.write(
    JSON.stringify({
      status: "false",
      message: data,
      error: "error",
    })
  );
  res.end();
}
module.exports = errorHandle;
