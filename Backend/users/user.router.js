const router = require("express").Router();
const { checkToken } = require("../middleware/jwt_validation");
const {
    createUser,
    login,
    updateUsers,
    deleteUser,
    validateUser,
    getDoctors,
    addToWaitList,
    getWaitingPatients,
    removePatientFromWaitlist
} = require("./user.controller");


router.get("/validate", checkToken, validateUser);

router.post("/login", login);
router.post("/signup", createUser);
router.post("/getdoctors", getDoctors);
router.post("/addtowaitlist", addToWaitList);
router.post("/getwaitingpatients", getWaitingPatients);
router.post("/removefromwaitlist", removePatientFromWaitlist);



router.patch("/", checkToken, updateUsers);
router.delete("/doctor", checkToken, deleteUser);


module.exports = router;