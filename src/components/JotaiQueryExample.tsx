import { useAtom, useAtomValue } from 'jotai';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  counterAtom,
  userPreferencesAtom,
  retirementDataAtom,
  portfolioAtom,
  retirementProjectionAtom,
} from '@/lib/atoms';

export function JotaiQueryExample() {
  // Simple atom usage
  const [count, setCount] = useAtom(counterAtom);

  // Complex atom with object state
  const [preferences, setPreferences] = useAtom(userPreferencesAtom);

  // Query atoms - these automatically handle loading, error, and data states
  const retirementData = useAtomValue(retirementDataAtom);
  const portfolio = useAtomValue(portfolioAtom);

  // Derived atom that depends on query results
  const projection = useAtomValue(retirementProjectionAtom);

  return (
    <div className='space-y-6 p-4'>
      <Card>
        <CardHeader>
          <CardTitle>Jotai + TanStack Query Integration</CardTitle>
          <CardDescription>
            Examples of using Jotai atoms with TanStack Query for state
            management
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Simple Counter Example */}
          <div className='flex items-center gap-2'>
            <Label>Counter:</Label>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCount((c) => c - 1)}
            >
              -
            </Button>
            <span className='w-8 text-center'>{count}</span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCount((c) => c + 1)}
            >
              +
            </Button>
          </div>

          {/* User Preferences */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <Label htmlFor='currency'>Currency</Label>
              <Select
                value={preferences.currency}
                onValueChange={(value) =>
                  setPreferences((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='USD'>USD</SelectItem>
                  <SelectItem value='EUR'>EUR</SelectItem>
                  <SelectItem value='GBP'>GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='retirement-age'>Retirement Age</Label>
              <Input
                id='retirement-age'
                type='number'
                value={preferences.retirementAge}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    retirementAge: parseInt(e.target.value) || 65,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor='theme'>Theme</Label>
              <Select
                value={preferences.theme}
                onValueChange={(value: 'light' | 'dark') =>
                  setPreferences((prev) => ({ ...prev, theme: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='light'>Light</SelectItem>
                  <SelectItem value='dark'>Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retirement Data Query */}
      <Card>
        <CardHeader>
          <CardTitle>Retirement Data (Query Atom)</CardTitle>
        </CardHeader>
        <CardContent>
          {retirementData.isLoading && <p>Loading retirement data...</p>}
          {retirementData.error && (
            <p className='text-red-500'>
              Error: {retirementData.error.message}
            </p>
          )}
          {retirementData.data && (
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div>
                <Label>Current Savings</Label>
                <p className='text-2xl font-bold'>
                  ${retirementData.data.currentSavings.toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Monthly Contribution</Label>
                <p className='text-2xl font-bold'>
                  ${retirementData.data.monthlyContribution.toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Expected Return</Label>
                <p className='text-2xl font-bold'>
                  {(retirementData.data.expectedReturn * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <Label>Projected Value</Label>
                <p className='text-2xl font-bold'>
                  ${retirementData.data.projectedValue.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Query (depends on preferences) */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio ({preferences.currency})</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio.isLoading && <p>Loading portfolio data...</p>}
          {portfolio.error && (
            <p className='text-red-500'>Error: {portfolio.error.message}</p>
          )}
          {portfolio.data && (
            <div>
              <p className='text-2xl font-bold mb-4'>
                Total: {portfolio.data.currency}{' '}
                {portfolio.data.totalValue.toLocaleString()}
              </p>
              <div className='space-y-2'>
                {portfolio.data.assets.map((asset) => (
                  <div
                    key={asset.name}
                    className='flex justify-between items-center'
                  >
                    <span>{asset.name}</span>
                    <span>
                      {asset.percentage}% - {portfolio.data.currency}{' '}
                      {asset.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Derived Calculation */}
      {projection && (
        <Card>
          <CardHeader>
            <CardTitle>Retirement Projection (Derived Atom)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <Label>Years to Retirement</Label>
                <p className='text-2xl font-bold'>
                  {projection.yearsToRetirement}
                </p>
              </div>
              <div>
                <Label>Projected Value</Label>
                <p className='text-2xl font-bold'>
                  ${projection.projectedValue.toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Monthly Income (4% rule)</Label>
                <p className='text-2xl font-bold'>
                  ${projection.monthlyIncome.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
