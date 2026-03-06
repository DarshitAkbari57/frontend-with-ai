'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CalendarDays, MapPin, UsersRound, Clock3, QrCode, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExperience } from '@/hooks/useExperience';
import { useExperienceTickets } from '@/hooks/useExperienceTickets';
import type { Experience } from '@/types/api';
import type { ExperienceTicketApiItem } from '@/services/ticketService';

type ActivityBucket = {
  groupActivities?: unknown;
  myActivities?: unknown;
};

type ExperienceRecord = Experience & Record<string, unknown>;

type ActivityViewModel = {
  key: string;
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
  isOnline: boolean;
  source: 'group' | 'my';
  invitationStatus?: string;
  picture?: string;
};

type InviteeViewModel = {
  key: string;
  userName: string;
  invitationStatus: string;
  inviteType: string | undefined;
  avatar: string | undefined;
};

type FunctionViewModel = {
  key: string;
  name: string;
  media: string | undefined;
  isDefault: boolean;
};

type CollaboratorViewModel = {
  key: string;
  collaboratorId: string;
  role: string;
  adminId: string | undefined;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function ensureArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function toBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return undefined;
}

function uniqueByKey<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];

  for (const item of items) {
    const key = getKey(item);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(item);
  }

  return unique;
}

function formatDateTime(dateString?: string) {
  if (!dateString) {
    return 'Date unavailable';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatDateOnly(dateString?: string) {
  if (!dateString) {
    return 'Date unavailable';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatDateRange(start?: string, end?: string) {
  const startDate = formatDateOnly(start);
  const endDate = formatDateOnly(end);

  if (startDate === 'Date unavailable' && endDate === 'Date unavailable') {
    return 'Date unavailable';
  }

  if (startDate === endDate) {
    return startDate;
  }

  return `${startDate} - ${endDate}`;
}

function resolveMedia(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  return asNonEmptyString(value.media);
}

function normalizeActivityItem(
  source: unknown,
  activitySource: 'group' | 'my',
  fallbackStart?: string,
  fallbackEnd?: string
): ActivityViewModel | null {
  if (!isRecord(source)) {
    return null;
  }

  const title =
    asNonEmptyString(source.activityName) ??
    asNonEmptyString(source.name) ??
    asNonEmptyString(source.title);
  if (!title) {
    return null;
  }

  const start =
    asNonEmptyString(source.activityStartDateTime) ??
    asNonEmptyString(source.startDateTime) ??
    asNonEmptyString(source.startTime) ??
    fallbackStart ??
    '';
  const end =
    asNonEmptyString(source.activityEndDateTime) ??
    asNonEmptyString(source.endDateTime) ??
    asNonEmptyString(source.endTime) ??
    fallbackEnd ??
    '';
  const description =
    asNonEmptyString(source.description) ??
    asNonEmptyString(source.desc) ??
    'No description available.';
  const location =
    asNonEmptyString(source.activityLocation) ??
    asNonEmptyString(source.location) ??
    asNonEmptyString(source.address) ??
    'Location unavailable';
  const isOnline = toBoolean(source.isOnline) ?? false;
  const invitationStatus = isRecord(source.status)
    ? asNonEmptyString(source.status.invitationStatus)
    : undefined;
  const picture = resolveMedia(source.activityPicture);
  const idLike = source.id ?? source.activityId ?? source.sequenceNumber;
  const key = idLike !== undefined ? String(idLike) : `${activitySource}-${title}-${start}-${location}`;

  return {
    key,
    title,
    description,
    location,
    start,
    end,
    isOnline,
    source: activitySource,
    invitationStatus,
    picture,
  };
}

function normalizeActivities(experience: Experience): { group: ActivityViewModel[]; my: ActivityViewModel[] } {
  const rawActivities = (experience as ExperienceRecord).activities;
  const group: ActivityViewModel[] = [];
  const my: ActivityViewModel[] = [];

  if (Array.isArray(rawActivities)) {
    rawActivities.forEach((item) => {
      const normalized = normalizeActivityItem(item, 'my');
      if (normalized) {
        my.push(normalized);
      }
    });
    return { group, my: uniqueByKey(my, (entry) => entry.key) };
  }

  if (!isRecord(rawActivities)) {
    return { group, my };
  }

  const bucket = rawActivities as ActivityBucket & Record<string, unknown>;
  const groupActivities = ensureArray(bucket.groupActivities);
  const myActivities = ensureArray(bucket.myActivities);

  groupActivities.forEach((groupEntry) => {
    if (!isRecord(groupEntry)) {
      return;
    }

    const fallbackStart = asNonEmptyString(groupEntry.startTime);
    const fallbackEnd = asNonEmptyString(groupEntry.endTime);
    const nestedActivities = ensureArray(groupEntry.activity);

    if (nestedActivities.length > 0) {
      nestedActivities.forEach((activity) => {
        const normalized = normalizeActivityItem(activity, 'group', fallbackStart, fallbackEnd);
        if (normalized) {
          group.push(normalized);
        }
      });
      return;
    }

    const normalized = normalizeActivityItem(groupEntry, 'group', fallbackStart, fallbackEnd);
    if (normalized) {
      group.push(normalized);
    }
  });

  myActivities.forEach((entry) => {
    const normalized = normalizeActivityItem(entry, 'my');
    if (normalized) {
      my.push(normalized);
    }
  });

  return {
    group: uniqueByKey(group, (entry) => entry.key),
    my: uniqueByKey(my, (entry) => entry.key),
  };
}

function normalizeInvitees(experience: Experience): InviteeViewModel[] {
  const invites = ensureArray((experience as ExperienceRecord).inviteDetails);

  const normalized = invites
    .map((entry, index) => {
      if (!isRecord(entry)) {
        return null;
      }

      const inviteUser =
        (isRecord(entry.InviteUserDetails) && entry.InviteUserDetails) ||
        (isRecord(entry.hostInviteUserDetails) && entry.hostInviteUserDetails) ||
        entry;

      const userName =
        asNonEmptyString((inviteUser as Record<string, unknown>).userName) ??
        asNonEmptyString(entry.userName) ??
        `User #${toFiniteNumber((inviteUser as Record<string, unknown>).id ?? entry.guest ?? entry.host ?? index + 1) ?? index + 1}`;
      const invitationStatus = asNonEmptyString(entry.invitationStatus) ?? 'UNKNOWN';
      const inviteType = asNonEmptyString(entry.inviteType);
      const avatar =
        resolveMedia((inviteUser as Record<string, unknown>).profilePicture) ??
        resolveMedia(entry.profilePicture);
      const key = String(entry.id ?? (inviteUser as Record<string, unknown>).id ?? `${index}-${userName}`);

      return {
        key,
        userName,
        invitationStatus,
        inviteType,
        avatar,
      };
    })
    .filter((entry): entry is InviteeViewModel => Boolean(entry));

  return uniqueByKey(normalized, (entry) => entry.key);
}

function normalizeFunctions(experience: Experience): FunctionViewModel[] {
  const functions = ensureArray((experience as ExperienceRecord).functions);

  return functions
    .map((entry, index) => {
      if (!isRecord(entry)) {
        return null;
      }

      const name = asNonEmptyString(entry.name) ?? `Function ${index + 1}`;
      const media = asNonEmptyString(entry.media);
      const isDefault = toBoolean(entry.default) ?? false;

      return {
        key: `${name}-${index}`,
        name,
        media,
        isDefault,
      };
    })
    .filter((entry): entry is FunctionViewModel => Boolean(entry));
}

function normalizeCollaborators(experience: Experience): CollaboratorViewModel[] {
  const collaborators = ensureArray((experience as ExperienceRecord).collaborators);

  return collaborators
    .map((entry, index) => {
      if (!isRecord(entry)) {
        return null;
      }

      const collaboratorId = String(entry.collaboratorId ?? entry.id ?? `N/A-${index}`);
      const role = asNonEmptyString(entry.collaboratorRole) ?? 'UNKNOWN';
      const adminId =
        entry.adminId !== undefined && entry.adminId !== null
          ? String(entry.adminId)
          : undefined;

      return {
        key: `${collaboratorId}-${index}`,
        collaboratorId,
        role,
        adminId,
      };
    })
    .filter((entry): entry is CollaboratorViewModel => Boolean(entry));
}

function normalizeTicketsFromApi(tickets: ExperienceTicketApiItem[]): ExperienceTicketApiItem[] {
  return uniqueByKey(
    tickets.filter((ticket) => Number.isFinite(ticket.id)),
    (ticket) => String(ticket.id)
  );
}

function resolveTicketTitle(ticket: ExperienceTicketApiItem): string {
  return asNonEmptyString(ticket.title) ?? 'Ticket';
}

function resolveTicketDescription(ticket: ExperienceTicketApiItem): string {
  return asNonEmptyString(ticket.description) ?? 'No description available.';
}

function resolveTicketIdentifier(ticket: ExperienceTicketApiItem): string {
  return String(ticket.id);
}

function resolveTicketDate(ticket: ExperienceTicketApiItem): string {
  const raw = asNonEmptyString(ticket.ticketDate) ?? asNonEmptyString(ticket.createdAt);
  return formatDateTime(raw);
}

function resolveTicketQrMedia(_ticket: ExperienceTicketApiItem): string | undefined {
  void _ticket;
  return undefined;
}

function resolveTicketBrand(experience: Experience): string {
  const title = asNonEmptyString(experience.title) ?? 'invi';
  const first = title.split(' ')[0] || 'invi';
  return first.slice(0, 10);
}

function renderTicketKey(ticket: ExperienceTicketApiItem): string {
  return String(ticket.id);
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-medium text-zinc-800 dark:text-zinc-100">{value}</span>
    </div>
  );
}

export default function ExperienceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const experienceId = Number(params?.id);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const [descriptionExtraLines, setDescriptionExtraLines] = useState(0);
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);
  const { data: experience, isLoading, error } = useExperience(
    Number.isFinite(experienceId) ? experienceId : undefined
  );
  const {
    data: ticketApiResponse,
    isLoading: isTicketsLoading,
    error: ticketsError,
  } = useExperienceTickets(Number.isFinite(experienceId) ? experienceId : undefined);
  const experienceRecord = (experience ?? ({} as Experience)) as ExperienceRecord;
  const activities = useMemo(
    () => (experience ? normalizeActivities(experience) : { group: [], my: [] }),
    [experience]
  );
  const ticketsFromApi = useMemo(() => ticketApiResponse?.data ?? [], [ticketApiResponse]);
  const tickets = useMemo(
    () => normalizeTicketsFromApi(ticketsFromApi),
    [ticketsFromApi]
  );
  const invitees = useMemo(() => (experience ? normalizeInvitees(experience) : []), [experience]);
  const features = useMemo(() => (experience ? normalizeFunctions(experience) : []), [experience]);
  const collaborators = useMemo(
    () => (experience ? normalizeCollaborators(experience) : []),
    [experience]
  );

  const isTicketEnabled = toBoolean(experienceRecord.isTicket) ?? tickets.length > 0;
  const canCreateActivity = toBoolean(experienceRecord.canCreateActivity) ?? false;
  const isAdmin = toBoolean(experienceRecord.isAdmin) ?? Boolean(experience?.isAdmin);
  const isPurchased = toBoolean(experienceRecord.isPurchased) ?? Boolean(experience?.isPurchased);
  const myInvitationStatus = asNonEmptyString(experienceRecord.myInvitationStatus) ?? 'UNKNOWN';
  const contentCount = ensureArray(experienceRecord.contentList).length;
  const taskCount = ensureArray(experienceRecord.experienceTaskList).length;
  const userRequestCount = toFiniteNumber(experienceRecord.userRequestCount) ?? 0;
  const chatRoomId = toFiniteNumber(experienceRecord.chatRoomId);

  const imageUrl = experience?.expPicture?.media ?? null;
  const shouldShowImage = Boolean(imageUrl) && failedImageUrl !== imageUrl;
  const baseImageHeightPx = 384;
  const lineHeightPx = 24;
  const minImageHeightPx = 336;
  const imageHeightPx = Math.max(minImageHeightPx, baseImageHeightPx - (descriptionExtraLines * lineHeightPx));

  useEffect(() => {
    const descriptionNode = descriptionRef.current;
    if (!descriptionNode) {
      return;
    }

    const updateDescriptionLines = () => {
      const computedLineHeight = Number.parseFloat(window.getComputedStyle(descriptionNode).lineHeight);
      if (!Number.isFinite(computedLineHeight) || computedLineHeight <= 0) {
        setDescriptionExtraLines(descriptionNode.scrollHeight > descriptionNode.clientHeight ? 1 : 0);
        return;
      }

      const lines = Math.max(1, Math.round(descriptionNode.scrollHeight / computedLineHeight));
      setDescriptionExtraLines(Math.max(0, lines - 1));
    };

    const frameId = window.requestAnimationFrame(updateDescriptionLines);

    const resizeObserver = new ResizeObserver(updateDescriptionLines);
    resizeObserver.observe(descriptionNode);
    window.addEventListener('resize', updateDescriptionLines);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDescriptionLines);
    };
  }, [experience?.description]);

  const handleBackToExperiences = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/experiences');
  };

  if (!Number.isFinite(experienceId)) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Invalid experience ID</h1>
        <Button asChild variant="outline">
          <Link href="/experiences">Back to experiences</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="h-80 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-32 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
        <h1 className="text-xl font-semibold text-red-700 dark:text-red-200">Failed to load experience</h1>
        <p className="text-sm text-red-600 dark:text-red-300">
          {error?.message || 'The experience could not be loaded from backend.'}
        </p>
        <Button asChild variant="outline">
          <Link href="/experiences">Back to experiences</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleBackToExperiences}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to experiences
        </Button>
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="h-full overflow-hidden border-zinc-200/80 pt-0 dark:border-zinc-800">
          <div
            className="relative w-full bg-zinc-100 transition-[height] duration-300 dark:bg-zinc-900"
            style={{ height: `${imageHeightPx}px` }}
          >
            {shouldShowImage ? (
              <Image
                src={imageUrl as string}
                alt={experience.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 70vw"
                unoptimized
                onError={() => setFailedImageUrl(imageUrl)}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-linear-to-br from-zinc-100 via-zinc-200 to-zinc-300 text-sm font-medium text-zinc-500 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 dark:text-zinc-300">
                No cover image available
              </div>
            )}
          </div>
          <CardHeader>
            <CardTitle className="text-3xl tracking-tight">{experience.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">
              {formatDateRange(experience.experienceStartDateTime, experience.experienceEndDateTime)}
            </p>
            <p ref={descriptionRef} className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              {experience.description || 'No description available.'}
            </p>

            <div className="grid gap-3 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
              <div className=" flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <CalendarDays className="h-4 w-4 text-zinc-500" />
                <span>{formatDateTime(experience.experienceStartDateTime)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <Clock3 className="h-4 w-4 text-zinc-500" />
                <span>{formatDateTime(experience.experienceEndDateTime)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <MapPin className="h-4 w-4 text-zinc-500" />
                <span className="line-clamp-1">{experience.location || experience.address || 'Location unavailable'}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <UsersRound className="h-4 w-4 text-zinc-500" />
                <span>{invitees.length} attendee(s)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-zinc-200/80 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Owner" value={experience.userDetail?.userName || `#${experience.experienceOwnerId}`} />
              <InfoRow label="Control" value={experience.controlBy} />
              <InfoRow label="Price" value={experience.experienceCost > 0 ? `$${experience.experienceCost}` : 'Free'} />
              <InfoRow label="Likes" value={String(experience.likeCount)} />
              <InfoRow label="Comments" value={String(experience.commentCount)} />
              <InfoRow label="Reports" value={String(experience.reportCount)} />
              <InfoRow label="Room" value={chatRoomId ? String(chatRoomId) : 'N/A'} />
            </CardContent>
          </Card>

          <Card className="border-zinc-200/80 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Permissions & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="My status" value={myInvitationStatus} />
              <InfoRow label="Can create activity" value={canCreateActivity ? 'Yes' : 'No'} />
              <InfoRow label="Is admin" value={isAdmin ? 'Yes' : 'No'} />
              <InfoRow label="Is purchased" value={isPurchased ? 'Yes' : 'No'} />
              <InfoRow label="Contents" value={String(contentCount)} />
              <InfoRow label="Tasks" value={String(taskCount)} />
              <InfoRow label="User requests" value={String(userRequestCount)} />
            </CardContent>
          </Card>

        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-zinc-200/80 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Attendees</CardTitle>
            </CardHeader>
            <CardContent>
              {invitees.length > 0 ? (
                <div className="space-y-3">
                  {invitees.map((invitee) => (
                    <div
                      key={invitee.key}
                      className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-zinc-300 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-700">
                        {invitee.avatar ? (
                          <Image src={invitee.avatar} alt={invitee.userName} fill sizes="40px" className="object-cover" unoptimized />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                            {invitee.userName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{invitee.userName}</p>
                        <p className="text-xs text-zinc-500">
                          {invitee.invitationStatus}
                          {invitee.inviteType ? ` - ${invitee.inviteType}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No invite details available.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-200/80 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Functions</CardTitle>
            </CardHeader>
            <CardContent>
              {features.length > 0 ? (
                <div className="space-y-3">
                  {features.map((feature) => (
                    <div
                      key={feature.key}
                      className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="relative h-9 w-9 overflow-hidden rounded-md border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                        {feature.media ? (
                          <Image src={feature.media} alt={feature.name} fill sizes="36px" className="object-cover" unoptimized />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShieldCheck className="h-4 w-4 text-zinc-500" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{feature.name}</p>
                        <p className="text-xs text-zinc-500">{feature.isDefault ? 'Default' : 'Custom'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No functions returned by backend.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="min-h-64 border-zinc-200/80 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Collaborators</CardTitle>
          </CardHeader>
          <CardContent>
            {collaborators.length > 0 ? (
              <div className="space-y-3">
                {collaborators.map((entry) => (
                  <div
                    key={entry.key}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <p className="font-medium">User #{entry.collaboratorId}</p>
                    <p className="text-xs text-zinc-500">Role: {entry.role}</p>
                    {entry.adminId ? <p className="text-xs text-zinc-500">Admin #{entry.adminId}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No collaborators available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200/80 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Group activities</h3>
              {activities.group.length > 0 ? (
                <div className="space-y-3">
                  {activities.group.map((activity) => (
                    <div
                      key={`group-${activity.key}`}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex gap-3">
                        <div className="relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-md border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800">
                          {activity.picture ? (
                            <Image src={activity.picture} alt={activity.title} fill sizes="40px" className="object-cover" unoptimized />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-500">
                              <CalendarDays className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{activity.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-300">{activity.description}</p>
                          <p className="mt-2 text-xs text-zinc-500">
                            {formatDateTime(activity.start)} - {formatDateTime(activity.end)}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">{activity.isOnline ? 'Online activity' : activity.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No group activities.</p>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">My activities</h3>
              {activities.my.length > 0 ? (
                <div className="space-y-3">
                  {activities.my.map((activity) => (
                    <div
                      key={`my-${activity.key}`}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <p className="font-medium">{activity.title}</p>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{activity.description}</p>
                      <p className="mt-2 text-xs text-zinc-500">
                        {formatDateTime(activity.start)} - {formatDateTime(activity.end)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {activity.isOnline ? 'Online activity' : activity.location}
                        {activity.invitationStatus ? ` - ${activity.invitationStatus}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No personal activities.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <article
                    key={renderTicketKey(ticket)}
                    className="relative mx-auto w-full max-w-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900"
                  >
                    <div className="grid min-h-36 grid-cols-[52px_1fr_66px] grid-rows-[1fr_auto]">
                      <div className="relative row-span-2 flex items-center justify-center bg-[#8CAFB7] px-1 text-center">
                        <span className="absolute -left-5 -top-5 h-10 w-10 rounded-full bg-white dark:bg-zinc-950" />
                        <span className="absolute -left-5 -bottom-5 h-10 w-10 rounded-full bg-white dark:bg-zinc-950" />
                        <span className="[writing-mode:vertical-rl] rotate-180 text-base font-medium text-white/90">
                          {resolveTicketBrand(experience)}
                        </span>
                      </div>

                      <div className="border-x-2 border-t-2 border-black dark:border-zinc-100">
                        <div className="px-3 py-1.5 text-center text-lg font-medium text-rose-500">
                          {resolveTicketTitle(ticket)}
                        </div>
                        <div className="grid grid-cols-[56px_1fr] gap-3 p-3">
                          <div className="flex h-14 w-14 items-center justify-center text-zinc-900 dark:text-zinc-100">
                            {resolveTicketQrMedia(ticket) ? (
                              <Image
                                src={resolveTicketQrMedia(ticket) as string}
                                alt="Ticket QR"
                                width={48}
                                height={48}
                                className="h-12 w-12 object-contain"
                                unoptimized
                              />
                            ) : (
                              <QrCode className="h-12 w-12" />
                            )}
                          </div>
                          <p className="line-clamp-3 text-sm leading-5 text-zinc-900 dark:text-zinc-100">
                            {resolveTicketDescription(ticket)}
                          </p>
                        </div>
                      </div>

                      <div className="relative row-span-2 flex items-center justify-center gap-1 bg-[#ff3b4a] px-1 text-center text-white">
                        <span className="absolute -right-5 -top-5 h-10 w-10 rounded-full bg-white dark:bg-zinc-950" />
                        <span className="absolute -right-5 -bottom-5 h-10 w-10 rounded-full bg-white dark:bg-zinc-950" />
                        <span className="[writing-mode:vertical-rl] rotate-180 text-lg leading-none font-semibold tracking-wide text-black">
                          Ticket
                        </span>
                        <span className="[writing-mode:vertical-rl] rotate-180 text-base leading-none font-light">
                          ID {resolveTicketIdentifier(ticket)}
                        </span>
                      </div>

                      <div className="border-x-2 border-y-2 border-black px-4 py-2 text-sm font-medium text-zinc-900 dark:border-zinc-100 dark:text-zinc-100">
                        {resolveTicketDate(ticket)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : isTicketsLoading ? (
              <p className="text-sm text-zinc-500">Loading tickets...</p>
            ) : (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {isTicketEnabled
                    ? 'Ticketing is enabled, but this API response does not include ticket objects yet.'
                    : 'No tickets available for this experience.'}
                </p>
                {ticketsError ? (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    Ticket API error: {ticketsError.message}
                  </p>
                ) : null}
                {isTicketEnabled ? (
                  <p className="mt-2 text-xs text-zinc-500">
                    Source: `GET /ticket/getallticket/:experienceId` only.
                  </p>
                ) : null}
              </div>
            )}

           
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
