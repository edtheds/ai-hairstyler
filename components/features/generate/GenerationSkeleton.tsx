import { Skeleton } from "@/components/ui/skeleton";

export function GenerationSkeleton() {
  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="flex gap-2 justify-center">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
      <p className="text-center text-sm text-muted-foreground animate-pulse">
        Generating your hairstyle…
      </p>
    </div>
  );
}
