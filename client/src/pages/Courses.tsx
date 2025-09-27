import { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/CourseCard";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data - todo: remove mock functionality
const mockCourses = [
  {
    id: "cs101",
    title: "Data Structures & Algorithms",
    lecturer: "Dr. John Smith",
    courseRep: "Alice Johnson",
    assignmentCount: 8,
    pendingAssignments: 2,
    studentsCount: 45,
    nextDeadline: "Dec 15",
    description: "Learn fundamental data structures and algorithms essential for computer science.",
  },
  {
    id: "cs102",
    title: "Object-Oriented Programming",
    lecturer: "Prof. Sarah Wilson",
    courseRep: "Bob Chen",
    assignmentCount: 6,
    pendingAssignments: 1,
    studentsCount: 52,
    nextDeadline: "Dec 18",
    description: "Master OOP concepts with Java and design patterns.",
  },
  {
    id: "cs103",
    title: "Database Systems",
    lecturer: "Dr. Michael Brown",
    courseRep: "Carol Davis",
    assignmentCount: 5,
    pendingAssignments: 0,
    studentsCount: 38,
    description: "Database design, SQL, and modern database technologies.",
  },
  {
    id: "cs104",
    title: "Computer Networks",
    lecturer: "Prof. David Lee",
    courseRep: "Eva Martinez",
    assignmentCount: 4,
    pendingAssignments: 1,
    studentsCount: 41,
    nextDeadline: "Dec 25",
    description: "Understanding network protocols, architecture, and security.",
  },
  {
    id: "cs105",
    title: "Software Engineering",
    lecturer: "Dr. Linda Garcia",
    courseRep: "Frank Wilson",
    assignmentCount: 7,
    pendingAssignments: 3,
    studentsCount: 48,
    nextDeadline: "Dec 12",
    description: "Software development lifecycle, testing, and project management.",
  },
  {
    id: "cs106",
    title: "Operating Systems",
    lecturer: "Prof. Robert Taylor",
    courseRep: "Grace Kim",
    assignmentCount: 6,
    pendingAssignments: 0,
    studentsCount: 35,
    description: "Process management, memory management, and system calls.",
  },
];

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  
  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.lecturer.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === "pending") {
      return matchesSearch && course.pendingAssignments > 0;
    }
    if (filterBy === "completed") {
      return matchesSearch && course.pendingAssignments === 0;
    }
    return matchesSearch;
  });
  
  const totalPendingAssignments = mockCourses.reduce((total, course) => total + course.pendingAssignments, 0);

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
          <Button data-testid="button-add-course">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="text-sm">
          {mockCourses.length} Total Courses
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
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No courses found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm ? `Try adjusting your search for "${searchTerm}"` : "Check your filter settings"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              {...course}
              onClick={() => console.log(`Opening course ${course.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
