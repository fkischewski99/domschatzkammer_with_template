'use client';

import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';

interface Guide {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface EventGuideBadgeProps {
  guide: Guide | null;
  size?: 'sm' | 'md';
  className?: string;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function EventGuideBadge({
  guide,
  size = 'sm',
  className,
}: EventGuideBadgeProps): React.JSX.Element | null {
  if (!guide) return null;

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className={cn(sizeClasses[size], className)}>
            {guide.image && <AvatarImage src={guide.image} alt={guide.name || ''} />}
            <AvatarFallback className="text-xs">{getInitials(guide.name)}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{guide.name || guide.email}</p>
          {guide.name && <p className="text-xs text-muted-foreground">{guide.email}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
