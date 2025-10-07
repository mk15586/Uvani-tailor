"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Floating particles component
const FloatingParticles = () => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      initial: {
        x: `${Math.random() * 100}vw`,
        y: `${Math.random() * 100}vh`,
        scale: Math.random() * 0.5 + 0.5,
      },
      animate: {
        x: [
          `${Math.random() * 100}vw`,
          `${Math.random() * 100}vw`,
          `${Math.random() * 100}vw`,
        ],
        y: [
          `${Math.random() * 100}vh`,
          `${Math.random() * 100}vh`,
          `${Math.random() * 100}vh`,
        ],
      },
      transition: {
        duration: Math.random() * 30 + 20,
        repeat: Infinity,
        ease: "linear",
      },
      style: {
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 10 + 5}px`,
      },
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/10"
          initial={particle.initial}
          animate={particle.animate}
          transition={particle.transition}
          style={particle.style}
        />
      ))}
    </div>
  );
};

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Create ripple effect on button
    if (buttonRef.current) {
      const button = buttonRef.current;
      const circle = document.createElement("span");
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      const rect = button.getBoundingClientRect();
      const offsetX = (e.nativeEvent as any).clientX - rect.left;
      const offsetY = (e.nativeEvent as any).clientY - rect.top;
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${offsetX - radius}px`;
      circle.style.top = `${offsetY - radius}px`;
      circle.classList.add("ripple");
      const ripple = button.getElementsByClassName("ripple")[0];
      if (ripple) {
        ripple.remove();
      }
      button.appendChild(circle);
    }
    // Supabase credential check
    const { data, error } = await supabase
      .from("tailors")
      .select("id, email, password")
      .eq("email", email)
      .single();
    if (error || !data) {
      toast.error("Invalid email or password");
      setLoading(false);
      return;
    }
    // Compare password (plain text, for demo; use hashing in production)
    if (data.password !== password) {
      toast.error("Invalid email or password");
      setLoading(false);
      return;
    }
    toast.success("Login successful");
    // persist signed-in email so Settings and other pages can load the tailor
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('uvani_signup_email', data.email);
        // optionally keep password for flows that expect it (registration uses this)
        localStorage.setItem('uvani_signup_password', password);
      } catch (e) {
        // ignore storage errors
      }
    }
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1200);
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "tween",
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4 py-8 sm:px-6" style={{
      backgroundImage: 'url(/singin-pics/about-img-2.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      {/* Dull overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />
      {/* Floating particles */}
      <FloatingParticles />
      
      <motion.div
        className="relative z-10 w-full max-w-md backdrop-blur-xl bg-white/5 rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/10"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.7, 
          ease: [0.16, 1, 0.3, 1],
          scale: {
            type: "spring",
            damping: 15,
            stiffness: 300
          }
        }}
        style={{
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)"
        }}
      >
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <div className="mx-auto mb-4 flex flex-col items-center gap-2">
              <img
                src="/UVANI logo.png"
                alt="Uvani Logo"
                className="h-14 w-auto sm:h-16 md:h-20 object-contain drop-shadow-lg"
                draggable={false}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">Sign In</h1>
            <p className="text-sm sm:text-base text-white/80 mb-2">Welcome back, artisan. Let's get creating.</p>
          </motion.div>
          
          <motion.div className="space-y-4" variants={itemVariants}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90 text-sm sm:text-base">Email</Label>
              <motion.div whileFocus={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="tailor@uvani.com" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:border-primary/30 h-12 sm:h-14 text-sm sm:text-base"
                />
              </motion.div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90 text-sm sm:text-base">Password</Label>
              <motion.div whileFocus={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:border-primary/30 h-12 sm:h-14 text-sm sm:text-base"
                />
              </motion.div>
            </div>
            {/* placeholder for layout spacing (forgot link moved below Sign In) */}
            <div className="h-0" />
          </motion.div>
          
          <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button 
              ref={buttonRef}
              type="submit" 
              className="w-full font-semibold text-base sm:text-lg py-3 sm:py-4 rounded-xl shadow-lg relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-300 h-12 sm:h-14"
              disabled={loading}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm sm:text-base"
                  >
                    Signing In...
                  </motion.span>
                ) : (
                  <motion.span
                    key="signin"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm sm:text-base"
                  >
                    Sign In
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* Forgot password link shown below Sign In */}
          <motion.div className="flex justify-center mt-3" variants={itemVariants}>
            <button
              type="button"
              onClick={() => { setShowForgot(prev => !prev); setForgotEmail(email || ""); }}
              className="text-sm text-white/90 font-medium transition transform duration-150 ease-out hover:scale-105 hover:bg-white/10 px-2 py-1 rounded-md"
              aria-label="Forgot your password"
            >
              Forgot your password?
            </button>
          </motion.div>

          {/* Forgot password dialog */}
          <Dialog open={showForgot} onOpenChange={(open) => { setShowForgot(open); if (!open) { setOtp(''); setOtpSent(false); setOtpVerified(false); } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Forgot Password</DialogTitle>
                <DialogDescription>Enter your registered email to receive a one-time code.</DialogDescription>
              </DialogHeader>

              {!otpSent && !otpVerified && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label className="text-sm">Email</Label>
                    <Input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="tailor@uvani.com"
                      className="mt-1"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">We will validate this email before sending the OTP.</div>
                </div>
              )}

              {otpSent && !otpVerified && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label className="text-sm">Enter OTP</Label>
                    <Input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" className="mt-1" />
                  </div>
                </div>
              )}

              {otpVerified && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label className="text-sm">New Password</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm">Confirm Password</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1" />
                  </div>
                </div>
              )}

              <DialogFooter>
                <div className="flex items-center gap-2 w-full">
                  <Button variant="ghost" onClick={() => setShowForgot(false)}>Cancel</Button>

                  {!otpSent && !otpVerified && (
                    <Button onClick={async () => {
                      if (!forgotEmail) return toast.error('Please enter your registered email');
                      try {
                        // validate email exists
                        const { data: exists, error: existsErr } = await supabase.from('tailors').select('id').eq('email', forgotEmail).maybeSingle();
                        if (existsErr) {
                          console.error(existsErr);
                          return toast.error('Failed to validate email');
                        }
                        if (!exists) {
                          return toast.error('Email not found. Please check the address you entered.');
                        }

                        setSendingOtp(true);
                        const res = await fetch('/api/auth/send-otp', {
                          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: forgotEmail })
                        });
                        const body = await res.json();
                        if (!res.ok || body.error) {
                          toast.error(body.error || 'Failed to send OTP');
                          setSendingOtp(false);
                          return;
                        }
                        setOtpSent(true);
                        toast.success('OTP sent to your email');
                      } catch (err) {
                        console.error(err);
                        toast.error('Failed to send OTP');
                      } finally { setSendingOtp(false); }
                    }}>{sendingOtp ? 'Sending...' : 'Send OTP'}</Button>
                  )}

                  {otpSent && !otpVerified && (
                    <>
                      <Button variant="ghost" onClick={() => { setOtpSent(false); setOtp(''); }}>Back</Button>
                      <Button onClick={async () => {
                        if (!otp) return toast.error('Enter OTP');
                        try {
                          setVerifyingOtp(true);
                          const res = await fetch('/api/auth/send-otp', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: forgotEmail, otp }) });
                          const body = await res.json();
                          if (!res.ok || body.error) { toast.error(body.error || 'Invalid OTP'); setVerifyingOtp(false); return; }
                          setOtpVerified(true); toast.success('OTP verified');
                        } catch (err) { console.error(err); toast.error('OTP verification failed'); } finally { setVerifyingOtp(false); }
                      }}>{verifyingOtp ? 'Verifying...' : 'Verify OTP'}</Button>
                    </>
                  )}

                  {otpVerified && (
                    <>
                      <Button variant="ghost" onClick={() => { setShowForgot(false); router.push('/dashboard'); }}>Skip and continue</Button>
                      <Button onClick={async () => {
                        if (!newPassword) return toast.error('Please enter a new password');
                        if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
                        try {
                          setResetting(true);
                          const { error } = await supabase.from('tailors').update({ password: newPassword }).eq('email', forgotEmail);
                          if (error) { toast.error(error.message || 'Failed to reset password'); setResetting(false); return; }
                          toast.success('Password changed. Redirecting...');
                          setTimeout(() => router.push('/dashboard'), 900);
                        } catch (err) { console.error(err); toast.error('Failed to reset password'); } finally { setResetting(false); }
                      }}>{resetting ? 'Saving...' : 'Change Password'}</Button>
                    </>
                  )}
                </div>
              </DialogFooter>
              <DialogClose />
            </DialogContent>
          </Dialog>
          
          <motion.div 
            className="relative w-full flex items-center justify-center py-2"
            variants={itemVariants}
          >
            <Separator className="absolute top-1/2 -translate-y-1/2 w-full bg-white/20" />
            <span className="relative z-10 bg-transparent px-4 text-xs sm:text-sm text-white/70 font-semibold tracking-widest uppercase">OR</span>
          </motion.div>
          
          <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button 
              variant="outline" 
              className="w-full font-semibold py-3 sm:py-4 rounded-xl shadow-sm border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all duration-300 h-12 sm:h-14 text-sm sm:text-base" 
              type="button"
            >
              Continue with Google
            </Button>
          </motion.div>
          
          <motion.div 
            className="text-sm text-center text-white/80"
            variants={itemVariants}
          >
            <span className="block sm:inline mb-1 sm:mb-0 sm:mr-1">Don't have an account?</span>
            <Link 
              href="/signup" 
              className="font-semibold text-primary/90 underline-offset-4 hover:text-primary transition-colors duration-300"
            >
              Sign Up
            </Link>
          </motion.div>
        </motion.form>
      </motion.div>

  <ToastContainer />
  <style jsx global>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.4);
          transform: scale(0);
          animation: ripple 0.6s linear;
        }
        
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        @media (max-width: 640px) {
          .backdrop-blur-xl {
            backdrop-filter: blur(12px);
          }
        }
      `}</style>
    </div>
  );
}