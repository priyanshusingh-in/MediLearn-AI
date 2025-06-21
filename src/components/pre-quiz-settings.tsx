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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { MedicalTopic } from './subject-selector';
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  preparationContext: z.string().min(3, {
    message: 'Please provide some context for your preparation.',
  }).max(100),
  questionType: z.string({
    required_error: 'Please select a question type.',
  }),
});

export type PreQuizSettingsData = z.infer<typeof formSchema>;

interface PreQuizSettingsProps {
  topic: MedicalTopic;
  onSubmit: (data: PreQuizSettingsData) => void;
  onBack: () => void;
}

export function PreQuizSettings({ topic, onSubmit, onBack }: PreQuizSettingsProps) {
  const form = useForm<PreQuizSettingsData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preparationContext: '',
      questionType: 'Conceptual Understanding',
    },
  });

  return (
    <Card className="w-full max-w-lg animate-in fade-in-50">
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="preparationContext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What are you preparing for?</FormLabel>
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
                <FormItem>
                  <FormLabel>Preferred Question Type</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Conceptual Understanding">Conceptual Understanding</SelectItem>
                      <SelectItem value="Factual Recall">Factual Recall</SelectItem>
                      <SelectItem value="Case-based Scenarios">Case-based Scenarios</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of questions you'd like to focus on.
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
