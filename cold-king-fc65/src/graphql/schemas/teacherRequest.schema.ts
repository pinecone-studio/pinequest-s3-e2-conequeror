import gql from "graphql-tag";

export const teacherRequestTypeDefs = gql`
	enum TeacherRequestStatus {
		PENDING
		APPROVED
		REJECTED
	}

	type TeacherRequest {
		id: ID!
		teacherId: String!
		teacherName: String!
		teacherEmail: String!
		teacherPhone: String!
		subject: String!
		schoolId: String!
		schoolName: String!
		status: TeacherRequestStatus!
		createdAt: DateTime!
		approvedAt: DateTime
		rejectedAt: DateTime
	}

	type Query {
		teacherRequestsForMySchool(status: String): [TeacherRequest]!
		myTeacherRequests: [TeacherRequest]!
	}

	input createTeacherRequestInput {
		schoolId: String!
		subject: String
	}

	input approveTeacherRequestInput {
		requestId: String!
	}

	input rejectTeacherRequestInput {
		requestId: String!
	}

	type Mutation {
		requestTeacherApproval(input: createTeacherRequestInput!): TeacherRequest
		approveTeacherRequest(input: approveTeacherRequestInput!): TeacherRequest
		rejectTeacherRequest(input: rejectTeacherRequestInput!): TeacherRequest
	}
`;
