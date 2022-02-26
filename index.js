const express = require("express");
const session = require("express-session");
const parseurl = require("parseurl");

const { createClient } = require("redis");
let RedisStore = require("connect-redis")(session);
let redisClient = createClient({ legacyMode: true });
redisClient.connect().catch(console.error);

const app = express();
app.use(
  session({
    name: "mockSessionId",
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({ client: redisClient }),
    cookie: {
      secure: false,
      httpOnly: false,
    },
  })
);

app.use((req, res, next) => {
  if (!req.session.views) {
    req.session.views = {};
  }

  // get the url pathname
  var pathname = parseurl(req).pathname;

  // count the views
  req.session.views[pathname] = (req.session.views[pathname] || 0) + 1;

  next();
});

app.get("/foo", function (req, res, next) {
  res.send("you viewed this page " + req.session.views["/foo"] + " times");
});

app.get("/bar", function (req, res, next) {
  res.send("you viewed this page " + req.session.views["/bar"] + " times");
});

app.listen(3000, () => {
  console.log("Application available!");
});
