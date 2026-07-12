export default function ForbiddenPage() {
  return (
    <main className="min-h-screen grid place-items-center p-6 text-slate-800">
      <div className="max-w-xl rounded-[2rem] border border-rose-200 bg-white p-8 text-center shadow-[0_20px_70px_-20px_rgba(244,63,94,0.25)]">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-rose-600">403 Forbidden</p>
        <h1 className="mt-3 text-3xl font-black text-cyan-950">Access denied</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Your session does not carry the required role or permission for this route.
        </p>
      </div>
    </main>
  );
}
