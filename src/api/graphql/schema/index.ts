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

        type RootQuery {
          users: [User]
        }

        schema {
            query: RootQuery
        }
  `);
