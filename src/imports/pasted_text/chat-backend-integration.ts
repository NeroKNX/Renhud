REGLAS IMPORTANTES — leer antes de hacer cualquier cambio:
1. NO modificar ningún CSS, clases de Tailwind, estilos, layouts ni elementos visuales
2. NO regenerar ningún componente completo
3. NO cambiar imports de imágenes — dejar exactamente como están
4. Solo modificar la lógica de JavaScript/TypeScript indicada abajo

CAMBIO 1 — En src/app/pages/chat.tsx:

Reemplazar la función handleSendMessage actual (que usa setTimeout con respuestas falsas) por esta versión que llama al backend real:

const handleSendMessage = async (text: string, isDeep?: boolean) => {
  const userMessage: Message = {
    id: Date.now().toString(),
    text,
    isUser: true,
    timestamp: new Date().toISOString(),
  };
  setMessages((prev) => [...prev, userMessage]);
  setIsTyping(true);

  const userStr = localStorage.getItem('ren_user');
  const user = userStr ? JSON.parse(userStr) : {};
  const userId = user.user_id || 'invitado';

  const history = messages
    .filter(m => m.text)
    .map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));

  try {
    const res = await fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        user_id: userId,
        deep: isDeep || false,
        history,
      }),
    });
    const data = await res.json();
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: data.text || 'Sin respuesta.',
      isUser: false,
      timestamp: new Date().toISOString(),
      model: 'claude-sonnet' as ModelType,
      isDeep: isDeep,
    };
    setTypingMessage(aiMessage);
  } catch {
    const errMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Error de conexión con el backend.',
      isUser: false,
      timestamp: new Date().toISOString(),
      model: 'claude-sonnet' as ModelType,
    };
    setMessages((prev) => [...prev, errMessage]);
    setIsTyping(false);
  }
};

CAMBIO 2 — En src/app/pages/chat.tsx:

En el useEffect que genera el mensaje de bienvenida (el que tiene welcomeMessages o el mensaje hardcodeado), reemplazar el contenido interno por esta llamada al backend:

const userStr = localStorage.getItem('ren_user');
const user = userStr ? JSON.parse(userStr) : {};
const userId = user.user_id || 'invitado';

fetch('http://localhost:5000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: '__INIT__', user_id: userId, deep: false, history: [] }),
})
  .then(r => r.json())
  .then(data => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: data.text || 'Hola.',
      isUser: false,
      timestamp: new Date().toISOString(),
      model: 'claude-sonnet' as ModelType,
    };
    setMessages([welcomeMessage]);
    setIsTyping(false);
  })
  .catch(() => {
    setMessages([{
      id: Date.now().toString(),
      text: 'Backend no disponible.',
      isUser: false,
      timestamp: new Date().toISOString(),
      model: 'claude-sonnet' as ModelType,
    }]);
    setIsTyping(false);
  });

Mantener el resto del useEffect exactamente igual (condiciones, setHasGeneratedWelcome, setIsTyping inicial, etc).

CAMBIO 3 — En src/app/pages/chat.tsx:

En la función handleNewSession, agregar esta llamada al backend ANTES de llamar a createNewSession():

const userStr = localStorage.getItem('ren_user');
const user = userStr ? JSON.parse(userStr) : {};
const userId = user.user_id || 'invitado';
if (messages.length > 0 && userId !== 'invitado') {
  fetch('http://localhost:5000/nueva_sesion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  }).catch(() => {});
}