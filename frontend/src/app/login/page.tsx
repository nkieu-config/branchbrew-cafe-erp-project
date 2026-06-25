"use client";

import { useState } from "react";
import { loginApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginApi({ email, password });
      login(response.user);
    } catch (err: any) {
      toast.error(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-slate-950 absolute top-0 left-0 z-50">
      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Coffee className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">QafaCafe</span>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3 text-balance">Welcome back</h1>
            <p className="text-slate-500 dark:text-slate-400">Sign in to your enterprise POS and management portal.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-600 dark:text-slate-300">Work Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="name@qafacafe.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required 
                className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-600 dark:text-slate-300">Password</Label>
                <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">Forgot password?</a>
              </div>
              <Input 
                id="password" 
                name="password"
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required 
                className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500"
              />
            </div>
            
            <Button type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 mt-4 group" disabled={loading}>
              {loading ? "Authenticating…" : (
                <span className="flex items-center">
                  Sign In <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-12 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Demo Access</p>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between"><span>Admin:</span> <span className="text-slate-900 dark:text-white">admin@qafacafe.com</span></div>
              <div className="flex justify-between"><span>Staff:</span> <span className="text-slate-900 dark:text-white">staff.siam@qafacafe.com</span></div>
              <div className="flex justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-800"><span>Password:</span> <span className="text-slate-900 dark:text-white">password123</span></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Visual Side */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center">
        {/* Abstract shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-teal-500/20 blur-[130px] rounded-full"></div>
        
        {/* Glass panel content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 p-12 max-w-xl text-center"
        >
          <div className="glass-panel border-white/10 p-10 rounded-3xl backdrop-blur-2xl bg-white/5 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">Enterprise Grade Efficiency</h2>
            <p className="text-slate-300 leading-relaxed mb-8">
              QafaCafe streamlines your operations from point-of-sale to inventory and human resources, giving you the clarity needed to scale.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="text-emerald-400 font-bold text-xl mb-1">99.9%</div>
                <div className="text-slate-400 text-xs uppercase tracking-wider">Uptime</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="text-teal-400 font-bold text-xl mb-1">2.4x</div>
                <div className="text-slate-400 text-xs uppercase tracking-wider">Faster Checkout</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
