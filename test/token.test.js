const { test } = require("tap");
const Authorizer = require("../");
const config = require("./config");

test(`Test jwt token validator OK`, async (t) => {
  const authorizer = new Authorizer({});
  Authorizer.printOptions();

  await authorizer.init();

  authorizer.authenticate()({}, null, config.token, (err, success) => {
    console.log(success);
    console.log(`error: ${err}`);
  });
});

test(`Test jwt token validator NOK`, async (t) => {
  const authorizer = new Authorizer({});
  Authorizer.printOptions();

  await authorizer.init();

  authorizer.authenticate()({}, "jwt", "asdfasdfa", (err, success) => {
    console.log(success);
    console.log(`error: ${err}`);
  });
});
