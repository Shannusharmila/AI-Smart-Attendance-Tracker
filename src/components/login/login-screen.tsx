'use client';

import { useState } from 'react';
import { GraduationCap, Eye, EyeOff, Lock, Mail, LogIn, Sparkles, ShieldCheck, Users, Camera, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import { APP_NAME, APP_TAGLINE, SCHOOL_NAME, DEMO_ACCOUNTS } from '@/lib/constants';
import type { Role, User } from '@/lib/types';

export function LoginScreen() {
  const setUser = useAppStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('TEACHER');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }
      toast.success(`Welcome, ${data.user.name}!`);
      setUser(data.user as User);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(acc: { email: string; password: string; role: Role }) {
    setEmail(acc.email);
    setPassword(acc.password);
    setRole(acc.role);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      {/* Top gradient banner */}
      <header className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-4 py-6 sm:py-8 shadow-lg">
        <div className="max-w-md mx-auto flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-2 ring-white/30">
            <GraduationCap className="h-8 w-8 sm:h-9 sm:h-9 sm:w-9" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{APP_NAME}</h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">{APP_TAGLINE}</p>
          </div>
          <p className="text-emerald-100/80 text-xs">{SCHOOL_NAME}</p>
        </div>
      </header>

      {/* Demo Mode Banner */}
      <div className="bg-amber-50 border-y border-amber-200 px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center gap-2 text-xs sm:text-sm text-amber-800">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span><strong>Demo Mode</strong> — use the demo accounts below to explore all three roles instantly.</span>
        </div>
      </div>

      {/* Main login card */}
      <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md space-y-4">
          <Card className="card-shadow border-slate-200/80">
            <CardContent className="pt-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Sign in</h2>
                <p className="text-sm text-slate-500">Select your role and enter credentials</p>
              </div>

              {/* Role selector */}
              <div>
                <Label className="text-xs font-medium text-slate-600">Role</Label>
                <div className="grid grid-cols-4 gap-2 mt-1.5">
                  {(['TEACHER', 'PARENT', 'STUDENT', 'ADMIN'] as Role[]).map((r) => {
                    const meta = DEMO_ACCOUNTS.find((a) => a.role === r)!;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 text-xs font-medium transition ${
                          role === r
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {r === 'TEACHER' ? <Users className="h-4 w-4" /> : r === 'PARENT' ? <ShieldCheck className="h-4 w-4" /> : r === 'STUDENT' ? <User className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <Label htmlFor="email" className="text-xs font-medium text-slate-600">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@school.com"
                      className="pl-9"
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password" className="text-xs font-medium text-slate-600">Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 pr-9"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</span>
                  ) : (
                    <span className="flex items-center gap-2"><LogIn className="h-4 w-4" /> Sign in as {DEMO_ACCOUNTS.find((a) => a.role === role)?.label}</span>
                  )}
                </Button>

                <div className="flex justify-between text-xs">
                  <button type="button" onClick={() => toast.info('Password reset link sent to your email (demo)')} className="text-emerald-700 hover:underline">
                    Forgot password?
                  </button>
                  <span className="text-slate-400">Secure login</span>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Demo accounts */}
          <Card className="border-amber-200 bg-amber-50/50 card-shadow">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="h-4 w-4 text-amber-700" />
                <p className="text-sm font-semibold text-slate-800">Demo Accounts — click to fill</p>
              </div>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition bg-white hover:shadow-sm ${
                      role === acc.role ? 'border-amber-400' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">{acc.label} — {acc.name}</p>
                        <p className="text-xs text-slate-500 truncate">{acc.email} · {acc.password}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold shrink-0">USE</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{acc.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-400 pb-4">
            © 2026 {SCHOOL_NAME}. AI-Based Smart Attendance Tracker Prototype.
          </p>
        </div>
      </main>
    </div>
  );
}
