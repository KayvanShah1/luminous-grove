interface StatusPillProps {
  nodeCount: number;
}

const StatusPill = ({ nodeCount }: StatusPillProps) => {
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 status-pill flex items-center gap-2 sm:gap-4 text-muted-foreground text-[10px] sm:text-xs">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse-glow" />
        <span className="hidden sm:inline">System: Active</span>
        <span className="sm:hidden">Active</span>
      </div>
      <div className="h-3 w-px bg-border" />
      <span>Nodes: <span className="text-foreground/80 tabular-nums">{nodeCount.toLocaleString()}</span></span>
    </div>
  );
};

export default StatusPill;
