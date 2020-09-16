var { writeOrderData } = require("./firebase");
function isOrder(event) {
  var text = event.message.text;
  return text.match(/order/g);
}

function sendOrderToDB(event, customerName) {
  var text = event.message.text;
  var order = text.match(/order(.*)/)[1].trim();
  console.log(order, "from", customerName);
  writeOrderData(customerName, order, "today");
}

module.exports.isOrder = isOrder;
module.exports.sendOrderToDB = sendOrderToDB;
