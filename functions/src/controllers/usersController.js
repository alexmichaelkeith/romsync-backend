const admin = require("firebase-admin");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


function generateToken(email) {
  const payload = { email };
  const secretKey = process.env.JWT_SECRET;
  const token = jwt.sign(payload, secretKey);
  return token;
}

// Create
const postUser = async (req, res) => {
  
  const username = req.headers.username
  const email = req.headers.email
  const password = req.headers.password

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

  const validUsername = (username) => {
    const regex = /^[a-zA-Z0-9]+$/;
    return username && username.length < 10 && regex.test(username) ? true : false;
  };


  if (!validEmail(email)) {
    return res.status(400).json("Email is invalid");
  }
  if (!validPassword(password)) {
    return res.status(400).send("Password is invalid");
  }
  if (!validUsername(username)) {
    return res.status(400).send("Username is invalid");
  }
  // Hash the user's password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Store the user in Firestore
  const userRef = admin.firestore().collection('users').doc(username);
  await userRef.set({ username: username, email: email, password: hashedPassword });

  res.status(201).send('User registered successfully');
  
};




// Read
const getUser = async (req, res) => {
  
  const password = req.headers.password
  const username = req.headers.username
  // Retrieve the user from Firestore
  const userRef = admin.firestore().collection('users').doc(username);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    return res.status(401).send('Invalid username or password');
  }

  const userData = snapshot.data();
  // Compare the input password with the stored password hash
  const passwordMatch = await bcrypt.compare(password, userData.password);

  if (!passwordMatch) {
    return res.status(401).send('Invalid username or password');
  }

  const token = generateToken(username);

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
