module.exports =
 async (req, res) => {

 const event =
  req.body;

 if (
  event.event_name ===
  "message.text.received"
 ) {

  const text =
   event.message?.text?.trim();

  const userId =
   String(
    event.message?.chat?.id ||
    event.message?.from?.id
   );

  await handleMessage(
   userId,
   text
  );
 }

 res.status(200).send("OK");
};
