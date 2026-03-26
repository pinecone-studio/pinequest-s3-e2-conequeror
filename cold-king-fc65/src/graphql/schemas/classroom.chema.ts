import gql from "graphql-tag";


export const classroomTypeDefs = gql`

    scalar DateTime

    type Classroom {
        id: ID!
        teacherId: String!
        schoolId: String
        schoolName: String
        className: String!
        classCode: String!
        createdAt: DateTime!
    }

    type Query{
        classroomsByTeacher: [Classroom]!
    }

    input createClassroomInput{
        className: String!
        schoolId: String
    }

    type Mutation{
        createClassroom(input: createClassroomInput!): Classroom
    }
`
