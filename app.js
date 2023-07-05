const express = require("express");
const { Server } = require("http"); // 1. 모듈 불러오기
const socketIo = require("socket.io"); // 1. 모듈 불러오기

const cookieParser = require("cookie-parser");
const goodsRouter = require("./routes/goods.js");
const usersRouter = require("./routes/users.js");
const authRouter = require("./routes/auth.js");
const connect = require("./schemas");

const app = express();
const http = Server(app); // 2. express app을 http 서버로 감싸기
const io = socketIo(http); // 3. http 객체를 Socket.io 모듈에 넘겨서 소켓 핸들러 생성

const port = 3000;

connect(); // mongoose를 연결합니다.

// 4. 소켓 연결 이벤트 핸들링
io.on("connection", (sock) => {
  console.log("새로운 소켓이 연결됐어요!"); // 소켓 사용자 접속

  // 클라이언트가 상품을 구매했을 때, 발생하는 이벤트
  sock.on("BUY", (data) => {
    const { nickname, goodsId, goodsName } = data;

    const emitData = {
      // emitDate 만들기
      nickname: nickname,
      goodsId: goodsId,
      goodsName: goodsName,
      date: new Date().toISOString(),
    };

    // 클라이언트가 구매한 정보를 바탕으로 BUY_GOODS 메세지 전달 ( 소켓에 접속한 모든 클라이언트)
    // sock.emit
    io.emit("BUY_GOODS", emitData);
  });

  sock.on("disconnect", () => {
    console.log(sock.id, "연결이 끊어졌어요!");
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("assets"));
app.use("/api", [goodsRouter, usersRouter, authRouter]);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

http.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
