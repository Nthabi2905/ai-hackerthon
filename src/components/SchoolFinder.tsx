import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, School, Users, Sparkles, Brain } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface School {
  id?: number;
  name: string;
  location: string;
  learners: number;
  infrastructure: string;
  lastOutreach: string;
  score: number;
  needsAnalysis?: string;
}

const SchoolFinder = () => {
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!province || !district) {
      toast({
        title: "Missing information",
        description: "Please enter both province and district",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Requesting AI recommendations for:", { province, district });
      
      const { data, error } = await supabase.functions.invoke('ai-school-recommendations', {
        body: { province, district }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      console.log("AI recommendations received:", data);

      if (data?.schools && Array.isArray(data.schools)) {
        const schoolsWithIds = data.schools.map((school: School, index: number) => ({
          ...school,
          id: index + 1
        }));
        
        setSchools(schoolsWithIds);
        
        toast({
          title: "AI recommendations ready!",
          description: `Discovered ${schoolsWithIds.length} schools that need STEM outreach`,
        });
      } else {
        throw new Error("Invalid response format from AI");
      }
    } catch (error: any) {
      console.error("Error getting recommendations:", error);
      
      toast({
        title: "Search failed",
        description: error.message || "Failed to get AI recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 px-6 bg-background" id="finder">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-4">
            <Brain className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">AI-Powered Discovery</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Find Schools That Need You
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI analyzes infrastructure, demographics, and outreach history to recommend
            schools where your impact will be greatest
          </p>
        </div>

        {/* Search Interface */}
        <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
          <CardHeader>
            <CardTitle>Search for Schools</CardTitle>
            <CardDescription>
              Enter the province and district to discover underserved schools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Province
                </label>
                <Input
                  placeholder="e.g., Gauteng"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="transition-smooth"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  District
                </label>
                <Input
                  placeholder="e.g., Ekurhuleni"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="transition-smooth"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    AI is analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find Schools
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {schools.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-accent" />
              <h3 className="text-2xl font-bold text-foreground">
                AI-Recommended Schools ({schools.length})
              </h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schools.map((school) => (
                <Card 
                  key={school.id} 
                  className="hover:shadow-md transition-smooth border-border hover:border-accent/50"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <School className="w-8 h-8 text-accent" />
                      <div className="bg-accent/10 text-accent px-2 py-1 rounded text-xs font-semibold">
                        Score: {school.score}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {school.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{school.learners} learners</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Infrastructure:</span>
                      <p className="text-muted-foreground">{school.infrastructure}</p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Last Outreach:</span>
                      <p className="text-muted-foreground">{school.lastOutreach}</p>
                    </div>
                    {school.needsAnalysis && (
                      <div className="text-sm bg-accent/5 p-3 rounded border border-accent/20">
                        <span className="font-medium text-accent flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3" />
                          Why this school?
                        </span>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {school.needsAnalysis}
                        </p>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 border-accent/30 text-accent hover:bg-accent/10"
                    >
                      Plan Outreach
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SchoolFinder;
