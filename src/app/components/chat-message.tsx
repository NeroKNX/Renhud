import { motion } from 'motion/react';
import { User, Copy, Check, Pencil, Brain, FileText, Terminal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import renAvatar from 'figma:asset/f7525c5786cfe4f02e861fff75eac3f54b4332bd.png';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { ModelType, modelColors, copyToClipboard } from '../utils/model-config';

interface AttachedFile {
  name: string;
  type: string;
  data: string;
}

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  model?: ModelType;
  isDeep?: boolean;
  files?: AttachedFile[];
  onEdit?: (newMessage: string) => void;
}

// Configurar marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function ChatMessage({ message, isUser, timestamp, model, isDeep, files, onEdit }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const handleBubbleTap = () => {
    setShowActions(prev => !prev);
  };

  // Cerrar acciones al tocar fuera
  useEffect(() => {
    if (!showActions) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showActions]);

  const handleCopy = async () => {
    const success = await copyToClipboard(message);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyBlock = async (code: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Renderizar markdown a HTML
  const renderMarkdown = (text: string): string => {
    if (!text) return '';
    try {
      return marked.parse(text) as string;
    } catch {
      return text;
    }
  };

  // Adjuntar botón de copiar a bloques de código después del render
  useEffect(() => {
    if (!contentRef.current || isUser) return;
    const preElements = contentRef.current.querySelectorAll('pre');
    preElements.forEach((pre) => {
      // Evitar duplicar botones
      if (pre.querySelector('.code-copy-btn')) return;

      const code = pre.querySelector('code');
      if (!code) return;

      const btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      btn.title = 'Copiar código';
      btn.onclick = () => handleCopyBlock(code.textContent || '');

      pre.style.position = 'relative';
      pre.appendChild(btn);
    });
  }, [message, isUser]);

  const handleEdit = () => {
    if (onEdit) {
      const newMessage = prompt('Editar mensaje:', message);
      if (newMessage && newMessage !== message) {
        onEdit(newMessage);
      }
    }
  };

  const htmlContent = renderMarkdown(message);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex gap-1.5 sm:gap-2 ${isUser ? 'justify-end' : 'justify-start'} mb-2 sm:mb-2.5 group`}
    >
      {/* Avatar REN */}
      {!isUser && (
        <div className="flex-shrink-0 self-end w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-[#0a0d14] flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(79,70,229,0.2)] border border-[#4f46e5]/15">
          <img src={renAvatar} alt="Ren" className="w-full h-full object-cover" />
        </div>
      )}

      <div className={`relative flex flex-col max-w-[88%] sm:max-w-[82%] md:max-w-[68%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div ref={bubbleRef} onClick={handleBubbleTap}
          className={`relative px-3 sm:px-3.5 py-1.5 sm:py-2 transition-all min-w-0 cursor-pointer active:scale-[0.98] hover:brightness-110 ${
            isUser
              ? 'bg-[var(--ren-bg-message-user)] text-[var(--ren-text-primary)] rounded-2xl rounded-br-sm ring-1 ring-[var(--accent-color)]/20'
              : isDeep
                ? 'bg-[var(--ren-bg-message-ai)] text-[var(--ren-text-primary)] rounded-2xl rounded-bl-sm border-2 border-[var(--accent-color)]/40'
                : 'bg-[var(--ren-bg-message)] text-[var(--ren-text-primary)] rounded-2xl rounded-bl-sm border border-[var(--ren-border)]'
          }`}
        >
          {/* Archivos adjuntos */}
          {files && files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5">
              {files.map((file, i) => (
                file.type.startsWith('image/') ? (
                  <img key={i} src={file.data} alt={file.name}
                    className="max-w-full rounded-xl border border-[#2d3250] max-h-72 object-contain" />
                ) : file.type.startsWith('audio/') ? (
                  <audio key={i} controls className="w-full max-w-xs" src={file.data}>
                    <track kind="captions" />
                  </audio>
                ) : file.type.startsWith('video/') ? (
                  <video key={i} controls className="max-w-full rounded-xl border border-[#2d3250] max-h-72" src={file.data}>
                    <track kind="captions" />
                  </video>
                ) : (
                  <a key={i} href={file.data} download={file.name}
                    className="text-xs text-[#4f46e5] hover:underline truncate max-w-[200px] border border-[#2d3250] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-[#1e2238] transition-colors">
                    <FileText size={12} /> {file.name}
                  </a>
                )
              ))}
            </div>
          )}

          {/* Markdown renderizado */}
          <div
            ref={contentRef}
            className="ren-markdown leading-[1.5] tracking-[0.01em] text-[4px] sm:text-sm md:text-base text-gray-100 [text-size-adjust:none] [-webkit-text-size-adjust:none] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Footer */}
          <div className="flex items-end justify-between mt-1 sm:mt-1.5">
            <div className="leading-none">
              {timestamp && (() => {
                const date = new Date(timestamp);
                const now = new Date();
                const diffMin = Math.round((now.getTime() - date.getTime()) / 60000);
                const diffHr = Math.floor(diffMin / 60);
                let timeStr;
                if (diffMin < 2) timeStr = 'Ahora';
                else if (diffMin < 60) timeStr = `Hace ${diffMin} min`;
                else if (diffHr < 24) timeStr = `Hace ${diffHr} horas`;
                else {
                  const d = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                  const t = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  timeStr = `${d} ${t}`;
                }
                return <span className="text-[9px] sm:text-[10px] text-gray-600/40">{timeStr}</span>;
              })()}
            </div>
            <div className="flex items-center gap-1.5 leading-none">
              {!isUser && isDeep && (
                <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-[#4f46e5]/12 border border-[#4f46e5]/20 rounded-full">
                  <Brain size={7} className="text-[#4f46e5]" />
                  <span className="text-[7px] sm:text-[8px] font-mono text-[#4f46e5] tracking-wider uppercase">Deep</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botones: aparecen al tocar la burbuja o hover desktop */}
        <div className={`flex gap-1 mt-0.5 transition-all duration-200 ${showActions ? 'opacity-100' : 'opacity-0 sm:opacity-0 sm:group-hover:opacity-100'}`}>
          <button
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            className="p-0.5 rounded text-gray-500/60 hover:text-[#818cf8] transition-colors active:scale-90"
            title="Copiar mensaje"
          >
            {copied ? (
              <Check size={10} className="text-emerald-400" />
            ) : (
              <Copy size={10} />
            )}
          </button>
          {isUser && onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); handleEdit(); }}
              className="p-0.5 rounded text-gray-500/60 hover:text-[#818cf8] transition-colors active:scale-90"
              title="Editar mensaje"
            >
              <Pencil size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Avatar usuario */}
      {isUser && (
        <div className="flex-shrink-0 self-end w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[#2d3250] to-[#1e2238] border border-[#3d4260]/50 flex items-center justify-center shadow-sm">
          <User size={11} className="sm:w-[13px] sm:h-[13px] md:w-[15px] md:h-[15px] text-gray-500" />
        </div>
      )}

      {/* Estilos para markdown */}
      <style>{`
        .ren-markdown {
          font-size: inherit;
          line-height: 1.45;
        }
        .ren-markdown p {
          margin: 0.2em 0;
        }
        .ren-markdown p:first-child { margin-top: 0; }
        .ren-markdown p:last-child { margin-bottom: 0; }

        /* Negritas más vibrantes */
        .ren-markdown strong {
          color: #c7d2fe;
          font-weight: 700;
        }
        .ren-markdown em {
          color: #a5b4fc;
          font-style: italic;
        }

        /* Listas con mejor espaciado y bullet personalizado */
        .ren-markdown ul, .ren-markdown ol {
          margin: 0.15em 0;
          padding-left: 1.2em;
        }
        .ren-markdown li {
          margin: 0.1em 0;
          line-height: 1.4;
        }
        .ren-markdown ul li {
          list-style: none;
          position: relative;
        }
        .ren-markdown ul li::before {
          content: "▸";
          position: absolute;
          left: -1.1em;
          color: #818cf8;
          font-size: 0.9em;
        }
        .ren-markdown ol li {
          list-style-type: decimal;
          color: #d1d5db;
        }
        .ren-markdown ol li::marker {
          color: #818cf8;
          font-weight: 600;
        }

        /* Headers con estilo */
        .ren-markdown h1, .ren-markdown h2, .ren-markdown h3, .ren-markdown h4 {
          color: #e0e7ff;
          font-weight: 700;
          margin: 0.4em 0 0.2em;
          line-height: 1.3;
        }
        .ren-markdown h1 { font-size: 1.05em; }
        .ren-markdown h2 { font-size: 1em; }
        .ren-markdown h3 { font-size: 0.95em; color: #a5b4fc; }
        .ren-markdown h4 { font-size: 0.9em; color: #c7d2fe; }

        /* Blockquote con estilo */
        .ren-markdown blockquote {
          border-left: 3px solid #818cf8;
          padding: 0.15em 0.6em;
          margin: 0.3em 0;
          color: #9ca3af;
          background: rgba(129, 140, 248, 0.04);
          border-radius: 0 6px 6px 0;
        }

        /* Links */
        .ren-markdown a {
          color: #818cf8;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.15s;
        }
        .ren-markdown a:hover {
          color: #a5b4fc;
        }

        /* Código inline */
        .ren-markdown code {
          background: #1a1d2e;
          padding: 0.15em 0.4em;
          border-radius: 4px;
          font-size: 0.88em;
          font-family: ui-monospace, 'Cascadia Code', monospace;
          color: #e2e8f0;
          border: 1px solid #2d3250;
        }

        /* Bloques de código */
        .ren-markdown pre {
          background: #0a0d14;
          border: 1px solid #1e2238;
          border-radius: 8px;
          padding: 0.6em;
          overflow-x: auto;
          margin: 0.3em 0;
          position: relative;
        }
        .ren-markdown pre code {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.85em;
          line-height: 1.5;
          color: #cbd5e1;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          display: block;
          font-family: ui-monospace, 'Cascadia Code', monospace;
        }

        /* Botón de copiar en bloques de código */
        .code-copy-btn {
          position: absolute;
          top: 6px;
          right: 6px;
          padding: 4px 6px;
          background: #1a1d2e;
          border: 1px solid #2d3250;
          border-radius: 6px;
          color: #6b7280;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }
        .ren-markdown pre:hover .code-copy-btn {
          opacity: 1;
        }
        .code-copy-btn:hover {
          border-color: #4f46e5;
          color: #e5e7eb;
          background: #1e2238;
        }

        /* Tablas */
        .ren-markdown table {
          border-collapse: collapse;
          margin: 0.6em 0;
          width: 100%;
          font-size: 0.88em;
          border-radius: 8px;
          overflow: hidden;
        }
        .ren-markdown th {
          background: #1a1d2e;
          color: #e0e7ff;
          font-weight: 600;
          padding: 0.5em 0.7em;
          border: 1px solid #2d3250;
          text-align: left;
        }
        .ren-markdown td {
          color: #d1d5db;
          padding: 0.4em 0.7em;
          border: 1px solid #2d3250;
        }
        .ren-markdown tr:nth-child(even) td {
          background: rgba(255, 255, 255, 0.02);
        }

        /* Separador */
        .ren-markdown hr {
          border: none;
          height: 1px;
          background: linear-gradient(to right, transparent, #2d3250, transparent);
          margin: 0.5em 0;
        }
      `}</style>
    </motion.div>
  );
}
