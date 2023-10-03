const admin = require("firebase-admin");
const Busboy = require("busboy");

// Create
const postData = async (req, res) => {
  const busboy = new Busboy({ headers: req.headers });

  busboy.on("file", (fieldname, file, filename) => {
    const bucket = admin.storage().bucket();
    const storageFilePath = `akeithx/${filename}`; // Specify the path where you want to store the file in Firebase Storage

    const fileStream = bucket.file(storageFilePath).createWriteStream();

    file.pipe(fileStream);

    fileStream.on("error", (err) => {
      console.error("Error uploading file:", err);
      res.status(500).json({ error: "Error uploading file" });
    });

    fileStream.on("finish", () => {
      res.status(200).json({ message: "File uploaded successfully" });
    });
  });

  busboy.end(req.rawBody);
};

// Read
const getData = async (req, res) => {
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

      res.json({ files: fileDetails });
    } catch (error) {
      console.error("Error listing files:", error);
      res.status(500).send("Error listing files");
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
      res.send(fileContent);
    })
    .catch((error) => {
      console.error("Error reading file:", error);
      res.status(500).send("Error reading file");
    });
};

// Update
const putData = async (req, res) => {
  res.send("test");
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
    console.error("Error deleting file:", error);
    res.status(500).send("Error deleting file");
  }
};

module.exports = { postData, getData, putData, deleteData };
