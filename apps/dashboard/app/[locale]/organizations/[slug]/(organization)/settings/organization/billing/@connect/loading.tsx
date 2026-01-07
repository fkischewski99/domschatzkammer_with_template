import * as React from 'react';

import { Skeleton } from '@workspace/ui/components/skeleton';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '@workspace/ui/components/card';

export default function ConnectLoading(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  );
}
