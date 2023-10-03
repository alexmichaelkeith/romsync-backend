const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

// Define routes for handling data-related operations
router.get("/", dataController.getData);
router.post("/", dataController.postData);
router.delete("/", dataController.deleteData);

module.exports = router;
