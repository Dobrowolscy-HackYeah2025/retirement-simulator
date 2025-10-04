import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { JotaiQueryExample } from '@/components/JotaiQueryExample';

// Sample data fetching function
const fetchWelcomeMessage = async (): Promise<string> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return 'Welcome to your Retirement Simulator!';
};

function Index() {
  const {
    data: welcomeMessage,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['welcome'],
    queryFn: fetchWelcomeMessage,
  });

  return (
    <div className='p-2'>
      <Card className='max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle>Retirement Simulator</CardTitle>
          <CardDescription>
            Plan your financial future with our comprehensive retirement
            planning tool
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading welcome message...</p>}
          {error && (
            <p className='text-red-500'>Error loading welcome message</p>
          )}
          {welcomeMessage && (
            <div className='space-y-4'>
              <h2 className='text-xl font-semibold'>{welcomeMessage}</h2>
              <p className='text-muted-foreground'>
                This is your home page. Start planning your retirement by
                exploring the features available.
              </p>
              <Button>Get Started</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jotai + TanStack Query Integration Example */}
      <JotaiQueryExample />
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: Index,
});
