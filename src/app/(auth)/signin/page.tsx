"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Create ripple effect on button
    if (buttonRef.current) {
      const button = buttonRef.current;
      const circle = document.createElement("span");
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      
      const rect = button.getBoundingClientRect();
      // This is a workaround as nativeEvent is not available in the same way in all browsers for FormEvent
      // A more robust solution would involve a click handler on the button itself
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
                  className="bg-white/5 border-white/10 text-white backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:border-primary/30 h-12 sm:h-14 text-sm sm:text-base"
                />
              </motion.div>
            </div>
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