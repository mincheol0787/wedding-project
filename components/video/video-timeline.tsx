type TimelineScene = {
  id: string;
  label: string;
  durationMs: number;
};

type VideoTimelineProps = {
  scenes: TimelineScene[];
};

export function VideoTimeline({ scenes }: VideoTimelineProps) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-md border border-ink/10 bg-white p-3">
      {scenes.map((scene) => (
        <div key={scene.id} className="min-w-32 rounded-md bg-porcelain p-3">
          <p className="text-sm font-medium text-ink">{scene.label}</p>
          <p className="mt-1 text-xs text-ink/60">{Math.round(scene.durationMs / 1000)}초</p>
        </div>
      ))}
    </div>
  );
}
