import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Bot } from "lucide-react";

interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials?: string;
    isAI?: boolean;
  };
  action: string;
  target: {
    name: string;
    href: string;
  };
  timestamp: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {activities.map((activity) => (
          <div key={activity.id} className="relative">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {activity.user.isAI ? (
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                ) : (
                  <Avatar>
                    <AvatarImage src={activity.user.avatar} />
                    <AvatarFallback>{activity.user.initials}</AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.user.name}</div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {activity.action}{" "}
                  <Link href={activity.target.href}>
                    <a className="font-medium text-primary">{activity.target.name}</a>
                  </Link>
                </p>
                <span className="text-xs text-gray-400 dark:text-gray-500">{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="border-t border-gray-200 dark:border-gray-800 px-6 py-3 bg-gray-50 dark:bg-gray-800">
        <Link href="/collaboration">
          <a className="text-sm font-medium text-primary hover:text-primary/80">
            View all activity
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}

export const defaultActivities: ActivityItem[] = [
  {
    id: "1",
    user: {
      name: "Tom Cook",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      initials: "TC"
    },
    action: "Created a new email template",
    target: {
      name: "Q3 Product Launch",
      href: "/assets/1"
    },
    timestamp: "2 hours ago"
  },
  {
    id: "2",
    user: {
      name: "AI Assistant",
      isAI: true,
      initials: "AI"
    },
    action: "Generated 5 variations of",
    target: {
      name: "Summer Sale",
      href: "/ai-generator"
    },
    timestamp: "3 hours ago"
  },
  {
    id: "3",
    user: {
      name: "Jessica Lee",
      avatar: "https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      initials: "JL"
    },
    action: "Added comments to",
    target: {
      name: "Holiday Campaign",
      href: "/assets/3"
    },
    timestamp: "5 hours ago"
  },
  {
    id: "4",
    user: {
      name: "Michael Roberts",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      initials: "MR"
    },
    action: "Approved the",
    target: {
      name: "Social Media Kit",
      href: "/assets/4"
    },
    timestamp: "Yesterday"
  },
  {
    id: "5",
    user: {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      initials: "SJ"
    },
    action: "Created a new campaign",
    target: {
      name: "Back to School",
      href: "/assets?campaign=5"
    },
    timestamp: "Yesterday"
  }
];
