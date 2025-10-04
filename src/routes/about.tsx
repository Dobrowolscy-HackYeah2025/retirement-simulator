import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { createFileRoute } from '@tanstack/react-router';

function About() {
  return (
    <div className="p-2">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>About Retirement Simulator</CardTitle>
          <CardDescription>
            Learn more about our retirement planning application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              The Retirement Simulator is a comprehensive tool designed to help
              you plan and visualize your financial future.
            </p>
            <p>Features include:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Investment portfolio tracking</li>
              <li>Retirement savings projections</li>
              <li>Expense planning and budgeting</li>
              <li>Social Security benefit calculations</li>
              <li>Tax-efficient withdrawal strategies</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Built with React, TanStack Router, and TanStack Query for a
              modern, responsive experience.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/about')({
  component: About,
});
