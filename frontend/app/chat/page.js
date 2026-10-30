import ChatWindow from '@/components/chat/ChatWindow';

export const metadata = {
  title: 'Adham AI Cortex Chat',
  description:
    'Chat directly with Adham AI Cortex — RAG-powered answers with source citations.',
};

export default function ChatPage() {
  return (
    <main className="flex-1 flex flex-col h-[calc(100dvh-4rem)] max-w-5xl mx-auto w-full overflow-hidden">
      <ChatWindow />
    </main>
  );
}
