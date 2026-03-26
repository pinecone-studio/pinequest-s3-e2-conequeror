"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ExamData {
    createExam: {
        id: string
        title: string
    }
}

const CREATE_EXAM = gql`
    mutation CreateExam($input: createExamInput!){
        createExam(input: $input){
            id
            title
        }
    }
`

export default function TeacherExamCreatePage() {
    const router = useRouter()

    const [title, setTitle] = useState("")
    const [subject, setSubject] = useState("")
    const [description, setDescription] = useState("")

    const [openStatus, setOpenStatus] = useState(false)

    const [duration, setDuration] = useState(0)
    const [grade, setGrade] = useState("")

    const [createExam, { error, loading }] = useMutation<ExamData>(CREATE_EXAM)

    const handleCreateExam = async () => {

        const res = await createExam({
            variables: {
                input: {
                    title,
                    subject,
                    description,
                    duration,
                    grade
                }
            }
        })

        const examId = res.data?.createExam.id

        console.log(error)

        router.push(`/teacher/exams/${examId}/edit`)

    }

    // add logic to create EXAM here

    return (
        <div>
            <div>
                create exam here

                <div className="w-full h-400 border-4 rounded-2xl flex flex-col gap-2">
                    <div>
                        <label>title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border"
                        />
                    </div>
                    <div>
                        <label>subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="border"
                        />
                    </div>
                    <div>
                        <label>description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border"
                        />
                    </div>
                    <div>
                        <label>duration</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="border"
                        />
                    </div>
                    <div>
                        <label>grade</label>
                        <input
                            type="text"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="border"
                        />
                    </div>
                    <button className="border w-fit px-10 rounded-2xl"
                        onClick={handleCreateExam}>
                        Create
                    </button>
                </div>


            </div>
        </div>
    )
}
