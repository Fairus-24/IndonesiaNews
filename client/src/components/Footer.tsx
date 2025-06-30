import { useSiteSettings } from "@/lib/siteSettings";

export default function Footer() {
  const siteSettings = useSiteSettings();
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {siteSettings.site_name || "Indonesia News"}. All rights reserved.
        </div>
        <div className="text-xs text-gray-400 mt-2 md:mt-0">
          {siteSettings.site_description || "Portal Berita Indonesia"}
        </div>
      </div>
    </footer>
  );
}
