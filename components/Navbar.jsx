import React from "react";
import { LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ModeToggle } from "./theme-toggle";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Navbar = ({
  user,
  toggleTheme,
  isDarkMode,
  chatName,
  onBackgroundChange,
}) => (
  <nav className="text-primary p-4 shadow-lg bg-transparent backdrop-blur">
    <div className="container mx-auto flex justify-between items-center">
      <Link href="/">
        <span className="text-2xl font-bold">LiveChat</span>
      </Link>
      {chatName && <h1 className="text-xl font-semibold">{chatName}</h1>}
      <div className="flex items-center space-x-4">
        <ModeToggle />
        {chatName && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chat Settings</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="chatBackground" className="text-right">
                    Chat Background
                  </Label>
                  <Input
                    id="chatBackground"
                    type="file"
                    accept="image/*"
                    className="col-span-2"
                    onChange={(e) => onBackgroundChange(e.target.files[0])}
                  />
                  <Button
                    onClick={() =>
                      document.getElementById("chatBackground").click()
                    }
                  >
                    Upload
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar>
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="rounded-full"
              >
                <LogOut size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  </nav>
);

export default Navbar;
