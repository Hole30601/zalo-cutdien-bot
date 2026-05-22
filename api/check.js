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
    item => !old.includes(item)
   );

  if (newItems.length) {

   await sendAllMessage(
`⚡ Có lịch cắt điện mới

${newItems.join("\n")}`
   );

   await saveData(current);
  }

  res.status(200).send("OK");

 } catch (err) {

  console.error(err);

  res.status(500).send(
   err.message
  );
 }
};
