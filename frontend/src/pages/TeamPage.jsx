import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'requestor' });
  const [busy, setBusy] = useState(false);

  const refresh = () => api.get('/orgs/me/users').then(({ data }) => { setUsers(data.users); setLoading(false); });
  useEffect(() => { refresh(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/orgs/me/users', form);
      toast.success('User added');
      setForm({ name: '', email: '', password: '', role: 'requestor' });
      setShowForm(false);
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not add user');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto" data-testid="team-page">
      <header className="flex items-end justify-between mb-8">
        <div>
          <div className="label-overline text-[#C47055] mb-2">Team</div>
          <h1 className="font-heading text-4xl font-semibold">{user?.organization?.name}</h1>
          <p className="text-[#5C635F] mt-2 capitalize">{user?.organization?.type}</p>
        </div>
        {user?.role === 'approver' && (
          <Button onClick={() => setShowForm((v) => !v)} data-testid="toggle-invite-btn"
            className="bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md">
            <UserPlus className="h-4 w-4 mr-2" /> Add user
          </Button>
        )}
      </header>

      {showForm && (
        <form onSubmit={submit} className="border border-[#D5CEBD] rounded-md p-6 bg-[#FDFBF7] mb-8 space-y-4" data-testid="invite-form">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="invite-name" className="border-[#D5CEBD]" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="invite-email" className="border-[#D5CEBD]" /></div>
            <div className="space-y-1.5"><Label>Temp password</Label><Input type="text" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="invite-password" className="border-[#D5CEBD]" /></div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="border-[#D5CEBD]" data-testid="invite-role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="requestor">Requestor</SelectItem>
                  <SelectItem value="approver">Approver</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={busy} data-testid="invite-submit-btn" className="bg-[#4A675B] hover:bg-[#3D564C] text-white rounded-md">
            {busy ? 'Adding…' : 'Add user'}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="text-[#5C635F]">Loading…</div>
      ) : (
        <div className="border border-[#D5CEBD] rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F4F1EA] text-[#5C635F]">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[#D5CEBD]" data-testid={`team-row-${u.id}`}>
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-[#5C635F]">{u.email}</td>
                  <td className="px-4 py-3 capitalize"><span className="text-[#4A675B] font-medium">{u.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
