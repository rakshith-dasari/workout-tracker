"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

type SessionSet = { weight: number | null; reps: number | null };
type SessionExercise = { id: string; name: string; sets: SessionSet[] };

const WORKOUT_TYPES = ["Push", "Pull", "Legs", "Full Body", "Upper", "Lower"];

const formSchema = z.object({
  date: z.date({ required_error: "Date is required" }),
  bodyWeight: z
    .union([z.coerce.number().min(0).max(1000), z.nan()])
    .optional()
    .nullable(),
  workoutType: z.string().min(1, "Select a type"),
});

export default function EditSessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sessionId = params?.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      bodyWeight: undefined,
      workoutType: "",
    },
  });

  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [allExerciseNames, setAllExerciseNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exercises")
      .then((r) => r.json())
      .then((d) => setAllExerciseNames(d.names ?? []))
      .catch(() => setAllExerciseNames([]));
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/sessions/${sessionId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load session");
        const data = await res.json();
        const s = data.session;
        form.reset({
          date: new Date(s.date),
          bodyWeight:
            typeof s.bodyWeight === "number" && !Number.isNaN(s.bodyWeight)
              ? s.bodyWeight
              : undefined,
          workoutType: s.workoutType,
        });
        setExercises(
          (s.workout ?? []).map((ex: any) => ({
            id: crypto.randomUUID(),
            name: ex.name,
            sets: (ex.sets ?? []).map((st: any) => ({
              weight: st.weight ?? null,
              reps: st.reps ?? null,
            })),
          }))
        );
      } catch (e) {
        toast.error("Failed to load session");
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", sets: [] },
    ]);
  };

  const deleteExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const addSet = (id: string) => {
    setExercises((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, sets: [...e.sets, { weight: null, reps: null }] }
          : e
      )
    );
  };

  const deleteSet = (exerciseId: string, idx: number) => {
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseId
          ? { ...e, sets: e.sets.filter((_, i) => i !== idx) }
          : e
      )
    );
  };

  const updateSet = (
    exerciseId: string,
    idx: number,
    key: keyof SessionSet,
    value: number
  ) => {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.id !== exerciseId) return e;
        const sets = e.sets.slice();
        sets[idx] = { ...sets[idx], [key]: value } as SessionSet;
        return { ...e, sets };
      })
    );
  };

  const updateExerciseName = (id: string, name: string) => {
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, name } : e)));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!sessionId) return;

    const workout = exercises
      .filter((e) => e.name && e.sets.length > 0)
      .map(({ name, sets }) => ({
        name,
        sets: sets.filter(
          (s) =>
            typeof s.weight === "number" &&
            !Number.isNaN(s.weight) &&
            typeof s.reps === "number" &&
            !Number.isNaN(s.reps)
        ) as { weight: number; reps: number }[],
      }))
      .filter((e) => e.sets.length > 0);

    if (workout.length === 0) {
      toast.error("Add at least one exercise with a set");
      return;
    }

    const payload = {
      date: values.date.toISOString(),
      bodyWeight:
        typeof values.bodyWeight === "number" &&
        !Number.isNaN(values.bodyWeight)
          ? values.bodyWeight
          : null,
      workoutType: values.workoutType,
      workout,
    };

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Session updated");
      router.push("/sessions");
    } catch (err) {
      toast.error("Failed to update session");
    }
  };

  return (
    <main className="min-h-screen w-full max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl">Update Session</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-6 motion-safe:animate-pulse">
              <div className="h-6 w-64 rounded bg-muted/50 animate-pulse" />
              <div className="grid grid-cols-1 gap-4">
                <div className="h-10 w-full rounded bg-muted/50" />
                <div className="h-10 w-full rounded bg-muted/50" />
                <div className="h-10 w-full rounded bg-muted/50" />
              </div>
              <div className="rounded-lg border p-4 space-y-4">
                <div className="h-10 w-60 rounded bg-muted/50" />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="h-9 w-full rounded bg-muted/50" />
                  <div className="h-9 w-full rounded bg-muted/50" />
                  <div className="h-9 w-10 rounded bg-muted/50" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="h-9 w-full rounded bg-muted/50" />
                  <div className="h-9 w-full rounded bg-muted/50" />
                  <div className="h-9 w-10 rounded bg-muted/50" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 w-36 rounded bg-muted/50" />
                <div className="h-10 w-44 rounded bg-muted/50" />
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }: { field: any }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              type="button"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>dd/mm/yyyy</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(d: Date | undefined) =>
                                d && field.onChange(d)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bodyWeight"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Body Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="decimal"
                            placeholder="Body Weight (kg)"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workoutType"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Workout Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Workout Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WORKOUT_TYPES.map((t) => (
                              <SelectItem value={t} key={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-lg border p-4">
                  {exercises.map((ex) => (
                    <div key={ex.id} className="mb-6">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div>
                          <Select
                            value={ex.name}
                            onValueChange={(v: string) =>
                              updateExerciseName(ex.id, v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Exercise" />
                            </SelectTrigger>
                            <SelectContent>
                              {allExerciseNames.map((n) => (
                                <SelectItem key={n} value={n}>
                                  {n}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end gap-3">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => addSet(ex.id)}
                          >
                            + Add Set
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => deleteExercise(ex.id)}
                          >
                            Delete Exercise
                          </Button>
                        </div>
                      </div>

                      {ex.sets.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                          {ex.sets.map((s, i) => (
                            <div
                              key={i}
                              className="grid grid-cols-3 gap-3 md:grid-cols-3"
                            >
                              <Input
                                inputMode="decimal"
                                placeholder="Weight"
                                type="number"
                                value={s.weight ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateSet(
                                    ex.id,
                                    i,
                                    "weight",
                                    val === ""
                                      ? (null as unknown as number)
                                      : Number(val)
                                  );
                                }}
                              />
                              <Input
                                inputMode="numeric"
                                placeholder="Reps"
                                type="number"
                                value={s.reps ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateSet(
                                    ex.id,
                                    i,
                                    "reps",
                                    val === ""
                                      ? (null as unknown as number)
                                      : Number(val)
                                  );
                                }}
                              />
                              <Button
                                className="w-0"
                                type="button"
                                variant="destructive"
                                onClick={() => deleteSet(ex.id, i)}
                              >
                                -
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex gap-3">
                    <Button type="button" onClick={addExercise}>
                      + Add Exercise
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit">Update Session</Button>
                  <Button variant="secondary" asChild>
                    <Link href="/sessions">Back to Sessions</Link>
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
