const Authorizer = require("../");

const authorizer = new Authorizer({
  fallback: {
    type: './.trash/authorizer',
    credentials: './.trash/credentials.json'
  }
});

const token = process.env['TEST_TOKEN']
// authorizer.

async function main() {
  Authorizer.printOptions();

  await authorizer.init()

  authorizer.authenticate()({},null, token, (err, success) => {
    console.log(success);
    console.log(`error: ${err}`);
  });

  authorizer.authenticate()({},"test", "test1", (err, success) => {
    console.log(success);
    console.log(`error: ${err}`);
  });

  setTimeout(()=> {
    authorizer.authenticate()({},null, token, (err, success) => {
        console.log(success);
        console.log(`error: ${err}`);
      });
  }, 2000)
}

main().then(
  () => {},
  (err) => {
    console.log(err);
  }
);
