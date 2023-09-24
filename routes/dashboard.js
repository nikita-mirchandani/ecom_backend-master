const router = require("express").Router();
const pool = require('../db/index');
const authorization = require("../middleware/authorization");
router.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
router.get('/',authorization, async (req,res)=>{
    try {
        //req.user has the payload
        // res.json(req.user);
        const user = await pool.query("SELECT first_name,last_name FROM users WHERE id = $1",[req.user]);
        res.json(user[0]); //whole data of user 



    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

module.exports = router;