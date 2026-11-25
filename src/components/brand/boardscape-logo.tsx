import { cn } from "@/lib/utils";

interface BoardscapeMarkProps {
  variant?: "white" | "dark";
  className?: string;
}

/**
 * Cropped, transparent-background boardscape logo mark using the exact
 * uploaded brand asset (`logo-white.png` on dark, `logo-dark.png` on light).
 */
export function BoardscapeMark({
  variant = "white",
  className,
}: BoardscapeMarkProps) {
  const src =
    variant === "dark" ? "/images/logo-dark.png" : "/images/logo-white.png";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={cn("h-8 w-auto shrink-0 object-contain", className)}
    />
  );
}
