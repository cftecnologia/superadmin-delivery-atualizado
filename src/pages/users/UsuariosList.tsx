import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { usuarioService, type Usuario, PERFIS_OPTIONS } from "../../features/usuarios/usuarioService";
import { storeService, type Store } from "../../features/stores/storeService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Plus, Search, Edit, Eye, Trash2, Shield, KeyRound } from "lucide-react";
import { authService } from "../../features/auth/authService";

export default function UsuariosList() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["usuarios"],
    queryFn: () => usuarioService.getAll(),
  });

  const { data: storesData } = useQuery({
    queryKey: ["stores"],
    queryFn: () => storeService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usuarioService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });

  const resetMfaMutation = useMutation({
    mutationFn: (id: string) => authService.resetMfa(id, "tenant"),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo": return <Badge variant="success">Ativo</Badge>;
      case "inativo": return <Badge variant="secondary">Inativo</Badge>;
      case "bloqueado": return <Badge variant="destructive">Bloqueado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPerfilBadge = (perfil: string) => {
    const colors: Record<string, string> = {
      administrador: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      operador: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      separador: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      entregador: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      financeiro: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
    };
    const label = PERFIS_OPTIONS.find(p => p.value === perfil)?.label || perfil;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[perfil] || "bg-gray-100 text-gray-800"}`}>
        <Shield className="w-3 h-3" />
        {label}
      </span>
    );
  };

  // Build store name lookup
  const storesArr: Store[] = Array.isArray(storesData?.data?.data) 
    ? storesData.data.data 
    : (Array.isArray(storesData?.data) ? storesData.data : (Array.isArray(storesData) ? storesData : []));
  const storeMap = new Map(storesArr.map((s: Store) => [s.id, s.nome]));

  const usuarios: Usuario[] = Array.isArray(data?.data?.data) 
    ? data.data.data 
    : (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));

  const filteredUsuarios = usuarios.filter((u: Usuario) =>
    u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.perfil?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, nome: string) => {
    if (window.confirm(`Deseja realmente excluir o usuário "${nome}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gerenciamento de Usuários</h2>
          <p className="text-muted-foreground text-sm">Visualize e gerencie os usuários do sistema (operadores, administradores, etc.).</p>
        </div>
        <Link to="/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo Usuário
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail ou perfil..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Loja</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando usuários...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-red-500">
                  Erro ao carregar usuários.
                </TableCell>
              </TableRow>
            ) : filteredUsuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsuarios.map((usuario: Usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">
                    <div>
                      <span>{usuario.nome}</span>
                      {usuario.telefone && (
                        <span className="block text-xs text-muted-foreground">{usuario.telefone}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{usuario.email}</TableCell>
                  <TableCell className="text-sm">{storeMap.get(usuario.loja_id) || usuario.loja_id?.slice(0, 8) + "..."}</TableCell>
                  <TableCell>{getPerfilBadge(usuario.perfil)}</TableCell>
                  <TableCell>{getStatusBadge(usuario.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link to={`/users/${usuario.id}`}>
                        <Button variant="ghost" size="icon" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/users/${usuario.id}/edit`}>
                        <Button variant="ghost" size="icon" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Redefinir MFA"
                        onClick={() => resetMfaMutation.mutate(usuario.id)}
                        disabled={resetMfaMutation.isPending}
                      >
                        <KeyRound className="h-4 w-4 text-amber-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Excluir"
                        onClick={() => handleDelete(usuario.id, usuario.nome)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
