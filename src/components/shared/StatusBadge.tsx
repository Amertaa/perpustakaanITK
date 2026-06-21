import Badge from '@/components/ui/Badge';
import {
  BookingStatusLabel, BookingStatusColor,
  BorrowingStatusLabel, BorrowingStatusColor,
  CopyStatusLabel, CopyStatusColor,
  FineStatusLabel, FineStatusColor,
} from '@/lib/utils';
import type { BookingStatus, BorrowingStatus, CopyStatus, FineStatus } from '@/types';

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const color = BookingStatusColor[status] as 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  return <Badge color={color} dot>{BookingStatusLabel[status]}</Badge>;
}

export function BorrowingStatusBadge({ status }: { status: BorrowingStatus }) {
  const color = BorrowingStatusColor[status] as 'blue' | 'green' | 'red' | 'gray';
  return <Badge color={color} dot>{BorrowingStatusLabel[status]}</Badge>;
}

export function CopyStatusBadge({ status }: { status: CopyStatus }) {
  const color = CopyStatusColor[status] as 'green' | 'yellow' | 'blue' | 'orange' | 'red';
  return <Badge color={color} dot>{CopyStatusLabel[status]}</Badge>;
}

export function FineStatusBadge({ status }: { status: FineStatus }) {
  const color = FineStatusColor[status] as 'red' | 'green' | 'blue';
  return <Badge color={color} dot>{FineStatusLabel[status]}</Badge>;
}
