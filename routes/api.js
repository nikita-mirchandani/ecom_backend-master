const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db/index');
const authorization = require("../middleware/authorization");
const validInfo = require("../middleware/validinfo");
// ROUTES //

// create a product - seller endpoint
// here seller's id would be fetch from token after login 
router.post("/createproduct",authorization,async (req,res)=>{
    try{
            const seller = await pool.query("SELECT S.id FROM users U,sellers S WHERE U.id = $1 and U.id=S.admin_id ",[req.user]);
            // res.json(seller[0]); //whole data of user 
            console.log("Seller id is",seller[0].id);

            // console.log(req.body); /**whatever we send from postman as a req that is printed in our console */
            const { name,short_desc,long_desc,bullets,brand_id,category_id,price,min_price,max_price,original_price,status } = req.body;
            const newProduct = await pool.query(
                "INSERT INTO products (name,short_desc,long_desc,bullets,brand_id,category_id,seller_id,price,min_price,max_price,original_price,status )VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING * ",
                [name,short_desc,long_desc,bullets,brand_id,category_id,seller[0].id,price,min_price,max_price,original_price,status]
                );
            res.json("product is inserted!"); //going to get response in json
               console.log(res);
    }catch(err){
            console.error(err.message);
    } 
     // RETURNING means to return that data in response and RETURNING is used for (insert and update)

})  //post to add the data 


//  get all products or List all products - Ecomm endpoints (use api/listProducts in postman)
router.get("/listProducts",authorization,async (req,res)=>{
    try{
       const allproducts = await pool.query("SELECT * FROM products");
       res.json(allproducts)
    } catch(err){
        console.error(err.message);
    }
})


// get a Product by name
// router.get("/:name",async (req,res)=>{
//     try{
//         // console.log(req.params); //it prints the id which passed by the user in the url
//         const {name} = req.params;   
//         const product = await pool.query("SELECT * FROM products WHERE name = $1",[name]); //todo_id is column name in db and id is variable which is taking out the passed number in the url
//         res.json(product);
//     } catch(err){
//         console.error(err.message);
//     }
// })

// update a product's price (or any detail later) on the basis of name
router.put("/:name",async (req,res)=>{
    try{
        const {name} = req.params;
        const {price} = req.body;
        const updateTodo = await pool.query("UPDATE products SET price = $1 WHERE name = $2",[price,name]); //todo_id is column name in db and id is variable which is taking out the passed number in the url
        res.json('product was updated!');

    }catch(err){
        console.log(err.message);
    }
})

// // delete a product by name
// router.delete("/:name",async (req,res) =>{
//     try{
//         const {name} = req.params;
//         const deleteTodo = await pool.query("DELETE FROM products WHERE name = $1",[name]);
//         res.json("product was Deleted!")
//     }catch(err){
//         console.log(err.message);
//     }
// })


// List Categories
router.get("/listCategories",authorization,async (req,res)=>{
    try{
       const allcategories = await pool.query("SELECT * FROM categories");
       res.json(allcategories)
    } catch(err){
        console.error(err.message);
    }
})

// List Brands
router.get("/listBrands",authorization,async (req,res)=>{
    try{
       const allbrands = await pool.query("SELECT * FROM brands");
       res.json(allbrands)
    } catch(err){
        console.error(err.message);
    }
})

// Lists Product by brands (includes authorization means USer/seller should be login first)
router.get("/brands/:brandname",authorization,async (req,res)=>{ //http:localhost:5000/api/brands/Zara using token of login seller in headers
    try{
        // console.log(req.params); //it prints the id which passed by the user in the url
        const {brandname} = req.params;  
        console.log(brandname); 
        const product = await pool.query("SELECT P.* FROM products P, brands B WHERE B.name= $1 and P.brand_id=B.id",[brandname]); //todo_id is column name in db and id is variable which is taking out the passed number in the url
        res.json(product);
    } catch(err){
        console.error(err.message);
    }
})


// Lists Product by category (includes authorization means USer/seller should be login first)
router.get("/Categories/:categoryname",authorization,async (req,res)=>{  //http:localhost:5000/api/Categories/Clothes using token of login seller in headers
    try{
        // console.log(req.params.category); //it prints the id which passed by the user in the url
        const {category_name} = req.params.category;  
        // console.log(category_name); 
        const product = await pool.query("SELECT P.* FROM products P, categories C WHERE C.name= $1 and P.category_id=C.id",[req.params.category]); 
        console.log(product);
        res.json(product);
    } catch(err){
        console.error(err.message);
    }
})

// Lists Product by SELLERS (includes authorization means Useer/seller should be login first)
router.get("/sellers/:selleremail",authorization,async (req,res)=>{ //http:localhost:5000/api/sellers/tanvidogra@gmail.com using token of login seller in headers
    try{
        // console.log(req.params); //it prints the id which passed by the user in the url
        const {selleremail} = req.params;  
        console.log(selleremail);
        const product = await pool.query("SELECT P.* FROM products P, sellers S, users U WHERE U.email= $1 and U.id= S.admin_id and S.id=P.seller_id;",[selleremail]); //todo_id is column name in db and id is variable which is taking out the passed number in the url
        res.json(product);
    } catch(err){
        console.error(err.message);
    }
})

//  Connection  --> seller(table--.id) and products table-->(seller_id)

//  Update user profile endpoint is a post req with all seller fields that they can update such as name,email,address,etc
//  need authorization of seller (find seller by his unique email  (Changes need to do : while connecting to frontend , after login it should taken session email) )
router.post("/sellers/edituserprofile/:selleremail",validInfo,async(req,res)=>{
    try{
         
         const {first_name,last_name,email,password,phone,company,address1,address2,address3,city,state,postal_code} = req.body;
         const {selleremail} = req.params;
         const seller = await pool.query("SELECT * FROM users U,sellers S WHERE U.email = $1 and U.id=S.admin_id;",[selleremail]);
        //  console.log("Seller id is",seller,selleremail);
         
        // res.json(seller);
         if(seller.length == 0){ 
            return res.status(401).send('Seller User doesn\'t exists'); //unauthorized - 401
        } 
        console.log(seller[0].id);
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        // console.log("password: ",password,first_name);
        
        const bcryptPassword = await bcrypt.hash(password, salt);
        // console.log(bcryptPassword);
        const edituser = await pool.query(`UPDATE users SET first_name = $1,
            last_name = $2,email = $3,password = $4,phone = $5 WHERE email=$6`,
             [first_name,last_name,email,password,phone,selleremail]);
    
         const EDITSeller = await pool.query(`UPDATE sellers SET company = $1,address1 = $2,address2 = $3,address3 = $4,city = $5,state = $6,postal_code = $7 WHERE id = $8 `,
             [company,address1,address2,address3,city,state,postal_code,seller[0].id]);

            res.json("Seller Profile is updated!"); //going to get response in json
 
    }catch(err){
        console.log(err.message);
    }
})



module.exports = router;
