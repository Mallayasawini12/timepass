import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Story {
  id: string;
  image_url: string;
  created_at: string;
  profile: {
    username: string;
    avatar_url: string | null;
  };
}

interface ViewStoryDialogProps {
  children: React.ReactNode;
  story: Story;
}

export function ViewStoryDialog({ children, story }: ViewStoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-0">
        <div className="relative bg-black h-[80vh]">
          {/* Story Header */}
          <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={story.profile.avatar_url || undefined}
                  alt={story.profile.username}
                />
                <AvatarFallback>
                  {story.profile.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-white font-medium">
                {story.profile.username}
              </span>
              <span className="text-white/70 text-sm">
                {new Date(story.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Story Image */}
          <img
            src={story.image_url}
            alt="Story"
            className="w-full h-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}