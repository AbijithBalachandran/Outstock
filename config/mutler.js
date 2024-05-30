const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'C:/Users/abiji/OneDrive/Desktop/First Project/Furnituer_products/public/upload/'); 
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`); 
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(
          new Error('Please upload only jpg, jpeg, png'),
          false
        );
      }
      cb(undefined, true);
    },
    }); 


    module.exports={upload}