import { Heart, MessageCircle, Share, MoreHorizontal, Pin, Trash2, Flag } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface PostCardProps {
  id: string;
  author?: string; // undefined for anonymous posts
  avatar?: string;
  content: string;
  timestamp: string;
  reactions: number;
  comments: number;
  isLiked?: boolean;
  isPinned?: boolean;
  isAnonymous?: boolean;
  course?: string;
  canPin?: boolean;
  canDelete?: boolean;
  media?: {
    type: "image" | "video" | "document";
    url: string;
    name: string;
  }[];
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

export function PostCard({
  id,
  author,
  avatar,
  content,
  timestamp,
  reactions,
  comments,
  isLiked = false,
  isPinned = false,
  isAnonymous = false,
  course,
  canPin = false,
  canDelete = false,
  media = [],
  onLike,
  onComment,
  onShare,
  onPin,
  onDelete,
  onReport,
}: PostCardProps) {
  const handleLike = () => {
    console.log(`Liking post ${id}`);
    onLike?.();
  };

  const handleComment = () => {
    console.log(`Commenting on post ${id}`);
    onComment?.();
  };

  const handleShare = () => {
    console.log(`Sharing post ${id}`);
    onShare?.();
  };

  const handlePin = () => {
    console.log(`Pinning post ${id}`);
    onPin?.();
  };

  const handleDelete = () => {
    console.log(`Deleting post ${id}`);
    onDelete?.();
  };

  const handleReport = () => {
    console.log(`Reporting post ${id}`);
    onReport?.();
  };

  return (
    <Card 
      className={cn(
        "hover-elevate transition-all duration-200",
        isPinned && "border-primary/50 bg-primary/5"
      )}
      data-testid={`card-post-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isAnonymous ? (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  ?
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatar} alt={author} />
                <AvatarFallback className="text-xs">
                  {author?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm" data-testid={`text-author-${id}`}>
                  {isAnonymous ? "Anonymous" : author}
                </p>
                {isPinned && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground" data-testid={`text-timestamp-${id}`}>
                  {timestamp}
                </p>
                {course && (
                  <Badge variant="outline" className="text-xs">
                    {course}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                data-testid={`button-post-menu-${id}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canPin && (
                <DropdownMenuItem onClick={handlePin}>
                  <Pin className="h-4 w-4 mr-2" />
                  {isPinned ? "Unpin" : "Pin"} Post
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="h-4 w-4 mr-2" />
                Report Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="whitespace-pre-wrap text-sm" data-testid={`text-content-${id}`}>
          {content}
        </div>
        
        {media.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {media.map((item, index) => (
              <div 
                key={index} 
                className="rounded-lg border bg-muted/50 p-3 text-center"
                data-testid={`media-${id}-${index}`}
              >
                <p className="text-xs text-muted-foreground">{item.type.toUpperCase()}</p>
                <p className="text-sm font-medium truncate">{item.name}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "flex items-center gap-1",
                isLiked && "text-red-500 hover:text-red-600"
              )}
              onClick={handleLike}
              data-testid={`button-like-${id}`}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              <span>{reactions}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleComment}
              data-testid={`button-comment-${id}`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{comments}</span>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShare}
            data-testid={`button-share-${id}`}
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
