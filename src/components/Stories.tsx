import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateStoryDialog } from "@/components/CreateStoryDialog";
import { ViewStoryDialog } from "@/components/ViewStoryDialog";

interface Story {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  caption: string | null;
  profile: {
    username: string;
    avatar_url: string | null;
  };
}

type DatabaseStory = {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  caption: string | null;
  profile: {
    username: string;
    avatar_url: string | null;
  };
};

export function Stories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data: storiesData, error } = await supabase
        .from("stories_with_profiles")
        .select("*")
        .gt("created_at", twentyFourHoursAgo.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Stories fetch error:", error);
        throw error;
      }

      if (!storiesData) {
        setStories([]);
        return;
      }

      const formatted: Story[] = storiesData.map((story: any) => ({
        id: story.id,
        user_id: story.user_id,
        image_url: story.image_url,
        created_at: story.created_at,
        caption: story.caption,
        profile: {
          username: story.username || "Unknown",
          avatar_url: story.avatar_url || null
        }
      }));

      setStories(formatted);
    } catch (error) {
      console.error("Error fetching stories:", error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryCreated = () => {
    fetchStories();
  };

  if (loading) {
    return <div className="h-24 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="relative py-4">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {user && (
            <CarouselItem className="pl-2 md:pl-4 basis-20">
              <div className="flex flex-col items-center gap-1">
                <CreateStoryDialog onStoryCreated={handleStoryCreated}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-16 w-16 rounded-full relative"
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </CreateStoryDialog>
                <span className="text-xs">Add Story</span>
              </div>
            </CarouselItem>
          )}
          {stories.map((story) => (
            <CarouselItem key={story.id} className="pl-2 md:pl-4 basis-20">
              <ViewStoryDialog story={story}>
                <div className="flex flex-col items-center gap-1 cursor-pointer">
                  <div className="rounded-full bg-gradient-to-br from-primary via-accent to-secondary p-[2px]">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={story.profile.avatar_url || undefined}
                        alt={story.profile.username}
                      />
                      <AvatarFallback>
                        {story.profile.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs truncate w-full text-center">
                    {story.profile.username}
                  </span>
                </div>
              </ViewStoryDialog>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}