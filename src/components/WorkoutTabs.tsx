"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrendChart from "@/components/TrendChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type SessionSet = { weight: number; reps: number };
type SessionExercise = { name: string; sets: SessionSet[] };
type SessionDoc = {
  date: string;
  workoutType: string;
  workout: SessionExercise[];
};

const WORKOUT_TYPES = [
  { value: "Push", label: "Push" },
  { value: "Pull", label: "Pull" },
  { value: "Legs", label: "Legs" },
] as const;

export default function WorkoutTabs() {
  const [type, setType] =
    useState<(typeof WORKOUT_TYPES)[number]["value"]>("Push");
  const [session, setSession] = useState<SessionDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercise, setExercise] = useState<string | null>(null);
  const [allExercises, setAllExercises] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSession(null);
    setExercise(null);

    fetch(`/api/sessions/last?type=${encodeURIComponent(type)}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load last session");
        return res.json();
      })
      .then((json: { session: SessionDoc | null }) => {
        if (cancelled) return;
        setSession(json.session);
        const firstExercise = json.session?.workout?.[0]?.name ?? null;
        setExercise(firstExercise);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [type]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/exercises`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load exercises");
        return res.json();
      })
      .then((json: { names: string[] }) => {
        if (cancelled) return;
        setAllExercises(json.names ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setAllExercises([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const exerciseNames = useMemo(
    () => session?.workout?.map((w) => w.name) ?? [],
    [session]
  );

  return (
    <div className="w-full">
      <Tabs value={type} onValueChange={(v) => setType(v as any)}>
        <TabsList>
          {WORKOUT_TYPES.map((wt) => (
            <TabsTrigger key={wt.value} value={wt.value}>
              {wt.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {WORKOUT_TYPES.map((wt) => (
          <TabsContent key={wt.value} value={wt.value}>
            {loading ? (
              <div className="flex flex-col gap-4 motion-safe:animate-pulse">
                <div className="h-4 w-48 rounded bg-muted/50" />
                <div className="h-8 w-full rounded bg-muted/50" />
                <div className="h-64 w-full rounded bg-muted/50" />
              </div>
            ) : error ? (
              <div className="text-sm text-destructive">
                Failed to load session: {error}
              </div>
            ) : session ? (
              <div className="flex flex-col gap-4">
                <div className="text-sm text-muted-foreground">
                  Last {type} workout on{" "}
                  {new Date(session.date).toLocaleDateString()}
                </div>

                {exerciseNames.length > 0 ? (
                  <Tabs
                    key={type}
                    defaultValue={exerciseNames[0]}
                    className="w-full"
                  >
                    <TabsList>
                      {exerciseNames.map((name) => (
                        <TabsTrigger key={name} value={name}>
                          {name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {exerciseNames.map((name) => (
                      <TabsContent key={name} value={name}>
                        <TrendChart exerciseName={name} />
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No exercises recorded.
                  </div>
                )}

                <div className="mt-8">
                  <div className="mb-2 text-sm font-medium">
                    All exercises trend
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-64">
                      <Select
                        value={exercise ?? undefined}
                        onValueChange={(v: string) => setExercise(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select exercise" />
                        </SelectTrigger>
                        <SelectContent>
                          {allExercises.map((n) => (
                            <SelectItem key={n} value={n}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    {exercise ? (
                      <TrendChart exerciseName={exercise} />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Select an exercise to see the trend.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No data.</div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
