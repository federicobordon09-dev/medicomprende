export const site = {
  name: "MediComprende",
  tagline: "Tu informe médico, en palabras que entendés.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export const nav = {
  links: [
    { href: "/", label: "Inicio" },
  ],
};

export const hero = {
  badge: "Sin costo • Confidencial • IA de Google",
  title: "Subí tu informe médico y <em>enterate qué dice</em>",
  subtitle: "Dejá que la IA traduzca cada término, hallazgo y resultado a lenguaje simple. Sin vueltas, sin alarmas, sin necesidad de ser médico.",
  uploadText: "Elegí tu PDF o arrastralo acá",
  uploadHint: "Solo PDF con texto seleccionable (máx 10 MB)",
  cta: "Analizar informe",
  ctaReset: "Analizar otro informe",
  formats: ".pdf",
};

export const loading = {
  title: "Analizando tu informe…",
  subtitle: "Estamos traduciendo cada término médico para que lo entiendas al toque.",
  steps: ["Leyendo el PDF", "Identificando hallazgos", "Traduciendo términos", "Preparando resultados"],
};

export const error = {
  title: "Algo salió mal",
  message: "No pudimos procesar tu informe. Verificá que sea un PDF con texto seleccionable e intentá de nuevo.",
  retry: "Intentar de nuevo",
};

export const result = {
  summaryTitle: "Resumen de tu informe",
  findingsTitle: "Hallazgos principales",
  termsTitle: "Términos médicos",
};

export const comoFunciona = {
  eyebrow: "Cómo funciona",
  title: "Tres pasos, cero complicación",
  subtitle: "Sin instalar nada. Solo subís, analizamos y entendés.",
  steps: [
    {
      number: 1,
      icon: "upload",
      title: "Subí tu PDF",
      desc: "Elegí o arrastrá tu informe de resonancia, tomografía, análisis de sangre o cualquier estudio médico.",
    },
    {
      number: 2,
      icon: "sparkles",
      title: "Analizamos con IA",
      desc: "Gemini de Google traduce cada término y hallazgo a lenguaje cotidiano en segundos.",
    },
    {
      number: 3,
      icon: "check",
      title: "Entendé todo",
      desc: "Leé tu informe como si te lo explicara un amigo. Simple, claro, sin alarmismo.",
    },
  ],
};

export const tiposInformes = {
  eyebrow: "Tipos de informes",
  title: "Funciona con cualquier estudio",
  subtitle: "Resonancias, tomografías, análisis clínicos y más.",
  tipos: [
    { icon: "brain", name: "Resonancia magnética (RMN)" },
    { icon: "bone", name: "Tomografía computada (TC)" },
    { icon: "droplet", name: "Análisis de sangre" },
    { icon: "heart", name: "Electrocardiograma" },
    { icon: "microscope", name: "Estudios de laboratorio" },
    { icon: "file", name: "Epicrisis e informes clínicos" },
  ],
};

export const preguntas = [
  {
    pregunta: "¿Cómo sabés que mi informe es confidencial?",
    respuesta: "Tu informe se procesa al instante en la memoria del servidor y se descarta automáticamente. No lo guardamos, no lo almacenamos, no lo compartimos. Es como una conversación privada que olvidamos al terminar.",
  },
  {
    pregunta: "¿Esto reemplaza una consulta médica?",
    respuesta: "No, para nada. MediComprende es una herramienta educativa que te ayuda a entender tu informe, pero no reemplaza la opinión, el diagnóstico ni el seguimiento de un profesional de la salud. Siempre consultá a tu médico.",
  },
  {
    pregunta: "¿Funciona con cualquier PDF médico?",
    respuesta: "Funciona con informes digitales que tengan texto seleccionable. Si tu PDF es una foto escaneada, esta versión no puede leerlo. Asegurate de que puedas seleccionar texto con el cursor.",
  },
  {
    pregunta: "¿Qué tan preciso es el análisis?",
    respuesta: "Usamos Gemini de Google, inteligencia artificial de última generación entrenada para interpretar lenguaje médico. Es muy precisa, pero puede tener errores. Siempre verificá la información con tu médico.",
  },
  {
    pregunta: "¿Tiene algún costo?",
    respuesta: "MediComprende tiene un plan gratuito con 3 análisis por mes. Si necesitás más, tenemos el plan Pro por $3.000 ARS/mes con análisis ilimitados, exportación PDF e historial completo. Sin permanencia, cancelás cuando quieras.",
  },
  {
    pregunta: "¿Qué incluye el plan Pro?",
    respuesta: "El plan Pro incluye análisis ilimitados, comparaciones ilimitadas, historial completo sin límite de estudios, exportación de análisis en PDF, y un modelo de IA premium para análisis más rápidos y detallados.",
  },
  {
    pregunta: "¿Cómo pago el plan Pro?",
    respuesta: "A través de Mercado Pago con tarjeta de crédito, débito o en efectivo. El pago es mensual y podés cancelar cuando quieras desde la configuración de tu cuenta.",
  },
];

export const disclaimer = {
  text: "La información proporcionada por MediComprende es únicamente educativa y no constituye diagnóstico, recomendación ni reemplaza la consulta con un profesional de la salud. Siempre consultá a tu médico para interpretar tus resultados.",
};

export const footer = {
  brand: "MediComprende",
  tagline: "Haciendo la información médica más accesible para todos.",
  copyright: "Todos los derechos reservados.",
};

export const notFound = {
  code: "404",
  title: "Página no encontrada",
  subtitle: "Esta página no existe o fue movida.",
  message: "Parece que te perdiste. Volvé al inicio para analizar tu informe.",
  cta: "Volver al inicio",
};

export const testimonials = [
  {
    text: "Por fin entendí qué decía mi resonancia. Nunca pensé que fuera tan sencillo.",
    name: "Carolina M.",
    role: "Paciente",
    rating: 5,
  },
  {
    text: "Lo usé con el informe de mi papá. Ahora sabemos qué preguntarle al médico.",
    name: "Andrés F.",
    role: "Familiar",
    rating: 5,
  },
  {
    text: "Soy médica y lo recomiendo. Ayuda muchísimo a que los pacientes lleguen a la consulta con preguntas concretas.",
    name: "Dra. Laura G.",
    role: "Médica clínica",
    rating: 5,
  },
];

export const planes = {
  eyebrow: "Planes",
  title: "Empezá gratis, escalá cuando quieras",
  subtitle: "Sin compromiso, cancelás cuando quieras.",
  planes: [
    {
      name: "Gratuito",
      price: "$0",
      period: "/mes",
      description: "Perfecto para probar y usar ocasionalmente.",
      features: [
        "3 análisis por mes",
        "2 comparaciones por mes",
        "10 estudios guardados",
        "Chat con IA (limitado)",
        "Modelo Gemini Flash-Lite",
        "1 perfil familiar",
        "Alertas básicas",
      ],
      cta: "Empezar gratis",
      href: "/register",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$3.000",
      period: "/mes",
      description: "Para quienes necesitan análisis frecuentes.",
      features: [
        "Análisis ilimitados",
        "Comparaciones ilimitadas",
        "Estudios ilimitados",
        "Exportación PDF",
        "Modelo Gemini Flash",
        "Perfiles familiares ilimitados",
        "Alertas avanzadas",
        "Chat con IA ilimitado",
        "Prioridad en procesamiento",
      ],
      cta: "Actualizar a Pro",
      href: "/pricing",
      highlighted: true,
    },
  ],
};
