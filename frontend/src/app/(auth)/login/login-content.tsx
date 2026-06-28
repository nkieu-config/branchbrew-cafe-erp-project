"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getErrorMessage } from "@/lib/errors";
import {
  authBrandMarkClassName,
  authDemoButtonClassName,
  authDemoDividerClassName,
  authDemoPanelClassName,
  authHeroCardClassName,
  authHeroGlowClassName,
  authHeroPanelClassName,
  authHeroStatClassName,
  authHeroStatLabelClassName,
  authHeroStatValueClassName,
  authHeroTextClassName,
  authHeroTitleClassName,
  authInputClassName,
  authLoadingClassName,
  authPageShellClassName,
  authPrimaryButtonClassName,
  text,
  typeHeadingClassName,
  typeUiLabelClassName,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/");
    }
  }, [isInitialized, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginApi({ email, password });
      login(response.user);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to login"));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
  };

  const demoAccounts = [
    { label: "Admin", email: "admin@qafacafe.com" },
    { label: "Manager", email: "manager@qafacafe.com" },
    { label: "Staff", email: "staff.siam@qafacafe.com" },
  ];

  if (!isInitialized) {
    return <div className={authLoadingClassName()}>Loading…</div>;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={authPageShellClassName()}>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          <div className="flex items-center gap-2 mb-12">
            <div className={authBrandMarkClassName()}>
              <Coffee className="w-5 h-5" />
            </div>
            <span className={typeHeadingClassName("text-xl tracking-tight")}>QafaCafe</span>
          </div>

          <div className="mb-10">
            <h1 className={typeHeadingClassName("text-4xl tracking-tight mb-3 text-balance")}>
              Welcome back
            </h1>
            <p className={text.muted}>Sign in to your enterprise POS and management portal.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className={text.secondary}>Work Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@qafacafe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                className={authInputClassName()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className={text.secondary}>Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className={authInputClassName()}
              />
            </div>

            <Button type="submit" className={authPrimaryButtonClassName()} disabled={loading}>
              {loading ? "Authenticating…" : (
                <span className="flex items-center">
                  Sign In <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform motion-reduce:transition-none" />
                </span>
              )}
            </Button>
          </form>

          <div className={authDemoPanelClassName()}>
            <p className={cn(typeUiLabelClassName("mb-3"), text.secondary)}>Demo Access</p>
            <div className="space-y-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account.email)}
                  className={authDemoButtonClassName()}
                >
                  <span>{account.label}:</span>
                  <span className={text.primary}>{account.email}</span>
                </button>
              ))}
              <div className={authDemoDividerClassName()}>
                <span>Password:</span>
                <span className={text.primary}>password123</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className={authHeroPanelClassName()}>
        <div className={authHeroGlowClassName("top-[-10%] left-[-10%] w-[50%] h-[50%]")} />
        <div className={authHeroGlowClassName("bottom-[-10%] right-[-10%] w-[60%] h-[60%] blur-[130px]")} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 p-12 max-w-xl text-center"
        >
          <div className={authHeroCardClassName()}>
            <h2 className={authHeroTitleClassName()}>Enterprise Grade Efficiency</h2>
            <p className={authHeroTextClassName()}>
              QafaCafe streamlines your operations from point-of-sale to inventory and human resources, giving you the clarity needed to scale.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className={authHeroStatClassName()}>
                <div className={authHeroStatValueClassName()}>99.9%</div>
                <div className={authHeroStatLabelClassName()}>Uptime</div>
              </div>
              <div className={authHeroStatClassName()}>
                <div className={authHeroStatValueClassName()}>2.4x</div>
                <div className={authHeroStatLabelClassName()}>Faster Checkout</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
