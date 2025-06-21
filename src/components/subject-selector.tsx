'use client';

import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export interface MedicalTopic {
  name: string;
  icon: LucideIcon;
  dataHint: string;
}

interface SubjectSelectorProps {
  topics: MedicalTopic[];
  selectedTopic: MedicalTopic | null;
  onTopicSelect: (topic: MedicalTopic) => void;
}

export function SubjectSelector({
  topics,
  selectedTopic,
  onTopicSelect,
}: SubjectSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-12">
      {topics.map((topic) => (
        <Card
          key={topic.name}
          onClick={() => onTopicSelect(topic)}
          className={cn(
            'cursor-pointer transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-xl group',
            selectedTopic?.name === topic.name
              ? 'border-accent ring-2 ring-accent shadow-lg'
              : 'border-border'
          )}
        >
          <CardHeader className="flex flex-col items-center justify-center p-4 text-center">
            <div className="relative h-24 w-full mb-2 overflow-hidden rounded-md">
                 <Image
                    src={`https://placehold.co/400x300.png`}
                    alt={topic.name}
                    data-ai-hint={topic.dataHint}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
            </div>
            <CardTitle className="text-base font-semibold text-foreground mt-2">
              {topic.name}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
