"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Topic {
  id: number;
  name: string;
  form: number;
  icon: string;
  _count: { questions: number };
}

const LEVELS = [
  { value: 1, label: "Tahun 1" },
  { value: 2, label: "Tahun 2" },
  { value: 3, label: "Tahun 3" },
  { value: 4, label: "Tahun 4" },
  { value: 5, label: "Tahun 5" },
  { value: 6, label: "Tahun 6" },
  { value: 7, label: "Tingkatan 1" },
  { value: 8, label: "Tingkatan 2" },
  { value: 9, label: "Tingkatan 3" },
  { value: 10, label: "Tingkatan 4" },
  { value: 11, label: "Tingkatan 5" },
];

export default function ChildQuizPage() {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    fetch("/api/topics").then(r => r.json()).then(setTopics);
  }, []);

  const groups = LEVELS
    .map(l => ({
      form: l.value,
      label: l.label,
      topics: topics.filter(t => t.form === l.value),
    }))
    .filter(g => g.topics.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pilih Topik</h1>
        <p className="text-muted-foreground">Pilih topik yang nak dijawab</p>
      </div>

      {groups.map(group => (
        <div key={group.form}>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">{group.label}</h2>
          {group.topics.length === 0 ? (
            <p className="text-sm text-muted-foreground italic mb-6">Tiada topik untuk tahap ini</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {group.topics.map(topic => (
                <Link key={topic.id} href={`/child/quiz/${topic.id}`}>
                  <Card className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{topic.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold">{topic.name}</h3>
                          <p className="text-xs text-muted-foreground">{topic._count.questions} soalan</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}

      {topics.filter(t => t._count.questions > 0).length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tiada Soalan Lagi</h3>
            <p className="text-muted-foreground mb-4">Minta ibu bapa tambah soalan dulu!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}