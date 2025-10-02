"use client";

import { useEffect, useState } from "react";
import TrendChart from "@/components/TrendChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function WorkoutTabs() {
  const [exercise, setExercise] = useState<string | null>("Cable Curls ");
  const [allExercises, setAllExercises] = useState<string[]>([]);

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

  return (
    <div className="w-full">
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
  );
}
