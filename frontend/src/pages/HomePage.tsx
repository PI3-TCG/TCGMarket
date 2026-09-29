import { healthCheck } from '@/services/api';

export function HomePage() {
  const apiUrl = import.meta.env.VITE_API_URL
  const testApi = async () => {
    try {
      const healthStatus = await healthCheck();
      console.log('Status da API:', healthStatus);
      alert(`Status da API: ${JSON.stringify(healthStatus)}`);
    } catch (error) {
      console.error('Erro ao verificar a saúde da API:', error);
      alert('Erro ao verificar a saúde da API. Verifique o console para mais detalhes.');
    }
};
  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm font-medium tracking-wide text-amber-400">TCC</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Trading Card Change
        </h1>
        <p className="mt-4 leading-relaxed text-slate-300">
          Front-end pronto para o desenvolvimento. Esta página confirma que
          React, TypeScript, Vite e Tailwind estão funcionando.
        </p>
        <p className="mt-6 text-sm text-slate-400">
          API:{' '}
          <code className="rounded bg-slate-800 px-2 py-1 text-amber-200">
            {apiUrl}
          </code>
        </p>
        <button onClick={testApi} className="mt-6 inline-block rounded bg-amber-400 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-500">
          Testar API
        </button>
      </section>
    </main>
  )
}
