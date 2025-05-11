import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Train,
  MapPin,
  CalendarRange,
  Armchair,
  Ticket,
  Settings,
  LogOut,
  Menu,
  X,
  Sofa,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard size={20} />,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: <Users size={20} />,
  },
  {
    title: "Trains",
    href: "/admin/trains",
    icon: <Train size={20} />,
  },
  {
    title: "Stations",
    href: "/admin/stations",
    icon: <MapPin size={20} />,
  },
  {
    title: "Schedules",
    href: "/admin/schedules",
    icon: <CalendarRange size={20} />,
  },
  {
    title: "Seats",
    href: "/admin/seats",
    icon: <Armchair size={20} />,
  },
  {
    title: "Berths",
    href: "/admin/berths",
    icon: <Sofa size={20} />,
  },
  {
    title: "Tickets",
    href: "/admin/tickets",
    icon: <Ticket size={20} />,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: <Settings size={20} />,
  },
]; 