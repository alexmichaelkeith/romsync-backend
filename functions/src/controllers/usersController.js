const admin = require("firebase-admin");

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
    res.send("Invalid Email Address");
  }
  if (!validPassword(req.query.password)) {
    res.send("Password must be at least six charactors");
  }

  admin
    .auth()
    .createUser({
      email: req.query.email,
      password: req.query.password,
      displayName: req.query.displayName,
    })
    .then((userRecord) => {
      res.send("Success");
    })
    .catch((error) => {
      res.send(error.message);
    });
};

// Read
const getUser = async (req, res) => {
  res.send("test");
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
