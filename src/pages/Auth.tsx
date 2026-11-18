import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (signInError) {
      console.error("Email sign-in error:", signInError);
      setError(
        signInError instanceof Error
          ? signInError.message
          : "Failed to send the verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (verifyError) {
      console.error("OTP verification error:", verifyError);
      setError("That verification code did not work. Check the code and retry.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (guestError) {
      console.error("Guest login error:", guestError);
      setError(
        guestError instanceof Error
          ? `Could not start a guest session: ${guestError.message}`
          : "Could not start a guest session.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050c18] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_500px_at_20%_10%,rgba(34,211,238,0.16),transparent_60%),radial-gradient(800px_600px_at_85%_90%,rgba(59,130,246,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 grid-blueprint opacity-[0.25]" />

      <div className="relative grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.06] p-10 lg:flex">
          <div className="flex items-center justify-between">
            <Link to="/" aria-label="Hub Agent Net home">
              <Logo />
            </Link>
            <Link
              to="/"
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground transition-colors hover:text-white"
            >
              <ArrowLeft className="size-3" />
              Back to site
            </Link>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -left-10 top-10 size-[380px] rounded-full bg-cyan-400/10 blur-[100px]" />
            <p className="relative flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              <Sparkles className="size-3.5" />
              Hub Agent Net
            </p>
            <h1 className="relative mt-4 max-w-md font-display text-[38px] font-semibold leading-[1.08]">
              The whole team,
              <br />
              <span className="text-gradient-cyan">one sign-in away.</span>
            </h1>
            <p className="relative mt-4 max-w-sm text-[12.5px] leading-relaxed text-slate-400">
              Post an update, find a shared resource, book a room and see who is on
              the floor — all from the same private workspace.
            </p>

            <div className="relative mt-8 grid max-w-md grid-cols-2 gap-2.5">
              {[
                { icon: Boxes, label: "Feed, catalog and bookings" },
                { icon: ShieldCheck, label: "Private team workspace" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5"
                >
                  <item.icon className="size-3.5 shrink-0 text-cyan-300" />
                  <span className="text-[10px] text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Team workspace · Level 04
          </div>
        </aside>

        <main className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[400px]">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link to="/" aria-label="Hub Agent Net home">
                <Logo />
              </Link>
              <Link
                to="/"
                className="text-[10px] text-muted-foreground transition-colors hover:text-white"
              >
                Back to site
              </Link>
            </div>

            <div className="glass-panel rounded-2xl p-6 sm:p-7">
              {step === "signIn" ? (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-display text-xl font-semibold">
                        Sign in to Hub Agent Net
                      </h2>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
                        Use your work email and we will send a one-time code. New
                        here? An account is created automatically.
                      </p>
                    </div>
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300">
                      <UserRound className="size-4" />
                    </span>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="mt-5">
                    <label
                      htmlFor="email"
                      className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                    >
                      Work email
                    </label>
                    <div className="relative mt-1.5">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@hubagentnet.io"
                        required
                        disabled={isLoading}
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-3 text-[12.5px] text-white outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-cyan-300/45 focus:bg-white/[0.06] disabled:opacity-60"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 text-[12px] font-semibold text-[#04101f] shadow-[0_18px_40px_-22px_rgba(34,211,238,0.95)] transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Sending code
                        </>
                      ) : (
                        <>
                          Send verification code
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </button>

                    {error && (
                      <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-[10.5px] text-rose-200">
                        {error}
                      </p>
                    )}

                    <div className="my-5 flex items-center gap-3">
                      <span className="h-px flex-1 bg-white/[0.08]" />
                      <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                        or
                      </span>
                      <span className="h-px flex-1 bg-white/[0.08]" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGuestLogin}
                      disabled={isLoading}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-[11.5px] font-medium text-slate-200 transition-colors hover:border-cyan-300/25 hover:bg-white/[0.06] disabled:opacity-60"
                    >
                      <UserRound className="size-3.5" />
                      Continue as guest
                    </button>

                    <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-foreground">
                      Guest access is for exploring this prototype. Team
                      accounts sign in with a work email and one-time code.
                    </p>
                  </form>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("signIn");
                      setError(null);
                      setOtp("");
                    }}
                    className="mb-4 flex items-center gap-1.5 text-[10px] text-muted-foreground transition-colors hover:text-white"
                  >
                    <ArrowLeft className="size-3" />
                    Use a different email
                  </button>

                  <h2 className="font-display text-xl font-semibold">
                    Check your inbox
                  </h2>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
                    We sent a six-digit code to{" "}
                    <span className="text-slate-200">{step.email}</span>.
                  </p>

                  <form onSubmit={handleOtpSubmit} className="mt-5">
                    <input type="hidden" name="email" value={step.email} />
                    <input type="hidden" name="code" value={otp} />

                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            otp.length === 6 &&
                            !isLoading
                          ) {
                            const form = (event.target as HTMLElement).closest("form");
                            form?.requestSubmit();
                          }
                        }}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {error && (
                      <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-center text-[10.5px] text-rose-200">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
                      className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-blue-500 text-[12px] font-semibold text-[#04101f] transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Verifying
                        </>
                      ) : (
                        <>
                          Verify and enter
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[9.5px] text-muted-foreground">
              <ShieldCheck className="size-3" />
              Secured by Convex Auth · Hub Agent Net
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
