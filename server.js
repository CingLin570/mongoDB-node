const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Post = require("./models/posts");
const headers = require("./headers");
const errorHandle = require("./responseHandle");

dotenv.config({ path: "./config.env" });
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
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        post,
      })
    );
    res.end();
  } else if (req.url === "/posts" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        if(data.content !== undefined) {
          let {name, content, image, likes } = data;
          const newPost = await Post.create({
            name,
            content,
            image,
            likes,
          });
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "success",
              post: newPost,
            })
          );
          res.end();
        } else {
          errorHandle(res, 400, "欄位沒有正確，或沒有此 ID");
        }
      } catch (error) {
        errorHandle(res, 400, 400, "欄位沒有正確，或沒有此 ID");
      }
    });
  } else if (req.url === "/posts" && req.method === "DELETE") {
    await Post.deleteMany({});
    const postCount = await Post.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        post: postCount,
      })
    );
    res.end();
  } else if (req.url.startsWith("/posts/") && req.method === "DELETE") {
    try {
      const id = req.url.split("/").pop();
      const post = await Post.findByIdAndDelete(id);
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: "success",
          post,
        })
      );
      res.end();
    } catch (error) {
      errorHandle(res, 400, "欄位沒有正確，或沒有此 ID");
    }
  } else if (req.url.startsWith("/posts/") && req.method === "PATCH") {
    req.on("end", async () => {
      try {
        const id = req.url.split("/").pop();
        const name = JSON.parse(body).name;
        if (name !== undefined) {
          await Post.findByIdAndUpdate(id, {
            name: name,
          });
          const post = await Post.findById(id);
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "success",
              post,
            })
          );
          res.end();
        } else {
          errorHandle(res, 400, "欄位沒有正確，或沒有此 ID");
        }
      } catch (error) {
        errorHandle(res, 400, "欄位沒有正確，或沒有此 ID");
      }
    });
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT);
