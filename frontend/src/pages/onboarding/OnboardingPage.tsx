import { useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, ArrowRight, Check, Dumbbell, Gauge, Scale, Sparkles, Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input, Label, Progress, Select } from "@/components/ui";
import { healthService, type ActivityLevel, type HealthGender, type HealthGoal } from "@/services";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/utils";

const activities: { value: ActivityLevel; title: string; description: string; multiplier: number }[] = [
  { value: "SEDENTARY", title: "Sedentary", description: "Mostly seated with little planned exercise", multiplier: 1.2 },
  { value: "LIGHTLY_ACTIVE", title: "Lightly Active", description: "Light exercise 1–3 days per week", multiplier: 1.375 },
  { value: "MODERATELY_ACTIVE", title: "Moderately Active", description: "Training 3–5 days per week", multiplier: 1.55 },
  { value: "VERY_ACTIVE", title: "Very Active", description: "Hard training 6–7 days per week", multiplier: 1.725 },
  { value: "EXTRA_ACTIVE", title: "Extra Active", description: "Physical work or twice-daily training", multiplier: 1.9 },
];
const goals: { value: HealthGoal; title: string; description: string }[] = [
  { value: "LOSE_WEIGHT", title: "Lose Weight", description: "Create a sustainable calorie deficit" },
  { value: "MAINTAIN_WEIGHT", title: "Maintain Weight", description: "Build consistent healthy habits" },
  { value: "GAIN_WEIGHT", title: "Gain Weight", description: "Support strength and muscle growth" },
];
type FormState = { gender: HealthGender; dateOfBirth: string; heightCm: string; currentWeightKg: string; activityLevel: ActivityLevel; goal: HealthGoal; targetWeightKg: string };

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) return (error.response?.data as { message?: string } | undefined)?.message ?? "The onboarding data could not be saved.";
  return "The onboarding data could not be saved.";
}
function ageFrom(date: string) {
  const birth = new Date(`${date}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const birthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (today < birthday) age -= 1;
  return Math.max(age, 1);
}
function calculatePreview(data: FormState) {
  const weight = Number(data.currentWeightKg);
  const height = Number(data.heightCm);
  const age = ageFrom(data.dateOfBirth);
  const activity = activities.find((item) => item.value === data.activityLevel)?.multiplier ?? 1.55;
  const bmr = 10 * weight + 6.25 * height - 5 * age + (data.gender === "MALE" ? 5 : -161);
  const tdee = Math.round(bmr * activity);
  const factor = data.goal === "LOSE_WEIGHT" ? 0.85 : data.goal === "GAIN_WEIGHT" ? 1.1 : 1;
  const calories = Math.round(tdee * factor);
  const protein = weight * (data.goal === "MAINTAIN_WEIGHT" ? 1.6 : 2);
  const fat = (calories * 0.25) / 9;
  const carbs = Math.max(0, (calories - protein * 4 - fat * 9) / 4);
  return { bmi: weight / ((height / 100) ** 2), bmr: Math.round(bmr), tdee, calories, protein, fat, carbs };
}

export function OnboardingPage() {
  const nav = useNavigate();
  const setOnboardingCompleted = useAppStore((state) => state.setOnboardingCompleted);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FormState>({ gender: "MALE", dateOfBirth: "", heightCm: "", currentWeightKg: "", activityLevel: "MODERATELY_ACTIVE", goal: "LOSE_WEIGHT", targetWeightKg: "" });
  const preview = useMemo(() => calculatePreview(data), [data]);
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setData((current) => ({ ...current, [key]: value }));
  const validateStep = () => {
    if (step === 1 && (!data.dateOfBirth || !data.heightCm || !data.currentWeightKg)) return "Complete your date of birth, height and current weight.";
    if (step === 1 && (Number(data.heightCm) < 100 || Number(data.heightCm) > 250 || Number(data.currentWeightKg) < 20 || Number(data.currentWeightKg) > 500)) return "Enter a valid height and weight.";
    if (step === 3 && data.goal !== "MAINTAIN_WEIGHT") {
      if (!data.targetWeightKg) return "Enter your target weight.";
      if (data.goal === "LOSE_WEIGHT" && Number(data.targetWeightKg) >= Number(data.currentWeightKg)) return "Target weight must be lower than current weight.";
      if (data.goal === "GAIN_WEIGHT" && Number(data.targetWeightKg) <= Number(data.currentWeightKg)) return "Target weight must be higher than current weight.";
    }
    return null;
  };
  const next = () => { const validation = validateStep(); if (validation) { setError(validation); return; } setError(null); setStep((value) => Math.min(value + 1, 4)); };
  const back = () => { setError(null); setStep((value) => Math.max(value - 1, 1)); };
  const finish = async () => {
    const validation = validateStep();
    if (validation) { setError(validation); return; }
    setSaving(true); setError(null);
    try {
      await healthService.completeOnboarding({ gender: data.gender, dateOfBirth: data.dateOfBirth, heightCm: Number(data.heightCm), currentWeightKg: Number(data.currentWeightKg), activityLevel: data.activityLevel, goal: data.goal, targetWeightKg: data.goal === "MAINTAIN_WEIGHT" ? null : Number(data.targetWeightKg) });
      setOnboardingCompleted(true);
      nav("/dashboard", { replace: true });
    } catch (requestError) { setError(errorMessage(requestError)); } finally { setSaving(false); }
  };
  return <div className="min-h-screen bg-canvas px-4 py-8 dark:bg-slate-950 md:py-12"><div className="mx-auto max-w-4xl">
    <div className="mb-8 flex items-center justify-between"><div className="flex items-center gap-2 font-bold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white"><Zap className="h-5 w-5" /></span>NessFit</div><span className="text-sm font-semibold text-slate-500">Step {step} of 4</span></div>
    <div className="mb-7"><div className="mb-3 flex justify-between text-xs font-bold text-slate-400"><span>About you</span><span>Activity</span><span>Goal</span><span>Your plan</span></div><Progress value={step * 25} className="h-2.5" /></div>
    <Card className="overflow-hidden"><div className="border-b bg-white p-6 md:p-8 dark:bg-slate-900"><h1 className="text-2xl font-bold md:text-3xl">{step === 1 ? "Let's understand your body" : step === 2 ? "How active is a typical week?" : step === 3 ? "What are you working toward?" : "Your personal starting plan"}</h1><p className="mt-2 text-slate-500">{step === 1 ? "These details help us calculate your baseline energy needs." : step === 2 ? "Choose the closest match. You can update this anytime." : step === 3 ? "A clear target helps NessFit recommend the right daily intake." : "Your targets are calculated from the information you entered."}</p></div>
      <div className="p-6 md:p-8">{step === 1 && <div className="grid gap-5 sm:grid-cols-2"><div><Label>Gender</Label><Select value={data.gender} onChange={(event) => update("gender", event.target.value as HealthGender)}><option value="MALE">Male</option><option value="FEMALE">Female</option></Select></div><div><Label>Date of birth</Label><Input type="date" value={data.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} /></div><div><Label>Height</Label><div className="relative"><Input type="number" min={100} max={250} value={data.heightCm} onChange={(event) => update("heightCm", event.target.value)} /><span className="absolute right-3 top-3 text-sm text-slate-400">cm</span></div></div><div><Label>Current weight</Label><div className="relative"><Input type="number" min={20} max={500} step="0.1" value={data.currentWeightKg} onChange={(event) => update("currentWeightKg", event.target.value)} /><span className="absolute right-3 top-3 text-sm text-slate-400">kg</span></div></div></div>}
      {step === 2 && <div className="grid gap-3">{activities.map((activity, index) => <button key={activity.value} type="button" onClick={() => update("activityLevel", activity.value)} className={cn("flex items-center gap-4 rounded-2xl border p-4 text-left transition", data.activityLevel === activity.value ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100" : "bg-white hover:border-brand-200")}><span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", data.activityLevel === activity.value ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500")}><Dumbbell className="h-5 w-5" /></span><span className="flex-1"><strong className="block">{activity.title}</strong><span className="text-sm text-slate-500">{activity.description}</span></span>{data.activityLevel === activity.value && <Check className="h-5 w-5 text-brand-600" />}<span className="hidden text-xs text-slate-400 sm:block">Level {index + 1}</span></button>)}</div>}
      {step === 3 && <div><div className="grid gap-3 md:grid-cols-3">{goals.map((goal) => <button key={goal.value} type="button" onClick={() => update("goal", goal.value)} className={cn("rounded-2xl border p-5 text-left transition", data.goal === goal.value ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100" : "hover:border-brand-200")}><Target className={cn("h-6 w-6", data.goal === goal.value ? "text-brand-600" : "text-slate-400")} /><strong className="mt-4 block">{goal.title}</strong><span className="mt-1 block text-sm text-slate-500">{goal.description}</span></button>)}</div>{data.goal !== "MAINTAIN_WEIGHT" && <div className="mt-6 rounded-2xl bg-slate-50 p-5"><Label>Target weight</Label><div className="relative"><Input type="number" min={20} max={500} step="0.1" value={data.targetWeightKg} onChange={(event) => update("targetWeightKg", event.target.value)} /><span className="absolute right-3 top-3 text-sm text-slate-400">kg</span></div></div>}</div>}
      {step === 4 && <div><div className="grid gap-4 sm:grid-cols-3">{[{ icon: Scale, label: "BMI", value: preview.bmi.toFixed(1), detail: "Calculated from your height and weight" }, { icon: Gauge, label: "BMR", value: preview.bmr.toLocaleString(), detail: "kcal at rest" }, { icon: Zap, label: "TDEE", value: preview.tdee.toLocaleString(), detail: "Estimated daily energy use" }].map(({ icon: Icon, label, value, detail }) => <div key={label} className="rounded-2xl bg-slate-950 p-5 text-white"><Icon className="h-5 w-5 text-brand-400" /><p className="mt-5 text-sm text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p><p className="text-xs text-slate-400">{detail}</p></div>)}</div><div className="mt-5 rounded-2xl border border-brand-200 bg-brand-50 p-5"><div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-brand-600" /><div><p className="font-bold">Your daily nutrition target</p><p className="text-sm text-slate-500">The backend will save these targets when you finish.</p></div></div><div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">{[["Calories", `${preview.calories.toLocaleString()} kcal`], ["Protein", `${preview.protein.toFixed(0)} g`], ["Carbs", `${preview.carbs.toFixed(0)} g`], ["Fat", `${preview.fat.toFixed(0)} g`]].map(([label, value]) => <div key={label}><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-bold">{value}</p></div>)}</div></div></div>}
      {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}
      <div className="mt-8 flex justify-between border-t pt-6">{step > 1 ? <Button variant="secondary" onClick={back}><ArrowLeft className="h-4 w-4" />Back</Button> : <span />}{step === 4 ? <Button onClick={finish} loading={saving}>Finish onboarding<Check className="h-4 w-4" /></Button> : <Button onClick={next}>Continue<ArrowRight className="h-4 w-4" /></Button>}</div></div>
    </Card>
  </div></div>;
}
