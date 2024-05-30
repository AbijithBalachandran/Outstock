
const isLogin = async(req,res,next)=>{
      try {
          if(req.session.admin_id){
            next();
              
          }else{
            res.redirect('/admin');
            return;
          }  
      } catch (error) {
            console.log(error.message);
      }
}

const isLogOut = async(req,res,next)=>{

      try {
            if(req.session.admin_id){
                  res.redirect('/admin/dashboard');
                  return;
            }else{
                  next();
            }
      } catch (error) {
            console.log(error.message);
      }
}

module.exports={
      isLogin,
      isLogOut
}
