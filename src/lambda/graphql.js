// src/lambda/graphql.js
const { ApolloServer, gql } = require("apollo-server-lambda");

const Posts = [
  {
    id: 1,
    title: "test",
    content: "blah"
  },
  {
    id: 2,
    title: "test2",
    content: "blah blah"
  }
];

const typeDefs = gql`
  type Query {
    getPosts: [Post]
    getPostById: [Post]
  }
  type Post {
    title: String
    id: Int
    content: String
    date: String
  }
`;

const resolvers = {
  Query: {
    getPosts: (root, args, context) => {
      return Posts;
    },
    getPostById: (parent, args, context, info) => {
        console.log(args, Posts)
      return Posts.filter(post => id === args.id);
    }
  }
};
const server = new ApolloServer({
  introspection: true,
  playground: true,
  typeDefs,
  resolvers
});

exports.handler = server.createHandler();
