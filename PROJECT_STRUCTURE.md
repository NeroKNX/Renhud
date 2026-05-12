# Ren AI - Estructura del Proyecto

## 🎨 Descripción General

Interfaz de chat oscura para un asistente de IA llamado "Ren" con estética terminal minimalista inspirada en Linear y Vercel. Sistema completo con autenticación, historial de conversaciones y diseño responsive.

## 📁 Estructura de Archivos

```
/src/app/
├── App.tsx                    # Punto de entrada principal con RouterProvider
├── routes.tsx                 # Configuración de React Router
│
├── pages/                     # Páginas principales
│   ├── landing.tsx           # Página de inicio con hero y features
│   ├── login.tsx             # Formulario de inicio de sesión
│   ├── register.tsx          # Formulario de registro
│   └── chat.tsx              # Interfaz principal del chat
│
├── components/               # Componentes reutilizables
│   ├── chat-input.tsx       # Input de mensajes con modo Deep
│   ├── chat-message.tsx     # Mensajes individuales con markdown
│   ├── typing-indicator.tsx # Indicador de escritura
│   ├── history-sidebar.tsx  # Panel lateral de historial
│   ├── keyboard-shortcuts-help.tsx # Ayuda de atajos de teclado
│   └── empty-state.tsx      # Pantalla de bienvenida con sugerencias
│
└── utils/                    # Utilidades
    └── session-manager.ts   # Gestión de sesiones en localStorage
```

## 🚀 Características Implementadas

### 1. Sistema de Autenticación
- **Landing Page**: Hero animado con features
- **Login**: Formulario con validación y toggle de password
- **Registro**: Formulario completo con términos de servicio
- **Modo Invitado**: Acceso rápido sin registro (disponible en todas las páginas)
- **Logout**: Cierre de sesión con limpieza de datos

### 2. Chat Mejorado
- **Header profesional** con avatar de Ren visible
- **Indicador de usuario/invitado** con badge distintivo
- **Botón de exportar** con dropdown (conversación actual o todo el historial)
- **Botón de historial** con animación al hover
- **Botón de nueva sesión** con animación al hover
- **Botón de logout** para cerrar sesión
- **Timestamps humanizados** ("hace 5 minutos")
- **Animaciones de entrada** para mensajes nuevos
- **Confirmación antes de salir** para invitados con conversaciones activas

### 3. Gestión de Sesiones
- **Múltiples conversaciones** guardadas en localStorage
- **Auto-generación de títulos** desde el primer mensaje
- **Búsqueda en historial** con filtrado en tiempo real
- **Edición de títulos** inline con Enter/Escape
- **Eliminación de sesiones** con confirmación
- **Persistencia de estado** entre recargas
- **Límite de sesiones para invitados** (máximo 10, auto-elimina la más antigua)
- **Advertencia de límite** cuando se acercan a 10 sesiones

### 4. Panel de Historial
- **Sidebar animado** con backdrop blur
- **Lista de sesiones** con preview
- **Contador de mensajes** por sesión
- **Timestamps relativos** en español
- **Acciones hover**: editar y eliminar
- **Estado activo** visual para sesión actual

### 5. Exportar Conversaciones ✨ NUEVO
- **Exportar conversación actual** a archivo .txt
- **Exportar todo el historial** a archivo .txt
- **Formato legible** con timestamps y modelos identificados
- **Dropdown menu** en el botón de exportar

### 6. Atajos de Teclado ⌨️ NUEVO
- **Ctrl/Cmd + K**: Nueva sesión
- **Ctrl/Cmd + H**: Abrir historial
- **Ctrl/Cmd + E**: Exportar conversación actual
- **Ctrl/Cmd + /**: Mostrar ayuda de atajos
- **Esc**: Cerrar panel lateral o modal
- **Modal de ayuda** flotante con botón de teclado

### 7. Modo Invitado 👤 NUEVO
- **Acceso sin registro** desde landing, login y registro
- **Badge de invitado** visible en el header
- **Banner informativo** sobre almacenamiento local
- **Límite de 10 sesiones** con auto-limpieza
- **Advertencia de pérdida de datos** al cerrar el navegador
- **Mismo conjunto de funcionalidades** que usuarios registrados

### 8. Empty State 🎨 NUEVO
- **Pantalla de bienvenida** cuando no hay mensajes
- **Sugerencias interactivas** con ejemplos de preguntas
- **Animaciones secuenciales** al cargar las sugerencias
- **Click para enviar** sugerencias directamente
- **Información contextual** para invitados
- **Hint de atajos** de teclado

## 🎨 Paleta de Colores

- **Fondo principal**: `#0f1018`
- **Fondo secundario**: `#16192a`
- **Bordes**: `#1e2238`, `#252942`, `#2d3250`
- **Acento primario**: `#4f46e5` (índigo)
- **Acento hover**: `#4338ca`

### Badges de Modelos
- **Claude Sonnet**: `#6366f1` (índigo)
- **Llama 70B**: `emerald-400` (verde)
- **Mistral 7B**: `orange-400` (naranja)

## 🔧 Tecnologías Utilizadas

- **React 18.3.1** con TypeScript
- **React Router 7.13.0** para navegación
- **Motion (Framer Motion) 12.23.24** para animaciones
- **Tailwind CSS 4.1.12** para estilos
- **date-fns 3.6.0** para formateo de fechas
- **react-markdown** para renderizado de mensajes
- **Lucide React** para iconos

## 📱 Responsive Design

### Mobile (< 768px)
- Header compacto con icono de hamburguesa
- Input apilado verticalmente
- Sidebar a pantalla completa
- Botones táctiles optimizados

### Tablet (768px - 1024px)
- Layout intermedio
- Sidebar de ancho medio
- Header con más espacio

### Desktop (> 1024px)
- Ancho máximo de 860px centrado
- Sidebar de 384px
- Todas las funcionalidades visibles

## 🔐 Persistencia de Datos

### localStorage Keys
- `ren_user`: Datos del usuario autenticado
- `ren_chat_sessions`: Array de todas las sesiones
- `ren_current_session`: ID de la sesión activa

## 🎯 Próximas Mejoras Sugeridas

- Integración con API real de IA
- Modo oscuro/claro toggle
- Exportar conversaciones a PDF/TXT
- Compartir conversaciones con link
- Búsqueda global en todos los mensajes
- Categorías o etiquetas para sesiones
- Configuración de usuario (preferencias)