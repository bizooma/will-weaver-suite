import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Hash, Heart, Users, Leaf, Briefcase, Globe } from "lucide-react";
import { format } from "date-fns";
import { getHeritageMonthsForDate, HeritageObservance } from "@/data/heritageMonths";

interface HeritageMonthDisplayProps {
  selectedDate: Date;
}

const categoryIcons = {
  Heritage: Globe,
  Health: Heart,
  "Social Justice": Users,
  Environmental: Leaf,
  Professional: Briefcase,
  Cultural: Calendar,
};

const categoryColors = {
  Heritage: "hsl(var(--primary))",
  Health: "hsl(var(--destructive))",
  "Social Justice": "hsl(var(--secondary))",
  Environmental: "hsl(120 50% 40%)",
  Professional: "hsl(45 100% 50%)",
  Cultural: "hsl(270 50% 60%)",
};

export function HeritageMonthDisplay({ selectedDate }: HeritageMonthDisplayProps) {
  const heritageMonths = getHeritageMonthsForDate(selectedDate);
  const monthName = format(selectedDate, "MMMM yyyy");

  if (heritageMonths.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Heritage & Awareness Months - {monthName}
        </CardTitle>
        <CardDescription>
          Important observances and awareness campaigns for content planning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {heritageMonths.map((observance, index) => {
            const CategoryIcon = categoryIcons[observance.category];
            return (
              <div
                key={index}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CategoryIcon 
                      className="h-4 w-4 flex-shrink-0" 
                      style={{ color: categoryColors[observance.category] }}
                    />
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${categoryColors[observance.category]}20`,
                        color: categoryColors[observance.category]
                      }}
                    >
                      {observance.category}
                    </Badge>
                  </div>
                </div>
                
                <h4 className="font-semibold text-sm mb-2 leading-tight">
                  {observance.name}
                </h4>
                
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {observance.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Hashtags:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {observance.hashtags.map((hashtag, hashIndex) => (
                      <Badge 
                        key={hashIndex} 
                        variant="outline" 
                        className="text-xs px-2 py-1 h-auto"
                      >
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}