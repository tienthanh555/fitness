import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  LockKeyhole,
  MoreHorizontal,
  SearchX,
  Trash2,
  UnlockKeyhole,
} from "lucide-react";
import { EmptyState, PageHeader, SearchInput } from "@/components/common";
import { Badge, Button, Card, Modal, Select } from "@/components/ui";
import { adminUserService, type AuthUser, type UserPage } from "@/services";

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error))
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      "The request could not be completed. Please try again."
    );
  return "The request could not be completed. Please try again.";
}
function statusTone(status: AuthUser["status"]) {
  return status === "ACTIVE" ? "green" : status === "LOCKED" ? "rose" : "gray";
}

export function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<UserPage>({
    content: [],
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });
  const [selected, setSelected] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      setResult(
        await adminUserService.list({
          query: submittedQuery,
          status: status || undefined,
          page,
          size: 20,
        }),
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [status, submittedQuery]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(0), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const manage = async (action: "lock" | "unlock" | "delete") => {
    if (!selected) return;
    setActionLoading(true);
    setError(null);
    try {
      if (action === "lock") await adminUserService.lock(selected.id);
      if (action === "unlock") await adminUserService.unlock(selected.id);
      if (action === "delete") await adminUserService.delete(selected.id);
      setSelected(null);
      await load(result.page);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionLoading(false);
    }
  };
  return (
    <div>
      <PageHeader
        title="User Management"
        description="Review user accounts and control sign-in access."
      />
      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search name or email..."
          />
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="LOCKED">Locked</option>
            <option value="DELETED">Deleted</option>
          </Select>
          <Button onClick={() => setSubmittedQuery(query)}>Search</Button>
        </div>
      </Card>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      )}
      {loading ? (
        <Card className="mt-5 p-6 text-sm text-slate-500">Loading users…</Card>
      ) : result.content.length ? (
        <Card className="mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  {["User", "Email", "Role", "Status", "Joined", "Actions"].map(
                    (x) => (
                      <th key={x} className="px-5 py-4">
                        {x}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.content.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 text-xs font-bold text-brand-700">
                          {user.fullName
                            .split(" ")
                            .filter(Boolean)
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("") || "U"}
                        </span>
                        <strong>{user.fullName}</strong>
                      </div>
                    </td>
                    <td className="px-5 text-slate-500">{user.email}</td>
                    <td className="px-5">{user.role}</td>
                    <td className="px-5">
                      <Badge tone={statusTone(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-5 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5">
                      {user.role === "USER" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelected(user)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          Manage
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Protected admin
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-4 text-sm text-slate-500">
            <span>
              {result.totalElements} account
              {result.totalElements === 1 ? "" : "s"}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={result.page === 0}
                onClick={() => void load(result.page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={result.page + 1 >= result.totalPages}
                onClick={() => void load(result.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="mt-5">
          <EmptyState
            icon={SearchX}
            title="No users found"
            description="Try another name, email or account status."
          />
        </div>
      )}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Manage user account"
      >
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="font-bold">{selected?.fullName}</p>
          <p className="text-sm text-slate-400">{selected?.email}</p>
          <Badge
            className="mt-3"
            tone={selected ? statusTone(selected.status) : "gray"}
          >
            {selected?.status}
          </Badge>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Locking immediately revokes the user's refresh sessions. Unlocking
          resets failed login attempts.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Cancel
          </Button>
          {selected?.status === "ACTIVE" && (
            <Button
              variant="danger"
              loading={actionLoading}
              onClick={() => void manage("lock")}
            >
              <LockKeyhole className="h-4 w-4" />
              Lock account
            </Button>
          )}
          {selected?.status === "LOCKED" && (
            <Button
              loading={actionLoading}
              onClick={() => void manage("unlock")}
            >
              <UnlockKeyhole className="h-4 w-4" />
              Unlock account
            </Button>
          )}
          {selected?.status !== "DELETED" && (
            <Button
              variant="ghost"
              loading={actionLoading}
              onClick={() => void manage("delete")}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
}
