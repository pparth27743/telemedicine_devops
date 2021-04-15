const router = require("express").Router();
const { checkToken } = require("../middleware/jwt_validation");
const {
    createUser,
    login,
    getUserByUserId,
    getUsers,
    updateUsers,
    deleteUser,
    getUserByUserEmail,
    validateUser
} = require("./user.controller");


router.get("/validate", checkToken, validateUser);
router.post("/login", login);
router.get("/getallusers", checkToken, getUsers);
router.post("/signup", createUser);
router.get("/:id", checkToken, getUserByUserId);
router.patch("/", checkToken, updateUsers);
router.delete("/", checkToken, deleteUser);

module.exports = router;