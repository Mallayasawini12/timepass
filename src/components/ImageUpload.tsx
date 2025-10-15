import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const uploadImage = useCallback(
    async (file: File) => {
      try {
        setUploading(true);

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size should be less than 5MB");
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error("Please upload an image file");
          return;
        }

        // Create a unique file path using UUID-like string for better uniqueness
        const fileExt = file.name.split('.').pop();
        const uniqueId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const fileName = `${uniqueId}.${fileExt}`;
        const filePath = fileName;

        // Check if bucket exists first
        const { data: bucketExists } = await supabase.storage
          .getBucket('avatars');

        if (!bucketExists) {
          console.error("Bucket 'avatars' not found");
          toast.error("Image upload is not configured. Please try again later.");
          return;
        }

        // Upload the file
        const { data, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type
          });

        if (uploadError) {
          console.error("Upload error details:", uploadError);
          toast.error(
            uploadError.message === "Bucket not found" 
              ? "Image upload service is not available. Please try again later." 
              : uploadError.message || "Error uploading image"
          );
          return;
        }

        if (!data?.path) {
          toast.error("Upload failed - no path returned");
          return;
        }

        const { data: publicURL } = supabase.storage
          .from('avatars')
          .getPublicUrl(data.path);

        if (publicURL?.publicUrl) {
          console.log("Upload successful, URL:", publicURL.publicUrl);
          onChange(publicURL.publicUrl);
          toast.success("Profile picture updated!");
        } else {
          toast.error("Could not get public URL for uploaded file");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        uploadImage(e.target.files[0]);
      }
    },
    [uploadImage]
  );

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <Avatar className="h-24 w-24">
        <AvatarImage src={value || undefined} />
        <AvatarFallback className="bg-muted">
          {uploading ? (
            <UploadCloud className="h-6 w-6 animate-pulse" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-center gap-2">
        <Label
          htmlFor="image-upload"
          className={cn(
            "cursor-pointer rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground",
            {
              "cursor-not-allowed opacity-50": disabled || uploading,
            }
          )}
        >
          {uploading ? "Uploading..." : "Change Image"}
        </Label>
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || uploading}
        />
      </div>
    </div>
  );
}