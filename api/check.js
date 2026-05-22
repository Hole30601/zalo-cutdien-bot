const getLichCatDien =
require("../services/scraper");

const sendAllMessage =
require("../services/sendAllMessage");

const {
  loadData,
  saveData
} = require("../utils/storage");

module.exports = async (
  req,
  res
) => {

  try {

    const current =
      await getLichCatDien();

    const old =
      await loadData();

    const newItems =
      current.filter(
        item =>
          !old.includes(item)
      );

    if (
      newItems.length > 0
    ) {

      const message =
`⚡ Có lịch cắt điện mới

${newItems.join("\n")}`;

      await sendAllMessage(
        message
      );

      await saveData(
        current
      );

      return res.json({
        success: true,
        sent: true,
        count:
          newItems.length
      });

    }

    return res.json({
      success: true,
      sent: false
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

};
