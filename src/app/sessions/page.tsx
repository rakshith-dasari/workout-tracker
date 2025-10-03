"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
// import { WorkoutCalendar } from "@/components/WorkoutCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransformedSession } from "@/lib/api-utils";

type SessionItem = {
  _id: string;
  date: string;
  workoutType: string;
};

function SessionsPageContent() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateFilter = searchParams.get("date");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/sessions", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load sessions");
        const data = await res.json();
        const mapped: SessionItem[] = (data.sessions ?? []).map(
          (s: TransformedSession) => ({
            _id: s._id,
            date: s.date,
            workoutType: s.workoutType,
          })
        );
        setSessions(mapped);
      } catch {
        setError("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filteredSessions = dateFilter
    ? sessions.filter((s) => s.date === dateFilter)
    : sessions;

  const handleClearFilter = () => {
    router.push("/sessions");
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this session? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete session");
      }

      // Remove the session from the local state
      setSessions(sessions.filter((s) => s._id !== sessionId));
    } catch (error) {
      console.error("Failed to delete session:", error);
      setError("Failed to delete session");
    }
  };

  return (
    <main className="min-h-screen w-full max-w-4xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">
          {dateFilter
            ? `Sessions on ${format(new Date(dateFilter), "MMMM dd, yyyy")}`
            : "Sessions"}
        </h1>
        <div className="flex items-center gap-2">
          {dateFilter && (
            <Button variant="outline" onClick={handleClearFilter}>
              Clear Filter
            </Button>
          )}
          <Button asChild>
            <Link href="/">Back</Link>
          </Button>
        </div>
      </div>

      {/* <WorkoutCalendar /> */}

      <Card /* className="mt-6" */>
        <CardHeader>
          <CardTitle>{dateFilter ? "Sessions" : "All Sessions"}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex flex-col gap-3 motion-safe:animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 w-full rounded bg-muted/50" />
              ))}
            </div>
          )}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && !error && filteredSessions.length === 0 && (
            <div>
              {dateFilter ? "No sessions on this date." : "No sessions found."}
            </div>
          )}
          {!loading && !error && filteredSessions.length > 0 && (
            <div className="flex flex-col gap-3">
              {filteredSessions.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Button
                    variant="ghost"
                    className="justify-start h-auto p-0 flex-1"
                    asChild
                  >
                    <Link href={`/sessions/${s._id}`}>
                      <div className="text-left">
                        <div className="font-medium">{s.workoutType}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(s.date), "EEE, MMM dd yyyy")}
                        </div>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                    onClick={() => handleDeleteSession(s._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SessionsPageContent />
    </Suspense>
  );
}
