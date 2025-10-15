import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Image, Loader2, Upload, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface CreateStoryDialogProps {
  children: React.ReactNode;
  onStoryCreated: () => void;
}

export function CreateStoryDialog({
  children,
  onStoryCreated,
}: CreateStoryDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImage(file);
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStream(stream);
      setIsCapturingPhoto(true);
    } catch (error) {
      toast.error("Unable to access camera");
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCapturingPhoto(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          setImage(file);
          setPreviewUrl(URL.createObjectURL(file));
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !user) return;

    setLoading(true);
    try {
      // Check if bucket exists first
      const { data: bucketExists } = await supabase.storage
        .getBucket('media');

      if (!bucketExists) {
        toast.error("Story upload is not available. Please try again later.");
        setLoading(false);
        return;
      }

      // Upload image to storage
      const fileExt = image.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `stories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, image);

      if (uploadError) {
        console.error("Story upload error:", uploadError);
        toast.error(
          uploadError.message === "Bucket not found" 
            ? "Story upload service is unavailable. Please try again later."
            : uploadError.message || "Error uploading story"
        );
        setLoading(false);
        return;
      }

      // Get public URL
      const { data: publicURL } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      // Create story record
      const { error: dbError } = await supabase.from("stories").insert({
        user_id: user.id,
        image_url: publicURL.publicUrl,
        caption: caption.trim() || null,
      });

      if (dbError) throw dbError;

      toast.success("Story created successfully!");
      onStoryCreated();
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Error creating story");
    } finally {
      setLoading(false);
      setImage(null);
      setPreviewUrl(null);
      setCaption("");
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          stopCamera();
        }
        setOpen(newOpen);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
          <DialogDescription>
            Share a photo that will be visible for 24 hours
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {!previewUrl && !isCapturingPhoto && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-6 w-6" />
                <span>Upload Photo</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={startCamera}
              >
                <Camera className="h-6 w-6" />
                <span>Take Photo</span>
              </Button>
              <Input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          )}

          {isCapturingPhoto && (
            <div className="relative aspect-[9/16] w-full max-w-sm mx-auto overflow-hidden rounded-md bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={stopCamera}
                  className="bg-white/20 backdrop-blur-sm"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={capturePhoto}
                  className="bg-white/20 backdrop-blur-sm"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {previewUrl && (
            <div className="relative aspect-[9/16] w-full max-w-sm mx-auto overflow-hidden rounded-md">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm"
                onClick={() => {
                  setImage(null);
                  setPreviewUrl(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {previewUrl && (
            <div className="space-y-2">
              <Label htmlFor="caption">Add Caption (Optional)</Label>
              <Input
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                maxLength={100}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                stopCamera();
                setImage(null);
                setPreviewUrl(null);
                setCaption("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !image}
              className={cn(
                "min-w-[100px]",
                image ? "bg-gradient-to-r from-primary via-accent to-secondary" : ""
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Share
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}