const { makeExecutableSchema } = require("graphql-tools");

const { gql } = require("apollo-server");
const fetch = require("node-fetch");

const typeDefs = gql`
  type Post {
    id: ID!
    user: User!
    title: String!
    body: String
  }

  type PostConnection {
    edges: [PostEdge!]!
    pageInfo: PageInfo!
  }

  type PostEdge {
    cursor: String!
    node: Post!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String!
  }

  type User {
    id: ID!
    name: String
    username: String!
    private: UserPrivate
    posts(first: Int, after: String): PostConnection!
  }

  type UserPrivate {
    email: String!
    address: Address!
    phone: String
    website: String
    company: Company!
  }

  type Address {
    street: String!
    suite: String
    city: String!
    zipcode: String!
    geo: Geo!
  }

  type Company {
    name: String!
    catchPhrase: String
    bs: String
  }

  type Geo {
    lat: String!
    lng: String!
  }

  type Query {
    posts(first: Int, after: String): PostConnection!
    postById(id: ID!): Post
    users: [User!]!
    userById(id: ID!): User
    user: User
  }

  input PostInput {
    id: ID!
    userId: ID
    title: String
    body: String
  }

  type Mutation {
    updatePost(input: PostInput!): Post
  }
`;

const resolvers = {
  Query: {
    posts: async (parent, args, context) => {
      return context.postModel.getAllConnection(args);
    },
    postById: async (parent, args, context) => {
      return context.postModel.getById(args.id);
    },
    users: async (parent, args, context) => {
      return context.userModel.getAll();
    },
    userById: async (parent, args, context, info) => {
      const fieldNodes = info.fieldNodes;
      const allDirectChildrenNames = fieldNodes[0].selectionSet.selections.map(
        selection => {
          return selection.name.value;
        }
      );
      console.log(allDirectChildrenNames);
      return context.userModel.getById(args.id);
    },
    user: async (parent, args, context) => {
      if (context.userId) {
        return context.userModel.getById(context.userId);
      } else {
        return null;
      }
    }
  },
  Mutation: {
    updatePost: async (parent, args, context) => {
      return context.postModel.update(args.input);
    }
  },
  Post: {
    user: (parent, args, context) => {
      return context.userModel.getById(parent.userId);
    }
  },
  User: {
    posts: async (parent, args, context) => {
      return context.postModel.getAllByUserIdConnection(context.userId, args);
    },
    private: async (parent, args, context) => {
      return context.userModel.getPrivate(parent);
    }
  }
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

module.exports = schema;
