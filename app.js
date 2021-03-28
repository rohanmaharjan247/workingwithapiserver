const express = require("express");
const axios = require("axios");
const cors = require("cors");
const  cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require("passport");
const fs = require("fs");

const app = express();
app.use(cors()).use(cookieParser());
//passport initialization
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())


const apiUrl = "http://api.openweathermap.org/data/2.5";
const port = process.env.PORT || 9091;

const config = fs.readFileSync("./config.json", "utf-8");
const config_json = JSON.parse(config);
const cityname = 'Kathmandu';

const stotifyapp = require('./spotifyapp')(app, config_json);

app.get("/", (request, response) => {
  response.send("Open Weather API");
});

app.get("/currentweather", async (request, response) => {
  const weather_response = await axios.get(`${apiUrl}/weather`, {
    params: {
      q: cityname,
      appid: config_json.appid,
      units: "metric"
    },
  });

  response.send(weather_response.data);
});

app.get("/hourlyweather", async (request, response) => {
  const weather_response = await axios.get(`${apiUrl}/weather`, {
    params: {
      q: cityname,
      appid: config_json.appid,
      units: "metric"
    },
  });

  response.send(weather_response.data);
});

app.get('/currentairpollution', async(request, response)=>{
  const lat = request.query.lat;
  const lon = request.query.lon;    
  const current_ap_response = await axios.get(`${apiUrl}/air_pollution`,{
    params:{
      lat: lat,
      lon: lon,
      appid: config_json.appid
    }
  })

  response.send(current_ap_response.data);
})


app.get('/forecastairpollution', async (request, response)=>{
  const lat = request.query.lat;
  const lon = request.query.lon;  
  const forecast_ap_response = await axios.get(`${apiUrl}/air_pollution/forecast`,{
    params:{
      lat: lat,
      lon: lon,
      appid: config_json.appid
    }
  })

  response.send(forecast_ap_response.data);
})


app.get('/airpollutionhistory', async (request, response)=>{
  const lat = request.query.lat;
  const lon = request.query.lon;  
  const start = request.query.start;  
  const end = request.query.end;  
  const forecast_ap_response = await axios.get(`${apiUrl}/air_pollution/history`,{
    params:{
      lat: lat,
      lon: lon,
      start: start,
      end: end,
      appid: config_json.appid
    }
  })

  response.send(forecast_ap_response.data);
})

app.get('/onecall', async (request, response)=>{
  const lat = request.query.lat;
  const lon = request.query.lon;    
  const dailyforecast_response = await axios.get(`${apiUrl}/onecall`, {
    params: {
      lat: lat,
      lon: lon,        
      appid: config_json.appid,
      units: "metric",
      exclude: "hourly,minutely,current"
    },
  });

  response.send(dailyforecast_response.data);
})

app.listen(port, () => {
  console.log("App listening to:" + port);
});


