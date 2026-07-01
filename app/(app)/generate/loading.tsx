import { Skeleton } from "@/components/ui/skeleton";

export default function GenerateLoading() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Skeleton className="h-52 w-full rounded-lg" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <div className="flex items-center justify-center">
          <Skeleton className="aspect-square w-full max-w-sm rounded-lg" />
        </div>
      </div>
    </main>
  );
}
