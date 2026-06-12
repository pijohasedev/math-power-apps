"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface Topic {
  id: number;
  name: string;
  form: number;
  icon: string;
  _count: { questions: number };
}

const LEVELS = [
  { value: 1, label: "Tahun 1", color: "from-green-400 to-emerald-500" },
  { value: 2, label: "Tahun 2", color: "from-teal-400 to-cyan-500" },
  { value: 3, label: "Tahun 3", color: "from-blue-400 to-indigo-500" },
  { value: 4, label: "Tahun 4", color: "from-indigo-400 to-purple-500" },
  { value: 5, label: "Tahun 5", color: "from-purple-400 to-pink-500" },
  { value: 6, label: "Tahun 6", color: "from-pink-400 to-rose-500" },
  { value: 7, label: "Tingkatan 1", color: "from-orange-400 to-red-500" },
  { value: 8, label: "Tingkatan 2", color: "from-red-400 to-rose-600" },
  { value: 9, label: "Tingkatan 3", color: "from-sky-400 to-blue-500" },
  { value: 10, label: "Tingkatan 4", color: "from-violet-400 to-purple-600" },
  { value: 11, label: "Tingkatan 5", color: "from-amber-400 to-orange-500" },
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
      color: l.color,
      topics: topics.filter(t => t.form === l.value),
    }))
    .filter(g => g.topics.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-md">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-heading">Pilih Topik</h1>
          <p className="text-muted-foreground">Pilih topik yang nak dijawab</p>
        </div>
      </div>

      {groups.map(group => (
        <div key={group.form}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`h-3 w-3 rounded-full bg-gradient-to-br ${group.color}`} />
            <h2 className="text-lg font-heading font-semibold">{group.label}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {group.topics.map((topic, i) => (
              <Link key={topic.id} href={`/child/quiz/${topic.id}`}>
                <Card className="group border-2 border-transparent hover:border-purple-300 hover:shadow-lg transition-all duration-200 cursor-pointer h-full slide-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl group-hover:scale-125 transition-transform duration-200">{topic.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold">{topic.name}</h3>
                        <p className="text-xs text-muted-foreground">{topic._count.questions} soalan</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-heading font-semibold mb-2">Tiada Soalan Lagi</h3>
            <p className="text-muted-foreground">Minta ibu bapa tambah soalan dulu!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
