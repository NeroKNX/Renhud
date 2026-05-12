import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Check, X, Layers } from 'lucide-react';
import { PreferencesManager } from '../utils/preferences-manager';

interface Skill {
  id: string;
  name: string;
  instructions: string;
  createdAt: string;
}

interface SkillsPanelProps {
  userId: string;
  activeSkill: string | null;
  onActivate: (skillId: string | null, skillName?: string) => void;
  onClose: () => void;
}

export function SkillsPanel({ userId, activeSkill, onActivate, onClose }: SkillsPanelProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [skillNewChat, setSkillNewChat] = useState(() => PreferencesManager.getPreferences().skillNewChat);

  const load = () => {
    fetch(`/api/skills?user_id=${userId}`)
      .then(r => r.json())
      .then(d => setSkills(d.skills || []))
      .catch(() => {});
  };

  useEffect(() => { load(); }, [userId]);

  const create = async () => {
    if (!newName.trim() || !newInstructions.trim()) return;
    await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, name: newName, instructions: newInstructions }),
    });
    setNewName('');
    setNewInstructions('');
    setIsCreating(false);
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/skills/${id}?user_id=${userId}`, { method: 'DELETE' });
    if (activeSkill === id) onActivate(null);
    load();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div className="bg-[#16192a] border border-[#252942] rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono text-gray-100">Mis Skills</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        {skills.length === 0 && !isCreating && (
          <p className="text-sm font-mono text-gray-500 mb-4">No tienes skills creadas aún.</p>
        )}

        <div className="space-y-2 mb-4">
          {skills.map(skill => (
            <div key={skill.id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                activeSkill === skill.id
                  ? 'bg-[#4f46e5]/10 border-[#4f46e5]'
                  : 'bg-[#0f1018] border-[#2d3250] hover:border-[#4f46e5]/50'
              }`}
              onClick={() => onActivate(activeSkill === skill.id ? null : skill.id, activeSkill === skill.id ? undefined : skill.name)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-gray-200 truncate">{skill.name}</p>
                <p className="text-xs font-mono text-gray-500 truncate">{skill.instructions.slice(0, 60)}</p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                {activeSkill === skill.id && <Check size={16} className="text-[#4f46e5]" />}
                <button onClick={e => { e.stopPropagation(); remove(skill.id); }}
                  className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {isCreating ? (
          <div className="space-y-3">
            <input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Nombre de la skill"
              className="w-full bg-[#0f1018] border border-[#2d3250] rounded-lg px-3 py-2 text-sm font-mono text-gray-100 placeholder:text-gray-600 focus:border-[#4f46e5] outline-none" />
            <textarea value={newInstructions} onChange={e => setNewInstructions(e.target.value)}
              placeholder="Instrucciones: ¿qué debería hacer REN cuando esta skill esté activa?"
              rows={3}
              className="w-full bg-[#0f1018] border border-[#2d3250] rounded-lg px-3 py-2 text-sm font-mono text-gray-100 placeholder:text-gray-600 focus:border-[#4f46e5] outline-none resize-none" />
            <div className="flex gap-2">
              <button onClick={create}
                className="flex-1 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-mono text-sm rounded-lg transition-colors">
                Crear
              </button>
              <button onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-[#1a1d2e] text-gray-300 font-mono text-sm rounded-lg border border-[#2d3250] transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsCreating(true)}
            className="w-full py-2.5 bg-[#1a1d2e] hover:bg-[#1e2238] text-gray-300 font-mono text-sm rounded-lg border border-[#2d3250] border-dashed transition-colors flex items-center justify-center gap-2">
            <Plus size={14} />
            Nueva skill
          </button>
        )}

        {/* Opción: abrir chat nuevo al activar skill */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#252942]">
          <input
            type="checkbox"
            checked={skillNewChat}
            onChange={(e) => {
              setSkillNewChat(e.target.checked);
              PreferencesManager.setSkillNewChat(e.target.checked);
            }}
            className="w-3.5 h-3.5 bg-[#1a1d2e] border border-[#2d3250] rounded accent-[#4f46e5] cursor-pointer"
          />
          <Layers size={14} className="text-gray-500" />
          <span className="text-xs font-mono text-gray-500">Abrir chat nuevo al activar skill</span>
        </div>
      </div>
    </motion.div>
  );
}
