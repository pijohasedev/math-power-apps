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

export default function ChildQuizPage() {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    fetch("/api/topics").then(r => r.json()).then(setTopics);
  }, []);

  const groups = [1, 2, 3].map(f => ({
    form: f,
    topics: topics.filter(t => t.form === f),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pilih Topik</h1>
        <p className="text-muted-foreground">Pilih topik yang nak dijawab</p>
      </div>

      {groups.map(group => (
        <div key={group.form}>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Tingkatan {group.form}</h2>
          {group.topics.length === 0 ? (
            <p className="text-sm text-muted-foreground italic mb-6">Tiada topik untuk tingkatan ini</p>
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