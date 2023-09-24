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
        const seller = await pool.query("SELECT first_name,last_name FROM users U,roles R WHERE U.id = $1 and R.name='sellers'",[req.user]);
        res.json(seller[0]); //whole data of user 



    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

module.exports = router;