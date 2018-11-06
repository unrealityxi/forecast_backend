const KEY = process.env.KEY || "8c727caf6986d2ec011d65331644a320";
const axios = require("axios");
const bodyParser = require("body-parser");
const geoCodeUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=";
const weatherUrl = "https://api.darksky.net/forecast/";
const ipLookupUrl = "https://freegeoip.net/json/";


function attemptToFetchWeatherDataAutomatically(req, res){

  let ip;
  let website;
  let address;

  // Determine clients ip address 
  if (req.headers["x-forwarded-for"]){
    ip = req.headers["x-forwarded-for"].split(",")[0];
  } else {
    ip = req.connection.remoteAddress;
  }

  // city/address information from the client
  let city = encodeURIComponent(req.query.location);

  // if city or address was provided through get request, 
  // sets things up for rest of the route to make call 
  // to googles geolocation api
  // if not, sets things up for call to freeGeoIp
  if (city !== "undefined"){
    website = geoCodeUrl;
    address = city;
  } else {
    website = ipLookupUrl;
    address = ip;
  }


  // gets geodata from either Google api or geoIP api
  axios.get(`${website}${address}`).then((response) => {

    let data;
    let lat;
    let lng;

    // response.data.results is the way google api responds
    // if (response.data.status === "ZERO_RESULTS"){
        
    // }
    if (response.data.results){
      data = response.data.results[0];
      req.address = data.formatted_address;
      lat = data.geometry.location.lat;
      lng = data.geometry.location.lng;
    } 
    // this is data from geoip, in case that google didnt happen
    else {
      data = response.data;
      req.address = `${data.city}, ${data.country_name}`;
      lat = data.latitude;
      lng = data.longitude;
    }
    
    // figures out requestedm easuring units, auto works best
    let units = req.query.units || "auto";

    // gets weather data for said location
    return axios.get(`${weatherUrl}${KEY}/${lat},${lng}?units=${units}`);
  }).then((response) => {

    // sends weather data JSON back to client
    response.data.address = req.address;
    res.send(response.data);
  }).catch((e) => {
    return res.send({"error": `Fetching weather data for ${ip} failed`, "errorMessage": e.message});
  });

}

let ip;
  let website;
  let address;

function fetchWeatherDataForLonLat(lon, lat, res){
  return axios.get(`${weatherUrl}${KEY}/${lat},${lon}?units=auto`)
  .then((weatherData) => {
   return res.send(weatherData.data);
  }).catch((e) => {
   return res.send(e);
  })
}

module.exports = {
  fetchWeatherDataForLonLat,
  attemptToFetchWeatherDataAutomatically
}