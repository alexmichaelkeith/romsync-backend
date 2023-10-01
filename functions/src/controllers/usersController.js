const admin = require("firebase-admin");
const db = admin.firestore();

// Controller function to get all users
const getAllUsers = async (req, res) => {
  const usersCollection = db.collection("users");
  async function getDocumentIds() {
    try {
      const querySnapshot = await usersCollection.get();
      const documentNames = querySnapshot.docs.map((doc) => doc.id);
      return documentNames;
    } catch (error) {
      throw error;
    }
  }
  try {
    const documentNames = await getDocumentIds();
    res.send(documentNames);
  } catch (error) {
    response.status(500).send("Failed to retrieve document IDs");
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id
  const usersCollection = db.collection("users");

  res.send(userId)
};  

module.exports = { getAllUsers, getUserById };
