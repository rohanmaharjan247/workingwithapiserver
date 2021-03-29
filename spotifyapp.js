const querystring = require("querystring");
const { URLSearchParams } = require("url");
const axios = require("axios");
const FormData = require("form-data");
const SpotifyWebApi = require("spotify-web-api-node");

const CLIENT_ID = "9c608a59662d42f59c9e3ff2bc969481";
const CLIENT_SECRET = "6d1e59eb3ec94e66a3e886b2ba1999e5";
const redirect_uri =
  'https://workingwithapi.herokuapp.com/spotify/callback';
 // "http://localhost:4200/spotify/callback";

const stateKey = "spotify_auth_state";
var access_token = "",
  refresh_token = "";

var spotifyApi = new SpotifyWebApi({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: redirect_uri,
});
var scopes = [
  "user-read-private",
  "user-read-email",
  "playlist-modify-public",
  "playlist-modify-private",
];

var generateRandomString = (length) => {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

module.exports = (app, config) => {
  //serialize and deserialize user are functions to handle sessions automatically

  app.get("/spotifyauth", (req, res) => {
    var state = generateRandomString(16);
    //res.cookie(stateKey, state);
    var html = spotifyApi.createAuthorizeURL(scopes);
    // "&show_dialog=true"
    res.send(JSON.stringify({ link: html, state: state }));
  
  });

  app.get("/callback", async function (req, res) {
    // your application requests refresh and access tokens
    // after checking the state parameter
    console.log("callback called");

     const { code } = req.query;
    // console.log(code);
    // try {
    //   var data = await spotifyApi.authorizationCodeGrant(code);
    //   const { access_token, refresh_token } = data.body;
    //   spotifyApi.setAccessToken(access_token);
    //   spotifyApi.setRefreshToken(refresh_token);

    //   res.redirect("/spotify/profile");
    // } catch (err) {
    //   res.redirect("/#/error/invalid token");
    // }
    // console.log(req.query);
    // var code = req.query.code || null;
    // var state = req.query.state || null;
    // var storedState = req.cookies ? req.cookies[stateKey] : null;

    // if (state === null || state !== storedState) {
    //   res.send(
    //     JSON.stringify({
    //       message: "State mismatch " + req.cookies[stateKey] + " " + state,
    //       result: false,
    //       reques: req.cookies
    //     })
    //   );
    // } else {
    //res.clearCookie(stateKey);

    const data = new URLSearchParams();

    data.append("code", code);
    data.append("redirect_uri", redirect_uri);
    data.append("grant_type", "authorization_code");

    var authOptions = {
      method: "POST",
      url: "https://accounts.spotify.com/api/token",
      data: data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      },
    };

    axios(authOptions)
      .then((spotifyResponse) => {
        if (spotifyResponse.status === 200) {
          access_token = spotifyResponse.data.access_token;
          refresh_token = spotifyResponse.data.refresh_token;

          res.send({ message: access_token, result: true });
          // we can also pass the token to the browser to make requests from there
          // res.redirect(
          //   "/#" +
          //     querystring.stringify({
          //       access_token: access_token,
          //       refresh_token: refresh_token,
          //     })
          // );
        } else {
          res.send({ message: "Invalid Token", result: false });
        }
      })
      .catch((err) => {
        console.error(err);
      });
    // }
  });

  app.get("/refresh_token", function (req, res) {
    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
      method: "POST",
      url: "https://accounts.spotify.com/api/token",
      headers: {
        Authorization:
          "Basic " +
          new Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      },
      form: {
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      },
      json: true,
    };

    axios(authOptions).then((refreshReponse) => {
      if (refreshReponse.status === 200) {
        var access_token = refreshReponse.data.access_token;
        res.send({
          access_token: access_token,
        });
      }
    });
  });

  app.get("/profile", (req, res) => {
    var access_token = req.get("Authorization");

    var options = {
      method: "GET",
      url: "https://api.spotify.com/v1/me",
      headers: { Authorization: "Bearer " + access_token },
    };

    // use the access token to access the Spotify Web API
    axios(options)
      .then((profile) => {
        res.send(profile.data);
      })
      .catch((err) => {
        console.error(err.data);
        //res.redirect("http://localhost:9091/spotifyauth");
      });
  });

  app.get("/playlists", (req, res) => {
    var access_token = req.get("Authorization");

    var options = {
      method: "GET",
      url: "https://api.spotify.com/v1/me/playlists",
      headers: { Authorization: "Bearer " + access_token },
    };

    // use the access token to access the Spotify Web API
    axios(options)
      .then((playlist) => {
        res.send(playlist.data);
      })
      .catch((err) => {
        console.error(err.data);
        //res.redirect("http://localhost:9091/spotifyauth");
      });
  });

  app.get("/userplaylist", (req, res) => {
    var access_token = req.get("Authorization");
    var userId = req.query.userid;

    var options = {
      method: "GET",
      url: `https://api.spotify.com/v1/users/${userId}/playlists`,
      headers: { Authorization: "Bearer " + access_token },
    };

    axios(options)
      .then((userPlaylist) => {
        res.send(userPlaylist.data);
      })
      .catch((err) => {
        console.error(err.data);
      });
  });

  app.get("/playlistinfo", (req, res) => {
    var access_token = req.get("Authorization");
    var playlistid = req.query.playlistid;

    var options = {
      method: "GET",
      url: `https://api.spotify.com/v1/playlists/${playlistid}`,
      headers: { Authorization: "Bearer " + access_token },
    };

    axios(options)
      .then((playlist) => {
        res.send(playlist.data);
      })
      .catch((err) => {
        console.error(err.data);
      });
  });
};
