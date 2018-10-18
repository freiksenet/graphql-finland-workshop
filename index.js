const { ApolloServer } = require("apollo-server");
const schema = require("./schema");
const schema2 = require("./schema2");
const makeSchema = require("./makeSchema");
const data = require("./data2");
const JsonPlaceholderResource = require("./JsonPlaceholderResource");
const PostModel = require("./PostModel");
const UserModel = require("./UserModel");

const jsonPlaceholderResource = new JsonPlaceholderResource(
  "https://jsonplaceholder.typicode.com"
);

async function makeServer() {
  const schema = await makeSchema();
  return new ApolloServer({
    schema: schema,
    context: ({ req }) => {
      const userId = req.headers["authentication"];

      return {
        postModel: new PostModel(jsonPlaceholderResource, userId),
        userModel: new UserModel(jsonPlaceholderResource, userId),
        userId: userId
      };
    }
  });
}

makeServer().then(server =>
  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  })
);
