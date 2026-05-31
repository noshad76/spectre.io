"use client";

import {
  Send,
  Smile,
  Coffee,
  Rocket,
  Gamepad2,
  Music,
  Camera,
  Cloud,
  Zap,
  Headphones,
  Bot,
  Star,
  Heart,
  Sparkles,
  Bell,
} from "lucide-react";

export function DoodlePatternDark() {
  return (
    <svg
      width="100%"
      height="100%"
      className="absolute opacity-10 inset-0 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="telegram-doodle-dark"
          width="300"
          height="300"
          patternUnits="userSpaceOnUse"
        >
          <g
            stroke="#6b7280" // رنگ خاکستری ملایم‌تر برای تم دارک
            strokeWidth="1.2"
            strokeOpacity="0.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Send
              width="24"
              height="24"
              x="30"
              y="0"
              transform="rotate(-15 42 52)"
            />
            <Smile
              width="22"
              height="22"
              x="180"
              y="0"
              transform="rotate(10 191 41)"
            />
            <Bot
              width="20"
              height="20"
              x="120"
              y="220"
              transform="rotate(-5 130 230)"
            />

            <Coffee
              width="20"
              height="20"
              x="240"
              y="80"
              transform="rotate(20 250 90)"
            />
            <Gamepad2
              width="26"
              height="26"
              x="70"
              y="150"
              transform="rotate(-10 83 163)"
            />
            <Headphones
              width="22"
              height="22"
              x="220"
              y="180"
              transform="rotate(15 231 191)"
            />
            <Music
              width="18"
              height="18"
              x="130"
              y="100"
              transform="rotate(-20 139 109)"
            />

            <Rocket
              width="24"
              height="24"
              x="40"
              y="240"
              transform="rotate(45 52 252)"
            />
            <Camera
              width="20"
              height="20"
              x="260"
              y="240"
              transform="rotate(-15 270 250)"
            />
            <Cloud
              width="24"
              height="24"
              x="90"
              y="20"
              transform="rotate(5 102 32)"
            />
            <Zap
              width="18"
              height="18"
              x="180"
              y="120"
              transform="rotate(10 189 129)"
            />
            <Rocket
              width="24"
              height="24"
              x="30"
              y="80"
              transform="rotate(-5 22 122)"
            />

            <Sparkles
              width="20"
              height="20"
              x="152"
              y="62"
              transform="rotate(15 160 70)"
            />
            <Star
              width="22"
              height="22"
              x="43"
              y="183"
              transform="rotate(-15 50 190)"
            />
            <Heart
              width="18"
              height="18"
              x="203"
              y="253"
              transform="rotate(20 210 260)"
            />
            <Bell
              width="21"
              height="21"
              x="272"
              y="132"
              transform="rotate(-10 280 140)"
            />

            <path d="M 100 180 L 106 186 M 106 180 L 100 186" />
            <path d="M 270 40 L 274 44 M 274 40 L 270 44" />
          </g>
        </pattern>
      </defs>

      {/* اعمال الگو روی کل صفحه */}
      <rect width="100%" height="100%" fill="url(#telegram-doodle-dark)" />
    </svg>
  );
}
