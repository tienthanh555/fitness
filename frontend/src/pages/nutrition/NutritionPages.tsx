import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Apple,
  Bookmark,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  MoreHorizontal,
  Plus,
  SearchX,
  SlidersHorizontal,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  EmptyState,
  ErrorState,
  MetricProgress,
  PageHeader,
  Pagination,
  SearchInput,
  SectionTitle,
} from "@/components/common";
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Modal,
  Progress,
  Select,
  Skeleton,
} from "@/components/ui";
import { foods, meals, nutritionTarget, todayNutrition } from "@/mocks/data";
import { healthService, type HealthGoal, type HealthProfile } from "@/services";
import { cn, formatNumber } from "@/utils";

export function FoodSearchPage() {
  const [query, setQuery] = useState("chicken");
  const [source, setSource] = useState("All");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [page, setPage] = useState(1);
  const results = foods.filter(
    (f) =>
      (source === "All" || f.source === source) &&
      f.name.toLowerCase().includes(query.toLowerCase()),
  );
  const search = () => {
    setStatus("loading");
    setTimeout(() => setStatus(query === "network" ? "error" : "idle"), 650);
  };
  return (
    <div>
      <PageHeader
        title="Find a food"
        description="Search verified nutrition data from USDA FoodData Central and Open Food Facts."
      />
      <Card className="p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex-1">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search foods, brands or barcode..."
            />
          </div>
          <Button onClick={search}>Search foods</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="mr-1 h-4 w-4 text-slate-400" />
          {["All", "USDA", "Open Food Facts"].map((x) => (
            <button
              key={x}
              onClick={() => setSource(x)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition",
                source === x
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200",
              )}
            >
              {x}
            </button>
          ))}
          <span className="ml-auto hidden text-xs text-slate-400 sm:inline">
            Food data is fetched through the NessFit backend
          </span>
        </div>
      </Card>
      {status === "loading" ? (
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : status === "error" ? (
        <div className="mt-5">
          <ErrorState
            message="The food provider is not responding. Check your connection and try again."
            onRetry={search}
          />
        </div>
      ) : results.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={SearchX}
            title="No foods found"
            description="Try a broader term, another brand, or switch the data source filter."
            actionLabel="Clear search"
            onAction={() => setQuery("")}
          />
        </div>
      ) : (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              <strong className="text-slate-800">
                {results.length} results
              </strong>{" "}
              matching “{query}”
            </p>
            <span className="text-xs text-slate-400">Nutrition per 100g</span>
          </div>
          <div className="space-y-3">
            {results.map((f) => (
              <FoodResult key={f.id} food={f} />
            ))}
          </div>
          <Pagination page={page} pages={4} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
function FoodResult({ food }: { food: (typeof foods)[number] }) {
  return (
    <Card className="group p-5 transition hover:border-brand-200 hover:shadow-lift">
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <Apple className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <Link
              to={`/nutrition/food/${food.id}`}
              className="font-bold hover:text-brand-600"
            >
              {food.name}
            </Link>
            <p className="mt-1 text-xs text-slate-500">
              {food.brand && `${food.brand} · `}
              {food.calories} kcal / 100g
            </p>
            <Badge
              tone={food.source === "USDA" ? "green" : "blue"}
              className="mt-2"
            >
              {food.source}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-5 md:w-72">
          {[
            ["Protein", food.protein],
            ["Carbs", food.carbs],
            ["Fat", food.fat],
          ].map(([l, v]) => (
            <div key={String(l)}>
              <p className="text-xs text-slate-400">{l}</p>
              <p className="mt-1 text-sm font-bold">{v}g</p>
            </div>
          ))}
        </div>
        <Link to={`/nutrition/food/${food.id}`}>
          <Button variant="secondary" className="w-full md:w-auto">
            View <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
export function FoodDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const food = foods.find((f) => f.id === id) ?? foods[0];
  const [qty, setQty] = useState(100);
  const [meal, setMeal] = useState("Lunch");
  const [saved, setSaved] = useState(false);
  const [success, setSuccess] = useState(false);
  const ratio = qty / 100;
  const metrics = [
    ["Calories", food.calories, "kcal"],
    ["Protein", food.protein, "g"],
    ["Carbs", food.carbs, "g"],
    ["Fat", food.fat, "g"],
    ["Fiber", food.fiber ?? 0, "g"],
    ["Sugar", food.sugar ?? 0, "g"],
    ["Sodium", food.sodium ?? 0, "mg"],
  ];
  return (
    <div>
      <PageHeader
        back
        title={food.name}
        description={`${food.brand ? food.brand + " · " : ""}Nutrition data provided by ${food.source}`}
        action={
          <Badge tone={food.source === "USDA" ? "green" : "blue"}>
            {food.source}
            <ExternalLink className="ml-1 h-3 w-3" />
          </Badge>
        }
      />
      {success && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm font-semibold text-brand-800">
          <span>Food added to {meal} successfully.</span>
          <button onClick={() => setSuccess(false)}>Dismiss</button>
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card className="p-6">
          <SectionTitle
            title={`Nutrition for ${qty}g`}
            description="Values update automatically when quantity changes."
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.slice(0, 4).map(([label, value, unit], i) => (
              <div
                key={String(label)}
                className={cn(
                  "rounded-2xl p-4",
                  i === 0 ? "bg-slate-950 text-white" : "bg-slate-50",
                )}
              >
                <p
                  className={cn(
                    "text-xs",
                    i === 0 ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {formatNumber(Number(value) * ratio, 1)}
                  <small className="ml-1 text-xs">{unit}</small>
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 divide-y">
            {metrics.slice(4).map(([label, value, unit]) => (
              <div
                key={String(label)}
                className="flex justify-between py-4 text-sm"
              >
                <span className="text-slate-500">{label}</span>
                <strong>
                  {formatNumber(Number(value) * ratio, 1)} {unit}
                </strong>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Nutrition values are provider estimates. Logged foods are stored
              as a snapshot by the NessFit backend.
            </p>
          </div>
        </Card>
        <Card className="h-fit p-6">
          <h2 className="text-lg font-bold">Add to your diary</h2>
          <div className="mt-5">
            <Label>Quantity</Label>
            <div className="grid grid-cols-3 gap-2">
              {[100, 150, 200].map((x) => (
                <button
                  key={x}
                  onClick={() => setQty(x)}
                  className={cn(
                    "h-10 rounded-xl border text-sm font-semibold",
                    qty === x
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "",
                  )}
                >
                  {x} g
                </button>
              ))}
            </div>
            <div className="relative mt-2">
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
              <span className="absolute right-3 top-3 text-sm text-slate-400">
                g
              </span>
            </div>
          </div>
          <div className="mt-5">
            <Label>Meal</Label>
            <Select value={meal} onChange={(e) => setMeal(e.target.value)}>
              {meals.map((x) => (
                <option key={x.name}>{x.name}</option>
              ))}
            </Select>
          </div>
          <Button className="mt-6 w-full" onClick={() => setSuccess(true)}>
            <Plus className="h-4 w-4" />
            Add to Food Diary
          </Button>
          <Button
            variant="secondary"
            className="mt-2 w-full"
            onClick={() => setSaved(!saved)}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            {saved ? "Saved" : "Save Food"}
          </Button>
          <button
            onClick={() => nav("/nutrition/diary")}
            className="mt-4 w-full text-center text-xs font-bold text-brand-600"
          >
            View today's diary
          </button>
        </Card>
      </div>
    </div>
  );
}
export function FoodDiaryPage() {
  const [data, setData] = useState(meals);
  const [remove, setRemove] = useState<{ meal: string; name: string } | null>(
    null,
  );
  const confirm = () => {
    if (!remove) return;
    setData((xs) =>
      xs.map((m) =>
        m.name === remove.meal
          ? {
              ...m,
              items: m.items.filter((i) => i.name !== remove.name),
              calories: m.items
                .filter((i) => i.name !== remove.name)
                .reduce((s, i) => s + i.calories, 0),
            }
          : m,
      ),
    );
    setRemove(null);
  };
  return (
    <div>
      <PageHeader
        title="Meal Prep"
        description="Thursday, 27 August 2026"
        action={
          <Link to="/nutrition/search">
            <Button>
              <Plus className="h-4 w-4" />
              Add food
            </Button>
          </Link>
        }
      />
      <Card className="mb-6 p-5 md:p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricProgress
            label="Calories"
            current={1420}
            target={1900}
            unit=" kcal"
          />
          <MetricProgress label="Protein" current={95} target={130} unit="g" />
          <MetricProgress
            label="Carbs"
            current={150}
            target={210}
            unit="g"
            color="bg-violet-500"
          />
          <MetricProgress
            label="Fat"
            current={41}
            target={60}
            unit="g"
            color="bg-amber-500"
          />
        </div>
      </Card>
      <div className="space-y-4">
        {data.map((meal) => (
          <Card key={meal.name} className="overflow-hidden">
            <div className="flex items-center justify-between border-b bg-slate-50/70 px-5 py-4">
              <div>
                <h2 className="font-bold">{meal.name}</h2>
                <p className="text-xs text-slate-400">
                  {meal.items.length}{" "}
                  {meal.items.length === 1 ? "item" : "items"}
                </p>
              </div>
              <strong className="text-sm">{meal.calories} kcal</strong>
            </div>
            {meal.items.length ? (
              <div className="divide-y">
                {meal.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Apple className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.portion}</p>
                    </div>
                    <p className="text-sm font-semibold">
                      {item.calories} kcal
                    </p>
                    <button
                      aria-label={`Remove ${item.name}`}
                      onClick={() =>
                        setRemove({ meal: meal.name, name: item.name })
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-6 text-center text-sm text-slate-400">
                No foods logged for {meal.name.toLowerCase()}.
              </div>
            )}
            <Link
              to="/nutrition/search"
              className="flex items-center gap-2 border-t px-5 py-3 text-sm font-bold text-brand-600 hover:bg-brand-50"
            >
              <Plus className="h-4 w-4" />
              Add food to {meal.name}
            </Link>
          </Card>
        ))}
      </div>
      <Card className="mt-6 p-6">
        <SectionTitle
          title="Nutrition summary"
          description="Distribution of today's 1,420 calories"
        />
        <div className="grid gap-5 md:grid-cols-[220px_1fr]">
          <div
            className="mx-auto grid h-44 w-44 place-items-center rounded-full"
            style={{
              background:
                "conic-gradient(#28a36f 0 31%,#8b5cf6 31% 73%,#f59e0b 73% 100%)",
            }}
          >
            <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center">
              <div>
                <p className="text-2xl font-bold">1,420</p>
                <p className="text-xs text-slate-400">kcal</p>
              </div>
            </div>
          </div>
          <div className="grid content-center gap-4 sm:grid-cols-3">
            {[
              ["Protein", "95g", "bg-brand-500"],
              ["Carbs", "150g", "bg-violet-500"],
              ["Fat", "41g", "bg-amber-500"],
            ].map(([a, b, c]) => (
              <div key={a} className="rounded-xl bg-slate-50 p-4">
                <i className={`block h-2 w-8 rounded ${c}`} />
                <p className="mt-3 text-xs text-slate-500">{a}</p>
                <p className="font-bold">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Modal
        open={!!remove}
        onClose={() => setRemove(null)}
        title="Remove food?"
      >
        <p className="text-sm text-slate-500">
          Remove <strong>{remove?.name}</strong> from today's{" "}
          {remove?.meal.toLowerCase()}? Your totals will update immediately.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRemove(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm}>
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
}
export function SavedFoodsPage() {
  const [items, setItems] = useState(foods);
  const [query, setQuery] = useState("");
  const filtered = items.filter((x) =>
    x.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div>
      <PageHeader
        title="Saved Foods"
        description="Your personal shortcuts for faster meal logging."
        action={
          <Link to="/nutrition/search">
            <Button>
              <Plus className="h-4 w-4" />
              Find food
            </Button>
          </Link>
        }
      />
      <div className="mb-5 max-w-md">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search saved foods..."
        />
      </div>
      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((f) => (
            <Card key={f.id} className="p-5">
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Apple className="h-5 w-5" />
                </span>
                <button
                  onClick={() =>
                    setItems((xs) => xs.filter((x) => x.id !== f.id))
                  }
                  className="p-2 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-4 font-bold">{f.name}</h3>
              <p className="mt-1 text-xs text-slate-500">
                {f.calories} kcal · {f.protein}g protein / 100g
              </p>
              <div className="mt-5 flex gap-2">
                <Button size="sm" className="flex-1">
                  Add to meal
                </Button>
                <Link to={`/nutrition/food/${f.id}`}>
                  <Button size="sm" variant="secondary">
                    View
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved foods found"
          description="Save foods you eat often to log them with fewer steps."
          actionLabel="Browse foods"
          actionTo="/nutrition/search"
        />
      )}
    </div>
  );
}
export function NutritionTargetsPage() {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [goal, setGoal] = useState<HealthGoal>("LOSE_WEIGHT");
  const [targetWeight, setTargetWeight] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    healthService.profile().then((result) => {
      setProfile(result);
      setGoal(result.goal);
      setTargetWeight(result.targetWeightKg?.toString() ?? "");
    }).catch(() => setError("Health profile could not be loaded.")).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>;
  if (!profile?.nutritionTarget) return <Card className="p-6"><h1 className="text-xl font-bold">Finish onboarding first</h1><p className="mt-2 text-sm text-slate-500">Complete your health profile to generate daily nutrition targets.</p><Link to="/onboarding"><Button className="mt-5">Go to onboarding</Button></Link></Card>;
  const target = profile.nutritionTarget;
  const macroCalories = target.proteinGrams * 4 + target.carbohydratesGrams * 4 + target.fatGrams * 9;
  const percent = (value: number) => macroCalories ? `${Math.round(value / macroCalories * 100)}%` : "0%";
  const goalLabel = goal === "LOSE_WEIGHT" ? "Lose Weight" : goal === "GAIN_WEIGHT" ? "Gain Weight" : "Maintain Weight";
  const updateGoal = async () => {
    setSaving(true); setError(null);
    try {
      const result = await healthService.completeOnboarding({ gender: profile.gender, dateOfBirth: profile.dateOfBirth, heightCm: profile.heightCm, currentWeightKg: profile.currentWeightKg, activityLevel: profile.activityLevel, goal, targetWeightKg: goal === "MAINTAIN_WEIGHT" ? null : Number(targetWeight) });
      setProfile(result); setEditing(false);
    } catch (requestError) {
      setError(axios.isAxiosError(requestError) ? ((requestError.response?.data as { message?: string } | undefined)?.message ?? "Goal could not be updated.") : "Goal could not be updated.");
    } finally { setSaving(false); }
  };
  return (
    <div>
      <PageHeader
        title="Nutrition Targets"
        description="Your daily plan connects energy needs with your weight goal."
        action={
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Update goal
          </Button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="p-6">
          <SectionTitle
            title="Daily nutrition"
            description="Calculated from your health profile and current goal"
          />
          <div className="rounded-2xl bg-slate-950 p-6 text-white">
            <p className="text-sm text-slate-400">Daily calorie target</p>
            <p className="mt-2 text-4xl font-bold">
              {target.calories.toLocaleString()} <span className="text-base text-slate-400">kcal</span>
            </p>
            <Progress value={0} className="mt-6 bg-slate-800" />
            <p className="mt-2 text-xs text-slate-500">Food diary totals will appear here after the nutrition module is connected.</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Protein", `${target.proteinGrams.toFixed(0)}g`, percent(target.proteinGrams * 4)],
              ["Carbohydrates", `${target.carbohydratesGrams.toFixed(0)}g`, percent(target.carbohydratesGrams * 4)],
              ["Fat", `${target.fatGrams.toFixed(0)}g`, percent(target.fatGrams * 9)],
            ].map(([a, b, c]) => (
              <div key={a} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{a}</p>
                <p className="mt-2 text-xl font-bold">{b}</p>
                <p className="mt-1 text-xs text-brand-600">{c} of calories</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <SectionTitle title="How we calculate it" />
          <div className="space-y-5">
            {[
              ["BMR", `${target.bmr.toLocaleString()} kcal`, "Energy your body uses at rest"],
              ["TDEE", `${target.tdee.toLocaleString()} kcal`, "Estimated daily energy expenditure"],
              ["Goal", goalLabel, profile.targetWeightKg ? `Target weight ${profile.targetWeightKg} kg` : "Keep your current weight"],
              ["Adjustment", `${target.tdee - target.calories > 0 ? "-" : "+"}${Math.abs(target.tdee - target.calories)} kcal/day`, "Applied as a percentage of TDEE"],
            ].map(([a, b, c]) => (
              <div
                key={a}
                className="flex items-start justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <p className="text-sm font-semibold">{a}</p>
                  <p className="mt-1 text-xs text-slate-400">{c}</p>
                </div>
                <strong className="text-sm">{b}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}
      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Update your goal"
      >
        <div className="space-y-4">
          <div>
            <Label>Goal</Label>
            <Select value={goal} onChange={(event) => setGoal(event.target.value as HealthGoal)}>
              <option value="LOSE_WEIGHT">Lose Weight</option>
              <option value="MAINTAIN_WEIGHT">Maintain Weight</option>
              <option value="GAIN_WEIGHT">Gain Weight</option>
            </Select>
          </div>
          {goal !== "MAINTAIN_WEIGHT" && <div>
            <Label>Target weight</Label>
            <Input type="number" min={20} max={500} step="0.1" value={targetWeight} onChange={(event) => setTargetWeight(event.target.value)} />
          </div>}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          <Button onClick={updateGoal} loading={saving}>Save changes</Button>
        </div>
      </Modal>
    </div>
  );
}
