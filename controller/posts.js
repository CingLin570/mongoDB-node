const { successHandle, errorHandle } = require("../utils/responseHandle");
require("../connection");
const Post = require("../models/posts");

const posts = {
  async getPost({ req, res }) {
    const post = await Post.find();
    successHandle(res, 200, post);
  },
  // 使用解構 body 不用注意參數順序
  async createPost({ req, res , body }) {
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
  },
  async deleteAllPosts({ req, res }) {
    const post = await Post.deleteMany({});
    successHandle(res, 200, post);
  },
  async deleteOnePost({ req, res }) {
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
  },
  async PatchOnePost({ req, res, body }) {
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
  }
}
module.exports = posts;