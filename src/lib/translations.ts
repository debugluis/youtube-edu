export type Language = "en" | "es";

const translations = {
  en: {
    // Navbar
    "nav.buyMeCoffee": "Buy me a coffee",
    "nav.profile": "Profile",
    "nav.achievements": "Achievements",
    "nav.editProfile": "Edit Profile",
    "nav.language": "Language",
    "nav.feedback": "Report a Bug",
    "nav.privacy": "Privacy Policy",
    "nav.terms": "Terms of Use",
    "nav.deleteAccount": "Delete Account",
    "nav.signOut": "Sign Out",

    // Common
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.confirm": "Confirm",
    "common.loading": "Loading...",
    "common.error": "An error occurred. Please try again.",

    // Profile modal
    "profile.title": "Edit Profile",
    "profile.displayName": "Display Name",
    "profile.displayNamePlaceholder": "Your name",
    "profile.photoURL": "Photo URL",
    "profile.saveError": "Failed to save profile. Please try again.",

    // Account deletion
    "account.deleteTitle": "Delete Account",
    "account.deleteMessage":
      "Are you sure you want to delete your account? This will permanently remove all your courses, progress, and data. This action cannot be undone.",
    "account.deleteConfirm": "Delete Account",
    "account.deleteError": "Failed to delete account. Please try again.",

    // Course deletion
    "course.deleteTitle": "Delete Course",
    "course.deleteMessage":
      "Are you sure you want to delete \"{name}\"? This will remove all your progress. This action cannot be undone.",
    "course.deleteConfirm": "Delete Course",

    // Dashboard
    "dashboard.myCourses": "My Courses",
    "dashboard.noCourses": "No courses yet. Paste a playlist URL above to get started.",
    "dashboard.complete": "complete",

    // Playlist input
    "playlist.createTitle": "Create new course",
    "playlist.createDesc": "Paste a YouTube playlist URL and AI will organize it into modules",
    "playlist.placeholder": "Paste a YouTube playlist URL...",
    "playlist.createButton": "Create Course",
    "playlist.processing": "Processing...",
    "playlist.errorInvalid": "Invalid URL. Make sure it is a YouTube playlist.",
    "playlist.errorPrivate": "This playlist is private or does not exist.",
    "playlist.errorGeneric": "Failed to process playlist. Please try again.",

    // Stats
    "stats.courses": "Courses",
    "stats.videosCompleted": "Videos Completed",
    "stats.studyTime": "Study Time",

    // Landing page
    "landing.howItWorks": "How it works",
    "landing.headline": "Turn any YouTube playlist into a structured course",
    "landing.subheadline":
      "AI organizes your playlists into logical modules. Track your progress with achievements.",
    "landing.step1Title": "Paste a playlist URL",
    "landing.step1Desc": "Copy any public YouTube playlist URL and paste it in your dashboard.",
    "landing.step2Title": "AI organizes it into modules",
    "landing.step2Desc": "Claude AI groups your videos into logical chapters automatically.",
    "landing.step3Title": "Track your progress",
    "landing.step3Desc": "Track every video and stay on course. No more abandoned playlists.",
    "landing.signIn": "Sign in with Google",

    // Course page — video player
    "course.completed": "Completed",
    "course.watched": "Watched",
    "course.markAsWatched": "Mark as watched",
    "course.watchOnYouTube": "Watch on YouTube",
    "course.next": "Next",

    // Course page — header stats
    "course.videos": "{n} videos",
    "course.percentComplete": "{n}% complete",
    "course.videosCompletedOf": "{completed} of {total} videos completed",

    // Course page — misc
    "course.progress": "Progress",
    "course.modules": "Modules",
    "course.achievements": "Achievements",
    "course.noAchievements": "Complete videos to unlock achievements.",
    "course.overallProgress": "Overall Progress",

    // Sidebar
    "sidebar.overallProgress": "Overall Progress",

    // Achievements
    "achievement.unlocked": "Achievement Unlocked",
    "achievement.new": "New",
    "achievement.unlockedOn": "Unlocked {date}",
    "achievement.first_video.title": "First Step",
    "achievement.first_video.description": "Completed your first video",
    "achievement.module_complete.title": "Module Mastered",
    "achievement.module_complete.description": "Completed an entire module",
    "achievement.half_course.title": "Halfway There",
    "achievement.half_course.description": "Completed 50% of the course",
    "achievement.course_complete.title": "Graduate",
    "achievement.course_complete.description": "Completed the entire course!",
    "achievement.streak_3.title": "On a Roll",
    "achievement.streak_3.description": "3 consecutive days studying",
    "achievement.streak_7.title": "Unstoppable",
    "achievement.streak_7.description": "7 consecutive days studying",
    "achievement.night_owl.title": "Night Owl",
    "achievement.night_owl.description": "Studied after 11pm",
    "achievement.early_bird.title": "Early Bird",
    "achievement.early_bird.description": "Studied before 7am",
    "achievement.speed_learner.title": "Speed Learner",
    "achievement.speed_learner.description": "5 videos in a single day",
    "achievement.dedicated.title": "Fully Dedicated",
    "achievement.dedicated.description": "10 total hours of study",

    // 404
    "notFound.title": "Page not found",
    "notFound.message": "The page you are looking for does not exist.",
    "notFound.button": "Go to Dashboard",

    // Footer
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Use",
    "footer.feedback": "Report a Bug",
  },

  es: {
    // Navbar
    "nav.buyMeCoffee": "Invítame un café",
    "nav.profile": "Perfil",
    "nav.achievements": "Logros",
    "nav.editProfile": "Editar Perfil",
    "nav.language": "Idioma",
    "nav.feedback": "Reportar un Bug",
    "nav.privacy": "Política de Privacidad",
    "nav.terms": "Términos de Uso",
    "nav.deleteAccount": "Eliminar Cuenta",
    "nav.signOut": "Cerrar Sesión",

    // Common
    "common.cancel": "Cancelar",
    "common.save": "Guardar",
    "common.delete": "Eliminar",
    "common.confirm": "Confirmar",
    "common.loading": "Cargando...",
    "common.error": "Ocurrió un error. Por favor intenta de nuevo.",

    // Profile modal
    "profile.title": "Editar Perfil",
    "profile.displayName": "Nombre de usuario",
    "profile.displayNamePlaceholder": "Tu nombre",
    "profile.photoURL": "URL de foto",
    "profile.saveError": "Error al guardar el perfil. Por favor intenta de nuevo.",

    // Account deletion
    "account.deleteTitle": "Eliminar Cuenta",
    "account.deleteMessage":
      "¿Estás seguro de que deseas eliminar tu cuenta? Esto eliminará permanentemente todos tus cursos, progreso y datos. Esta acción no se puede deshacer.",
    "account.deleteConfirm": "Eliminar Cuenta",
    "account.deleteError": "Error al eliminar la cuenta. Por favor intenta de nuevo.",

    // Course deletion
    "course.deleteTitle": "Eliminar Curso",
    "course.deleteMessage":
      "¿Estás seguro de que deseas eliminar \"{name}\"? Esto eliminará todo tu progreso. Esta acción no se puede deshacer.",
    "course.deleteConfirm": "Eliminar Curso",

    // Dashboard
    "dashboard.myCourses": "Mis Cursos",
    "dashboard.noCourses": "No tienes cursos aún. Pega una URL de playlist arriba para empezar.",
    "dashboard.complete": "completado",

    // Playlist input
    "playlist.createTitle": "Crear nuevo curso",
    "playlist.createDesc": "Pega una URL de playlist de YouTube y la IA la organizará en módulos",
    "playlist.placeholder": "Pega una URL de playlist de YouTube...",
    "playlist.createButton": "Crear Curso",
    "playlist.processing": "Procesando...",
    "playlist.errorInvalid": "URL inválida. Asegúrate de que sea una playlist de YouTube.",
    "playlist.errorPrivate": "Esta playlist es privada o no existe.",
    "playlist.errorGeneric": "Error al procesar la playlist. Por favor intenta de nuevo.",

    // Stats
    "stats.courses": "Cursos",
    "stats.videosCompleted": "Videos Completados",
    "stats.studyTime": "Tiempo de Estudio",

    // Landing page
    "landing.howItWorks": "Cómo funciona",
    "landing.headline": "Convierte cualquier playlist de YouTube en un curso estructurado",
    "landing.subheadline":
      "La IA organiza tus playlists en módulos lógicos. Sigue tu progreso con logros.",
    "landing.step1Title": "Pega una URL de playlist",
    "landing.step1Desc": "Copia cualquier URL de playlist pública de YouTube y pégala en tu dashboard.",
    "landing.step2Title": "La IA la organiza en módulos",
    "landing.step2Desc": "Claude AI agrupa tus videos en capítulos lógicos automáticamente.",
    "landing.step3Title": "Sigue tu progreso",
    "landing.step3Desc": "Sigue cada video y mantente en curso. Sin más playlists abandonadas.",
    "landing.signIn": "Entrar con Google",

    // Course page — video player
    "course.completed": "Completado",
    "course.watched": "Visto",
    "course.markAsWatched": "Marcar como visto",
    "course.watchOnYouTube": "Ver en YouTube",
    "course.next": "Siguiente",

    // Course page — header stats
    "course.videos": "{n} videos",
    "course.percentComplete": "{n}% completado",
    "course.videosCompletedOf": "{completed} de {total} videos completados",

    // Course page — misc
    "course.progress": "Progreso",
    "course.modules": "Módulos",
    "course.achievements": "Logros",
    "course.noAchievements": "Completa videos para desbloquear logros.",
    "course.overallProgress": "Progreso General",

    // Sidebar
    "sidebar.overallProgress": "Progreso General",

    // Achievements
    "achievement.unlocked": "Logro Desbloqueado",
    "achievement.new": "Nuevo",
    "achievement.unlockedOn": "Desbloqueado el {date}",
    "achievement.first_video.title": "Primer Paso",
    "achievement.first_video.description": "Completaste tu primer video",
    "achievement.module_complete.title": "Módulo Dominado",
    "achievement.module_complete.description": "Completaste un módulo entero",
    "achievement.half_course.title": "A Medio Camino",
    "achievement.half_course.description": "Completaste el 50% del curso",
    "achievement.course_complete.title": "Graduado",
    "achievement.course_complete.description": "¡Completaste el curso entero!",
    "achievement.streak_3.title": "En Racha",
    "achievement.streak_3.description": "3 días consecutivos estudiando",
    "achievement.streak_7.title": "Imparable",
    "achievement.streak_7.description": "7 días consecutivos estudiando",
    "achievement.night_owl.title": "Búho Nocturno",
    "achievement.night_owl.description": "Estudiaste después de las 11pm",
    "achievement.early_bird.title": "Madrugador",
    "achievement.early_bird.description": "Estudiaste antes de las 7am",
    "achievement.speed_learner.title": "Aprendiz Veloz",
    "achievement.speed_learner.description": "5 videos en un solo día",
    "achievement.dedicated.title": "Dedicación Total",
    "achievement.dedicated.description": "10 horas totales de estudio",

    // 404
    "notFound.title": "Página no encontrada",
    "notFound.message": "La página que buscas no existe.",
    "notFound.button": "Ir al Dashboard",

    // Footer
    "footer.privacy": "Política de Privacidad",
    "footer.terms": "Términos de Uso",
    "footer.feedback": "Reportar un Bug",
  },
} as const;

type TranslationKey = keyof (typeof translations)["en"];

export function getTranslation(lang: Language, key: string): string {
  const dict = translations[lang] as Record<string, string>;
  const fallback = translations["en"] as Record<string, string>;
  return dict[key] ?? fallback[key] ?? key;
}

export type { TranslationKey };
export { translations };
