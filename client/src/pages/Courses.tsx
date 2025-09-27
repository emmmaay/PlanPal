import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Filter, Plus, Settings, Users, BookOpen, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/CourseCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCourseSchema, type CreateCourseRequest, type SelectCourse } from "@shared/schema";
import { z } from "zod";

// Create course form schema
const createCourseFormSchema = createCourseSchema;
type CreateCourseFormData = z.infer<typeof createCourseFormSchema>;

// Course creation dialog component
function CreateCourseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const form = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseFormSchema),
    defaultValues: {
      name: '',
      description: '',
      lecturer: '',
      courseRep: '',
      supabaseUrl: '',
      supabaseAnonKey: '',
      supabaseServiceKey: '',
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: CreateCourseFormData) => {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create course');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({ title: 'Course created successfully!' });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to create course', 
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    },
  });

  const onSubmit = (data: CreateCourseFormData) => {
    createCourseMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Create a new course with its own database. Course reps will provide their Supabase credentials.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Computer Science 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Course description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lecturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lecturer</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="courseRep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Representative</FormLabel>
                    <FormControl>
                      <Input placeholder="Alice Johnson" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="border p-4 rounded-lg bg-muted/20">
              <h4 className="font-semibold mb-3">Supabase Database Credentials</h4>
              <p className="text-sm text-muted-foreground mb-4">
                The course rep should provide their Supabase project credentials for course-specific data.
              </p>
              
              <FormField
                control={form.control}
                name="supabaseUrl"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Supabase URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-project.supabase.co" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="supabaseAnonKey"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Supabase Anon Key</FormLabel>
                    <FormControl>
                      <Input placeholder="eyJ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="supabaseServiceKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supabase Service Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="eyJ..." {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be stored securely and used for course data management.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCourseMutation.isPending}>
                {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Courses() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery<SelectCourse[]>({
    queryKey: ['/api/courses'],
    enabled: !!user,
  });
  
  // Check if user can create courses (creator or top admin)
  const canCreateCourses = user?.isCreator || false; // TODO: Check for top_admin role
  
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.lecturer || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // TODO: Add filtering by assignments when we have per-course data
    return matchesSearch;
  });
  
  const totalPendingAssignments = 0; // TODO: Calculate from per-course assignment data

  return (
    <div className="space-y-6" data-testid="page-courses">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-courses-title">
              My Courses
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your enrolled courses and track progress.
            </p>
          </div>
          {canCreateCourses && (
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              data-testid="button-add-course"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          )}
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="text-sm">
          {courses.length} Total Courses
        </Badge>
        <Badge variant="destructive" className="text-sm">
          {totalPendingAssignments} Pending Assignments
        </Badge>
      </div>
      
      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses or lecturers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-courses"
          />
        </div>
        
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-48" data-testid="select-filter-courses">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="pending">With Pending Work</SelectItem>
            <SelectItem value="completed">Up to Date</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Courses Grid */}
      {coursesLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            {searchTerm ? 'No courses found' : 'No courses available yet'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm ? `Try adjusting your search for "${searchTerm}"` : 
             canCreateCourses ? 'Create your first course to get started' : 'Contact your admin to get enrolled in courses'}
          </p>
          {canCreateCourses && !searchTerm && (
            <Button 
              className="mt-4" 
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Course
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              id={course.id}
              title={course.name}
              lecturer={course.lecturer || 'TBA'}
              courseRep={course.courseRep || 'TBA'}
              description={course.description || ''}
              assignmentCount={0} // TODO: Get from course-specific DB
              pendingAssignments={0} // TODO: Get from course-specific DB
              studentsCount={0} // TODO: Get from course memberships
              nextDeadline="TBA" // TODO: Get from course-specific DB
              onClick={() => console.log(`Opening course ${course.id}`)}
            />
          ))}
        </div>
      )}
      
      {/* Course Creation Dialog */}
      <CreateCourseDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
}