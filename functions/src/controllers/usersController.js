const admin = require("firebase-admin");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const functions = require('firebase-functions');


function generateToken(email) {
  const payload = { email };
  const secretKey = process.env.JWT_SECRET;
  const token = jwt.sign(payload, secretKey);
  return token;
}

// Create
const postUser = async (req, res) => {
  
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

  if (!validEmail(req.query.email)) {
    return res.status(400).json("Email is invalid");
  }
  if (!validPassword(req.query.password)) {
    return res.status(400).send("Password is invalid");
  }


  // Hash the user's password
  const hashedPassword = await bcrypt.hash(req.query.password, 10);

  // Store the user in Firestore
  const userRef = admin.firestore().collection('users').doc(req.query.email);
  await userRef.set({ email: req.query.email, password: hashedPassword });

  res.status(201).send('User registered successfully');
  
};




// Read
const getUser = async (req, res) => {
  
  const email = req.query.email
  const password = req.query.password

  // Retrieve the user from Firestore
  const userRef = admin.firestore().collection('users').doc(email);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    return res.status(401).send('Invalid email or password');
  }

  const userData = snapshot.data();
  // Compare the input password with the stored password hash
  const passwordMatch = await bcrypt.compare(password, userData.password);

  if (!passwordMatch) {
    return res.status(401).send('Invalid email or password');
  }

  const token = generateToken(email);

  res.status(200).send(token);

};

// Update
const putUser = async (req, res) => {
  res.send("test");
};

// Delete
const deleteUser = async (req, res) => {
  res.send("test");
};

module.exports = { postUser, getUser, putUser, deleteUser };
