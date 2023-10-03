const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

// Define routes for handling user-related operations
router.get("/", usersController.getUser);
router.post("/", usersController.postUser);
router.put("/", usersController.putUser);
router.delete("/", usersController.deleteUser);

module.exports = router;
