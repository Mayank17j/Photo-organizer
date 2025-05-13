const axios = require("axios");
require("dotenv").config();

//create axiosInstance to get request
const axiosInstance = axios.create({
  baseURL: "https://api.unsplash.com", //baseURL, headers must be exactly same as client want,
  headers: {
    Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`, //Case sensetive
    "Content-Type": "application/json",
  },
});

// Debugging Axios instance configuration
/*
if (
  !axiosInstance.defaults.baseURL ||
  !axiosInstance.defaults.headers.Authorization
) {
  console.error("LOG: Axios. axiosInstance incorrect:", {
    baseURL: axiosInstance.defaults.baseURL,
    Authorization: axiosInstance.defaults.headers.Authorization,
  });
} else {
  console.log("LOG: Axios. axiosInstance  successfully configured:", {
    baseURL: axiosInstance.defaults.baseURL,
    Authorization: axiosInstance.defaults.headers.Authorization,
  });
}
*/
module.exports = axiosInstance;
