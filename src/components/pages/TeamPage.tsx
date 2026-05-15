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
import { Loader2, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
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

  const isApprover = user?.role === 'approver';

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const data = await api.get('/orgs/me/users');
        setUsers(data.users || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    }
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to add user');
    } finally {
      setAdding(false);
    }
  };

  const orgName = user?.org?.name || 'Organization';
  const orgType = user?.org?.type
    ? ORG_TYPE_LABELS[user.org.type] || user.org.type
    : '';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-[#1F2321]">
            {orgName}
          </h1>
          {orgType && (
            <p className="mt-1 text-sm text-[#5C635F]">{orgType}</p>
          )}
        </div>
        {isApprover && (
          <Button
            data-testid="btn-toggle-add-user"
            onClick={() => setShowForm(!showForm)}
            className="bg-[#4A675B] hover:bg-[#3D564C] text-white"
          >
            <UserPlus className="h-4 w-4" />
            Add user
            {showForm ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Add user form */}
      {showForm && (
        <div className="mb-6 rounded-md border border-[#D5CEBD] bg-[#F4F1EA] p-5">
          <p className="label-overline text-[#5C635F] mb-4">New team member</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="team-name" className="text-sm text-[#1F2321]">
                Name
              </Label>
              <Input
                id="team-name"
                data-testid="input-team-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Full name"
                className="mt-1.5 border-[#D5CEBD] bg-white"
              />
            </div>
            <div>
              <Label htmlFor="team-email" className="text-sm text-[#1F2321]">
                Email
              </Label>
              <Input
                id="team-email"
                data-testid="input-team-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@example.com"
                className="mt-1.5 border-[#D5CEBD] bg-white"
              />
            </div>
            <div>
              <Label htmlFor="team-password" className="text-sm text-[#1F2321]">
                Temporary password
              </Label>
              <Input
                id="team-password"
                data-testid="input-team-password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="mt-1.5 border-[#D5CEBD] bg-white"
              />
            </div>
            <div>
              <Label className="text-sm text-[#1F2321]">Role</Label>
              <Select
                value={formRole}
                onValueChange={(val) => setFormRole(val)}
              >
                <SelectTrigger
                  data-testid="select-team-role"
                  className="mt-1.5 w-full border-[#D5CEBD] bg-white"
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
          <div className="mt-4">
            <Button
              data-testid="btn-submit-user"
              onClick={handleAddUser}
              disabled={adding}
              className="bg-[#4A675B] hover:bg-[#3D564C] text-white"
            >
              {adding && <Loader2 className="h-4 w-4 animate-spin" />}
              Add user
            </Button>
          </div>
        </div>
      )}

      {/* Team table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#4A675B]" />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-md border-2 border-dashed border-[#D5CEBD] p-12 text-center">
          <p className="text-sm text-[#5C635F]">No team members found.</p>
        </div>
      ) : (
        <div className="rounded-md border border-[#D5CEBD] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F4F1EA] border-b border-[#D5CEBD]">
                <th className="px-4 py-3 text-left font-medium text-[#5C635F]">Name</th>
                <th className="px-4 py-3 text-left font-medium text-[#5C635F]">Email</th>
                <th className="px-4 py-3 text-left font-medium text-[#5C635F]">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-[#D5CEBD] last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium text-[#1F2321]">
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-[#5C635F]">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-emerald-700">
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
