import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Experience } from '@/types/api';

interface ExperienceCardProps {
  experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate">{experience.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-600 line-clamp-2">{experience.description}</p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="truncate">{experience.location || 'No location'}</span>
          <span>
            {experience.experienceCost === 0 ? 'Free' : `$${experience.experienceCost}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
