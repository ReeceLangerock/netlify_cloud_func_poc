// src/lambda/graphql.js
const { ApolloServer, gql } = require('apollo-server-lambda');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MONGO_URI = process.env.MONGO_URI;
console.log(process.env.MONGO_URI);
if (!MONGO_URI) {
	throw new Error('You must provide a MongoLab URI');
}

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URI, { useNewUrlParser: true });
mongoose.connection
	.once('open', () => console.log('Connected to MongoLab instance.'))
	.on('error', error => console.log('Error connecting to MongoLab:', error));

const postSchema = new Schema(
	{
		title: String,
		content: String
	},
	{
		autoIndex: true,
		timestamps: true
	}
);

const Post = mongoose.model('post', postSchema);

const typeDefs = gql`
	type Query {
		getPosts: [Post]
		getPostByTitle(title: String!): Post
		getPostById(id: ID!): Post
	}
	type Mutation {
		addPost(title: String!, content: String!): Post
	}
	type Post {
		id: ID!
		title: String
		content: String
	}
`;

const resolvers = {
	Query: {
		getPosts: async () =>
			await Post.find({})
				.limit(2)
				.exec(),

		getPostByTitle: async (parent, args, context) =>
			await Post.findOne({ title: args.title }).exec(),
		getPostById: async (parent, args, context) => await Post.findById({ _id: args.id }).exec()
	},
	Mutation: {
		addPost: async (parent, args, context) => {
			try {
				let response = await Post.create(args);
				return response;
			} catch (e) {
				return e.message;
			}
		}
	}
};

const server = new ApolloServer({
	introspection: true,
	playground: true,
	typeDefs,
	resolvers,
	context: ({ req }) => ({
		Post
	})
});

exports.handler = server.createHandler();
