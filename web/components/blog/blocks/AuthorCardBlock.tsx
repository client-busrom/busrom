// @ts-nocheck
"use client";

import React from "react";
import { IconifyIcon } from "@/components/ui/IconifyIcon";

export function AuthorCardBlock({ node }: { node: any }) {
  const { author, displayFields, customBio, backgroundColor } =
    node.data || node.fields || {};

  if (!author) return null;

  // Helper to check if a field should be displayed
  const isVisible = (field: string) => displayFields?.includes(field);

  const { name, avatar, role, bio, socialLinks } = author;
  const displayBio = customBio || bio;
  const imageUrl = avatar?.url || "";

  // Social icons mapping
  const socialIcons: Record<string, string> = {
    instagram: "ant-design:instagram-filled",
    linkedin: "entypo-social:linkedin-with-circle",
    twitter: "ant-design:twitter-circle-filled",
    facebook: "entypo-social:facebook-with-circle",
    pinterest: "entypo-social:pinterest-with-circle",
    youtube: "ant-design:youtube-filled",
    website: "gg:website",
  };

  return (
    <div
      className="my-12 p-8 md:p-12 rounded-[32px] flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12"
      style={{ backgroundColor: backgroundColor || "#fbfcf4" }}
    >
      {/* Avatar */}
      {isVisible("avatar") && imageUrl && (
        <div className="shrink-0">
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-sm">
            <img src={imageUrl} alt={name} className="w-full h-auto" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Bio / Quote */}
        {isVisible("bio") && displayBio && (
          <p className="font-josefin-sans text-[#474642] text-lg md:text-xl leading-relaxed italic mb-8 opacity-80">
            "{displayBio}"
          </p>
        )}

        <div className="mt-auto">
          {/* Name */}
          {isVisible("name") && (
            <h4 className="font-josefin-sans font-bold text-[#b06e4e] text-lg uppercase tracking-wider mb-1">
              {name}
            </h4>
          )}

          {/* Role */}
          {isVisible("role") && role && (
            <p className="font-josefin-sans text-[#756f3f] text-sm uppercase tracking-[0.2em] font-medium">
              {role}
            </p>
          )}

          {/* Social Links */}
          {isVisible("socialLinks") &&
            socialLinks &&
            socialLinks.length > 0 && (
              <div className="flex gap-4 mt-6">
                {socialLinks.map((link: any, idx: number) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#b06e4e] hover:opacity-70 transition-opacity"
                  >
                    <IconifyIcon
                      name={socialIcons[link.platform] || "gg:link"}
                      size={24}
                    />
                  </a>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
