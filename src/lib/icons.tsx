// String → lucide icon resolver, so the catalog can reference icons by name.
import {
  FileText, Mail, Receipt, ScanSearch, Calculator, Globe, CalendarDays,
  GraduationCap, Wrench, TrendingUp, Percent, Clock, Banknote, PieChart,
  Landmark, Wallet, PiggyBank, Home, DollarSign, PoundSterling, Coins,
  CalendarClock, CalendarCheck, Cake, Sigma, ClipboardCheck, Scale, KeyRound,
  Search, Copy, Check, Download, Star, Printer, X, ChevronRight, Eye, Pencil,
  Sparkles, Plus, Trash2, RefreshCw, Heart, ArrowLeftRight, Euro, LayoutGrid,
  Undo2, Shuffle, CalendarRange, Command, Moon, Sun, ChevronDown, CornerDownLeft,
  PanelLeftClose, PanelLeftOpen, Users, Building2, Save, UserPlus,
  DoorOpen, DoorClosed, ShieldCheck, Stamp, Image, type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  FileText, Mail, Receipt, ScanSearch, Calculator, Globe, CalendarDays,
  GraduationCap, Wrench, TrendingUp, Percent, Clock, Banknote, PieChart,
  Landmark, Wallet, PiggyBank, Home, DollarSign, PoundSterling, Coins,
  CalendarClock, CalendarCheck, Cake, Sigma, ClipboardCheck, Scale, KeyRound,
  Search, Copy, Check, Download, Star, Printer, X, ChevronRight, Eye, Pencil,
  Sparkles, Plus, Trash2, RefreshCw, Heart, ArrowLeftRight, Euro, LayoutGrid,
  Undo2, Shuffle, CalendarRange, Command, Moon, Sun, ChevronDown, CornerDownLeft,
  PanelLeftClose, PanelLeftOpen, Users, Building2, Save, UserPlus,
  DoorOpen, DoorClosed, ShieldCheck, Stamp, Image,
};

export function getIcon(name: string): LucideIcon {
  return MAP[name] ?? FileText;
}
