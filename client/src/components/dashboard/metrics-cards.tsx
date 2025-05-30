import { FileText, CheckSquare, Users, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";

interface Metric {
  title: string;
  value: number;
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  linkText: string;
  linkHref: string;
}

interface MetricsCardsProps {
  metrics: Metric[];
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${metric.iconBgColor} rounded-md p-3`}>
                <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{metric.title}</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{metric.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 dark:bg-gray-800 px-5 py-3">
            <div className="text-sm">
              <Link href={metric.linkHref}>
                <a className="font-medium text-primary hover:text-primary/80">
                  {metric.linkText}
                </a>
              </Link>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export const defaultMetrics: Metric[] = [
  {
    title: "Assets Created",
    value: 128,
    icon: FileText,
    iconBgColor: "bg-primary-50 dark:bg-primary-900/20",
    iconColor: "text-primary",
    linkText: "View all",
    linkHref: "/assets"
  },
  {
    title: "Completed Campaigns",
    value: 24,
    icon: CheckSquare,
    iconBgColor: "bg-green-50 dark:bg-green-900/20",
    iconColor: "text-green-500",
    linkText: "View all",
    linkHref: "/assets?filter=campaigns"
  },
  {
    title: "Team Members",
    value: 16,
    icon: Users,
    iconBgColor: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-500",
    linkText: "Manage team",
    linkHref: "/collaboration"
  },
  {
    title: "AI Credits",
    value: 750,
    icon: Sparkles,
    iconBgColor: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "text-purple-500",
    linkText: "Buy more",
    linkHref: "/settings"
  }
];
