'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api-client';
import { ORG_TYPE_LABELS } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, UserPlus, ChevronDown, ChevronUp, Trash2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

interface OrgUser {
  id: string;
  name: string;
  email: string;
  role: string;
  accountType: string;
  orgId: string;
  createdAt: string;
}

export default function TeamPage() {
  const { user } = useAppStore();
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Add user form
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('requestor');
  const [adding, setAdding] = useState(false);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<OrgUser | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isApprover = user?.role === 'approver';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/orgs/me/users');
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      toast.error('All fields are required');
      return;
    }
    setAdding(true);
    try {
      const data = await api.post('/orgs/me/users', {
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword,
        role: formRole,
      });
      setUsers((prev) => [...prev, data.user]);
      toast.success('User added successfully');
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      setFormRole('requestor');
      setShowForm(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add user';
      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    if (!deletePassword.trim()) {
      toast.error('Please enter your password to confirm');
      return;
    }
    setDeleting(true);
    // Optimistic update
    const previousUsers = users;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    try {
      await api.delete(`/orgs/me/users/${deleteTarget.id}`, { password: deletePassword });
      toast.success(`${deleteTarget.name} has been removed`);
      setDeleteTarget(null);
      setDeletePassword('');
    } catch (err: unknown) {
      // Revert optimistic update
      setUsers(previousUsers);
      const message = err instanceof Error ? err.message : 'Failed to remove user';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const orgName = user?.org?.name || 'Organization';
  const orgType = user?.org?.type
    ? ORG_TYPE_LABELS[user.org.type] || user.org.type
    : '';

  // Count approvers to know if we can delete the last one
  const approverCount = users.filter((u) => u.role === 'approver').length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8 flex items-start sm:items-center justify-between gap-4">
        <div>
          <span className="label-overline text-accent">Team</span>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mt-1">
            {orgName}
          </h1>
          {orgType && (
            <p className="mt-1 text-sm text-muted-foreground">{orgType}</p>
          )}
        </div>
        {isApprover && (
          <Button
            data-testid="btn-toggle-add-user"
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg btn-press shrink-0"
          >
            <UserPlus className="h-4 w-4 mr-1.5" />
            Add user
            {showForm ? (
              <ChevronUp className="h-4 w-4 ml-1" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1" />
            )}
          </Button>
        )}
      </div>

      {/* Add user form */}
      {showForm && (
        <div className="mb-8 bg-secondary rounded-xl border border-border p-6 animate-scale-in">
          <p className="label-overline text-muted-foreground mb-4">New team member</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="team-name" className="text-sm text-foreground">
                Name
              </Label>
              <Input
                id="team-name"
                data-testid="input-team-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Full name"
                className="mt-1.5 border-border bg-card"
              />
            </div>
            <div>
              <Label htmlFor="team-email" className="text-sm text-foreground">
                Email
              </Label>
              <Input
                id="team-email"
                data-testid="input-team-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@example.com"
                className="mt-1.5 border-border bg-card"
              />
            </div>
            <div>
              <Label htmlFor="team-password" className="text-sm text-foreground">
                Temporary password
              </Label>
              <Input
                id="team-password"
                data-testid="input-team-password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="mt-1.5 border-border bg-card"
              />
            </div>
            <div>
              <Label className="text-sm text-foreground">Role</Label>
              <Select
                value={formRole}
                onValueChange={(val) => setFormRole(val)}
              >
                <SelectTrigger
                  data-testid="select-team-role"
                  className="mt-1.5 w-full border-border bg-card"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requestor">Requestor</SelectItem>
                  <SelectItem value="approver">Approver</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-5">
            <Button
              data-testid="btn-submit-user"
              onClick={handleAddUser}
              disabled={adding}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg btn-press"
            >
              {adding && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              Add user
            </Button>
          </div>
        </div>
      )}

      {/* Team table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-12 text-center animate-fade-in-up">
          <p className="text-sm text-muted-foreground">No team members found.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in-up">
          <table className="w-full text-sm premium-table">
            <thead>
              <tr className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5 text-left font-medium">Name</th>
                <th className="px-5 py-3.5 text-left font-medium">Email</th>
                <th className="px-5 py-3.5 text-left font-medium">Role</th>
                {isApprover && (
                  <th className="px-5 py-3.5 text-right font-medium w-16"></th>
                )}
              </tr>
            </thead>
            <tbody className="stagger-children">
              {users.map((u) => {
                const isSelf = u.id === user?.id;
                const isLastApprover = u.role === 'approver' && approverCount <= 1;
                const canDelete = isApprover && !isSelf;

                return (
                  <tr
                    key={u.id}
                    data-testid={`team-row-${u.id}`}
                    className="border-b border-border last:border-b-0 group"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                          {u.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span>{u.name}</span>
                        {isSelf && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === 'approver'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-accent/10 text-accent'
                        }`}
                      >
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    {isApprover && (
                      <td className="px-5 py-3.5 text-right">
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`btn-delete-user-${u.id}`}
                            onClick={() => setDeleteTarget(u)}
                            disabled={isLastApprover}
                            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                            title={isLastApprover ? 'Cannot remove last approver' : 'Remove user'}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay"
          onClick={() => !deleting && (setDeleteTarget(null), setDeletePassword(''))}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  Remove team member
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Are you sure you want to remove{' '}
                  <span className="font-medium text-foreground">{deleteTarget.name}</span>{' '}
                  ({deleteTarget.email}) from your organization? This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => !deleting && (setDeleteTarget(null), setDeletePassword(''))}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="modal-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-5">
              <Label htmlFor="delete-password" className="text-sm text-foreground">
                Confirm with your password
              </Label>
              <Input
                id="delete-password"
                data-testid="input-delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1.5 border-border bg-card"
                autoFocus
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                For security, please enter your own password to authorize this removal.
              </p>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => { setDeleteTarget(null); setDeletePassword(''); }}
                disabled={deleting}
                className="border-border rounded-lg btn-press"
                data-testid="modal-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteUser}
                disabled={deleting || !deletePassword.trim()}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg btn-press"
                data-testid="modal-confirm-delete"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Remove user
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
