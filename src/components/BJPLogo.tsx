"use client";

import Image from "next/image";

interface BJPLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BJPLogo({ size = "md", className = "" }: BJPLogoProps) {
  const sizes = {
    sm: { width: 56, height: 56 },
    md: { width: 80, height: 80 },
    lg: { width: 120, height: 120 },
  };

  return (
    <Image
      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/f7cd043f-2f0b-4500-a548-677ae12f25de/BJP-logo-resized-1768839563341.webp?width=8000&height=8000&resize=contain"
      alt="BJP Logo"
      width={sizes[size].width}
      height={sizes[size].height}
      className={`object-contain ${className}`}
      unoptimized
    />
  );
}

export function LeaderCard({
  name,
  title,
  imageUrl,
}: {
  name: string;
  title: string;
  imageUrl: string;
}) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#FF6B00]/50 group-hover:border-[#FF6B00] transition-colors mb-2">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover object-top"
          unoptimized
        />
      </div>
      <p className="text-white font-semibold text-sm">{name}</p>
      <p className="text-white/60 text-xs">{title}</p>
    </div>
  );
}

export const LEADERS = {
  modi: {
    name: "Shri Narendra Modi",
    title: "Prime Minister of India",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Narendra_Modi_2021.jpg/440px-Narendra_Modi_2021.jpg",
  },
  fadnavis: {
    name: "Shri Devendra Fadnavis",
    title: "Chief Minister, Maharashtra",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Devendra_Fadnavis_in_2024.jpg/440px-Devendra_Fadnavis_in_2024.jpg",
  },
  chavan: {
    name: "Shri Ravindra Chavan",
    title: "BJP State President, Maharashtra",
    imageUrl: "https://pbs.twimg.com/profile_images/1539474547927891968/CfT8Y3hf_400x400.jpg",
  },
};
