import { IconifyIcon } from "@/components/ui/IconifyIcon";

interface Props {
  platform: string;
}

export default function SocialIcon({ platform }: Props) {
  // Mapping platform names to Iconify Icon names
  const iconMap: Record<string, string> = {
    facebook: "ri:facebook-fill",
    instagram: "ri:instagram-line",
    twitter: "ri:twitter-x-fill",
    linkedin: "ri:linkedin-fill",
    youtube: "ri:youtube-fill",
    tiktok: "ri:tiktok-fill",
    wechat: "ri:wechat-fill",
    whatsapp: "ri:whatsapp-fill",
  };

  const iconName = iconMap[platform.toLowerCase()] || "ri:global-line";

  return (
    <IconifyIcon 
      name={iconName} 
      size={18} 
      className="transition-colors duration-300"
    />
  );
}
