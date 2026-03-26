import gql from "graphql-tag";

export const schoolTypeDefs = gql`
	type School {
		id: ID!
		schoolName: String!
		email: String!
		managerLastName: String!
		managerFirstName: String!
		aimag: String!
		createdAt: DateTime!
	}

	type Query {
		schools: [School]!
		mySchool: School
	}

	input upsertSchoolInput {
		schoolName: String!
		email: String!
		managerLastName: String!
		managerFirstName: String!
		aimag: String!
	}

	type Mutation {
		upsertSchool(input: upsertSchoolInput!): School
	}
`;
