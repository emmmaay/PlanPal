import { Calendar, CheckCircle, Clock, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AssignmentCardProps {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  description?: string;
  isCompleted?: boolean;
  priority: "low" | "medium" | "high";
  submissionType?: string;
  onClick?: () => void;
  onToggleComplete?: () => void;
}

export function AssignmentCard({
  id,
  title,
  course,
  dueDate,
  description,
  isCompleted = false,
  priority,
  submissionType = "Document",
  onClick,
  onToggleComplete,
}: AssignmentCardProps) {
  const getPriorityColor = () => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-orange-600 dark:text-orange-400";
      default:
        return "text-green-600 dark:text-green-400";
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4" />;
      case "medium":
        return <Clock className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const handleClick = () => {
    console.log(`Opening assignment ${id}`);
    onClick?.();
  };

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Toggling completion for assignment ${id}`);
    onToggleComplete?.();
  };

  return (
    <Card 
      className={cn(
        "hover-elevate cursor-pointer transition-all duration-200",
        isCompleted && "opacity-75"
      )}
      onClick={handleClick}
      data-testid={`card-assignment-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className={cn(
              "text-lg font-semibold truncate",
              isCompleted && "line-through text-muted-foreground"
            )} data-testid={`text-assignment-title-${id}`}>
              {title}
            </CardTitle>
            <p className="text-sm text-primary font-medium mt-1" data-testid={`text-assignment-course-${id}`}>
              {course}
            </p>
            {description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <div className={cn("flex items-center gap-1", getPriorityColor())}>
              {getPriorityIcon()}
              <span className="text-xs font-medium capitalize">{priority}</span>
            </div>
            {isCompleted && (
              <Badge variant="secondary" className="text-green-600">
                Completed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Due: <span data-testid={`text-due-date-${id}`}>{dueDate}</span>
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {submissionType}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            variant={isCompleted ? "outline" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            data-testid={`button-view-assignment-${id}`}
          >
            {isCompleted ? "Review" : "Start Assignment"}
          </Button>
          
          <Button 
            variant={isCompleted ? "default" : "outline"}
            onClick={handleToggleComplete}
            data-testid={`button-toggle-complete-${id}`}
          >
            {isCompleted ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
