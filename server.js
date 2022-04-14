const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Room = require("./models/rooms");
const headers = require("./headers");
const errorHandle = require("./errorHandle");

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
  if (req.url === "/rooms" && req.method === "GET") {
    const room = await Room.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        room,
      })
    );
    res.end();
  } else if (req.url === "/rooms" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const newRoom = await Room.create({
          name: data.name,
          price: data.price,
          rating: data.rating,
        });
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: "success",
            room: newRoom,
          })
        );
        res.end();
      } catch (error) {
        errorHandle(res, "欄位沒有正確，或沒有此 ID");
      }
    });
  } else if (req.url === "/rooms" && req.method === "DELETE") {
    await Room.deleteMany({});
    const roomCount = await Room.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        room: roomCount,
      })
    );
    res.end();
  } else if (req.url.startsWith("/rooms/") && req.method === "DELETE") {
    try {
      const id = req.url.split("/").pop();
      const room = await Room.findByIdAndDelete(id);
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: "success",
          room,
        })
      );
      res.end();
    } catch (error) {
      errorHandle(res, "欄位沒有正確，或沒有此 ID");
    }
  } else if (req.url.startsWith("/rooms/") && req.method === "PATCH") {
    req.on("end", async () => {
      try {
        const id = req.url.split("/").pop();
        const name = JSON.parse(body).name;
        if (name !== undefined) {
          await Room.findByIdAndUpdate(id, {
            name: name,
          });
          const room = await Room.findById(id);
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "success",
              room,
            })
          );
          res.end();
        } else {
          errorHandle(res, "欄位沒有正確，或沒有此 ID");
        }
      } catch (error) {
        errorHandle(res, "欄位沒有正確，或沒有此 ID");
      }
    });
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT);
