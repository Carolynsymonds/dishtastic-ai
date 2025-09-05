import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const DashboardHeader = () => {
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-border">
      {/* Left side - Search box */}
      <div className="flex items-center gap-2 w-80">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items, ingredients, suppliers, etc..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Right side - Empty for now */}
      <div></div>

    </header>
  );
};

export default DashboardHeader;