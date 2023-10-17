const admin = require("firebase-admin");
const Busboy = require("busboy");
const jwt = require('jsonwebtoken');

// Create
const postData = async (req, res) => {
  const bb = Busboy({ headers: req.headers });

  bb.on('file', (name, file, info) => {
    const bucket = admin.storage().bucket();
    const storageFilePath = req.query.user + '/' + info.filename;

    const fileStream = bucket.file(storageFilePath).createWriteStream();

    file.pipe(fileStream);

    fileStream.on("error", (err) => {
      console.error("Error uploading file:", err);
      return res.status(500).json({ error: "Error uploading file" });
    });

    fileStream.on("finish", () => {
      return res.status(200).json({ message: "File uploaded successfully" });
    });
  });

  bb.end(req.rawBody);
};

// Read
const getData = async (req, res) => {

  const token = req.query.authorization;
  if (!token) {
    return res.status(401).send('Unauthorized');
  }
  const secretKey = process.env.JWT_SECRET;

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).send('Invalid token');
    }
  });

  if (!req.query.fileName) {
    try {
      const directory = req.query.directory;
      // Get a reference to your Firebase Storage bucket
      const bucket = admin.storage().bucket();

      // Specify the prefix (directory) you want to list files from
      const prefix = `${directory}/`;
      // List all files in the specified directory
      const [files] = await bucket.getFiles({ prefix });
      const fileDetails = [];

      // Iterate through the list of files and fetch metadata for each file
      for (const file of files) {
        const [metadata] = await file.getMetadata();
        const lastUpdated = metadata.updated;
        const location = file.name;
        const fileName = location.substring(location.lastIndexOf("/") + 1);
        // Add file details to the array
        if (fileName) {
          fileDetails.push({
            name: fileName,
            lastUpdated: lastUpdated,
            location: location,
            size: metadata.size,
          });
        }
      }

      return res.json({ files: fileDetails });
    } catch (error) {
      console.error("Error listing files:", error);
      return res.status(500).send("Error listing files");
    }
  }

  const bucket = admin.storage().bucket();

  const directory = req.query.directory + "/" + req.query.fileName;

  const file = bucket.file(directory);

  // Read the file from Firebase Storage
  file
    .download()
    .then((data) => {
      const fileContent = data[0];
      return res.send(fileContent);
    })
    .catch((error) => {
      console.error("Error reading file:", error);
      return res.status(500).send("Error reading file");
    });
};

// Delete
const deleteData = async (req, res) => {
  try {
    const bucket = admin.storage().bucket();

    const directory = req.query.directory;

    const file = bucket.file(directory);

    // Delete the file
    await file.delete();

    res.status(204).send(); // No content, successful deletion
  } catch (error) {
    return res.status(500).send("Error deleting file");
  }
};

module.exports = { postData, getData, deleteData };
