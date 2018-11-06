
const express = require("express");

const helmet = require("helmet");
const path = require("path");

const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "../public");

const dataFetcher = require("./app/weatherDataFetching");

let app = express();
app.use(helmet());
app.use(express.static(publicPath));
app.set("view engine", "ejs");
app.set("views", publicPath);


// homepage route 

app.get("/", function(req, res){
  res.render("index.ejs", {"website": req.protocol + "://" + req.get("host")});
});


// route for ajax call, returns json data
app.get("/api", function(req, res){
  let lat = req.query.lat;
  let lon = req.query.lon;

  console.log("Made it here");
  if (lat && lon){   
    dataFetcher.fetchWeatherDataForLonLat(lon, lat, res)
  } else {
    dataFetcher.attemptToFetchWeatherDataAutomatically(req, res);
  }
});


app.listen(PORT, console.log(`App running on port ${PORT}`));