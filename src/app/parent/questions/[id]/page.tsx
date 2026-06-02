import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QuestionEditor } from "@/components/parent/QuestionEditor";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id: parseInt(id) },
    include: { topic: true },
  });

  if (!question) notFound();

  const initialData = {
    id: question.id,
    topicId: question.topicId,
    type: question.type,
    difficulty: question.difficulty,
    questionText: question.questionText,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    points: question.points,
  };

  return <QuestionEditor initialData={initialData} isEdit />;
}