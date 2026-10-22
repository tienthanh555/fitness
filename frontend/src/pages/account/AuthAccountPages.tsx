import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { KeyRound, LogOut, Save, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common";
import { Button, Card, Input, Label, Modal } from "@/components/ui";
import { authService, userService } from "@/services";
import { useAppStore } from "@/store/app-store";

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error))
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      "The request could not be completed. Please try again."
    );
  return "The request could not be completed. Please try again.";
}

export function ProfilePage() {
  const nav = useNavigate();
  const accessToken = useAppStore((s) => s.accessToken);
  const authUser = useAppStore((s) => s.authUser);
  const setAuth = useAppStore((s) => s.setAuth);
  const clearAuth = useAppStore((s) => s.clearAuth);
  const [fullName, setFullName] = useState(authUser?.fullName ?? "");
  const [email, setEmail] = useState(authUser?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  useEffect(() => {
    userService
      .profile()
      .then((user) => {
        setFullName(user.fullName);
        setEmail(user.email);
        if (accessToken) setAuth(accessToken, user);
      })
      .catch(() => undefined);
  }, [accessToken, setAuth]);
  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const user = await userService.update({ fullName, email });
      if (user.email !== authUser?.email) {
        clearAuth();
        nav("/login", { replace: true });
        return;
      }
      if (accessToken) setAuth(accessToken, user);
      setSaved(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };
  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordSaving(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      clearAuth();
      nav("/login", { replace: true });
    } catch (requestError) {
      setPasswordError(getErrorMessage(requestError));
    } finally {
      setPasswordSaving(false);
    }
  };
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      nav("/login", { replace: true });
    }
  };
  return (
    <div>
      <PageHeader
        title="Profile"
        description="Manage the account details used to access NessFit."
      />
      {saved && (
        <div className="mb-5 rounded-xl bg-brand-50 p-4 text-sm font-semibold text-brand-700">
          Profile changes saved successfully.
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit p-6 text-center">
          <span className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-brand-100 text-2xl font-bold text-brand-700">
            {fullName
              .split(" ")
              .filter(Boolean)
              .map((part) => part[0])
              .slice(0, 2)
              .join("") || "U"}
          </span>
          <h2 className="mt-4 text-xl font-bold">
            {fullName || "NessFit member"}
          </h2>
          <p className="text-sm text-slate-400">{email}</p>
          <p className="mt-3 text-xs font-semibold text-brand-700">
            {authUser?.role === "ADMIN" ? "Administrator" : "Active member"}
          </p>
        </Card>
        <form onSubmit={saveProfile} className="space-y-5">
          <Card className="p-6">
            <h2 className="mb-5 font-bold">Account information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="profile-name">Full name</Label>
                <Input
                  id="profile-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  maxLength={254}
                />
              </div>
            </div>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700"
              >
                {error}
              </p>
            )}
          </Card>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPasswordOpen(true)}
            >
              <KeyRound className="h-4 w-4" />
              Change password
            </Button>
            <Button type="button" variant="danger" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            <Button type="submit" loading={loading}>
              <Save className="h-4 w-4" />
              Save changes
            </Button>
          </div>
        </form>
      </div>
      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Change password"
      >
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-slate-500">
              At least 8 characters, including one uppercase letter and one
              number.
            </p>
          </div>
          <div>
            <Label htmlFor="confirm-new-password">Confirm new password</Label>
            <Input
              id="confirm-new-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>
          {passwordError && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700"
            >
              {passwordError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={passwordSaving}>
              Change password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function SettingsPage() {
  const nav = useNavigate();
  const clearAuth = useAppStore((s) => s.clearAuth);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logoutAll = async () => {
    try {
      await authService.logoutAll();
    } finally {
      clearAuth();
      nav("/login", { replace: true });
    }
  };
  const deleteAccount = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await userService.deleteAccount(password);
      clearAuth();
      nav("/login", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };
  return (
    <div>
      <PageHeader
        title="Account settings"
        description="Manage account sessions and account deletion."
      />
      <div className="space-y-5">
        <Card className="p-6">
          <h2 className="font-bold">Sessions</h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign out every browser and device that has an active NessFit refresh
            token.
          </p>
          <Button variant="secondary" className="mt-5" onClick={logoutAll}>
            <LogOut className="h-4 w-4" />
            Logout from all devices
          </Button>
        </Card>
        <Card className="p-6">
          <h2 className="font-bold text-rose-700">Delete account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Deleting your account immediately revokes all sessions and disables
            future sign-in.
          </p>
          <Button
            variant="danger"
            className="mt-5"
            onClick={() => setDeleteOpen(true)}
          >
            <ShieldAlert className="h-4 w-4" />
            Delete account
          </Button>
        </Card>
      </div>
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
      >
        <form onSubmit={deleteAccount}>
          <p className="text-sm text-slate-500">
            Enter your current password to permanently disable this account.
          </p>
          <Label className="mt-5" htmlFor="delete-password">
            Current password
          </Label>
          <Input
            id="delete-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700"
            >
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={saving}>
              Delete account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
