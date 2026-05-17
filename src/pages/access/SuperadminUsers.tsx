import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, KeyRound, Loader2, Plus, Save, Trash2 } from "lucide-react";
import {
  SUPERADMIN_MODULES,
  superadminUserService,
  type SuperadminUser,
  type SuperadminUserPayload,
} from "../../features/superadminUsers/superadminUserService";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

const defaultForm: SuperadminUserPayload & { password: string } = {
  name: "",
  email: "",
  password: "",
  role: "vendedor",
  status: "ativo",
  modules: ["dashboard"],
};

export default function SuperadminUsers() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState<SuperadminUser | null>(null);
  const [error, setError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["superadmin-users"],
    queryFn: () => superadminUserService.getAll(),
  });

  const users: SuperadminUser[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  useEffect(() => {
    if (!editing) {
      setForm(defaultForm);
      return;
    }
    setForm({
      name: editing.name,
      email: editing.email,
      password: "",
      role: editing.role,
      status: editing.status,
      modules: editing.modules || [],
    });
  }, [editing]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: any = { ...form };
      if (editing && !payload.password) delete payload.password;
      return editing
        ? superadminUserService.update(String(editing.id), payload)
        : superadminUserService.create(payload);
    },
    onSuccess: () => {
      setEditing(null);
      setForm(defaultForm);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["superadmin-users"] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || err.response?.data?.error || "Erro ao salvar usuário.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => superadminUserService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["superadmin-users"] }),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    saveMutation.mutate();
  };

  const toggleModule = (slug: string) => {
    const exists = form.modules.includes(slug);
    setForm({
      ...form,
      modules: exists ? form.modules.filter((moduleSlug) => moduleSlug !== slug) : [...form.modules, slug],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Acessos do Superadmin</h2>
        <p className="text-muted-foreground text-sm">Cadastre vendedores e defina exatamente quais módulos cada usuário pode visualizar.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" />
            {editing ? "Editar acesso" : "Novo acesso"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-1">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>{editing ? "Nova senha" : "Senha"}</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} />
              </div>
              <div className="space-y-1">
                <Label>Role</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })}>
                  <option value="vendedor">Vendedor</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="bloqueado">Bloqueado</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {SUPERADMIN_MODULES.map((module) => (
                <label key={module.slug} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.role === "superadmin" || form.modules.includes(module.slug)}
                    disabled={form.role === "superadmin"}
                    onChange={() => toggleModule(module.slug)}
                  />
                  {module.label}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              {editing && <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>}
              <Button type="submit" disabled={saveMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? "Salvando..." : "Salvar acesso"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" />
            Usuários cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Módulos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Carregando...</TableCell></TableRow>
                ) : users.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado.</TableCell></TableRow>
                ) : users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Badge variant={user.role === "superadmin" ? "default" : "secondary"}>{user.role}</Badge></TableCell>
                    <TableCell><Badge variant={user.status === "ativo" ? "success" : user.status === "bloqueado" ? "destructive" : "secondary"}>{user.status}</Badge></TableCell>
                    <TableCell className="max-w-md">
                      {user.role === "superadmin" ? (
                        <span className="text-sm text-muted-foreground">Todos os módulos</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">{(user.modules || []).join(", ") || "Sem módulos"}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => setEditing(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    <Button variant="ghost" size="icon" title="Excluir" onClick={() => deleteMutation.mutate(user.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
