import { IconifyIcon } from "@/components/ui/IconifyIcon";

interface Props {
  platform: string;
}

export default function SocialIcon({ platform }: Props) {
  // Complete mapping of all backend platforms to Iconify Icon names
  const iconMap: Record<string, string> = {
    facebook: "ri:facebook-fill",
    instagram: "ri:instagram-line",
    twitter: "ri:twitter-x-fill",
    linkedin: "ri:linkedin-fill",
    youtube: "ri:youtube-fill",
    tiktok: "ri:tiktok-fill",
    pinterest: "ri:pinterest-fill",
    whatsapp: "ri:whatsapp-fill",
    telegram: "ri:telegram-fill",
    discord: "ri:discord-fill",
    wechat: "ri:wechat-fill",
    weibo: "ri:weibo-fill",
    douyin: "tabler:brand-douyin",
    xiaohongshu: "simple-icons:xiaohongshu",
    bilibili: "ri:bilibili-fill",
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
