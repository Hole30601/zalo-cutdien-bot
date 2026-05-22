const express = require("express");

const { ADMIN_ID } =
require("../config");

const getLichCatDien =
require("../services/scraper");

const sendMessage =
require("../services/zalo");

const sendMessageToUser =
require("../services/sendMessageToUser");

const db =
require("../firebase");

const {
  getSubscribers,
  addSubscriber,
  removeSubscriber
} = require("../utils/subscribers");

const app = express();

app.use(express.json());

let waitingBroadcast = false;

async function handleMessage(
  userId,
  text
) {

  try {

    await db
      .ref("users")
      .child(userId)
      .set({
        userId,
        updatedAt: Date.now()
      });

    if (
      waitingBroadcast &&
      userId === String(ADMIN_ID) &&
      !text.startsWith("/")
    ) {

      waitingBroadcast = false;

      await sendMessage(
`📢 THÔNG BÁO

${text}`
      );

      await sendMessageToUser(
        userId,
        "✅ Đã gửi thông báo tới tất cả người nhận."
      );

      return;
    }

    if (text === "/start") {

      return sendMessageToUser(
        userId,
`👋 Xin chào

Tôi là bot thông báo lịch cắt điện.

/help
Xem danh sách lệnh

/dangky
Đăng ký nhận thông báo

/huy
Hủy nhận thông báo`
      );

    }

    if (text === "/help") {

      return sendMessageToUser(
        userId,
`📖 Danh sách lệnh

/start
/help
/id

⚡ Điện Đóm

/kiemtra
Kiểm tra lịch cắt điện hiện tại

/dangky
Đăng ký nhận thông báo

/huy
Hủy nhận thông báo

👑 Admin

/sendmes
/adduser ID
/deluser ID
/users`
      );

    }

    if (text === "/id") {

      return sendMessageToUser(
        userId,
        `ID của bạn\n\n${userId}`
      );

    }

    if (text === "/kiemtra") {

      const current =
        await getLichCatDien();

      let message =
        "⚡ LỊCH CẮT ĐIỆN HIỆN TẠI\n\n";

      if (
        !current ||
        current.length === 0
      ) {

        message +=
          "Không có lịch cắt điện.";

      } else {

        message +=
          current.join("\n");

      }

      return sendMessageToUser(
        userId,
        message
      );

    }

    if (text === "/dangky") {

      await addSubscriber(userId);

      return sendMessageToUser(
        userId,
        "✅ Đã đăng ký nhận thông báo lịch cắt điện."
      );

    }

    if (text === "/huy") {

      await removeSubscriber(userId);

      return sendMessageToUser(
        userId,
        "❌ Đã hủy nhận thông báo."
      );

    }

    if (
      text.startsWith("/adduser ")
    ) {

      if (
        userId !== String(ADMIN_ID)
      ) {

        return sendMessageToUser(
          userId,
          "❌ Bạn không phải admin."
        );

      }

      const targetId =
        text.replace(
          "/adduser ",
          ""
        ).trim();

      await addSubscriber(
        targetId
      );

      return sendMessageToUser(
        userId,
`✅ Đã thêm người nhận

${targetId}`
      );

    }

    if (
      text.startsWith("/deluser ")
    ) {

      if (
        userId !== String(ADMIN_ID)
      ) {

        return sendMessageToUser(
          userId,
          "❌ Bạn không phải admin."
        );

      }

      const targetId =
        text.replace(
          "/deluser ",
          ""
        ).trim();

      await removeSubscriber(
        targetId
      );

      return sendMessageToUser(
        userId,
`🗑️ Đã xóa

${targetId}`
      );

    }

    if (text === "/users") {

      if (
        userId !== String(ADMIN_ID)
      ) {

        return sendMessageToUser(
          userId,
          "❌ Bạn không phải admin."
        );

      }

      const users =
        await getSubscribers();

      return sendMessageToUser(
        userId,
`👥 Danh sách người nhận

${users.length
  ? users.join("\n")
  : "Trống"}`
      );

    }

    if (text === "/sendmes") {

      if (
        userId !== String(ADMIN_ID)
      ) {

        return sendMessageToUser(
          userId,
          "❌ Bạn không phải admin."
        );

      }

      waitingBroadcast = true;

      return sendMessageToUser(
        userId,
        "📢 Hãy nhập nội dung thông báo."
      );

    }

  } catch (err) {

    console.error(err);

  }

}

app.post("/", async (req, res) => {

  try {

    const data = req.body;

    const userId =
      String(
        data.sender?.id ||
        data.userId
      );

    const text =
      data.message?.text ||
      data.text;

    if (
      userId &&
      text
    ) {

      await handleMessage(
        userId,
        text
      );

    }

    res.status(200).json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }

});

module.exports = app;
