const User = require('../Models/user');
const isLogin = async(req,res,next)=>{
      try {
        
        if (req.session.userData_id) {
          const user_id = req.session.userData_id;
          const user = await User.findById({_id:user_id})
          if(user_id && user.is_block == true){
            return res.redirect('/');
          }else{
            next();
          }
         }else{
          return res.redirect('/');
         }    
      } catch (error) {
          console.log(error.message);  
      }
}

const isLogout = async(req,res,next)=>{
      try {
      if (req.session.userData_id) {
        const user_id =req.session.userData_id;
        const user = await User.findById({_id:user_id});
        if (user) {
            return res.redirect('/home');
        } else {
            next();
        }   
      }else{
        next();
      }
      } catch (error) {
        console.log(error.message);    
      }
}

module.exports={
      isLogin,
      isLogout
}
