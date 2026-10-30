import Link from 'next/link';
import { Terminal, ArrowLeft } from 'lucide-react';
import Container from '@/components/layout/Container';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center py-24">
      <Container size="sm" className="text-center">
        <div className="inline-flex p-4 rounded-2xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 mb-6">
          <Terminal className="w-8 h-8" />
        </div>

        <div className="font-mono text-xs text-cyan-400 uppercase tracking-widest mb-2 font-semibold">
          Error 404 // Resource Not Found
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
          System Target Missing
        </h1>

        <p className="text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed font-light">
          The requested route, case study, or research endpoint could not be located in this neural index.
        </p>

        <Button href="/" variant="primary" size="md" icon={ArrowLeft} className="text-xs font-mono">
          Return to Mission Control
        </Button>
      </Container>
    </main>
  );
}
