import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthYear } from "../utils/dateUtils";

interface WeekNavigationProps {
  weekDays: Date[];
  appointmentCount: number;
  loading: boolean;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

export function WeekNavigation({
  weekDays,
  appointmentCount,
  loading,
  onPreviousWeek,
  onNextWeek,
  onToday,
}: WeekNavigationProps) {
  // Use the middle of the week (Wednesday) to determine the month/year
  const monthYearDate = weekDays[3]; // Wednesday (index 3)

  return (
    <Card className="rounded-b-none border-b-0">
      <CardContent className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onPreviousWeek}
                className="rounded-r-none border-r-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onNextWeek}
                className="rounded-l-none"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={onToday}>
              Today
            </Button>
            <div className="text-lg font-semibold ml-3">
              {formatMonthYear(monthYearDate)}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {loading ? '...' : appointmentCount} appointment{appointmentCount !== 1 ? 's' : ''} this week
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
