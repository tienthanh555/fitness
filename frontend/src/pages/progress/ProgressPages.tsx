import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { CalendarDays, Edit3, Plus, Scale, Target, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { WeightChart } from "@/components/charts";
import { EmptyState, ErrorState, PageHeader, SectionTitle, StatCard } from "@/components/common";
import { Badge, Button, Card, Input, Label, Modal, Progress, Skeleton } from "@/components/ui";
import { healthService, type HealthProfile, type WeightMeasurementApi } from "@/services";
import { formatDate, formatNumber } from "@/utils";

type Range = "30D" | "90D" | "1Y";
type FormState = { weightKg: string; measuredAt: string };

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function fromDate(range: Range) {
  const date = new Date();
  date.setDate(date.getDate() - (range === "30D" ? 29 : range === "90D" ? 89 : 364));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) return (error.response?.data as { message?: string } | undefined)?.message ?? "The measurement request could not be completed.";
  return "The measurement request could not be completed.";
}
function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(`${value}T12:00:00`));
}

export function ProgressPage() {
  const [range, setRange] = useState<Range>("30D");
  const [data, setData] = useState<{ profile: HealthProfile; history: WeightMeasurementApi[] } | null>(null);
  const [selected, setSelected] = useState<WeightMeasurementApi | null>(null);
  const [form, setForm] = useState<FormState>({ weightKg: "", measuredAt: today() });
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profile, history] = await Promise.all([healthService.profile(), healthService.weightHistory()]);
      setData({ profile, history });
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

  const visibleHistory = useMemo(() => {
    if (!data) return [];
    const start = fromDate(range);
    return data.history.filter((item) => item.measuredAt >= start && item.measuredAt <= today());
  }, [data, range]);
  const current = data?.history[data.history.length - 1];
  const starting = data?.history[0];
  const currentWeight = current?.weightKg ?? data?.profile.currentWeightKg ?? 0;
  const startingWeight = starting?.weightKg ?? currentWeight;
  const weightChange = currentWeight - startingWeight;
  const target = data?.profile.targetWeightKg ?? null;
  const goalProgress = target == null ? null : data?.profile.goal === "GAIN_WEIGHT"
    ? ((currentWeight - startingWeight) / (target - startingWeight)) * 100
    : ((startingWeight - currentWeight) / (startingWeight - target)) * 100;
  const bmi = data?.profile.heightCm ? currentWeight / ((data.profile.heightCm / 100) ** 2) : 0;
  const chartData = visibleHistory.map((item) => ({ date: dateLabel(item.measuredAt), weight: item.weightKg }));

  const openCreate = () => {
    setSelected(null);
    setForm({ weightKg: formatNumber(currentWeight, 1), measuredAt: today() });
    setOpen(true);
    setNotice(null);
  };
  const openEdit = (measurement: WeightMeasurementApi) => {
    setSelected(measurement);
    setForm({ weightKg: String(measurement.weightKg), measuredAt: measurement.measuredAt });
    setOpen(true);
    setNotice(null);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { weightKg: Number(form.weightKg), measuredAt: form.measuredAt };
      if (selected) await healthService.updateMeasurement(selected.id, payload);
      else await healthService.createMeasurement(payload);
      setOpen(false);
      setNotice("Measurement saved. Your trend has been updated.");
      await load();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };
  const remove = async (measurement: WeightMeasurementApi) => {
    setError(null);
    try {
      await healthService.deleteMeasurement(measurement.id);
      setNotice("Measurement deleted.");
      await load();
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  if (loading && !data) return <div className="space-y-5"><Skeleton className="h-16" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div><Skeleton className="h-80" /></div>;
  if (error && !data) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!data) return null;

  return <div>
    <PageHeader title="Body Progress" description="Track your weight trend and update your measurements over time." action={<Button onClick={openCreate}><Plus className="h-4 w-4" />Add measurement</Button>} />
    {notice && <div className="mb-5 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm font-semibold text-brand-700">{notice}</div>}
    {error && <p role="alert" className="mb-5 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Current weight" value={`${formatNumber(currentWeight, 1)} kg`} detail={current ? `Updated ${formatDate(current.measuredAt)}` : "From onboarding"} icon={Scale} />
      <StatCard label="Starting weight" value={`${formatNumber(startingWeight, 1)} kg`} detail={starting ? formatDate(starting.measuredAt) : "From onboarding"} icon={CalendarDays} tone="blue" />
      {target == null ? <StatCard label="Goal" value="Maintain" detail="No target weight set" icon={Target} tone="amber" /> : <StatCard label="Goal weight" value={`${formatNumber(target, 1)} kg`} detail={`${Math.round(Math.min(100, Math.max(0, goalProgress ?? 0)))}% complete`} icon={Target} tone="amber" />}
      <StatCard label="Weight change" value={`${weightChange > 0 ? "+" : ""}${formatNumber(weightChange, 1)} kg`} detail={weightChange <= 0 ? "Since first measurement" : "Increase since first measurement"} icon={weightChange <= 0 ? TrendingDown : TrendingUp} />
    </div>
    <Card className="mt-5 p-5 md:p-6"><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><SectionTitle title="Weight trend" description={`${visibleHistory.length} measurement${visibleHistory.length === 1 ? "" : "s"} in the selected period`} /><div className="flex rounded-xl bg-slate-100 p-1">{(["30D", "90D", "1Y"] as Range[]).map((item) => <button key={item} onClick={() => setRange(item)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${range === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}>{item}</button>)}</div></div>{visibleHistory.length ? <WeightChart detailed data={chartData} /> : <EmptyState icon={Scale} title="No measurements in this period" description="Add a measurement or choose a longer period to see your trend." actionLabel="Add measurement" onAction={openCreate} />}</Card>
    {target != null && <Card className="mt-5 p-6"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Goal progress</h2><p className="mt-1 text-sm text-slate-500">Progress from your first measurement toward your target.</p></div><Badge tone="green">{Math.round(Math.min(100, Math.max(0, goalProgress ?? 0)))}%</Badge></div><div className="my-6"><div className="mb-2 flex justify-between text-sm"><span>{formatNumber(startingWeight, 1)} kg</span><strong className="text-brand-600">{formatNumber(Math.abs(weightChange), 1)} kg changed</strong><span>{formatNumber(target, 1)} kg</span></div><Progress value={Math.min(100, Math.max(0, goalProgress ?? 0))} className="h-3" /></div><div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2"><div className="flex justify-between"><span className="text-slate-500">Remaining</span><strong>{formatNumber(Math.abs(currentWeight - target), 1)} kg</strong></div><div className="flex justify-between"><span className="text-slate-500">Current BMI</span><strong>{formatNumber(bmi, 1)}</strong></div></div></Card>}
    {target == null && <Card className="mt-5 p-6"><div className="flex items-center gap-3"><Target className="h-5 w-5 text-brand-600" /><div><h2 className="font-bold">Maintenance goal</h2><p className="mt-1 text-sm text-slate-500">Keep tracking your weight to monitor a stable trend. No target weight is configured.</p></div></div></Card>}
    <Card className="mt-5 overflow-hidden"><div className="border-b px-5 py-4"><SectionTitle title="Measurement history" description="One measurement per day. You can edit or delete your own entries." /></div>{data.history.length ? <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Weight</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y">{[...data.history].reverse().map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-5 py-4">{formatDate(item.measuredAt)}</td><td className="px-5 py-4 font-semibold">{formatNumber(item.weightKg, 1)} kg</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Edit3 className="h-4 w-4" />Edit</Button><Button size="sm" variant="ghost" onClick={() => void remove(item)}><Trash2 className="h-4 w-4 text-rose-600" />Delete</Button></div></td></tr>)}</tbody></table></div> : <div className="p-6"><EmptyState icon={Scale} title="No measurements yet" description="Add your first weight measurement to start tracking progress." actionLabel="Add measurement" onAction={openCreate} /></div>}</Card>
    <MeasurementModal open={open} selected={selected} form={form} saving={saving} onChange={setForm} onClose={() => setOpen(false)} onSubmit={submit} />
  </div>;
}

function MeasurementModal({ open, selected, form, saving, onChange, onClose, onSubmit }: { open: boolean; selected: WeightMeasurementApi | null; form: FormState; saving: boolean; onChange: (value: FormState) => void; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  return <Modal open={open} onClose={onClose} title={selected ? "Edit measurement" : "Add body measurement"}><form onSubmit={onSubmit}><div><Label htmlFor="measurement-weight">Weight (kg)</Label><Input id="measurement-weight" required min={20} max={500} step="0.1" type="number" value={form.weightKg} onChange={(event) => onChange({ ...form, weightKg: event.target.value })} /></div><div className="mt-4"><Label htmlFor="measurement-date">Date</Label><Input id="measurement-date" required max={today()} type="date" value={form.measuredAt} onChange={(event) => onChange({ ...form, measuredAt: event.target.value })} /></div><p className="mt-4 text-xs text-slate-400">Only one measurement is kept for each date. Saving the same date updates that entry.</p><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={saving}>{selected ? "Save changes" : "Save measurement"}</Button></div></form></Modal>;
}
