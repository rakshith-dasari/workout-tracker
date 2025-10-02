import WorkoutTabs from "@/components/WorkoutTabs";
import { WorkoutCalendar } from "@/components/WorkoutCalendar";
import { QuickStats } from "@/components/QuickStats";

export default function Home() {
  return (
    <main className="min-h-screen w-full max-w-7xl mx-auto p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-2">
          Workout Tracker
        </h1>
      </div>

      {/* Quick Stats Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Overview</h2>
        <QuickStats />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Section */}
        <div className="space-y-4 lg:col-span-1 h-full">
          <WorkoutCalendar />
        </div>

        {/* Trends Section */}
        <div className="space-y-4 lg:col-span-2">
          <div className="bg-card rounded-lg border p-6 shadow-sm h-full">
            <WorkoutTabs />
          </div>
        </div>
      </div>
    </main>
  );
}
