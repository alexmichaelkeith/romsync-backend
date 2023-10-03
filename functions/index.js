const express = require("express");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const app = express();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: "gs://rombackend.appspot.com/",
});
const cors = require("cors")({
  origin: true,
});

const dataRoute = require("./src/routes/dataRoute");
const usersRoute = require("./src/routes/usersRoute");

app.use(cors);

app.use("/data", dataRoute);
app.use("/users", usersRoute);

exports.app = functions.https.onRequest(app);
