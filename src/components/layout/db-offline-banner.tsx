type DbOfflineBannerProps = {
  message?: string;
};

export function DbOfflineBanner({
  message = "Database is offline — you are signed in, but entries cannot load until PostgreSQL is running.",
}: DbOfflineBannerProps) {
  return (
    <p className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-sm leading-relaxed text-amber-950/90">
      {message}
    </p>
  );
}
