import type { SVGProps } from "react";

export function UvaniLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="currentColor">
        <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z" />
        <path d="M168 64H88a8 8 0 0 0 0 16h32v80a40 40 0 0 0 80 0v-8a8 8 0 0 0-16 0v8a24 24 0 0 1-48 0V80h32a8 8 0 0 0 0-16Z" />
      </g>
    </svg>
  );
}
