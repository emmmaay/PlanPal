import { Calendar, Clock, User, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  id: string;
  title: string;
  lecturer: string;
  courseRep: string;
  assignmentCount: number;
  pendingAssignments: number;
  studentsCount: number;
  nextDeadline?: string;
  description?: string;
  onClick?: () => void;
}

export function CourseCard({
  id,
  title,
  lecturer,
  courseRep,
  assignmentCount,
  pendingAssignments,
  studentsCount,
  nextDeadline,
  description,
  onClick,
}: CourseCardProps) {
  const handleClick = () => {
    console.log(`Navigating to course ${id}`);
    onClick?.();
  };

  return (
    <Card 
      className="hover-elevate cursor-pointer transition-all duration-200" 
      onClick={handleClick}
      data-testid={`card-course-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate" data-testid={`text-course-title-${id}`}>
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          {pendingAssignments > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pendingAssignments} due
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Lecturer</p>
              <p className="text-sm font-medium truncate" data-testid={`text-lecturer-${id}`}>
                {lecturer}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Course Rep</p>
              <p className="text-sm font-medium truncate" data-testid={`text-course-rep-${id}`}>
                {courseRep}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {assignmentCount} assignments
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {studentsCount} students
            </span>
          </div>
          
          {nextDeadline && (
            <div className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400">
              <Clock className="h-3 w-3" />
              <span data-testid={`text-next-deadline-${id}`}>{nextDeadline}</span>
            </div>
          )}
        </div>
        
        <Button 
          className="w-full" 
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          data-testid={`button-view-course-${id}`}
        >
          View Course
        </Button>
      </CardContent>
    </Card>
  );
}
