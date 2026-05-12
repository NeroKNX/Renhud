import { Send, Paperclip, Brain, X, FileText, Image as ImageIcon, Music, Video } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { PreferencesManager } from '../utils/preferences-manager';

interface ChatInputProps {
  onSendMessage: (message: string, isDeep?: boolean, files?: File[]) => void;
  disabled?: boolean;
  sessionId?: string;
  activeSkillName?: string | null;
  onDeactivateSkill?: () => void;
}

export function ChatInput({ onSendMessage, disabled, sessionId, activeSkillName, onDeactivateSkill }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const hasKeyboard = !('ontouchstart' in window) || navigator.maxTouchPoints === 0;
    setIsTouchDevice(!(hasHover || hasKeyboard));
  }, []);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load draft on mount
  useEffect(() => {
    if (sessionId) {
      const draft = PreferencesManager.getDraft(sessionId);
      if (draft) {
        setMessage(draft);
      }
    }
  }, [sessionId]);

  // Save draft when message changes
  useEffect(() => {
    if (sessionId && message) {
      PreferencesManager.saveDraft(sessionId, message);
    }
  }, [message, sessionId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const isAudio = file.type.startsWith('audio/');
      const isVideo = file.type.startsWith('video/');
      const isUnder50MB = file.size <= 50 * 1024 * 1024; // 50MB limit
      return (isImage || isPDF || isAudio || isVideo) && isUnder50MB;
    });
    setAttachedFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachedFiles.length > 0) && !disabled) {
      onSendMessage(message, isAdvancedMode, attachedFiles.length > 0 ? attachedFiles : undefined);
      setMessage('');
      setAttachedFiles([]);
      // Clear draft after sending
      if (sessionId) {
        PreferencesManager.clearDraft(sessionId);
      }
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        // Remove focus to clear the halo effect
        textareaRef.current.blur();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-[#1e2238] bg-[#0f1018] px-2 sm:px-4 py-3 sm:py-4">
      {/* File previews */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachedFiles.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-2 py-1.5 bg-[#1a1d2e] border border-[#2d3250] rounded-lg text-sm"
            >
              {file.type.startsWith('image/') ? (
                <ImageIcon size={14} className="text-[#4f46e5] flex-shrink-0" />
              ) : file.type.startsWith('audio/') ? (
                <Music size={14} className="text-green-400 flex-shrink-0" />
              ) : file.type.startsWith('video/') ? (
                <Video size={14} className="text-yellow-400 flex-shrink-0" />
              ) : (
                <FileText size={14} className="text-red-400 flex-shrink-0" />
              )}
              <span className="text-gray-300 font-mono text-xs max-w-[100px] sm:max-w-[150px] truncate">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="p-0.5 hover:bg-[#2d3250] rounded transition-colors flex-shrink-0"
              >
                <X size={12} className="text-gray-500 hover:text-gray-300" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Skill activa badge */}
      {activeSkillName && (
        <div className="flex items-center gap-2 px-3 py-1.5 mb-1 bg-[#4f46e5]/10 border border-[#4f46e5]/30 rounded-lg">
          <Brain size={14} className="text-[#4f46e5]" />
          <span className="text-xs font-mono text-[#4f46e5]">
            Skill activa: <strong>{activeSkillName}</strong>
          </span>
          {onDeactivateSkill && (
            <button
              type="button"
              onClick={onDeactivateSkill}
              className="ml-auto p-0.5 hover:bg-[#4f46e5]/20 rounded transition-colors"
            >
              <X size={14} className="text-[#4f46e5] hover:text-gray-300" />
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:gap-3">
        {/* Deep mode checkbox - compacto en móvil */}
        <div className="flex items-center gap-2 px-2 sm:px-3 group relative">
          <input
            type="checkbox"
            checked={isAdvancedMode}
            onChange={(e) => setIsAdvancedMode(e.target.checked)}
            disabled={disabled}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#1a1d2e] border border-[#2d3250] rounded accent-[#4f46e5] cursor-pointer hover:border-[#4f46e5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Brain size={12} className={`sm:w-[14px] sm:h-[14px] transition-colors ${isAdvancedMode ? 'text-[#4f46e5]' : 'text-gray-500'}`} />
            <span className={`text-xs sm:text-sm font-mono transition-colors ${isAdvancedMode ? 'text-[#4f46e5]' : 'text-gray-500'}`}>
              Deep
            </span>
            <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block z-50">
              <div className="bg-[#1a1d2e] border border-[#2d3250] rounded-lg px-2.5 py-1.5 text-xs text-gray-300 font-mono whitespace-nowrap shadow-lg">
                Usa el modelo avanzado (Pro) para preguntas complejas
              </div>
            </div>
            <motion.div
              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isAdvancedMode ? 'bg-[#4f46e5]' : 'bg-gray-700'}`}
              animate={{ scale: isAdvancedMode ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Textarea with icons */}
        <div className={`flex items-end gap-1.5 sm:gap-2 bg-[#1a1d2e] border rounded-lg px-2.5 sm:px-4 py-2 sm:py-2.5 transition-all ${
          isAdvancedMode
            ? 'border-[#4f46e5] shadow-[0_0_20px_rgba(79,70,229,0.25)] ring-2 ring-[#4f46e5]/20'
            : isFocused
              ? 'border-[#4f46e5] shadow-[0_0_15px_rgba(79,70,229,0.15)]'
              : 'border-[#2d3250]'
        }`}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,audio/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="text-gray-500 hover:text-gray-300 hover:scale-110 transition-all pb-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Adjuntar archivo"
            title="Adjuntar imagen, PDF, audio o video (máx 50MB)"
          >
            <Paperclip size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="flex-1 bg-transparent outline-none text-sm sm:text-base text-gray-100 placeholder:text-gray-600 resize-none disabled:opacity-50 disabled:cursor-not-allowed min-w-0"
          />
          <button
            type="submit"
            disabled={(!message.trim() && attachedFiles.length === 0) || disabled}
            className="text-[#4f46e5] hover:text-[#6366f1] hover:scale-110 disabled:text-gray-600 disabled:cursor-not-allowed transition-all pb-0.5 flex-shrink-0"
            aria-label="Enviar mensaje"
          >
            <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </form>
      {!isTouchDevice && (
      <p className="text-[10px] sm:text-xs text-gray-500 mt-2 text-center font-mono px-2">
        <span className="hidden sm:inline">Presiona <kbd className="px-1.5 py-0.5 bg-[#1a1d2e] border border-[#2d3250] rounded text-gray-400">Enter</kbd> para enviar, <kbd className="px-1.5 py-0.5 bg-[#1a1d2e] border border-[#2d3250] rounded text-gray-400">Shift + Enter</kbd> para nueva línea</span>
        <span className="sm:hidden">Enter: enviar | Shift+Enter: nueva línea</span>
      </p>
      )}
    </div>
  );
}