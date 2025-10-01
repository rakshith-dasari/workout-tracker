import WorkoutTabs from "@/components/WorkoutTabs";

export default function Home() {
  return (
    <main className="min-h-screen w-full max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-semibold mb-4">Workout Tracker</h1>
      <WorkoutTabs />
    </main>
  );
}
