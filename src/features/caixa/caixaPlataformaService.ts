import { api } from "../../lib/api";

export interface CaixaPlataformaEntry {
  id: string;
  descricao: string;
  categoria: string;
  tipo: "custo" | "receita";
  valor: number;
  competencia?: string | null;
  vencimento_em?: string | null;
  pago_em?: string | null;
  status: "previsto" | "pago" | "cancelado";
  observacoes?: string | null;
  criado_em?: string;
  atualizado_em?: string;
}

export interface CaixaPlataformaFilters {
  dataInicio?: string;
  dataFim?: string;
  status?: string;
  categoria?: string;
  tipo?: string;
}

export interface CaixaPlataformaPayload {
  descricao: string;
  categoria: string;
  tipo: "custo" | "receita";
  valor: number;
  competencia?: string | null;
  vencimento_em?: string | null;
  pago_em?: string | null;
  status: "previsto" | "pago" | "cancelado";
  observacoes?: string | null;
}

export const caixaPlataformaService = {
  async getAll(params: CaixaPlataformaFilters = {}) {
    const response = await api.get("/caixa-plataforma", { params });
    return response.data?.data ?? response.data;
  },
  async create(payload: CaixaPlataformaPayload) {
    const response = await api.post("/caixa-plataforma", payload);
    return response.data?.data ?? response.data;
  },
  async update(id: string, payload: Partial<CaixaPlataformaPayload>) {
    const response = await api.put(`/caixa-plataforma/${id}`, payload);
    return response.data?.data ?? response.data;
  },
  async cancel(id: string) {
    const response = await api.delete(`/caixa-plataforma/${id}`);
    return response.data?.data ?? response.data;
  },
};
