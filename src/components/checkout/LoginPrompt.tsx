import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogIn, User } from "lucide-react";

export const LoginPrompt = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-accent-purple/30 rounded-lg p-6 mb-8 backdrop-blur-sm"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-medium">Sign in for a faster checkout</h3>
            <p className="text-sm text-gray-600">Access your saved addresses and payment methods</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="default" className="gap-2">
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
          <Button variant="outline">Continue as Guest</Button>
        </div>
      </div>
    </motion.div>
  );
};