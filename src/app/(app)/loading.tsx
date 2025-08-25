export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div className="relative h-24 w-24">
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>
            {`
            .thread {
                stroke: hsl(var(--accent));
                stroke-width: 2;
                stroke-dasharray: 200;
                stroke-dashoffset: 200;
                animation: draw-thread 2s ease-in-out infinite;
            }
            .needle {
                fill: hsl(var(--primary));
                transform-origin: 50% 50%;
                animation: bob-needle 2s ease-in-out infinite;
            }
            @keyframes draw-thread {
                0% { stroke-dashoffset: 400; }
                50% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: -400; }
            }
            @keyframes bob-needle {
                0% { transform: translateY(0px) rotate(45deg); }
                50% { transform: translateY(-15px) rotate(45deg); }
                100% { transform: translateY(0px) rotate(45deg); }
            }
            `}
          </style>
          <path
            className="thread"
            d="M5 90 Q 25 20, 45 60 T 85 20"
            fill="none"
          />
          <path
            className="needle"
            d="M85 20 L95 10 L80 5 L70 15 Z"
          />
        </svg>
        <p className="absolute bottom-0 w-full text-center font-headline text-lg text-primary">
          Uvani
        </p>
      </div>
    </div>
  );
}
