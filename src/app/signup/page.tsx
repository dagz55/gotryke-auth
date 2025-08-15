'use client';

import { SignupForm } from '@/components/auth/signup-form';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-primary/10 p-4">
      {/* Centered Animated Logo */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        <motion.div
          whileHover={{ 
            scale: 1.1,
            rotate: [0, -1, 1, 0],
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.9 }}
        >
          <Image
            src="https://elnntdfdlojxpcjiyehe.supabase.co/storage/v1/object/public/gotryke-bucket/public/images/gotryke-logo.png"
            alt="GoTryke Logo"
            width={180}
            height={72}
            className="mx-auto h-12 md:h-16 w-auto drop-shadow-lg cursor-pointer"
          />
        </motion.div>
      </motion.div>
      <SignupForm />
    </main>
  );
}
