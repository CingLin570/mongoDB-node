const HttpController = require("../controller/http");
const PostController = require("../controller/posts");

const routes = async (req, res) => {
  const { method, url } = req;
  console.log(method , url);
  
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  if (url === "/posts" && method === "GET") {
    PostController.getPost({ req, res });
  } else if (url === "/posts" && method === "POST") {
    req.on("end", () => PostController.createPost({ req, res, body }));
  } else if (url === "/posts" && method === "DELETE") {
    PostController.deleteAllPosts({ req, res });
  } else if (url.startsWith("/posts/") && method === "DELETE") {
    PostController.deleteOnePost({ req, res });
  } else if (url.startsWith("/posts/") && method === "PATCH") {
    req.on("end", () => PostController.PatchOnePost({ req, res, body }));
  } else if (url === "/posts" && method === "OPTIONS") {
    HttpController.cors(req, res);
  } else {
    HttpController.notFound(req, res);
  }
}
module.exports = routes;