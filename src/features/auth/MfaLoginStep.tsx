import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { authService } from "./authService";

export type MfaSession = {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    role: string;
    nome?: string;
    perfil?: string;
    permissions?: string[];
  };
  aal?: "aal1" | "aal2";
};

type ApiError = { response?: { data?: { error?: { message?: string } } } };

const errorMessage = (error: unknown, fallback: string) =>
  (error as ApiError).response?.data?.error?.message || fallback;

type Props = {
  session: MfaSession;
  onComplete: (session: MfaSession) => void;
  onCancel: () => void;
};

export function MfaLoginStep({ session, onComplete, onCancel }: Props) {
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prepare = async () => {
      try {
        const status = await authService.mfaStatus();
        if (status.enrollment_required) {
          const factor = await authService.mfaEnroll();
          setFactorId(factor.id);
          setQrCode(factor.totp.qr_code);
          setSecret(factor.totp.secret);
        } else {
          setFactorId(status.factors[0]?.id || "");
        }
      } catch (err: unknown) {
        setError(errorMessage(err, "Não foi possível preparar o autenticador."));
      } finally {
        setLoading(false);
      }
    };
    void prepare();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!factorId || code.length !== 6) return;
    try {
      setLoading(true);
      setError("");
      const challenge = await authService.mfaChallenge(factorId);
      onComplete({ ...session, ...(await authService.mfaVerify(factorId, challenge.id, code)), aal: "aal2" });
    } catch (err: unknown) {
      setError(errorMessage(err, "Código inválido."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 text-center">
      <KeyRound className="mx-auto h-10 w-10 text-primary" />
      <h2 className="text-xl font-bold">Autenticação em dois fatores</h2>
      <p className="text-sm text-slate-500">{qrCode ? "Escaneie o QR code e confirme o código." : "Informe o código do aplicativo autenticador."}</p>
      {qrCode && <img src={qrCode} alt="QR code do autenticador" className="mx-auto h-44 w-44" />}
      {secret && <p className="text-xs text-slate-500">Chave manual: <span className="font-mono">{secret}</span></p>}
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      <Input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" className="text-center font-mono text-lg tracking-[0.3em]" />
      <Button className="w-full" disabled={loading || code.length !== 6}>{loading ? "Validando..." : "Confirmar código"}</Button>
      <Button type="button" variant="outline" className="w-full" onClick={onCancel}>Voltar</Button>
    </form>
  );
}
