const headers = require("./headers");
const errorHandle = (res, status, data) => {
  res.writeHead(status ,headers);
  res.write(
    JSON.stringify({
      status: "false",
      message: data,
      error: "error",
    }, null, 2)
  );
  res.end();
}
const successHandle = (res, status, data) => {
  res.writeHead(status, headers);
  res.write(
    JSON.stringify({
      status: "success",
      message: data,
    }, null, 2)
  );
  res.end();
}
module.exports = {
  errorHandle,
  successHandle
}