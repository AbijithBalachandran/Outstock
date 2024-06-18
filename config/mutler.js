const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'C:/Users/abiji/OneDrive/Desktop/First Project/Furnituer_products/public/upload/product'); 
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



const fileFilter = (req, file, cb) => {
  // Check file types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
  } else {
      cb(new Error('Please upload only JPG, JPEG, or PNG files.'), false); // Reject the file
  }
};

const uploaded = multer({ storage, fileFilter });



    module.exports={upload,uploaded}