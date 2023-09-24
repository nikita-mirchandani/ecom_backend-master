const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db/index');
const jwtGenerator = require('../utils/jwtGenerator')
const validInfo = require("../middleware/validinfo");
const Authorization = require("../middleware/authorization");
const authorization = require("../middleware/authorization");
//registering  route
router.post("/register",validInfo,async(req,res)=>{
    try {
        //1.destructure the req.body(name,email,password)

        const {first_name,last_name,email,password,phone} = req.body;

        //2.check user exist (if user exits then throw error)
        
        const user = await pool.query("SELECT * FROM users WHERE email = $1",[email]);
        
        // res.json(user);

        if(user.length !=0){ //if user exists
            return res.status(401).send('User already exists'); //unauthorized - 401
        }
        //3. Bcrypt the user password
        console.log("p is : ",password);
        //if user is not unique it will continue
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);

        const bcryptPassword = await bcrypt.hash(password, salt);

        //4. enter the new user inside our db
        
        //this is for  user (hence role should be bydefault of user) : 

        // Explaination :  if we are in login page of user hence we require to fill user's fn,ln,email and password but in db 
        // we have a field of role_id which is a foreign key from table roles. hence by default i've set that the role_id should be selected where
        // the rolename is user . hence in this below query it is possible to enter only fn,ln,email and password and user can login

        // INSERT INTO users (role_id, first_name , last_name, email, password, phone) 
        // SELECT R.id,'sizuka','ejbef','shizuka@gmail.com','Passwordcdnndnhere','8875496455' FROM "roles" R WHERE R.name='users';


        const newUser = await pool.query(`INSERT INTO users(role_id,first_name,last_name,email,password,phone) SELECT R.id,$1, $2,$3,$4,$5 FROM "roles" R WHERE R.name = 'users' RETURNING *`, [first_name,last_name,email,bcryptPassword,phone]);

        
        // const newUser = await pool.query(`INSERT INTO users(role_id,first_name,last_name,email,password,phone) SELECT R.id,$1,$2,$3,$4,$5 FROM "roles" R WHERE R.name = $6 RETURNING *`,
        //  [first_name,last_name,email,bcryptPassword,phone,role]);



        // res.json(newUser);
        
        //5. generating our jwt token
        const token = jwtGenerator(newUser.id);

        res.json({token});


    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

router.post("/login",validInfo,async(req,res)=>{
    try {

        //1.destructure the req.body

        const {email,password} = req.body;

        //2.check if user doesnt exist (if not then we throw error)

        const user= await pool.query("SELECT * FROM users WHERE email = $1",[email]);
        // res.json(user[0].password);
        
        if(user.length === 0){
            return res.status(401).json("Password or Email is incorrect!"); //unauthorized - 401
        }
        
        //3.check if incoming password is the same the database password
        const validPassword = await bcrypt.compare(password,user[0].password);
        if(!validPassword){
            return res.status(401).json("Password or Email is incorrect!")
        }

        // 4. give them the jwt token 
        const token = jwtGenerator(user[0].id);
        res.json({token});
        
    } catch (error) {
        console.error(error.message);
    }
})



//Seller side login and register
router.post("/sellerregister",validInfo,async(req,res)=>{
    try {
        //1.destructure the req.body(name,email,password)

        const {first_name,last_name,email,password,phone,company,address1,address2,address3,city,state,postal_code} = req.body;


        //2.check user exist (if seller user exits then throw error)
        
        const user = await pool.query("SELECT * FROM users U,roles R WHERE U.email = $1 and R.name='sellers';",[email]);
        
        // res.json(user);

        if(user.length !=0){ //if user exists
            return res.status(401).send('Seller User already exists'); //unauthorized - 401
        }
        //3. Bcrypt the user password
        
        //if user is not unique it will continue
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);

        const bcryptPassword = await bcrypt.hash(password, salt);

        //4. enter the new user inside our db
        
        //this is for  user (hence role should be bydefault of user) : 

        // Explaination :  if we are in login page of user hence we require to fill user's fn,ln,email and password but in db 
        // we have a field of role_id which is a foreign key from table roles. hence by default i've set that the role_id should be selected where
        // the rolename is user . hence in this below query it is possible to enter only fn,ln,email and password and user can login

        // INSERT INTO users (role_id, first_name , last_name, email, password, phone) 
        // SELECT R.id,'sizuka','ejbef','shizuka@gmail.com','Passwordcdnndnhere','8875496455' FROM "roles" R WHERE R.name='users';

        const newuser = await pool.query(`INSERT INTO users(role_id,first_name,
            last_name,email,password,phone) SELECT R.id,$1,$2,$3,$4,$5 FROM 
            "roles" R WHERE R.name = 'sellers' RETURNING *`,
             [first_name,last_name,email,bcryptPassword,phone]);

            // console.log(newuser);

            //  INSERT INTO sellers(company,address1,address2,address3,
            //     --         city,state,postal_code,admin_id) 
            //     --         SELECT 'bfjbfej','jwf','ehfbj','ehfb','fehebf','ebhfj',454655,U.id FROM "users" U,"roles" R
            //     --         WHERE U.id = 'f1503101-4994-47aa-9a1d-41c913357e1f' and R.name='sellers' RETURNING *
       
    //    on the basis of unique email id 
            const newSeller = await pool.query(`INSERT INTO sellers(company,address1,address2,address3,
        city,state,postal_code,admin_id) 
        SELECT $1,$2,$3,$4,$5,$6,$7,U.id FROM "users" U,"roles" R WHERE U.email=$8 and U.role_id=R.id and R.name='sellers' RETURNING *`,
         [company,address1,address2,address3,city,state,postal_code,
            email]);



        // res.json(newSeller);
        
        //5. generating our jwt token
        const token = jwtGenerator(newSeller.id);

        res.json({token});


    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

router.post("/sellerlogin",validInfo,async(req,res)=>{
    try {

        //1.destructure the req.body

        const {email,password} = req.body;

        //2.check if seller doesnt exist (if not then we throw error)

        const user= await pool.query("SELECT * FROM users WHERE email = $1 and role_id= (select id from roles where name = 'sellers');  ",[email]);
        // res.json(user[0].password);
        
        if(user.length === 0){
            return res.status(401).json("Password or Email is incorrect!"); //unauthorized - 401
        }
        
        //3.check if incoming password is the same the database password
        const validPassword = await bcrypt.compare(password,user[0].password);
        if(!validPassword){
            return res.status(401).json("Password or Email is incorrect!")
        }

        // 4. give them the jwt token 
        const token = jwtGenerator(user[0].id);
        res.json({token});
        
    } catch (error) {
        console.error(error.message);
    }
})


router.get("/is-verify",authorization,async (req,res)=>{
    try {
        res.json(true);
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
})

module.exports = router;