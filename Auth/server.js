require("dotenv").config();
const path=require('path');
var cors = require("cors");
const express = require("express");
const app = express();
const https = require("https");
const cookieparser = require("cookie-parser");

const port = process.env.AUTH_PORT;
const bodyparser = require("body-parser");
const credentials = {
    key: process.env.PRIVATE_KEY,
    cert: process.env.CERTIFICATE,
  };

app.use(
    cors({
      origin: `http://localhost:${process.env.GAME_PORT}`,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieparser());

  app.use((err, req, res, next) => {
    const statusCode = err.statusCode | 500;
    res.status(statusCode).send(err.message);
  });

  var httpsServer = https.createServer(credentials, app);
   httpsServer.listen(port, () =>
  console.log(`Auth server listening on port ${port}`),
);