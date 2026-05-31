export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center  px-6">
      <div className="max-w-2xl text-center space-y-8">
        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-display tracking-tight">
            Ephemeral <span className="text-primary">Realtime</span> <br />
            Communication
          </h1>
          <p className="text-body-soft max-w-lg mx-auto">
            Spectre.io provides secure, temporary chat rooms that vanish without
            a trace. Created for developers, built for privacy.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
          <div className="surface-card p-6 text-left">
            <h3 className="text-title-3 mb-2">Room TTL</h3>
            <p className="text-caption">
              Set lifetimes from 1 to 24 hours. Rooms auto-destruct upon
              expiration.
            </p>
          </div>
          <div className="surface-card p-6 text-left">
            <h3 className="text-title-3 mb-2">Realtime Sync</h3>
            <p className="text-caption">
              Low latency socket communication with optimistic UI updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
