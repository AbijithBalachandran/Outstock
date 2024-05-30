const {v4: uuidv4} = require('uuid')

const sessionSecret = uuidv4();
module.exports ={
      sessionSecret
}