import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Users, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SchoolMap from "./SchoolMap";

interface School {
  id: string;
  nat_emis: string;
  institution_name: string;
  province: string;
  district: string;
  town_city: string;
  learners_2024: number;
  educators_2024: number;
  quintile: string;
  longitude: number;
  latitude: number;
}

const SchoolFinder = () => {
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);

  const handleSearch = async () => {
    if (!province || !district) {
      toast.error("Please enter both province and district");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .ilike('province', `%${province}%`)
        .ilike('district', `%${district}%`)
        .not('longitude', 'is', null)
        .not('latitude', 'is', null)
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        setSchools(data);
        toast.success(`Found ${data.length} schools`);
      } else {
        toast.info("No schools found for this search");
        setSchools([]);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(error.message || "Failed to search schools. Please try again.");
      setSchools([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 px-6 bg-background" id="finder">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Find Schools That Need You
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Search for schools by province and district to discover where your STEM outreach
            can make the greatest impact
          </p>
        </div>

        {/* Search Interface */}
        <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
          <CardHeader>
            <CardTitle>Search for Schools</CardTitle>
            <CardDescription>
              Enter the province and district to discover schools in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Province
                </label>
                <Input
                  placeholder="e.g., Gauteng, Western Cape"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  District
                </label>
                <Input
                  placeholder="e.g., Ekurhuleni, Cape Town"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search Schools
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {schools.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Found {schools.length} Schools
            </h3>
            
            <SchoolMap schools={schools} />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {schools.map((school) => (
                <Card key={school.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{school.institution_name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-2">
                          <MapPin className="h-4 w-4" />
                          {school.town_city}, {school.district}
                        </CardDescription>
                      </div>
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        Quintile {school.quintile}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Learners</p>
                          <p className="text-sm text-muted-foreground">{school.learners_2024.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Educators</p>
                          <p className="text-sm text-muted-foreground">{school.educators_2024}</p>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full" variant="default">
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