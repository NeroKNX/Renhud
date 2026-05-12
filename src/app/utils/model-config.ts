export type ModelType = 'claude-sonnet' | 'llama-70b' | 'mistral-7b';

export const modelColors = {
  'claude-sonnet': 'text-[#6366f1]',
  'llama-70b': 'text-emerald-400',
  'mistral-7b': 'text-orange-400',
};

// Helper to copy text to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      console.error('Error al copiar:', err);
      document.body.removeChild(textArea);
      return false;
    }
  } catch (err) {
    console.error('Error al copiar:', err);
    return false;
  }
};
