# 📝 Changelog - Ren AI

## [v2.0.0] - 2026-03-10

### 🎉 Nuevas Funcionalidades

#### **Modo Invitado** 👤
- Acceso instantáneo sin necesidad de registro
- Botón "Continuar como invitado" en landing, login y registro
- Badge distintivo en el header para identificar usuarios invitados
- Límite de 10 sesiones con auto-eliminación de la más antigua
- Banner informativo sobre almacenamiento local
- Advertencia antes de cerrar el navegador con conversaciones activas

#### **Atajos de Teclado** ⌨️
- `Ctrl/Cmd + K`: Nueva sesión
- `Ctrl/Cmd + H`: Abrir historial
- `Ctrl/Cmd + E`: Exportar conversación
- `Ctrl/Cmd + /`: Mostrar ayuda de atajos
- `Esc`: Cerrar paneles y modales
- Modal flotante con ayuda de atajos (botón con animación pulse)
- Soporte completo para Mac (⌘) y Windows/Linux (Ctrl)

#### **Exportar Conversaciones** 💾
- Botón de exportar con dropdown menu
- Exportar conversación actual a .txt
- Exportar todo el historial a .txt
- Formato legible con timestamps y modelos
- Atajo rápido: `Ctrl/Cmd + E`

### ✨ Mejoras Visuales

#### **Header del Chat**
- Indicador de usuario/invitado con badge
- Mejor organización de botones
- Tooltips con atajos de teclado
- Animaciones mejoradas en hover

#### **Mensajes**
- Animación de entrada para nuevos mensajes
- Efecto stagger (secuencial) en carga inicial
- Transiciones más suaves

#### **Banners Informativos**
- Banner de advertencia para invitados cerca del límite (8/10 sesiones)
- Banner informativo para nuevos invitados
- Colores distintivos (ámbar para advertencias, índigo para info)

### 🔧 Mejoras Técnicas

#### **Gestión de Sesiones**
- Auto-limpieza de sesiones antiguas para invitados
- Mejor manejo de localStorage
- Prevención de pérdida de datos con confirmación de salida

#### **UX Mejorada**
- Botón de ayuda flotante con animación
- Mejor feedback visual en todas las acciones
- Responsive mejorado para todos los tamaños de pantalla

### 📚 Documentación

- **GUIA_DE_USO.md**: Guía completa para usuarios
- **PROJECT_STRUCTURE.md**: Actualizado con nuevas funcionalidades
- **CHANGELOG.md**: Historial de versiones y cambios

---

## [v1.0.0] - 2026-03-09

### 🎉 Lanzamiento Inicial

#### **Sistema de Autenticación**
- Landing page con hero animado
- Formulario de login con validación
- Formulario de registro completo
- Sistema de logout

#### **Chat Funcional**
- Interfaz de chat oscura minimalista
- Soporte para 3 modelos de IA (Claude, Llama, Mistral)
- Badges discretos para identificar modelos
- Modo "Deep" para conversaciones profundas
- Indicador de escritura animado
- Renderizado de markdown en mensajes
- Botón de copiar mensaje

#### **Gestión de Sesiones**
- Creación de múltiples sesiones
- Auto-generación de títulos
- Persistencia en localStorage
- Timestamps humanizados

#### **Panel de Historial**
- Sidebar animado con blur
- Búsqueda en tiempo real
- Edición de títulos inline
- Eliminación de sesiones
- Contador de mensajes por sesión

#### **Diseño Responsive**
- Soporte para mobile, tablet y desktop
- Ancho máximo de 860px
- Optimización táctil para móviles

---

## 🔮 Próximas Versiones

### [v2.1.0] - Planificado
- Integración con API real de IA
- Categorías/etiquetas para sesiones
- Búsqueda global en todos los mensajes
- Compartir conversaciones con link

### [v3.0.0] - Planificado
- Backend con Supabase
- Sincronización multi-dispositivo
- Modo oscuro/claro toggle
- Exportar a PDF
- Configuración de usuario
- Estadísticas de uso

---

## 📊 Estadísticas

### v2.0.0
- **Componentes**: 7
- **Páginas**: 4
- **Líneas de código**: ~2,000+
- **Funcionalidades principales**: 15+
- **Atajos de teclado**: 5

### v1.0.0
- **Componentes**: 5
- **Páginas**: 4
- **Líneas de código**: ~1,500
- **Funcionalidades principales**: 10

---

## 🙏 Créditos

Desarrollado con:
- React 18.3.1
- TypeScript
- Tailwind CSS 4.1.12
- Motion (Framer Motion) 12.23.24
- React Router 7.13.0
- Lucide React (iconos)
- date-fns 3.6.0

Inspirado en el diseño de Linear y Vercel.

---

**Última actualización**: 10 de marzo de 2026
