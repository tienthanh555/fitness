import { useCallback, useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { Apple, Edit3, Plus, SearchX, Trash2 } from "lucide-react";
import { EmptyState, PageHeader, SearchInput } from "@/components/common";
import { Badge, Button, Card, Input, Label, Modal, Skeleton } from "@/components/ui";
import { adminFoodService, type FoodApi, type FoodPage, type FoodRequest } from "@/services";

type FoodFormState = {
  name: string;
  caloriesPer100g: string;
  proteinPer100g: string;
  carbohydratesPer100g: string;
  fatPer100g: string;
  fiberPer100g: string;
  sugarPer100g: string;
  sodiumMgPer100g: string;
  active: boolean;
};
type NumericField = Exclude<keyof FoodFormState, "name" | "active">;

const emptyForm: FoodFormState = {
  name: "",
  caloriesPer100g: "",
  proteinPer100g: "",
  carbohydratesPer100g: "",
  fatPer100g: "",
  fiberPer100g: "",
  sugarPer100g: "",
  sodiumMgPer100g: "",
  active: true,
};

const numericFields: { key: NumericField; label: string; unit: string }[] = [
  { key: "caloriesPer100g", label: "Calories", unit: "kcal / 100g" },
  { key: "proteinPer100g", label: "Protein", unit: "g / 100g" },
  { key: "carbohydratesPer100g", label: "Carbohydrates", unit: "g / 100g" },
  { key: "fatPer100g", label: "Fat", unit: "g / 100g" },
  { key: "fiberPer100g", label: "Fiber", unit: "g / 100g" },
  { key: "sugarPer100g", label: "Sugar", unit: "g / 100g" },
  { key: "sodiumMgPer100g", label: "Sodium", unit: "mg / 100g" },
];

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message ?? "The request could not be completed.";
  }
  return "The request could not be completed.";
}

function formFromFood(food: FoodApi): FoodFormState {
  return {
    name: food.name,
    caloriesPer100g: String(food.caloriesPer100g),
    proteinPer100g: String(food.proteinPer100g),
    carbohydratesPer100g: String(food.carbohydratesPer100g),
    fatPer100g: String(food.fatPer100g),
    fiberPer100g: String(food.fiberPer100g),
    sugarPer100g: String(food.sugarPer100g),
    sodiumMgPer100g: String(food.sodiumMgPer100g),
    active: food.active,
  };
}

function requestFromForm(form: FoodFormState): FoodRequest {
  return {
    name: form.name.trim(),
    caloriesPer100g: Number(form.caloriesPer100g),
    proteinPer100g: Number(form.proteinPer100g),
    carbohydratesPer100g: Number(form.carbohydratesPer100g),
    fatPer100g: Number(form.fatPer100g),
    fiberPer100g: Number(form.fiberPer100g),
    sugarPer100g: Number(form.sugarPer100g),
    sodiumMgPer100g: Number(form.sodiumMgPer100g),
    active: form.active,
  };
}

export function AdminFoodPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [result, setResult] = useState<FoodPage>({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 });
  const [selected, setSelected] = useState<FoodApi | null>(null);
  const [form, setForm] = useState<FoodFormState>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      setResult(await adminFoodService.list({ query: submittedQuery || undefined, page, size: 20 }));
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [submittedQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(0), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openCreate = () => {
    setSelected(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };
  const openEdit = (food: FoodApi) => {
    setSelected(food);
    setForm(formFromFood(food));
    setModalOpen(true);
  };
  const updateField = <K extends keyof FoodFormState>(key: K, value: FoodFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = requestFromForm(form);
      if (selected) await adminFoodService.update(selected.id, payload);
      else await adminFoodService.create(payload);
      setModalOpen(false);
      await load(result.page);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };
  const deactivate = async (food: FoodApi) => {
    setError(null);
    try {
      await adminFoodService.delete(food.id);
      await load(result.page);
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  return (
    <div>
      <PageHeader
        title="Food Management"
        description="Maintain the internal food database used by food search and diary logging. All values are stored per 100g."
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" />Add food</Button>}
      />
      <Card className="mb-5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1"><SearchInput value={query} onChange={setQuery} placeholder="Search food name..." /></div>
          <Button onClick={() => setSubmittedQuery(query.trim())}>Search</Button>
        </div>
      </Card>
      {error && <p role="alert" className="mb-5 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}
      {loading ? (
        <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
      ) : result.content.length ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr>{["Food", "Calories", "Protein", "Carbs", "Fat", "Status", "Actions"].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr></thead>
              <tbody className="divide-y">
                {result.content.map((food) => <tr key={food.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600"><Apple className="h-4 w-4" /></span><strong>{food.name}</strong></div></td>
                  <td className="px-5">{food.caloriesPer100g} kcal</td><td className="px-5">{food.proteinPer100g} g</td><td className="px-5">{food.carbohydratesPer100g} g</td><td className="px-5">{food.fatPer100g} g</td>
                  <td className="px-5"><Badge tone={food.active ? "green" : "gray"}>{food.active ? "Active" : "Inactive"}</Badge></td>
                  <td className="px-5"><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => openEdit(food)}><Edit3 className="h-4 w-4" />Edit</Button>{food.active && <Button size="sm" variant="ghost" onClick={() => void deactivate(food)}><Trash2 className="h-4 w-4 text-rose-600" />Deactivate</Button>}</div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t px-5 py-4 text-sm text-slate-500"><span>{result.totalElements} food{result.totalElements === 1 ? "" : "s"}</span><div className="flex gap-2"><Button size="sm" variant="secondary" disabled={result.page === 0} onClick={() => void load(result.page - 1)}>Previous</Button><Button size="sm" variant="secondary" disabled={result.page + 1 >= result.totalPages} onClick={() => void load(result.page + 1)}>Next</Button></div></div>
        </Card>
      ) : <EmptyState icon={SearchX} title="No foods found" description="Create a food or adjust the search term." actionLabel="Add food" onAction={openCreate} />}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selected ? "Edit food" : "Add food"}>
        <form onSubmit={(event) => void submit(event)}>
          <div><Label htmlFor="food-name">Food name</Label><Input id="food-name" required maxLength={150} value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="e.g. Chicken Breast, Roasted" /></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{numericFields.map((field) => <div key={field.key}><Label htmlFor={field.key}>{field.label}</Label><Input id={field.key} required min={0} step="0.01" type="number" value={form[field.key]} onChange={(event) => updateField(field.key, event.target.value)} /><p className="mt-1 text-xs text-slate-400">{field.unit}</p></div>)}</div>
          <label className="mt-4 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.active} onChange={(event) => updateField("active", event.target.checked)} />Available for users</label>
          <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" loading={saving}>{selected ? "Save changes" : "Create food"}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
