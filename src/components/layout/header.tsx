import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary"
          >
            <path d="M9.5 7l-2.1 4.9a1 1 0 0 0 .9 1.4h4.4a1 1 0 0 0 .9-1.4L11.5 7" />
            <path d="M16 13.3a1 1 0 0 0 1 1h.5a1 1 0 0 0 1-1v-1.3m-4.5-1.4-1-2.3m9 5.3a1 1 0 0 1-1-1v-.3a1 1 0 0 1 1-1h.5a1 1 0 0 1 1 1v.3a1 1 0 0 1-1 1h-.5Z" />
            <path d="M4 17a1 1 0 0 1 1-1h1.5a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1Z" />
            <path d="M12 19H8" />
            <path d="M9.5 13.3H7" />
            <path d="M14 7h1" />
            <path d="M17 17h1.5a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1" />
            <path d="M16.5 11.7 18 7" />
            <path d="M11 19h2" />
          </svg>
          <span className="font-bold sm:inline-block text-primary">
            RE-Link Insights
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end">
          <Button variant="ghost">Login</Button>
        </div>
      </div>
    </header>
  );
}
