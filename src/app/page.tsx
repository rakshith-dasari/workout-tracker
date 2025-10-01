import WorkoutTabs from "@/components/WorkoutTabs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen w-full max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-semibold mb-4">Workout Tracker</h1>
      <div className="mb-6 flex gap-3">
        <Button asChild>
          <Link href="/sessions/log">Log Session</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/sessions">View Sessions</Link>
        </Button>
      </div>
      <WorkoutTabs />
    </main>
  );
}
