import Link from "next/link";

interface Props {
  message?: string;
  cta?: string;
}

export default function UpgradeBanner({
  message = "Actualizá a Pro para análisis ilimitados, exportación PDF y chat con IA.",
  cta = "Ver planes",
}: Props) {
  return (
    <div className="bg-accent brutal-border-2 p-4 flex items-center justify-between gap-4">
      <p className="text-sm font-mono text-ink flex-1">{message}</p>
      <Link href="/pricing" className="brutal-btn text-xs flex-shrink-0">
        {cta}
      </Link>
    </div>
  );
}
