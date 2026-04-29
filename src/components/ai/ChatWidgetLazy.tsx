"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MessageCircle } from "lucide-react";

const ChatWidget = dynamic(() => import("./ChatWidget"), {
  ssr: false,
  loading: () => null,
});

export default function ChatWidgetLazy({ locale }: { locale?: string }) {
  const [enabled, setEnabled] = useState(false);

  if (enabled) {
    return <ChatWidget locale={locale} initialOpen />;
  }

  return (
    <button
      type="button"
      onClick={() => setEnabled(true)}
      className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 sm:h-16 sm:w-16"
      style={{
        bottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))",
        right: "max(1.5rem, env(safe-area-inset-right, 1.5rem))",
        background:
          "linear-gradient(135deg, #F472B6 0%, #FDA4AF 45%, #FDE68A 100%)",
        boxShadow:
          "0 10px 30px rgba(236, 72, 153, 0.25), 0 2px 10px rgba(0,0,0,0.06)",
      }}
      aria-label="Chat öffnen"
    >
      <MessageCircle className="h-6 w-6 text-white sm:h-7 sm:w-7" />
    </button>
  );
}
