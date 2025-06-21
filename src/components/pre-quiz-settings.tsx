'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { MedicalTopic } from './subject-selector';
import { ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  preparationContext: z.string().min(3, {
    message: 'Please provide some context for your preparation.',
  }).max(100),
  questionType: z.string({
    required_error: 'Please select a question type.',
  }),
  numberOfQuestions: z.number().min(5).max(20),
});

export type PreQuizSettingsData = z.infer<typeof formSchema>;

interface PreQuizSettingsProps {
  topic: MedicalTopic;
  onSubmit: (data: PreQuizSettingsData) => void;
  onBack: () => void;
}

const questionTypes = [
  {
    value: 'Conceptual Understanding',
    title: 'Conceptual',
    description: 'Tests your grasp of underlying principles and relationships.',
  },
  {
    value: 'Factual Recall',
    title: 'Factual Recall',
    description: 'Focuses on specific facts, definitions, and classifications.',
  },
  {
    value: 'Case-based Scenarios',
    title: 'Case-based',
    description: 'Applies knowledge to solve short clinical vignettes.',
  },
];

const questionCountOptions = [5, 10, 15, 20];

export function PreQuizSettings({ topic, onSubmit, onBack }: PreQuizSettingsProps) {
  const form = useForm<PreQuizSettingsData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preparationContext: '',
      questionType: 'Conceptual Understanding',
      numberOfQuestions: 5,
    },
  });

  return (
    <Card className="w-full max-w-2xl animate-in fade-in-50 border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <CardTitle className="text-2xl">Quiz Settings for {topic.name}</CardTitle>
                <CardDescription>Tell us a bit more to personalize your quiz.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="preparationContext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">What are you preparing for?</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., USMLE Step 1, final exams" {...field} />
                  </FormControl>
                  <FormDescription>
                    This helps us tailor the difficulty and style of questions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="questionType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">Preferred Question Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
                    >
                      {questionTypes.map((type) => (
                        <div key={type.value}>
                          <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                          <Label
                            htmlFor={type.value}
                            className={cn(
                              'flex h-full flex-col justify-between rounded-md border-2 border-muted bg-popover p-4 transition-transform hover:-translate-y-1 cursor-pointer',
                              field.value === type.value && 'border-primary'
                            )}
                          >
                            <span className="mb-3 font-bold tracking-tight text-foreground">{type.title}</span>
                            <span className="text-sm text-muted-foreground">{type.description}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="numberOfQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Number of Questions</FormLabel>
                   <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(parseInt(value, 10))}
                      defaultValue={String(field.value)}
                      className="flex flex-wrap items-center gap-4 pt-2"
                    >
                      {questionCountOptions.map((count) => (
                        <FormItem key={count} className="flex items-center space-y-0">
                           <FormControl>
                            <RadioGroupItem value={String(count)} id={`count-${count}`} className="sr-only" />
                          </FormControl>
                          <Label
                            htmlFor={`count-${count}`}
                            className={cn(
                              'flex h-10 cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-popover px-4 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                              field.value === count && 'border-primary'
                            )}
                          >
                            {count}
                          </Label>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Choose how many questions you want in your quiz.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="w-full">
              Generate My Quiz
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
