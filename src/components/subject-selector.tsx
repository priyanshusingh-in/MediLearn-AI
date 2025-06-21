'use client';

import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-accent">
              <topic.icon className="h-8 w-8 text-primary transition-colors duration-300 group-hover:text-accent-foreground" />
            </div>
            <CardTitle className="text-base font-semibold text-foreground">
              {topic.name}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
