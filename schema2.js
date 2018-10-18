const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLNonNull,
  GraphQLList,
  GraphQLBoolean
} = require("graphql");

const Post = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    user: {
      type: new GraphQLNonNull(User)
    },
    title: {
      type: new GraphQLNonNull(GraphQLString)
    },
    body: {
      type: GraphQLString
    }
  })
});

const User = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    username: {
      type: new GraphQLNonNull(GraphQLString)
    },
    posts: {
      type: new GraphQLList(Post)
    }
  })
});

const PageInfo = new GraphQLObjectType({
  name: "PageInfo",
  fields: () => ({
    lastCursor: {
      type: new GraphQLNonNull(GraphQLString)
    },
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean)
    }
  })
});

function createEdgeAndConnection(type, pageInfo) {
  const edge = new GraphQLObjectType({
    name: `${type.name}Edge`,
    fields: () => ({
      cursor: {
        type: new GraphQLNonNull(GraphQLString)
      },
      node: {
        type: type
      }
    })
  });

  const connection = new GraphQLObjectType({
    name: `${type.name}Connection`,
    fields: () => ({
      edges: {
        type: new GraphQLList(edge)
      },
      pageInfo: {
        type: pageInfo
      }
    })
  });

  return { edge, connection };
}

const { connection: PostConnection, edge: PostEdge } = createEdgeAndConnection(
  Post,
  PageInfo
);

function createInputObject(type) {
  const fields = type.getFields();
  const inputTypeFields = {};
  Object.keys(fields).forEach(fieldName => {
    const field = fields[fieldName];
    if (field instanceof GraphQLObjectType) {
      inputTypeFields[`${fieldName}Id`] = {
        type: GraphQLID
      };
    } else {
      inputTypeFields[fieldName] = {
        type: field.type
      };
    }
  });

  return new GraphQLInputObjectType({
    name: `${type.name}Input`,
    fields: inputTypeFields
  });
}

const Query = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    posts: {
      type: PostConnection,
      resolve(parent, args, context) {
        return context.postModel.getAllConnection({});
      }
    }
  })
});

module.exports = new GraphQLSchema({
  query: Query
});
// posts: {
//   args: {
//     first: {
//       type: new GraphQLNonNull(GraphQLString),
//     },
//      after: new GraphQLNon): PostConnection!

// type User {
//   id: ID!
//   name: String
//   username: String!
//   private: UserPrivate
//   posts(first: Int, after: String): PostConnection!
// }

// type Post {
//   id: ID!
//   user: User!
//   title: String!
//   body: String
// }
