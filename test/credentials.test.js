const Authorizer = require("..");
const { test } = require("tap");
const config = require("./config");
// authorizer.

test(`Test username password validation OK`, async (t) => {
  const authorizer = new Authorizer({
    authUrl: "https://auth.dev.tlmd.goldmann.sk/auth",
  });
  Authorizer.printOptions();

  await authorizer.init();

  let user = {}

  return new Promise((resolve) => { 
    authorizer.authenticate()(
      user,
      config.username,
      config.password,
      (err, success) => {
        t.same(success, true, "user is authenticated");
        t.same("tlmd-dev\\" + user.claims.preferred_username, config.username, "username is test");
        resolve() 
      }
    );
  })
});
