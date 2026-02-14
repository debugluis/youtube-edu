## PROMPT INICIO

Necesito que construyas desde cero una web app educativa que transforma playlists de YouTube en cursos estructurados con progreso, logros y módulos. Te voy a dar todos los detalles técnicos y de diseño. Léelos completos antes de empezar a codear.

---

### STACK TECNOLÓGICO

- **Framework:** Next.js 14+ con App Router
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Auth:** Firebase Authentication (Google Sign-In)
- **Base de datos:** Firebase Firestore
- **AI:** API de Anthropic (Claude Haiku) para estructurar playlists en módulos
- **YouTube:** YouTube Data API v3 para obtener datos de playlists
- **Deploy:** Preparado para Vercel
- **Entorno:** WSL (Ubuntu) con Node.js

---

### SETUP INICIAL

1. Crea el proyecto con `npx create-next-app@latest youtube-edu --typescript --tailwind --app --src-dir --eslint`
2. Instala dependencias:
   - `firebase` (auth + firestore)
   - `@anthropic-ai/sdk` (para Claude API)
   - `googleapis` o `youtube-api-search` (para YouTube Data API)
   - `lucide-react` (iconos)
   - `zustand` (state management ligero)
   - `framer-motion` (animaciones para logros y progreso)
3. Crea un archivo `.env.local` con estas variables (el usuario las llenará después):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
YOUTUBE_API_KEY=
ANTHROPIC_API_KEY=
```

4. Configura Firebase en `src/lib/firebase.ts`
5. Configura el cliente de YouTube API en `src/lib/youtube.ts`
6. Configura el cliente de Anthropic en `src/lib/anthropic.ts` (server-side only)

---

### ESTRUCTURA DE CARPETAS

```
src/
├── app/
│   ├── layout.tsx            # Layout principal con providers
│   ├── page.tsx              # Landing / Login
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard con cursos del usuario
│   ├── course/
│   │   └── [courseId]/
│   │       └── page.tsx      # Vista del curso con reproductor
│   └── api/
│       ├── process-playlist/
│       │   └── route.ts      # Endpoint: recibe URL playlist → llama YouTube API → llama Claude → devuelve estructura
│       └── youtube-data/
│           └── route.ts      # Endpoint auxiliar para datos de YouTube
├── components/
│   ├── auth/
│   │   └── LoginButton.tsx
│   ├── course/
│   │   ├── ModuleCard.tsx        # Tarjeta de módulo colapsable
│   │   ├── VideoItem.tsx         # Item de video con checkbox y estado
│   │   ├── VideoPlayer.tsx       # Reproductor embebido con detección de completado
│   │   ├── ProgressBar.tsx       # Barra de progreso general y por módulo
│   │   ├── AchievementBadge.tsx  # Badge de logro desbloqueado
│   │   └── CourseHeader.tsx      # Header del curso con stats
│   ├── dashboard/
│   │   ├── CourseCard.tsx        # Tarjeta de curso en el dashboard
│   │   ├── PlaylistInput.tsx     # Input para pegar URL de playlist
│   │   └── StatsOverview.tsx     # Resumen de estadísticas generales
│   └── ui/
│       ├── Sidebar.tsx
│       ├── Navbar.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useCourseProgress.ts
│   └── useYouTubePlayer.ts
├── lib/
│   ├── firebase.ts
│   ├── youtube.ts
│   ├── anthropic.ts
│   └── types.ts              # Todos los tipos TypeScript
├── stores/
│   └── courseStore.ts         # Zustand store
└── utils/
    ├── achievements.ts        # Lógica de logros
    └── progress.ts            # Cálculos de progreso
```

---

### MODELOS DE DATOS (Firestore)

```typescript
// types.ts

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: timestamp;
}

interface Course {
  id: string;                    // auto-generated
  userId: string;                // owner
  playlistId: string;            // YouTube playlist ID
  playlistUrl: string;           // URL original
  title: string;                 // título de la playlist
  description: string;
  thumbnailUrl: string;
  totalVideos: number;
  totalDuration: string;         // duración total formateada
  modules: Module[];
  isMonothematic: boolean;       // si la AI detectó que es un solo tema
  createdAt: timestamp;
  lastAccessedAt: timestamp;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  videos: Video[];
}

interface Video {
  id: string;                    // YouTube video ID
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;              // ISO 8601 duration
  durationSeconds: number;
  order: number;
  moduleId: string;
}

interface UserProgress {
  id: string;                    // `${userId}_${courseId}`
  userId: string;
  courseId: string;
  completedVideos: string[];     // array de video IDs completados
  videoProgress: {               // progreso parcial por video
    [videoId: string]: {
      watchedSeconds: number;
      percentage: number;
      lastWatchedAt: timestamp;
      completedAt?: timestamp;
      completionMethod: 'auto' | 'manual';  // cómo se marcó completado
    }
  };
  achievements: Achievement[];
  overallPercentage: number;
  startedAt: timestamp;
  lastActivityAt: timestamp;
}

interface Achievement {
  id: string;
  type: AchievementType;
  unlockedAt: timestamp;
  courseId: string;
}

type AchievementType =
  | 'first_video'           // Completó su primer video
  | 'module_complete'       // Completó un módulo
  | 'half_course'           // 50% del curso
  | 'course_complete'       // 100% del curso
  | 'streak_3'              // 3 días seguidos
  | 'streak_7'              // 7 días seguidos
  | 'night_owl'             // Estudió después de las 11pm
  | 'early_bird'            // Estudió antes de las 7am
  | 'speed_learner'         // Completó 5 videos en un día
  | 'dedicated'             // 10 horas totales de estudio
```

---

### FLUJO PRINCIPAL: PROCESAR PLAYLIST

Endpoint `POST /api/process-playlist`:

1. Recibe `{ playlistUrl: string }` del frontend
2. Extrae el playlist ID de la URL (soportar formatos: `youtube.com/playlist?list=XXXXX`, `youtu.be/...?list=XXXXX`)
3. Llama a YouTube Data API:
   - `playlistItems.list` para obtener todos los videos (paginar si hay más de 50)
   - `videos.list` para obtener duración de cada video (el playlistItems no trae duración)
   - `playlists.list` para obtener título y descripción de la playlist
4. Construye un resumen de la playlist con títulos, descripciones y duraciones
5. Envía este resumen a Claude Haiku con el siguiente prompt:

```
Eres un asistente educativo. Te voy a dar los datos de una playlist de YouTube.
Tu trabajo es analizar los videos y organizarlos en módulos lógicos para un curso educativo.

Datos de la playlist:
- Título: {título}
- Descripción: {descripción}
- Videos: {lista con título, descripción y duración de cada video}

Instrucciones:
1. Analiza si la playlist es monotemática (un solo tema) o multitemática (varios temas/secciones).
2. Si es monotemática: crea un solo módulo con todos los videos.
3. Si es multitemática: agrupa los videos en módulos lógicos (capítulos, secciones, áreas temáticas).
4. Dale a cada módulo un nombre descriptivo y una breve descripción.
5. Mantén el orden original de los videos dentro de cada módulo.
6. No cambies el orden global de los videos, solo agrúpalos.

Responde SOLO con un JSON válido con esta estructura:
{
  "isMonothematic": boolean,
  "modules": [
    {
      "id": "mod_1",
      "title": "Nombre del módulo",
      "description": "Breve descripción",
      "videoIndices": [0, 1, 2]  // índices de los videos que pertenecen a este módulo
    }
  ]
}
```

6. Parsea la respuesta de Claude y construye el objeto Course completo
7. Guarda en Firestore y devuelve al frontend

---

### COMPONENTE: VIDEO PLAYER

El componente `VideoPlayer.tsx` debe:

1. **Embeber el video** usando YouTube IFrame API (no un simple iframe, usar la API completa para eventos)
2. **Cargar la YouTube IFrame API** dinámicamente:
   ```javascript
   // Cargar el script de YouTube IFrame API
   const tag = document.createElement('script');
   tag.src = "https://www.youtube.com/iframe_api";
   ```
3. **Detectar cuando el video termina** (`onStateChange` → `YT.PlayerState.ENDED`) y marcar automáticamente como completado con `completionMethod: 'auto'`
4. **Trackear progreso parcial**: cada 10 segundos guardar el tiempo actual del video para poder retomar después
5. **Considerar completado** si el usuario vio el 90% o más del video
6. **Tres opciones visibles para el usuario:**
   - El video embebido (reproduce dentro de la app)
   - Botón "🔗 Ver en YouTube" que abre `https://youtube.com/watch?v={videoId}` en nueva pestaña
   - Checkbox "✅ Marcar como visto" para marcar manualmente con `completionMethod: 'manual'`
7. Si el video ya está completado, mostrar un indicador visual (overlay sutil o badge)

---

### INTERFAZ Y DISEÑO

**Tema visual:** Oscuro (dark mode por defecto), inspirado en plataformas educativas modernas como Platzi/Udemy pero con identidad propia.

**Colores principales:**
- Background: gris muy oscuro (#0f0f0f o similar)
- Cards/Surfaces: gris oscuro (#1a1a2e o similar)
- Acento primario: un color vibrante (verde esmeralda #10b981 o azul eléctrico #3b82f6 — usa el que se vea mejor)
- Progreso: gradiente del color acento
- Texto: blanco y grises claros

**Layout de la vista de curso (la más importante):**

```
┌──────────────────────────────────────────────────────┐
│  NAVBAR: Logo | Nombre del curso | Avatar usuario    │
├──────────────┬───────────────────────────────────────┤
│              │                                       │
│  SIDEBAR     │   VIDEO PLAYER (grande, 16:9)         │
│              │                                       │
│  Módulo 1 ▼  │   ─────────────────────────────────   │
│   ✅ Video 1 │                                       │
│   ▶ Video 2  │   Título del video                    │
│   ○ Video 3  │   Botón "Ver en YouTube"              │
│              │   Checkbox "Marcar como visto"         │
│  Módulo 2 ▼  │                                       │
│   ○ Video 4  │   ─────────────────────────────────   │
│   ○ Video 5  │                                       │
│              │   PROGRESO GENERAL: ████░░░ 45%       │
│  ──────────  │   Módulo 1: ████████░ 66%             │
│  PROGRESO    │   Módulo 2: ░░░░░░░░░ 0%             │
│  GENERAL     │                                       │
│  ████░ 45%   │   LOGROS RECIENTES:                   │
│              │   🏆 Primer video | 🔥 Racha 3 días   │
│              │                                       │
└──────────────┴───────────────────────────────────────┘
```

- El sidebar es colapsable en móvil
- Los módulos se expanden/colapsan con click
- El video activo se resalta en el sidebar
- Videos completados tienen ✅, el actual ▶, pendientes ○
- Transiciones suaves con framer-motion

**Layout del Dashboard:**

```
┌──────────────────────────────────────────────────────┐
│  NAVBAR: Logo | "Mis Cursos" | Avatar usuario        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────────────────────────────────┐     │
│  │  🔗 Pegar URL de playlist de YouTube...     │     │
│  │              [Crear Curso]                   │     │
│  └─────────────────────────────────────────────┘     │
│                                                      │
│  ESTADÍSTICAS:                                       │
│  📚 3 cursos | ✅ 24 videos | ⏱ 12h estudiadas     │
│                                                      │
│  MIS CURSOS:                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Thumb    │  │ Thumb    │  │ Thumb    │          │
│  │ Curso 1  │  │ Curso 2  │  │ Curso 3  │          │
│  │ ████░ 75%│  │ ██░░ 30% │  │ ░░░░ 0%  │          │
│  │ 12 videos│  │ 8 videos │  │ 20 videos│          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Logros — Animación:**
Cuando se desbloquea un logro, mostrar un modal/toast animado con confetti o brillo que aparece por 3-4 segundos y luego se desvanece. Debe sentirse gratificante.

---

### SISTEMA DE LOGROS (detalle)

```typescript
const ACHIEVEMENTS = {
  first_video: {
    title: "Primer Paso",
    description: "Completaste tu primer video",
    icon: "🎬",
    condition: (progress) => progress.completedVideos.length >= 1
  },
  module_complete: {
    title: "Módulo Dominado",
    description: "Completaste un módulo entero",
    icon: "📦",
    condition: (progress, course) => {
      return course.modules.some(module =>
        module.videos.every(v => progress.completedVideos.includes(v.id))
      );
    }
  },
  half_course: {
    title: "A Medio Camino",
    description: "Completaste el 50% del curso",
    icon: "⚡",
    condition: (progress) => progress.overallPercentage >= 50
  },
  course_complete: {
    title: "Graduado",
    description: "¡Completaste el curso entero!",
    icon: "🎓",
    condition: (progress) => progress.overallPercentage >= 100
  },
  streak_3: {
    title: "En Racha",
    description: "3 días seguidos estudiando",
    icon: "🔥",
    condition: (progress) => calculateStreak(progress) >= 3
  },
  streak_7: {
    title: "Imparable",
    description: "7 días seguidos estudiando",
    icon: "💪",
    condition: (progress) => calculateStreak(progress) >= 7
  },
  night_owl: {
    title: "Búho Nocturno",
    description: "Estudiaste después de las 11pm",
    icon: "🦉",
    condition: () => new Date().getHours() >= 23
  },
  early_bird: {
    title: "Madrugador",
    description: "Estudiaste antes de las 7am",
    icon: "🌅",
    condition: () => new Date().getHours() < 7
  },
  speed_learner: {
    title: "Aprendiz Veloz",
    description: "5 videos en un solo día",
    icon: "⚡",
    condition: (progress) => getVideosCompletedToday(progress) >= 5
  },
  dedicated: {
    title: "Dedicación Total",
    description: "10 horas totales de estudio",
    icon: "🏆",
    condition: (progress) => getTotalWatchTime(progress) >= 36000
  }
};
```

Después de cada acción de completar video, ejecutar un check de todos los logros y disparar la animación para cualquier logro nuevo.

---

### MANEJO DE ERRORES

- Si la URL de la playlist no es válida: mostrar error claro "URL no válida, asegúrate de que sea una playlist de YouTube"
- Si la playlist es privada: mostrar "Esta playlist es privada o no existe"
- Si la API de YouTube falla: retry con exponential backoff, máximo 3 intentos
- Si Claude falla al estructurar: usar fallback de un solo módulo con todos los videos en orden
- Si Firebase está offline: usar caché local y sincronizar cuando vuelva la conexión

---

### RESPONSIVE

- Desktop: layout completo como los wireframes de arriba
- Tablet: sidebar se colapsa pero se puede abrir
- Móvil: sidebar oculto con hamburger menu, video ocupa todo el ancho, progreso debajo del video

---

### INSTRUCCIONES FINALES

1. Empieza configurando el proyecto y la estructura de carpetas
2. Implementa auth con Firebase (Google Sign-In)
3. Construye la UI del dashboard y la vista de curso con datos mock/hardcodeados primero
4. Implementa la integración con YouTube API
5. Implementa la llamada a Claude para estructurar módulos
6. Conecta Firestore para persistir progreso
7. Implementa el sistema de logros
8. Agrega animaciones con framer-motion
9. Haz responsive
10. Prueba el flujo completo

Antes de empezar, muéstrame tu plan y pregúntame si tengo dudas. Luego procede paso a paso, mostrándome el código de cada archivo.

## PROMPT FIN

---