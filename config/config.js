// config/config.js

require("dotenv").config(); 
const config = {
  port: process.env.PORT || 5000,  
  nodeEnv: process.env.NODE_ENV || "development", 
};

module.exports = config;
