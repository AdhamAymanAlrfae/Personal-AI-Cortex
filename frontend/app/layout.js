import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { personalInfo } from '@/data/personal';

export const metadata = {
  metadataBase: new URL('https://adhamalrefai.dev'),
  title: {
    default: `${personalInfo.name} | Adham AI Cortex — RAG & Agentic Chat`,
    template: `%s | ${personalInfo.name}`,
  },
  description:
    'Chat with Adham AI Cortex powered by Retrieval-Augmented Generation — trained on projects, experience, skills, and research.',
  keywords: [
    'Adham Alrefai',
    'AI Engineer',
    'RAG',
    'Retrieval-Augmented Generation',
    'AI Agents',
    'LLM',
    'Chat AI',
    'Biomedical Engineer',
    'Machine Learning',
    'Deep Learning',
    'Healthcare AI',
    'LangChain',
    'LangGraph',
    'Vector Search',
    'FastAPI',
    'Next.js',
  ],
  authors: [{ name: personalInfo.name, url: 'https://adhamalrefai.dev' }],
  creator: personalInfo.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://adhamalrefai.dev',
    title: `${personalInfo.name} | Adham AI Cortex — RAG & Agentic Chat`,
    description:
      'Chat with Adham AI Cortex powered by RAG — ask about projects, skills, and experience.',
    siteName: `${personalInfo.name} Adham AI Cortex`,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${personalInfo.name} | Adham AI Cortex — RAG & Agentic Chat`,
    description:
      'Chat with Adham AI Cortex powered by RAG — ask about projects, skills, and experience.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        {/* Prevent buggy browser extension crashes from triggering Next.js dev overlay */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(e) {
                  if (e.filename && e.filename.indexOf('chrome-extension://') !== -1) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                });
                window.addEventListener('unhandledrejection', function(e) {
                  var reason = e.reason;
                  if (reason && reason.stack && reason.stack.indexOf('chrome-extension://') !== -1) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="bg-background text-slate-100 min-h-screen flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 antialiased overflow-x-hidden">
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
