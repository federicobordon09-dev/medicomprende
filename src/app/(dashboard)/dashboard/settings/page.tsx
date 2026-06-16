"use client";

import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-warm-950">Configuración</h1>
        <p className="text-warm-600 mt-1">Administrá tu cuenta y preferencias.</p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-azul-200/60 space-y-4">
        <h3 className="font-display font-semibold text-lg">Tu cuenta</h3>
        <div className="flex items-center gap-4 pb-4 border-b border-azul-100">
          <div className="w-14 h-14 rounded-full bg-cta-500 flex items-center justify-center text-white text-xl font-bold">
            {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-semibold text-warm-950">{session?.user?.name || "Usuario"}</p>
            <p className="text-sm text-warm-500">{session?.user?.email}</p>
          </div>
        </div>

        <div className="text-sm text-warm-600 space-y-2">
          <div className="flex justify-between py-2">
            <span>Plan actual</span>
            <span className="font-medium text-celeste-600 bg-celeste-50 px-2 py-0.5 rounded-full text-xs">Gratuito</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Próximo paso</span>
            <span className="text-cta-500 font-medium">Próximamente: Plan Pro</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-azul-200/60">
        <h3 className="font-display font-semibold text-lg mb-4">Información legal</h3>
        <div className="space-y-3 text-sm text-warm-600">
          <p>
            MediComprende es una herramienta educativa que utiliza inteligencia artificial
            para ayudar a los pacientes a comprender mejor sus estudios médicos.
          </p>
          <p>
            <strong>No reemplaza la consulta médica.</strong> Toda la información proporcionada
            es únicamente con fines informativos y educativos.
          </p>
          <p>
            Tus datos se almacenan de forma segura y no se comparten con terceros.
            Podés eliminar tu cuenta y todos tus datos en cualquier momento.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-red-200">
        <h3 className="font-display font-semibold text-lg text-red-600 mb-2">Zona de peligro</h3>
        <p className="text-sm text-warm-600 mb-4">
          Estas acciones son irreversibles. Eliminar tu cuenta borrará todos tus estudios, análisis y datos.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (confirm("¿Eliminar todos tus estudios? Esta acción no se puede deshacer.")) {
                // TODO: Implement delete all studies
              }
            }}
            className="bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold px-4 py-2 rounded-xl text-sm transition-all"
          >
            Eliminar todos los estudios
          </button>
          <button
            onClick={() => {
              if (confirm("¿Eliminar tu cuenta? Todos tus datos se perderán permanentemente.")) {
                // TODO: Implement account deletion
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all"
          >
            Eliminar cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
