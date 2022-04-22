const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Post = require("./models/posts");
const { successHandle, errorHandle } = require("./utils/responseHandle");

dotenv.config({ path: "./.env" });
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
// 連接資料庫
mongoose
  .connect(DB)
  .then(() => {
    console.log("資料庫連線成功");
  })
  .catch((error) => {
    console.log(error);
  });

const requestListener = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  if (req.url === "/posts" && req.method === "GET") {
    const post = await Post.find();
    successHandle(res, 200, post);
  } else if (req.url === "/posts" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        if(data.content !== "") {
          let { name, content, image, likes } = data;
          const newPost = await Post.create({
            name,
            content,
            image,
            likes,
          });
          successHandle(res, 200, newPost);
        } else {
          errorHandle(res, 400, "content欄位尚未填寫");
        }
      } catch (error) {
        errorHandle(res, 400, "欄位沒有正確");
      }
    });
  } else if (req.url === "/posts" && req.method === "DELETE") {
    const post = await Post.deleteMany({});
    successHandle(res, 200, post);
  } else if (req.url.startsWith("/posts/") && req.method === "DELETE") {
    try {
      const id = req.url.split("/").pop();
      const post = await Post.findByIdAndDelete(id);
      if(post !== null) {
        successHandle(res, 200, post);
      } else {
        errorHandle(res, 400, "此id不存在");
      }
    } catch (error) {
      errorHandle(res, 400, "欄位沒有正確，或無此ID");
    }
  } else if (req.url.startsWith("/posts/") && req.method === "PATCH") {
    req.on("end", async () => {
      try {
        const id = req.url.split("/").pop();
        const data = JSON.parse(body);
        if (data.content !== "") {
          let { content, image, likes } = data;
          const post = await Post.findByIdAndUpdate(id, {
            $set: {
              content,
              image,
              likes,
            }
          });
          if(post !== null) {
            successHandle(res, 200, post);
          } else {
            errorHandle(res, 400, "此id不存在");
          }
        } else {
          errorHandle(res, 400, "content欄位不能為空值");
        }
      } catch (error) {
        errorHandle(res, 400, "欄位沒有正確");
      }
    });
  } else if (req.url === "/posts" && req.method === "OPTIONS") {
    successHandle(res, 200, "OPTIONS");
  } else {
    errorHandle(res, 404, "無此網頁路由");
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT);
