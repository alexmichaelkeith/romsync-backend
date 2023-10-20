const admin = require("firebase-admin");
const Busboy = require("busboy");
const jwt = require("jsonwebtoken");
// Create
const postData = async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  const secretKey = process.env.JWT_SECRET;

  // REPLACE WITH SAFE ID NOT EMAIL BACKSLASH ISSUE
  const user = jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).send("Invalid token");
    }
    return user.username;
  });

  const bb = Busboy({
    headers: req.headers,
  });
  bb.on("file", (name, file, info) => {
    const bucket = admin.storage().bucket();
    const prefix = `${user}/`;
    
    const storageFilePath = prefix + req.headers.filename;
    const customMetadata = {
      lastModified: req.headers.lastmodified,
      createdtime: req.headers.createdtime,
    };

    const fileStream = bucket
      .file(storageFilePath)
      .createWriteStream({ metadata: { metadata: customMetadata } });
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
  const token = req.headers.authorization;
  const filename = req.headers.filename
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  const secretKey = process.env.JWT_SECRET;

  const user = jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).send("Invalid token");
    }
    return user.username;
  });
  if (!filename) {
    try {
      // Get a reference to your Firebase Storage bucket
      const bucket = admin.storage().bucket();

      // Specify the prefix (directory) you want to list files from
      const prefix = `${user}/`;
      // List all files in the specified directory
      const [files] = await bucket.getFiles({ prefix });
      const fileDetails = [];
      // Iterate through the list of files and fetch metadata for each file
      for (const file of files) {
        const [metadata] = await file.getMetadata();
        const lastUpdated = metadata.updated;
        const location = file.name;
        const fileName = location.substring(location.lastIndexOf("/") + 1);
        const getLastModified = await file
          .getMetadata()
          .then((data) => {
            const customMetadata = data[0].metadata; // Access custom metadata
            return customMetadata.lastModified;
          })
          .catch((error) => {
            console.error("Error getting metadata:", error);
            return undefined;
          });
        const ctime = await file
          .getMetadata()
          .then((data) => {
            const customMetadata = data[0].metadata; // Access custom metadata
            return customMetadata.createdtime;
          })
          .catch((error) => {
            console.error("Error getting metadata:", error);
            return undefined;
          });

        // Add file details to the array
        if (fileName) {
          fileDetails.push({
            fileName: fileName,
            lastModified: getLastModified,
            createdtime: ctime,
            lastUpdated: lastUpdated,
            location: location,
            size: metadata.size,
          });
        }
      }

      return res.json(fileDetails);
    } catch (error) {
      console.error("Error listing files:", error);
      return res.status(500).send("Error listing files");
    }
  }

  try {
    const bucket = admin.storage().bucket();
    const prefix = `${user}/`;
    const file = bucket.file(prefix + req.headers.filename);
    const metadata = await file.getMetadata();
    const stream = file.createReadStream();
    res.set({
      lastmodified: metadata[0].metadata.lastModified,
      createdtime: metadata[0].metadata.createdtime,
    });
    stream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

// Delete
const deleteData = async (req, res) => {
  try {
    const bucket = admin.storage().bucket();

    //const directory = req.query.directory;

    const file = bucket.file(directory);

    // Delete the file
    await file.delete();

    res.status(204).send(); // No content, successful deletion
  } catch (error) {
    return res.status(500).send("Error deleting file");
  }
};

module.exports = { postData, getData, deleteData };
