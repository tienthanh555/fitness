import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Apple,
  Bookmark,
  ChevronRight,
  CircleAlert,
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
  SectionTitle,
  SearchInput,
} from "@/components/common";
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Select,
  Skeleton,
} from "@/components/ui";
import {
  foodService,
  nutritionService,
  savedFoodService,
  type FoodApi,
  type FoodDiaryItemApi,
  type MealType,
  type NutritionSummary,
} from "@/services";
import { cn, formatNumber } from "@/utils";

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function apiError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error))
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      fallback
    );
  return fallback;
}
function mealLabel(meal: MealType) {
  return meal.charAt(0) + meal.slice(1).toLowerCase();
}

export function FoodSearchPage() {
  const [query, setQuery] = useState("");
  const [minProtein, setMinProtein] = useState("");
  const [maxCalories, setMaxCalories] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [submittedMinProtein, setSubmittedMinProtein] = useState("");
  const [submittedMaxCalories, setSubmittedMaxCalories] = useState("");
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<{
    content: FoodApi[];
    totalPages: number;
    totalElements: number;
  }>({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(
    (nextPage = 0) => {
      setLoading(true);
      setError(null);
      foodService
        .search({
          query: submittedQuery,
          minProtein: submittedMinProtein
            ? Number(submittedMinProtein)
            : undefined,
          maxCalories: submittedMaxCalories
            ? Number(submittedMaxCalories)
            : undefined,
          page: nextPage,
          size: 20,
        })
        .then((data) => {
          setResult(data);
          setPage(data.page);
        })
        .catch((requestError) =>
          setError(apiError(requestError, "Foods could not be loaded.")),
        )
        .finally(() => setLoading(false));
    },
    [submittedMaxCalories, submittedMinProtein, submittedQuery],
  );
  useEffect(() => {
    const timer = window.setTimeout(() => load(0), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  return (
    <div>
      <PageHeader
        title="Find a food"
        description="Search the NessFit food database and log the exact amount in grams."
      />
      <Card className="p-4 md:p-6">
        <div className="grid gap-3 md:grid-cols-[1fr_150px_150px_auto]">
          <div>
            <Label>Food name</Label>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search foods..."
            />
          </div>
          <div>
            <Label>Min protein</Label>
            <Input
              type="number"
              min={0}
              value={minProtein}
              onChange={(event) => setMinProtein(event.target.value)}
              placeholder="g / 100g"
            />
          </div>
          <div>
            <Label>Max calories</Label>
            <Input
              type="number"
              min={0}
              value={maxCalories}
              onChange={(event) => setMaxCalories(event.target.value)}
              placeholder="kcal / 100g"
            />
          </div>
          <Button
            className="self-end"
            onClick={() => {
              setSubmittedQuery(query.trim());
              setSubmittedMinProtein(minProtein);
              setSubmittedMaxCalories(maxCalories);
            }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Search
          </Button>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Nutrition values are stored per 100g. The server calculates values for
          the amount you log.
        </p>
      </Card>
      {error && (
        <div className="mt-5">
          <ErrorState message={error} onRetry={() => load(page)} />
        </div>
      )}
      {loading ? (
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      ) : !error && result.content.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={SearchX}
            title="No foods found"
            description="Try another name or adjust the nutrition filters."
          />
        </div>
      ) : !error ? (
        <div className="mt-6">
          <p className="mb-4 text-sm text-slate-500">
            <strong className="text-slate-800">
              {result.totalElements} results
            </strong>
            {query ? ` matching “${query}”` : ""}
          </p>
          <div className="space-y-3">
            {result.content.map((food) => (
              <FoodResult key={food.id} food={food} />
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={page === 0}
              onClick={() => load(page - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page + 1 >= result.totalPages}
              onClick={() => load(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
function FoodResult({ food }: { food: FoodApi }) {
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
              {food.caloriesPer100g} kcal / 100g
            </p>
            <Badge tone="green" className="mt-2">
              Internal database
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-5 md:w-72">
          {[
            ["Protein", food.proteinPer100g],
            ["Carbs", food.carbohydratesPer100g],
            ["Fat", food.fatPer100g],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-bold">{value}g</p>
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
  const { id = "" } = useParams();
  const nav = useNavigate();
  const [food, setFood] = useState<FoodApi | null>(null);
  const [qty, setQty] = useState(100);
  const [meal, setMeal] = useState<MealType>("LUNCH");
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    foodService
      .detail(id)
      .then(setFood)
      .catch((requestError) =>
        setError(apiError(requestError, "Food could not be loaded.")),
      );
  }, [id]);
  if (error)
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError(null);
          foodService
            .detail(id)
            .then(setFood)
            .catch((requestError) =>
              setError(apiError(requestError, "Food could not be loaded.")),
            );
        }}
      />
    );
  if (!food) return <Skeleton className="h-96" />;
  const ratio = qty / 100;
  const metrics = [
    ["Calories", food.caloriesPer100g, "kcal"],
    ["Protein", food.proteinPer100g, "g"],
    ["Carbs", food.carbohydratesPer100g, "g"],
    ["Fat", food.fatPer100g, "g"],
    ["Fiber", food.fiberPer100g, "g"],
    ["Sugar", food.sugarPer100g, "g"],
    ["Sodium", food.sodiumMgPer100g, "mg"],
  ];
  const saveFood = async () => {
    try {
      if (saved) {
        await savedFoodService.remove(food.id);
        setSaved(false);
      } else {
        await savedFoodService.save(food.id);
        setSaved(true);
      }
    } catch (requestError) {
      setError(apiError(requestError, "Saved food could not be updated."));
    }
  };
  const addToDiary = async () => {
    try {
      await nutritionService.addDiaryItem({
        foodId: food.id,
        logDate: today(),
        mealType: meal,
        quantityGrams: qty,
      });
      setMessage(`Food added to ${mealLabel(meal)}.`);
    } catch (requestError) {
      setError(apiError(requestError, "Food could not be added to the diary."));
    }
  };
  return (
    <div>
      <PageHeader
        back
        title={food.name}
        description="Nutrition values from the internal database"
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card className="p-6">
          <SectionTitle
            title={`Nutrition for ${qty}g`}
            description="Values are calculated from the per-100g database values."
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.slice(0, 4).map(([label, value, unit], index) => (
              <div
                key={String(label)}
                className={cn(
                  "rounded-2xl p-4",
                  index === 0 ? "bg-slate-950 text-white" : "bg-slate-50",
                )}
              >
                <p
                  className={cn(
                    "text-xs",
                    index === 0 ? "text-slate-400" : "text-slate-500",
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
              The logged item stores a nutrition snapshot so later food edits do
              not change your history.
            </p>
          </div>
        </Card>
        <Card className="h-fit p-6">
          <h2 className="text-lg font-bold">Add to your diary</h2>
          <Label className="mt-5">Quantity</Label>
          <div className="grid grid-cols-3 gap-2">
            {[100, 150, 200].map((value) => (
              <button
                key={value}
                onClick={() => setQty(value)}
                className={cn(
                  "h-10 rounded-xl border text-sm font-semibold",
                  qty === value
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "",
                )}
              >
                {value} g
              </button>
            ))}
          </div>
          <Input
            className="mt-2"
            type="number"
            min={0.1}
            max={10000}
            step="0.1"
            value={qty}
            onChange={(event) => setQty(Number(event.target.value))}
          />
          <Label className="mt-5">Meal</Label>
          <Select
            value={meal}
            onChange={(event) => setMeal(event.target.value as MealType)}
          >
            <option value="BREAKFAST">Breakfast</option>
            <option value="LUNCH">Lunch</option>
            <option value="DINNER">Dinner</option>
          </Select>
          {message && (
            <p className="mt-4 rounded-xl bg-brand-50 p-3 text-sm font-semibold text-brand-700">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">
              {error}
            </p>
          )}
          <Button className="mt-5 w-full" onClick={addToDiary}>
            <Plus className="h-4 w-4" />
            Add to Food Diary
          </Button>
          <Button
            variant="secondary"
            className="mt-2 w-full"
            onClick={saveFood}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            {saved ? "Saved" : "Save Food"}
          </Button>
          <button
            onClick={() => nav("/nutrition/diary")}
            className="mt-4 w-full text-center text-xs font-bold text-brand-600"
          >
            View diary
          </button>
        </Card>
      </div>
    </div>
  );
}

export function FoodDiaryPage() {
  const [date, setDate] = useState(today());
  const [summary, setSummary] = useState<NutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(
    (nextDate = date) => {
      setLoading(true);
      setError(null);
      nutritionService
        .summary(nextDate)
        .then(setSummary)
        .catch((requestError) =>
          setError(
            apiError(requestError, "Nutrition diary could not be loaded."),
          ),
        )
        .finally(() => setLoading(false));
    },
    [date],
  );
  useEffect(() => {
    const timer = window.setTimeout(() => load(date), 0);
    return () => window.clearTimeout(timer);
  }, [date, load]);
  const remove = async (item: FoodDiaryItemApi) => {
    try {
      await nutritionService.deleteDiaryItem(item.id);
      load();
    } catch (requestError) {
      setError(apiError(requestError, "Food could not be removed."));
    }
  };
  if (loading && !summary)
    return (
      <div className="space-y-4">
        <Skeleton className="h-36" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  if (error && !summary)
    return <ErrorState message={error} onRetry={() => load()} />;
  if (!summary) return null;
  return (
    <div>
      <PageHeader
        title="Meal Prep"
        description="Track the foods you eat and compare them with your daily targets."
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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Label htmlFor="diary-date">Date</Label>
            <Input
              id="diary-date"
              type="date"
              max={today()}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <p className="text-sm text-slate-500">
            All quantities are recorded in grams.
          </p>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricProgress
            label="Calories"
            current={summary.calories}
            target={summary.targetCalories ?? 0}
            unit=" kcal"
          />
          <MetricProgress
            label="Protein"
            current={summary.proteinGrams}
            target={summary.targetProteinGrams ?? 0}
            unit="g"
          />
          <MetricProgress
            label="Carbs"
            current={summary.carbohydratesGrams}
            target={summary.targetCarbohydratesGrams ?? 0}
            unit="g"
            color="bg-violet-500"
          />
          <MetricProgress
            label="Fat"
            current={summary.fatGrams}
            target={summary.targetFatGrams ?? 0}
            unit="g"
            color="bg-amber-500"
          />
        </div>
        {error && (
          <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}
      </Card>
      <div className="space-y-4">
        {summary.meals.map((meal) => (
          <Card key={meal.mealType} className="overflow-hidden">
            <div className="flex items-center justify-between border-b bg-slate-50/70 px-5 py-4">
              <div>
                <h2 className="font-bold">{mealLabel(meal.mealType)}</h2>
                <p className="text-xs text-slate-400">
                  {meal.items.length}{" "}
                  {meal.items.length === 1 ? "item" : "items"}
                </p>
              </div>
              <strong className="text-sm">
                {formatNumber(meal.calories, 0)} kcal
              </strong>
            </div>
            {meal.items.length ? (
              <div className="divide-y">
                {meal.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Apple className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {item.foodName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.quantityGrams} g ·{" "}
                        {formatNumber(item.calories, 0)} kcal
                      </p>
                    </div>
                    <button
                      aria-label={`Remove ${item.foodName}`}
                      onClick={() => remove(item)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-6 text-center text-sm text-slate-400">
                No foods logged for this meal.
              </div>
            )}
            <Link
              to="/nutrition/search"
              className="flex items-center gap-2 border-t px-5 py-3 text-sm font-bold text-brand-600 hover:bg-brand-50"
            >
              <Plus className="h-4 w-4" />
              Add food to {mealLabel(meal.mealType)}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SavedFoodsPage() {
  const [items, setItems] = useState<FoodApi[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    savedFoodService
      .list()
      .then(setItems)
      .catch((requestError) =>
        setError(apiError(requestError, "Saved foods could not be loaded.")),
      )
      .finally(() => setLoading(false));
  }, []);
  const remove = async (id: string) => {
    try {
      await savedFoodService.remove(id);
      setItems((foods) => foods.filter((food) => food.id !== id));
    } catch (requestError) {
      setError(apiError(requestError, "Saved food could not be removed."));
    }
  };
  const filtered = items.filter((food) =>
    food.name.toLowerCase().includes(query.toLowerCase()),
  );
  if (loading)
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
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
      {error && (
        <p
          role="alert"
          className="mb-5 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      )}
      <div className="mb-5 max-w-md">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search saved foods..."
        />
      </div>
      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((food) => (
            <Card key={food.id} className="p-5">
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Apple className="h-5 w-5" />
                </span>
                <button
                  onClick={() => remove(food.id)}
                  className="p-2 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-4 font-bold">{food.name}</h3>
              <p className="mt-1 text-xs text-slate-500">
                {food.caloriesPer100g} kcal · {food.proteinPer100g}g protein /
                100g
              </p>
              <div className="mt-5 flex gap-2">
                <Link className="flex-1" to={`/nutrition/food/${food.id}`}>
                  <Button size="sm" className="w-full">
                    Add to meal
                  </Button>
                </Link>
                <Link to={`/nutrition/food/${food.id}`}>
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
