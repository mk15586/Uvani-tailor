"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import OtpModal from "@/components/auth/otp-modal";
import { supabase } from "@/lib/supabaseClient";
import { Separator } from "@/components/ui/separator";

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

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // form fields (bound) so we can show where OTP was sent
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP UI state
  const [showOtp, setShowOtp] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // cooldown timer for resend
  useEffect(() => {
    let timer: any = null;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const createRipple = (e: React.FormEvent<HTMLFormElement>) => {
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
  };

  const sendOtp = async () => {
    if (!email) return;
    setLoading(true);
    setOtpError(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setShowOtp(true);
        setResendCooldown(45);
      } else {
        setOtpError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setOtpError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createRipple(e);
    await sendOtp();
  };

  const handleVerify = async () => {
    setOtpError(null);
    const code = otpInput.trim();
    if (code.length === 0) {
      setOtpError("Please enter the code.");
      return;
    }
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (data.ok) {
        // OTP verified, now store email and password in Supabase
        const { error: insertError } = await supabase.from('tailors').insert({
          email,
          password
        });
        if (insertError) {
          setOtpError(insertError.message || 'Failed to save credentials.');
          return;
        }
        setShowOtp(false);
        router.push("/complete-registration");
      } else {
        setOtpError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setOtpError("Failed to verify OTP");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    await sendOtp();
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "tween",
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4 py-8 sm:px-6"
      style={{
        backgroundImage: "url(/singin-pics/about-img-2.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
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
            stiffness: 300,
          },
        }}
        style={{
          boxShadow:
            "0 20px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
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
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Sign Up
            </h1>
            <p className="text-sm sm:text-base text-white/80 mb-2">
              Start managing your craft with precision.
            </p>
          </motion.div>
          
          {/* name fields removed - collected in complete-registration */}
          
          <motion.div className="space-y-4" variants={itemVariants}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90 text-sm sm:text-base">
                Email
              </Label>
              <motion.div
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Input
                  id="email"
                  type="email"
                  placeholder="masterjee@uvani.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:border-primary/30 h-12 sm:h-14 text-sm sm:text-base"
                />
              </motion.div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90 text-sm sm:text-base">
                Password
              </Label>
              <motion.div
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:border-primary/30 h-12 sm:h-14 text-sm sm:text-base"
                />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
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
                    Creating Account...
                  </motion.span>
                ) : (
                  <motion.span
                    key="signup"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm sm:text-base"
                  >
                    Create Account
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
          
          <motion.div
            className="relative w-full flex items-center justify-center py-2"
            variants={itemVariants}
          >
            <Separator className="absolute top-1/2 -translate-y-1/2 w-full bg-white/20" />
            <span className="relative z-10 bg-transparent px-4 text-xs sm:text-sm text-white/70 font-semibold tracking-widest uppercase">
              OR
            </span>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
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
            <span className="block sm:inline mb-1 sm:mb-0 sm:mr-1">
              Already have an account?
            </span>
            <Link
              href="/signin"
              className="font-semibold text-primary/90 underline-offset-4 hover:text-primary transition-colors duration-300"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.form>
      </motion.div>
      
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
      <OtpModal
        show={showOtp}
        onClose={() => setShowOtp(false)}
        emailOrContact={email || "your contact"}
        otpInput={otpInput}
        setOtpInput={setOtpInput}
        otpError={otpError}
        onVerify={handleVerify}
        onResend={handleResend}
        resendCooldown={resendCooldown}
      />
    </div>
  );
}