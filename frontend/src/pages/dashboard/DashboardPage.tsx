import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  Dumbbell,
  Flame,
  Plus,
  Scale,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CaloriesChart, WeightChart } from "@/components/charts";
import { ErrorState, MetricProgress, SectionTitle } from "@/components/common";
import { Badge, Button, Card, Skeleton } from "@/components/ui";
import { dashboardService, type DashboardSummary } from "@/services";
import { useAppStore } from "@/store/app-store";
import { formatNumber } from "@/utils";

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message ?? "Dashboard data could not be loaded.";
  }
  return "Dashboard data could not be loaded.";
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(`${value}T12:00:00`));
}

function mealLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export function DashboardPage() {
  const fullName = useAppStore((state) => state.authUser?.fullName ?? "there");
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDashboard(await dashboardService.summary(today()));
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (loading) {
    return <div className="space-y-5"><Skeleton className="h-24" /><div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-56" /><Skeleton className="h-56" /></div><Skeleton className="h-80" /></div>;
  }
  if (error || !dashboard) return <ErrorState message={error ?? "Dashboard data could not be loaded."} onRetry={() => void load()} />;

  const nutrition = dashboard.nutrition;
  const targetCalories = nutrition.targetCalories ?? 0;
  const targetProtein = nutrition.targetProteinGrams ?? 0;
  const targetCarbs = nutrition.targetCarbohydratesGrams ?? 0;
  const targetFat = nutrition.targetFatGrams ?? 0;
  const caloriesRemaining = Math.max(0, targetCalories - nutrition.calories);
  const calorieChart = dashboard.calorieHistory.map((item) => ({ day: dateLabel(item.date), consumed: item.calories, target: item.targetCalories ?? targetCalories }));
  const weightChart = dashboard.weightHistory.map((item) => ({ date: dateLabel(item.measuredAt), weight: item.weightKg }));
  const weightDirection = dashboard.weightChangeKg < 0 ? "↓" : dashboard.weightChangeKg > 0 ? "↑" : "→";
  const weightChange = Math.abs(dashboard.weightChangeKg);
  const targetLabel = dashboard.targetWeightKg == null ? "Maintain current weight" : `Goal ${formatNumber(dashboard.targetWeightKg, 1)} kg`;

  return (
    <div>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-bold text-brand-600">{dateLabel(dashboard.date)}</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Good morning, {fullName}</h1>
          <p className="mt-2 text-slate-500">Here's your health overview for today.</p>
        </div>
        <Link to="/nutrition/search"><Button><Plus className="h-4 w-4" />Log food</Button></Link>
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="relative overflow-hidden bg-slate-950 p-6 text-white xl:col-span-6">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Daily calories</p><p className="mt-2 text-3xl font-bold">{formatNumber(nutrition.calories)} <span className="text-sm font-medium text-slate-400">/ {formatNumber(targetCalories)} kcal</span></p><p className="mt-1 text-sm text-brand-400">{formatNumber(caloriesRemaining)} kcal remaining</p></div><CalorieRing current={nutrition.calories} target={targetCalories} /></div>
          <div className="mt-7 grid grid-cols-3 gap-2 border-t border-white/10 pt-5">{[["Eaten", nutrition.calories], ["Exercise", "—"], ["Net", nutrition.calories]].map(([label, value]) => <div key={String(label)}><p className="text-[11px] text-slate-500">{label}</p><p className="mt-1 text-sm font-bold">{typeof value === "number" ? formatNumber(value) : value}</p></div>)}</div>
        </Card>
        <Card className="p-6 xl:col-span-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">Macronutrients</p><p className="mt-1 font-bold">Today's balance</p></div><Badge tone="green">On track</Badge></div><div className="space-y-4"><MetricProgress label="Protein" current={nutrition.proteinGrams} target={targetProtein} unit="g" /><MetricProgress label="Carbs" current={nutrition.carbohydratesGrams} target={targetCarbs} unit="g" color="bg-violet-500" /><MetricProgress label="Fat" current={nutrition.fatGrams} target={targetFat} unit="g" color="bg-amber-500" /></div></Card>
        <Card className="p-6 xl:col-span-4"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">Weight progress</p><p className="mt-1 text-3xl font-bold">{formatNumber(dashboard.currentWeightKg, 1)} <span className="text-base text-slate-400">kg</span></p><p className="mt-1 text-sm font-semibold text-brand-600">{weightDirection} {formatNumber(weightChange, 1)} kg since first measurement</p></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><Scale className="h-5 w-5" /></span></div><div className="mt-2"><WeightChart data={weightChart} /></div><div className="flex justify-between text-xs text-slate-500"><span>Start {formatNumber(dashboard.startingWeightKg, 1)} kg</span><span>{targetLabel}</span></div></Card>
        <MockWorkoutCard />
        <MockStreakCard />
      </div>
      <div className="mt-7 grid gap-5 xl:grid-cols-[1.65fr_1fr]"><Card className="p-5 md:p-6"><SectionTitle title="Nutrition overview" description="Calories consumed versus your daily target" /><CaloriesChart data={calorieChart} /><div className="mt-2 flex gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-brand-500" />Consumed</span><span className="flex items-center gap-2"><i className="h-0.5 w-5 bg-slate-400" />Target</span></div></Card><AIInsight /></div>
      <div className="mt-7"><SectionTitle title="Recent meals" description={`${formatNumber(nutrition.calories)} kcal logged across ${nutrition.meals.filter((meal) => meal.items.length).length} meals`} action={<Link to="/nutrition/diary" className="text-sm font-bold text-brand-600">View diary →</Link>} /><div className="grid gap-4 md:grid-cols-3">{nutrition.meals.map((meal) => <Card key={meal.mealType} className="p-5"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100"><UtensilsCrossed className="h-4 w-4 text-slate-500" /></span><span className="text-sm font-bold">{formatNumber(meal.calories)} kcal</span></div><h3 className="mt-4 font-bold">{mealLabel(meal.mealType)}</h3><p className="mt-1 truncate text-sm text-slate-500">{meal.items.length ? meal.items.map((item) => item.foodName).join(" · ") : "No foods logged"}</p></Card>)}</div></div>
    </div>
  );
}

function CalorieRing({ current, target }: { current: number; target: number }) {
  const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  return <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#4dbb87 ${percentage}%,#29362f 0)` }}><div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-slate-950 text-center"><div><p className="text-lg font-bold">{Math.round(percentage)}%</p><p className="text-[9px] text-slate-500">consumed</p></div></div></div>;
}

function MockWorkoutCard() {
  return <Card className="relative overflow-hidden p-6 xl:col-span-5"><div className="absolute right-0 top-0 h-full w-1.5 bg-brand-500" /><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Today's workout</p><h3 className="mt-1 text-2xl font-bold">Push Day</h3></div><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Dumbbell className="h-6 w-6" /></span></div><div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500"><span className="flex items-center gap-1.5"><CalendarCheck className="h-4 w-4" />6 exercises</span><span>~65 minutes</span><span>Intermediate</span></div><Link to="/workouts/session/session-push"><Button className="mt-6">Start Workout <ArrowRight className="h-4 w-4" /></Button></Link></Card>;
}

function MockStreakCard() {
  return <Card className="bg-amber-50 p-6 xl:col-span-3"><div className="flex items-center justify-between"><Flame className="h-7 w-7 text-orange-500" /><Badge tone="amber">Personal best</Badge></div><p className="mt-5 text-2xl font-bold">12 day streak</p><p className="mt-1 text-sm text-slate-500">Your longest is 18 days</p><div className="mt-5 grid grid-cols-7 gap-1.5">{Array.from({ length: 14 }).map((_, index) => <span key={index} className={`aspect-square rounded-md ${index < 12 ? "bg-orange-400" : "bg-white"}`} />)}</div></Card>;
}

function AIInsight() {
  return <Card className="relative overflow-hidden bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white"><div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/10" /><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10"><Bot className="h-5 w-5 text-brand-200" /></span><div><div className="flex items-center gap-2"><p className="font-bold">AI Insight</p><Sparkles className="h-3.5 w-3.5 text-amber-300" /></div><p className="text-xs text-brand-200">Personalized for today</p></div></div><p className="mt-6 text-lg font-semibold leading-relaxed">Your calories are on target, but protein is still <span className="text-amber-300">35g below</span> your daily goal.</p><div className="mt-5 rounded-2xl bg-white/10 p-4"><p className="text-xs text-brand-200">Suggested combination</p><p className="mt-1 font-bold">Chicken breast + Greek yogurt</p><p className="mt-1 text-xs text-brand-100">≈ 390 kcal · 44g protein</p></div><Link to="/ai"><Button variant="secondary" className="mt-5 border-white/20 bg-white text-brand-800">Ask NessFit AI <ArrowRight className="h-4 w-4" /></Button></Link></Card>;
}
