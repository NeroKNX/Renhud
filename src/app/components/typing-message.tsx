import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import renAvatar from 'figma:asset/f7525c5786cfe4f02e861fff75eac3f54b4332bd.png';
import { ModelType, copyToClipboard } from '../utils/model-config';

interface TypingMessageProps {
  fullMessage: string;
  model?: ModelType;
  timestamp?: string;
  isDeep?: boolean;
  onComplete?: () => void;
  onStop?: () => void;
}

export function TypingMessage({ fullMessage, model, timestamp, isDeep, onComplete, onStop }: TypingMessageProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [copied, setCopied] = useState(false);
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const TYPING_DURATION_MS = Math.min(3000, fullMessage.length * 8); // máx 3s o 8ms por caracter

  useEffect(() => {
    startTimeRef.current = Date.now();
    completedRef.current = false;

    // Si el mensaje es muy corto, mostrarlo ya
    if (fullMessage.length < 20) {
      setDisplayedText(fullMessage);
      setIsTyping(false);
      completedRef.current = true;
      onComplete?.();
      return;
    }

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(1, elapsed / TYPING_DURATION_MS);
      const charsToShow = Math.floor(progress * fullMessage.length);

      if (charsToShow > 0) {
        setDisplayedText(fullMessage.slice(0, charsToShow));
      }

      if (progress >= 1) {
        setDisplayedText(fullMessage);
        setIsTyping(false);
        completedRef.current = true;
        onComplete?.();
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [fullMessage, onComplete, TYPING_DURATION_MS]);

  // Detectar cuando la pestaña vuelve a estar visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isTyping && !completedRef.current) {
        // Si vuelve visible y no ha terminado, completar inmediato
        setDisplayedText(fullMessage);
        setIsTyping(false);
        completedRef.current = true;
        onComplete?.();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fullMessage, isTyping, onComplete]);

  const handleStop = () => {
    setDisplayedText(fullMessage);
    setIsTyping(false);
    completedRef.current = true;
    onStop?.();
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(displayedText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 flex gap-3 items-start group"
    >
      <div className="w-10 h-10 rounded-full bg-[#0a0d14] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-[0_0_15px_rgba(79,70,229,0.2)] border border-[#0f1018]">
        <img src={renAvatar} alt="Ren" className="w-full h-full object-cover brightness-125" />
      </div>

      <div className="flex-1 max-w-[80%] md:max-w-[65%]">
        <div className={`px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-all ${
          isDeep 
            ? 'bg-[#16192a] border border-[#4f46e5] shadow-[0_0_20px_rgba(79,70,229,0.3)] ring-1 ring-[#4f46e5]/30'
            : 'bg-[#16192a] border border-[#1a1d2e]'
        }`}>
          <div className={`prose prose-invert prose-sm max-w-none prose-pre:bg-[#0a0d14] prose-pre:border prose-pre:border-[#1e2238] prose-code:text-[#4f46e5] prose-code:before:content-none prose-code:after:content-none prose-pre:text-xs md:prose-pre:text-sm transition-colors duration-300 ${
            isTyping ? 'text-gray-500' : 'text-gray-300'
          }`}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  return inline ? (
                    <code className="bg-[#0f1018] px-1.5 py-0.5 rounded text-[#6366f1] font-mono text-xs" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-[#0f1018] p-3 rounded-lg overflow-x-auto font-mono text-xs leading-relaxed" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {displayedText}
            </ReactMarkdown>
            {isTyping && <span className="inline-block w-[2px] h-3.5 bg-gray-500/60 ml-1 animate-pulse" />}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isTyping ? (
            <button
              onClick={handleStop}
              className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-gray-500 hover:text-red-400 transition-colors"
              title="Detener generación"
            >
              <Square size={12} />
              Detener
            </button>
          ) : (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors"
              title="Copiar"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
