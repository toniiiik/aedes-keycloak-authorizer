const Authorizer = require("../");

const authorizer = new Authorizer();

const token = process.env['TEST_TOKEN']
// authorizer.

async function main() {
  Authorizer.printOptions();

  authorizer.authenticate()({},null, token, (err, success) => {
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
