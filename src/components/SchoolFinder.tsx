import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, School, Users, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SchoolFinder = () => {
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);
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
    
    // Simulate AI processing
    setTimeout(() => {
      // Mock data for demonstration
      const mockSchools = [
        {
          id: 1,
          name: "Thembisa Secondary School",
          location: `${district}, ${province}`,
          learners: 850,
          infrastructure: "Limited STEM facilities",
          lastOutreach: "Never",
          score: 95,
        },
        {
          id: 2,
          name: "Sunrise Primary School",
          location: `${district}, ${province}`,
          learners: 420,
          infrastructure: "No science lab",
          lastOutreach: "2+ years ago",
          score: 92,
        },
        {
          id: 3,
          name: "Valley High School",
          location: `${district}, ${province}`,
          learners: 650,
          infrastructure: "Basic facilities only",
          lastOutreach: "Never",
          score: 88,
        },
      ];

      setSchools(mockSchools);
      setIsLoading(false);
      
      toast({
        title: "Schools found!",
        description: `Discovered ${mockSchools.length} recommended schools in your area`,
      });
    }, 2000);
  };

  return (
    <section className="py-20 px-6 bg-background" id="finder">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
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
            <h3 className="text-2xl font-bold text-foreground">
              Recommended Schools ({schools.length})
            </h3>
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
                        Match: {school.score}%
                      </div>
                    </div>
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {school.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
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
