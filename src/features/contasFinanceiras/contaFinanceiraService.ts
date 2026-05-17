import { api } from "../../lib/api";

export interface ContaFinanceira {
  id: string;
  loja_id: string;
  nome: string;
  titular: string;
  tipo_titular: 'empresa' | 'pessoa';
  cpf_cnpj_titular: string;
  banco_nome?: string;
  banco_codigo?: string;
  agencia?: string;
  conta?: string;
  digito?: string;
  tipo_conta?: 'corrente' | 'poupanca' | 'pagamento';
  chave_pix?: string;
  gateway?: 'mercadopago' | 'nubank' | 'banco_manual' | 'outro';
  conta_gateway_id?: string;
  principal: boolean;
  ativa: boolean;
  criado_em: string;
  atualizado_em: string;
}

export type ContaFinanceiraInput = Omit<ContaFinanceira, 'id' | 'criado_em' | 'atualizado_em'>;

export const contaFinanceiraService = {
  getByLojaId: async (lojaId: string) => {
    const response = await api.get('/contas_financeiras', {
      params: { loja_id: lojaId, per_page: 100 }
    });
    const payload = response.data?.data ?? response.data;
    return Array.isArray(payload?.data) ? payload.data : payload;
  },

  create: async (data: ContaFinanceiraInput) => {
    const response = await api.post('/contas_financeiras', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ContaFinanceiraInput>) => {
    const response = await api.put(`/contas_financeiras/${id}`, data);
    return response.data;
  },

  patch: async (id: string, data: Partial<ContaFinanceiraInput>) => {
    const response = await api.patch(`/contas_financeiras/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/contas_financeiras/${id}`);
    return response.data;
  }
};
