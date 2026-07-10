interface Props {
  className?: string;
}

export default function DisclaimerBanner({ className = "" }: Props) {
  return (
    <div className={`bg-paper-2 brutal-border-2 px-4 py-3 ${className}`}>
      <p className="text-sm font-mono text-ink/60 leading-relaxed">
        ⚕️ La información proporcionada es únicamente educativa y no constituye diagnóstico,
        recomendación ni reemplaza la consulta con un profesional de la salud.
        Siempre consultá a tu médico para interpretar tus resultados.
      </p>
    </div>
  );
}
