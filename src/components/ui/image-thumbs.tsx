type ImageThumbsProps = {
  images: string[];
  max?: number;
};

export function ImageThumbs({ images, max = 4 }: ImageThumbsProps) {
  if (!images || images.length === 0) {
    return null;
  }

  const shown = images.slice(0, max);
  const extra = images.length - shown.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {shown.map((src, index) => (
        <div
          key={`${index}-${src.slice(0, 32)}`}
          className="h-14 w-20 overflow-hidden rounded-md border border-border/60 bg-muted/30"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-full w-full object-cover" />
        </div>
      ))}
      {extra > 0 ? (
        <span className="text-xs text-muted-foreground">+{extra}</span>
      ) : null}
    </div>
  );
}
