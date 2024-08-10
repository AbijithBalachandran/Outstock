
const isAuthenticate = (req,res,next)=>{
      if (req.session && req.session.userData_id){
            next();
      }else{
            res.status(401).json({redirectUrl:'/login'})
      }
};


module.exports={
      isAuthenticate
}