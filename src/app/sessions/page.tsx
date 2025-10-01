"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SessionItem = {
  _id: string;
  date: string;
  workoutType: string;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/sessions", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load sessions");
        const data = await res.json();
        const mapped: SessionItem[] = (data.sessions ?? []).map((s: any) => ({
          _id: s._id,
          date: s.date,
          workoutType: s.workoutType,
        }));
        setSessions(mapped);
      } catch (e) {
        setError("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <main className="min-h-screen w-full max-w-4xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Sessions</h1>
        <Button asChild>
          <Link href="/">Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && sessions.length === 0 && (
            <div>No sessions found.</div>
          )}
          {!loading && !error && sessions.length > 0 && (
            <div className="flex flex-col gap-5">
              {sessions.map((s) => (
                <Button
                  key={s._id}
                  variant="secondary"
                  className="justify-start"
                  asChild
                >
                  <Link href={`/sessions/${s._id}`}>
                    {s.workoutType} -{" "}
                    {format(new Date(s.date), "EEE, MMM dd yyyy")}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
