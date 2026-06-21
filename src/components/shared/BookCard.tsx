'use client';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { truncate } from '@/lib/utils';
import type { Book } from '@/types';

interface BookCardProps {
  book: Book;
  showAvailability?: boolean;
}

export default function BookCard({ book, showAvailability = true }: BookCardProps) {
  const available = book.availableCopies ?? 0;
  const isAvailable = available > 0;

  return (
    <Link href={`/books/${book.id}`}>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
        <div className="relative h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
          ) : (
            <span className="text-5xl">📖</span>
          )}
          {showAvailability && (
            <div className="absolute top-2 right-2">
              <Badge color={isAvailable ? 'green' : 'red'} size="sm">
                {isAvailable ? `${available} tersedia` : 'Tidak tersedia'}
              </Badge>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-bold text-slate-800 leading-tight mb-0.5">
            {truncate(book.title, 50)}
          </h3>
          <p className="text-xs text-slate-500 mb-2">{truncate(book.author, 35)}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {book.category && (
              <Badge
                color="blue"
                size="sm"
                className="!border-0"
                style={{ backgroundColor: book.category.color + '20', color: book.category.color }}
              >
                {book.category.name}
              </Badge>
            )}
            {book.year && (
              <span className="text-[10px] text-slate-400">{book.year}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
