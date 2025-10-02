"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface QuickStatsData {
  currentStreak: number;
  thisWeekSessions: number;
  thisMonthSessions: number;
  lastMonthSessions: number;
}

export function QuickStats() {
  const [stats, setStats] = useState<QuickStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        // Extract quick stats from the comprehensive stats response
        const quickStatsData = {
          currentStreak: data.currentStreak,
          thisWeekSessions: data.thisWeekSessions,
          thisMonthSessions: data.thisMonthSessions,
          lastMonthSessions: data.lastMonthSessions,
        };
        setStats(quickStatsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Loading...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded-md"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const monthChange = stats.thisMonthSessions - stats.lastMonthSessions;
  const monthChangePercent =
    stats.lastMonthSessions > 0
      ? ((monthChange / stats.lastMonthSessions) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Current Streak */}
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Streak
          </CardTitle>
          <Flame className="h-4 w-4 text-chart-1" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold mb-1">{stats.currentStreak}</div>
          <p className="text-xs text-muted-foreground">
            consecutive workout days
          </p>
        </CardContent>
      </Card>

      {/* This Week's Sessions */}
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            This Week
          </CardTitle>
          <Calendar className="h-4 w-4 text-chart-2" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold mb-1">
            {stats.thisWeekSessions}/7
          </div>
          <p className="text-xs text-muted-foreground">workouts this week</p>
        </CardContent>
      </Card>

      {/* Monthly Comparison */}
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            This Month
          </CardTitle>
          {monthChange > 0 ? (
            <TrendingUp className="h-4 w-4 text-chart-3" />
          ) : monthChange < 0 ? (
            <TrendingDown className="h-4 w-4 text-destructive" />
          ) : (
            <Minus className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold mb-1">
            {stats.thisMonthSessions}
          </div>
          <p className="text-xs text-muted-foreground">
            vs {stats.lastMonthSessions} last month
            {monthChange !== 0 && (
              <span
                className={`ml-1 font-medium ${
                  monthChange > 0 ? "text-chart-3" : "text-destructive"
                }`}
              >
                ({monthChange > 0 ? "+" : ""}
                {monthChangePercent}%)
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
