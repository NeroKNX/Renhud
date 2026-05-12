import { motion } from 'motion/react';
import renAvatar from 'figma:asset/f7525c5786cfe4f02e861fff75eac3f54b4332bd.png';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-2 md:gap-3 items-start mb-4"
    >
      <div className="flex-shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#0a0d14] flex items-center justify-center overflow-hidden mt-1 shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-[#4f46e5]/30">
        <img 
          src={renAvatar} 
          alt="Ren" 
          className="w-full h-full object-cover brightness-125"
        />
      </div>
      
      <div className="px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-[#16192a] border border-[#252942]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-[#4f46e5] rounded-full"
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <motion.span 
            className="text-xs text-gray-500 font-mono ml-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            pensando
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}