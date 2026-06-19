import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { regrasSplitService, type RegraSplit, type RegraSplitDestinatario } from "../../features/regras_split/regrasSplitService";
import { storeService } from "../../features/stores/storeService";
import { Button } from "../../components/ui/button";

export default function RegraSplitForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<Partial<RegraSplit>>({
    loja_id: "",
    nome: "",
    descricao: "",
    gateway: "mercadopago",
    ativo: true,
    prioridade: 1,
    destinatarios: [],
  });

  const { data: stores } = useQuery({
    queryKey: ["stores"],
    queryFn: () => storeService.getAll(),
  });

  useEffect(() => {
    if (isEditing && id) {
      regrasSplitService.getById(id).then((data) => {
        setFormData(data);
      });
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && id) {
        await regrasSplitService.update(id, formData);
      } else {
        await regrasSplitService.create(formData as RegraSplit);
      }
      navigate("/settings/split-rules");
    } catch (error) {
      console.error("Failed to save split rule", error);
      alert("Erro ao salvar regra de split. Verifique os dados e tente novamente.");
    }
  };

  const addDestinatario = () => {
    setFormData((prev) => ({
      ...prev,
      destinatarios: [
        ...(prev.destinatarios || []),
        {
          tipo_destinatario: "plataforma",
          tipo_valor: "percentual",
          valor: 0,
          prioridade: 1,
          ativo: true,
        },
      ],
    }));
  };

  const updateDestinatario = (index: number, field: keyof RegraSplitDestinatario, value: any) => {
    setFormData((prev) => {
      const newDest = [...(prev.destinatarios || [])];
      newDest[index] = { ...newDest[index], [field]: value };
      return { ...prev, destinatarios: newDest };
    });
  };

  const removeDestinatario = (index: number) => {
    setFormData((prev) => {
      const newDest = [...(prev.destinatarios || [])];
      newDest.splice(index, 1);
      return { ...prev, destinatarios: newDest };
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/settings/split-rules")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isEditing ? "Editar Regra de Split" : "Nova Regra de Split"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure as regras de comissionamento e taxas da plataforma.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Dados Principais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Loja (Tenant)</label>
              <select
                required
                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                value={formData.loja_id}
                onChange={(e) => setFormData({ ...formData, loja_id: e.target.value })}
                disabled={isEditing}
              >
                <option value="">Selecione a loja</option>
                {(Array.isArray((stores as any)?.data) ? (stores as any).data : Array.isArray(stores) ? stores : [])?.map((store: any) => (
                  <option key={store.id} value={store.id}>
                    {store.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome da Regra</label>
              <input
                type="text"
                required
                placeholder="Ex: Taxa Padrão Mercado Pago"
                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descrição (Opcional)</label>
              <input
                type="text"
                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                value={formData.descricao || ""}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gateway</label>
              <select
                required
                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                value={formData.gateway}
                onChange={(e) => setFormData({ ...formData, gateway: e.target.value })}
              >
                <option value="mercadopago">Mercado Pago</option>
                <option value="pagarme">Stone (Pagar.me)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prioridade</label>
              <input
                type="number"
                required
                min={1}
                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                value={formData.prioridade}
                onChange={(e) => setFormData({ ...formData, prioridade: Number(e.target.value) })}
              />
            </div>
            
            <div className="space-y-2 flex items-center h-full pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-primary"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Regra Ativa</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              Destinatários (Application Fee)
            </h3>
            <Button type="button" variant="outline" size="sm" onClick={addDestinatario}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Destinatário
            </Button>
          </div>

          <div className="space-y-4">
            {formData.destinatarios?.length === 0 && (
              <div className="text-center py-6 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                Nenhum destinatário configurado. Adicione a plataforma para reter a comissão.
              </div>
            )}
            
            {formData.destinatarios?.map((dest, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-slate-500">Destinatário</label>
                  <select
                    className="w-full h-9 text-sm px-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    value={dest.tipo_destinatario}
                    onChange={(e) => updateDestinatario(index, "tipo_destinatario", e.target.value)}
                  >
                    <option value="plataforma">Plataforma (Superadmin)</option>
                    <option value="loja">Loja (Lojista / Tenant)</option>
                    <option value="entregador">Entregador</option>
                    <option value="franquia">Franquia</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-slate-500">Tipo de Valor</label>
                  <select
                    className="w-full h-9 text-sm px-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    value={dest.tipo_valor}
                    onChange={(e) => updateDestinatario(index, "tipo_valor", e.target.value)}
                  >
                    <option value="percentual">Percentual (%)</option>
                    <option value="fixo">Valor Fixo (R$)</option>
                  </select>
                </div>
                
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-slate-500">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full h-9 text-sm px-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                    value={dest.valor}
                    onChange={(e) => updateDestinatario(index, "valor", Number(e.target.value))}
                  />
                </div>
                
                <div className="flex items-end pb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDestinatario(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/settings/split-rules")}>
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Salvar Regra
          </Button>
        </div>
      </form>
    </div>
  );
}
