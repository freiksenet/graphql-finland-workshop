const schema = require("./schema");
const { makeRemoteExecutableSchema, introspectSchema } = require('graphql-tools')
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch')

module.exports = async function makeSchema() {
  const link = new HttpLink({ uri: 'https://api.graphcms.com/simple/v1/swapi', fetch})
  const clientSchema = await introspectSchema(link);
  const remoteSchema = makeRemoteExecutableSchema({ schema: clientSchema, link})
  return remoteSchema;
};
