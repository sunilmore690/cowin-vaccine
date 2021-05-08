var axios = require("axios");

var axiosInstance = axios.create({
  baseURL: "https://cdn-api.co-vin.in/api/v2"
  /* other custom settings */
});

module.exports = axiosInstance;
