'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Experience } from '@/types/api';
import { CalendarDays, MapPin, UserRound } from 'lucide-react';

interface ExperienceCardProps {
  experience: Experience;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const router = useRouter();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  const handleOpenDetails = () => {
    router.push(`/experiences/${experience.id}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenDetails();
    }
  };

  const costLabel = experience.experienceCost > 0 ? `$${experience.experienceCost}` : 'Free';
  const imageUrl = experience.expPicture?.media ?? null;
  const shouldShowImage = Boolean(imageUrl) && failedImageUrl !== imageUrl;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleOpenDetails}
      onKeyDown={handleKeyDown}
      className="group cursor-pointer overflow-hidden border-zinc-200/80 py-0 gap-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800"
    >
      <div className="relative h-44 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {shouldShowImage ? (
          <Image
            src={imageUrl as string}
            alt={experience.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
            onError={() => setFailedImageUrl(imageUrl)}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-linear-to-br from-zinc-100 via-zinc-200 to-zinc-300 text-sm font-medium text-zinc-500 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 dark:text-zinc-300">
            No image available
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {costLabel}
        </div>
        {experience.isOnline && (
          <div className="absolute right-3 top-3 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white">
            Online
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1 text-lg">{experience.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="line-clamp-2 min-h-10 text-sm text-zinc-600 dark:text-zinc-300">
          {experience.description || 'No description available.'}
        </p>

        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
            <span className="line-clamp-1">{experience.location || experience.address || 'Location not provided'}</span>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
            <span className="line-clamp-1">{formatDate(experience.experienceStartDateTime)}</span>
          </div>
          <div className="flex items-start gap-2">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
            <span className="mb-5 line-clamp-1">{experience.userDetail?.userName || `Owner #${experience.experienceOwnerId}`}</span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
