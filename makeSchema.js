const schema = require("./schema");
const { makeRemoteExecutableSchema, introspectSchema, mergeSchemas, delegateToSchema, FilterRootFields, transformSchema } = require('graphql-tools')
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch')

module.exports = async function makeSchema() {
  const link = new HttpLink({ uri: 'https://api.graphcms.com/simple/v1/swapi', fetch})
  const clientSchema = await introspectSchema(link);
  const remoteSchema = makeRemoteExecutableSchema({ schema: clientSchema, link})

  const transformedSchema = transformSchema(remoteSchema, [new FilterRootFields((operation, fieldName) => fieldName === 'allFilms')]);

  return mergeSchemas({
    schemas: [transformedSchema, schema, `
      extend type Post {
        movie: Film!
      }
    `],
    resolvers: {
      Post: {
        movie(parent, args, context, info) {
          return delegateToSchema({
            schema: remoteSchema,
            operation: 'query',
            fieldName: 'Film',
            args: {
              title: "The Empire Strikes Back"
            },
            context,
            info,
          })
        }
      }
    }
  });
};
