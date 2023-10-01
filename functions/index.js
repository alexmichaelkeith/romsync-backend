const admin = require("firebase-admin");
const functions = require("firebase-functions");
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const db = admin.firestore();
const express = require("express");
const api = express();

const usersRoute = require("./src/routes/usersRoute");
const cors = require("cors")({
  origin: true,
});
api.use(cors);
api.use("/users", usersRoute);

api.get("/firestore", async (request, response) => {
  // Reference to the "users" collection
  const usersCollection = db.collection("users");
  async function getDocumentIds() {
    try {
      const querySnapshot = await usersCollection.get();
      const documentNames = querySnapshot.docs.map((doc) => doc.id);
      return documentNames;
    } catch (error) {
      console.error("Error getting documents: ", error);
      throw error;
    }
  }

  try {
    const documentNames = await getDocumentIds();
    response.send(documentNames); // Send the document IDs as a response
  } catch (error) {
    response.status(500).send("Failed to retrieve document IDs");
  }
});

api.post("/user", (request, response) => {
  const validEmail = (email) => {
    const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
    if (!email) return false;

    if (email.length > 254) return false;

    const valid = emailRegex.test(email);
    if (!valid) return false;

    // Further checking of some things regex can't handle
    const parts = email.split("@");
    if (parts[0].length > 64) return false;

    const domainParts = parts[1].split(".");
    if (
      domainParts.some((part) => {
        return part.length > 63;
      })
    ) {
      return false;
    }

    return true;
  };

  const validPassword = (password) => {
    return password && password.length < 6 ? false : true;
  };

  if (!validEmail(request.query.email)) {
    response.send("Invalid Email Address");
  }
  if (!validPassword(request.query.password)) {
    response.send("Password must be at least six charactors");
  }

  admin
    .auth()
    .createUser({
      email: request.query.email,
      password: request.query.password,
      displayName: request.query.displayName,
    })
    .then((userRecord) => {
      response.send("Success");
    })
    .catch((error) => {
      response.send(error.message);
    });
});

exports.api = functions.https.onRequest(api);
