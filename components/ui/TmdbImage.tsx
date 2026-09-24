import Image, { type ImageProps } from "next/image";
import { FilmIcon } from "./icons";

type Props = Omit<ImageProps, "src" | "alt"> & {
  path: string | null;
  alt: string;
  /** Rendered when TMDB has no image. */
  fallbackLabel?: string;
};

/** TMDB image via the custom loader (lazy by default), with a graceful placeholder. */
export function TmdbImage({ path, alt, fallbackLabel, className, ...rest }: Props) {
  if (!path) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-2 p-2 text-center text-xs text-muted ${className ?? ""}`}
      >
        <FilmIcon size={22} />
        {fallbackLabel ? <span className="line-clamp-2">{fallbackLabel}</span> : null}
      </div>
    );
  }
  return <Image src={path} alt={alt} className={className} {...rest} />;
}
