import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questions } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Tiada soalan untuk diimport" }, { status: 400 });
    }

    const topics = await prisma.topic.findMany();
    const topicMap = new Map(topics.map(t => [`${t.form}:${t.name.toLowerCase().trim()}`, t.id]));
    topicMap.set("", -1);

    const results: { row: number; status: string; error?: string }[] = [];
    const validQuestions: {
      topicId: number;
      type: string;
      difficulty: string;
      questionText: string;
      options: string | null;
      correctAnswer: string;
      explanation: string | null;
      points: number;
    }[] = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const rowNum = i + 2;

      if (!q.questionText || !q.questionText.trim()) {
        results.push({ row: rowNum, status: "error", error: "Teks soalan kosong" });
        continue;
      }

      if (!["mcq", "fill_blank", "calculation"].includes(q.type)) {
        results.push({ row: rowNum, status: "error", error: `Jenis soalan tidak sah: ${q.type}` });
        continue;
      }

      if (!["easy", "medium", "hard"].includes(q.difficulty)) {
        results.push({ row: rowNum, status: "error", error: `Aras tidak sah: ${q.difficulty}` });
        continue;
      }

      const topicKey = q.form ? `${q.form}:${String(q.topicName || "").toLowerCase().trim()}` : "";
      const topicId = topicMap.get(topicKey);
      if (!topicId || topicId === -1) {
        results.push({ row: rowNum, status: "error", error: `Topik tidak dijumpai: T${q.form} ${q.topicName}` });
        continue;
      }

      if (!q.correctAnswer || !q.correctAnswer.trim()) {
        results.push({ row: rowNum, status: "error", error: "Jawapan betul kosong" });
        continue;
      }

      const options = q.type === "mcq"
        ? [q.optionA || "", q.optionB || "", q.optionC || "", q.optionD || ""]
        : null;

      if (q.type === "mcq" && options && options.some(o => !o.trim())) {
        results.push({ row: rowNum, status: "error", error: "Semua pilihan MCQ mesti diisi" });
        continue;
      }

      if (q.type === "mcq" && options && !options.includes(q.correctAnswer)) {
        results.push({ row: rowNum, status: "error", error: "Jawapan betul mesti salah satu pilihan A-D" });
        continue;
      }

      validQuestions.push({
        topicId,
        type: q.type,
        difficulty: q.difficulty,
        questionText: q.questionText.trim(),
        options: options ? JSON.stringify(options) : null,
        correctAnswer: q.correctAnswer.trim(),
        explanation: q.explanation?.trim() || null,
        points: parseInt(q.points) || 1,
      });
      results.push({ row: rowNum, status: "success" });
    }

    let insertedCount = 0;
    if (validQuestions.length > 0) {
      await prisma.question.createMany({ data: validQuestions });
      insertedCount = validQuestions.length;
    }

    return NextResponse.json({
      total: questions.length,
      inserted: insertedCount,
      errors: results.filter(r => r.status === "error").length,
      details: results,
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ error: "Ralat memproses import" }, { status: 500 });
  }
}