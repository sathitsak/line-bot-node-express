"use strict";

// create LINE SDK config from env variables
const { config, ownerId } = require("./config/line");

const line = require("@line/bot-sdk");
const express = require("express");
const middleware = require("@line/bot-sdk").middleware;
var { isOrder, sendOrderToDB } = require("./module/order");

const SignatureValidationFailed = require("@line/bot-sdk")
  .SignatureValidationFailed;

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// create LINE SDK client
const client = new line.Client(config);

app.use(middleware(config));

app.post("/webhook", (req, res) => {
  res.json(req.body.events); // req.body will be webhook event object
});

app.use((err, req, res, next) => {
  if (err instanceof SignatureValidationFailed) {
    res.status(401).send(err.signature);
    return;
  } else if (err instanceof JSONParseError) {
    res.status(400).send(err.raw);
    return;
  }
  next(err); // will throw default 500
});
// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/callback", (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  var replyMessage = { type: "text", text: "event.message.text" };
  const customerName = await getCustomerName(event);
  if (isOrder(event)) {
    sendOrderToDB(event, customerName);
    replyMessage.text = "ได้รับออเดอร์ แล้ว , order received";
    // Auto message to owner when there is new order
    client.pushMessage(ownerId, {
      type: "text",
      text: "มีออเดอร์ใหม่เข้ามา , new order has arrived",
    });
  } else {
    replyMessage.text =
      "กรุณา พิมพ์ order ตามด้วยรายการอาหาร เช่น order ข้าวผัดไก่ 1 กล่อง.\n" +
      "To make an order please type order follow with the item you wish to order \n" +
      "example: order one chicken fried rice";
  }

  return client.replyMessage(event.replyToken, replyMessage);
}
async function getCustomerName(event) {
  const clientName = await client.getProfile(event.source.userId);
  return clientName.displayName;
}

// listen on port
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
