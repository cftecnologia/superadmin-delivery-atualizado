import { api } from "../../lib/api";

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password, userType: 'superadmin' });
    return response.data;
  },
  me: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
  mfaStatus: async () => (await api.get("/auth/mfa/status")).data,
  mfaEnroll: async () => (await api.post("/auth/mfa/enroll")).data,
  mfaChallenge: async (factorId: string) => (await api.post("/auth/mfa/challenge", { factor_id: factorId })).data,
  mfaVerify: async (factorId: string, challengeId: string, code: string) => (
    await api.post("/auth/mfa/verify", { factor_id: factorId, challenge_id: challengeId, code })
  ).data,
  mfaUnenroll: async (factorId: string) => api.delete(`/auth/mfa/factors/${factorId}`),
  resetMfa: async (userId: string, targetType: "tenant" | "superadmin") => (
    await api.post(`/auth/mfa/reset/${userId}`, { target_type: targetType })
  ).data,
};
