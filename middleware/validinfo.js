module.exports = (req, res, next)=> {
    const {email,first_name,last_name,password} = req.body;
  
    function validEmail(email) {
      return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
    }
  
    if (req.path === "/register" || req.path === "/sellerregister") {
      console.log(!email.length);
      if (![email, first_name,last_name, password].every(Boolean)) {
        return res.json("Missing Credentials");
      } else if (!validEmail(email)) {
        return res.status(401).json("Invalid Email");
      }
    } 
    
    else if (req.path === "/login" || req.path==="/sellerlogin") {
      if (![email, password].every(Boolean)) {
        return res.status(401).json("Missing Credentials");
      } else if (!validEmail(email)) {
        return res.status(401).json("Invalid Email");
      }
    }
  
    next();
  };