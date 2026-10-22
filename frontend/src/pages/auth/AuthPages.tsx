import { useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Label } from "@/components/ui";
import { authService } from "@/services";
import { useAppStore } from "@/store/app-store";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number");
const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
const registerSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name").max(100),
    email: z.string().email("Enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error))
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      "The request could not be completed. Please try again."
    );
  return "The request could not be completed. Please try again.";
}

export function LoginPage() {
  const nav = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);
  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);
  const [show, setShow] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const submit = async (values: LoginValues) => {
    setSubmitError(null);
    try {
      const session = await authService.login(values);
      setAuth(session.accessToken, session.user);
      setOnboardingCompleted(session.user.role === "ADMIN" ? true : null);
      nav(session.user.role === "ADMIN" ? "/admin" : "/dashboard", {
        replace: true,
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };
  return (
    <>
      <p className="text-sm font-bold text-brand-600">Welcome back</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        Sign in to NessFit
      </h1>
      <p className="mt-2 text-slate-500">
        Your next healthy choice starts here.
      </p>
      <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <div className="flex justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-brand-600"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder=""
              className="pr-11"
              {...register("password")}
            />
            <button
              type="button"
              aria-label="Toggle password visibility"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {show ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.password.message}
            </p>
          )}
        </div>
        {submitError && (
          <p
            role="alert"
            className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700"
          >
            {submitError}
          </p>
        )}
        <p className="text-xs text-slate-500">
          Your session is maintained by a secure browser cookie.
        </p>
        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="w-full"
        >
          Sign in <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-500">
        New to NessFit?{" "}
        <Link to="/register" className="font-bold text-brand-600">
          Create an account
        </Link>
      </p>
    </>
  );
}

export function RegisterPage() {
  const nav = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);
  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });
  const submit = async (values: RegisterValues) => {
    setSubmitError(null);
    try {
      const session = await authService.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });
      setAuth(session.accessToken, session.user);
      setOnboardingCompleted(false);
      nav("/onboarding", { replace: true });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };
  return (
    <>
      <p className="text-sm font-bold text-brand-600">Start your journey</p>
      <h1 className="mt-2 text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-slate-500">
        We'll personalize NessFit around your body and goal.
      </p>
      <form onSubmit={handleSubmit(submit)} className="mt-7 space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" autoComplete="name" {...register("fullName")} />
          {errors.fullName && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.fullName.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="register-email">Email address</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          <ul className="mt-2 space-y-1 text-xs text-slate-500">
            <li>** At least 8 characters</li>
            <li>** At least one uppercase letter</li>
            <li>** At least one number</li>
          </ul>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.password.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        {submitError && (
          <p
            role="alert"
            className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700"
          >
            {submitError}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="mt-2 w-full"
        >
          Create account <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already a member?{" "}
        <Link to="/login" className="font-bold text-brand-600">
          Sign in
        </Link>
      </p>
    </>
  );
}

export function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const submit = async (values: ForgotPasswordValues) => {
    setSubmitError(null);
    try {
      const result = await authService.forgotPassword(values.email);
      setMessage(result.message);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };
  if (message)
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-brand-600" />
        <h1 className="mt-5 text-2xl font-bold">Request received</h1>
        <p className="mt-2 text-slate-500">{message}</p>
        <Link to="/login">
          <Button className="mt-7">Back to sign in</Button>
        </Link>
      </div>
    );
  return (
    <>
      <Mail className="h-9 w-9 text-brand-600" />
      <h1 className="mt-5 text-3xl font-bold">Forgot your password?</h1>
      <p className="mt-2 text-slate-500">
        Enter your email. Email delivery for reset links will be connected
        later.
      </p>
      <form onSubmit={handleSubmit(submit)} className="mt-8">
        <Label htmlFor="forgot-email">Email address</Label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
        )}
        {submitError && (
          <p
            role="alert"
            className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700"
          >
            {submitError}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="mt-5 w-full"
        >
          Submit request
        </Button>
      </form>
      <Link
        to="/login"
        className="mt-6 block text-center text-sm font-bold text-brand-600"
      >
        Back to sign in
      </Link>
    </>
  );
}

export function ResetPasswordPage() {
  return (
    <div className="text-center">
      <Mail className="mx-auto h-12 w-12 text-brand-600" />
      <h1 className="mt-5 text-3xl font-bold">
        Password reset is pending email setup
      </h1>
      <p className="mt-2 text-slate-500">
        This page will become available after the email reset-link provider is
        configured.
      </p>
      <Link to="/forgot-password">
        <Button className="mt-7">Back to forgot password</Button>
      </Link>
    </div>
  );
}
