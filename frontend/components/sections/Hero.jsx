'use client';

import ChatWindow from '@/components/chat/ChatWindow';

export default function Hero() {
  return (
    <section className="relative w-full h-full flex-1 overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-cyan-500/[0.04] rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[350px] bg-violet-500/[0.04] rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-tech-grid opacity-15 pointer-events-none -z-10" />

      <div className="relative z-10 flex-1 flex flex-col h-full w-full max-w-5xl mx-auto">
        <ChatWindow />
      </div>
    </section>
  );
}
