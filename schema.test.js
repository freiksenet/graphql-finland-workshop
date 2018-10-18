const schema = require("./schema");
const { graphql } = require("graphql");
const PostModel = require("./PostModel");
const UserModel = require("./UserModel");

class MockJsonPlaceholder {
  constructor(data) {
    this.data = data;
  }

  async query(resource) {
    const [uri, querystring] = resource.split("?");
    const [type, param] = uri.split("/");
    if (querystring) {
      const ids = querystring.split("&");
      const idValues = ids.map(id => id.split("=")[1]);
      const idName = ids[0].split("=")[0];
      return idValues.map(idValue =>
        this.data[type].filter(obj => obj[idName] === idValue)
      );
    } else {
      return this.data[type].find(obj => obj.id === param);
    }
    return null;
  }
}

const mockPlaceholder = new MockJsonPlaceholder(require("./data2"));

it("returns post", async () => {
  const result = await graphql({
    schema: schema,
    source: `
      {
       	postById(id:"81") {
          title
        }
      }
    `,
    contextValue: {
      postModel: new PostModel(mockPlaceholder),
      userModel: new UserModel(mockPlaceholder)
    }
  });
  expect(result).toEqual({
    data: {
      postById: {
        title: "tempora rem veritatis voluptas quo dolores vero"
      }
    }
  });
});
