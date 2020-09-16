// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase");
var moment = require("moment"); // require
// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");

var firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.apiKey,
  measurementId: process.env.measurementId,
};

function writeOrderData(customerName, order) {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }
  const databaseRef = firebase.database().ref();
  const todayOrderRef = databaseRef.child(moment().format("D-MMM-YYYY"));
  const item = {
    order: order,
    completed: false,
    customerName: customerName,
    time: moment().format("H-mm-SSS"),
  };
  todayOrderRef.push(item);
}
module.exports.writeOrderData = writeOrderData;
