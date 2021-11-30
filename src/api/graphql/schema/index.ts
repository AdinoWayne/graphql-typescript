import { buildSchema } from 'graphql';

export const graphQlSchema = buildSchema(`
        scalar Date

        type User {
            _id: ID!
            name: String
            email: String!
            password: String!
            avatar: String!
            date: Date
        }

        type Profile {
          _id: ID!
          bio: String
          githubusername: String
          location: String
          status: String
          website: String
          date: Date
        }

        type Comment {
          _id: ID!
          text: String
          name: String
          avatar: String
          date: Date
        }

        type Like {
          _id: ID!
          user: ID!
        }

        type Post {
          _id: ID!
          text: String
          name: String
          likes: [Like]
          comments: [Comment]
          date: Date
        }

        type RootQuery {
          users: [User]
          user(_id: ID!): User
          profiles: [Profile]
          profile(_id: ID!): Profile
          posts: [Post]
          post(_id: ID!): Post
        }

        input postInput {
          text: String!
        }

        type Mutation {
          storePost(input: postInput): Post
        }

        schema {
            query: RootQuery,
            mutation: Mutation
        }
  `);
