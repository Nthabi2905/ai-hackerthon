import { Button } from "@/components/ui/button";
import { Rocket, Target, Users } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-accent/20">
          <Rocket className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-primary-foreground">
            AI-Powered STEM Outreach
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
          Connect Schools with
          <br />
          <span className="bg-gradient-accent bg-clip-text text-transparent">
            Space & STEM Education
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-primary-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
          Automate outreach coordination, discover underserved schools, and create
          lasting impact in STEM education across South Africa.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow transition-all hover:scale-105"
          >
            Start Planning Outreach
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm"
          >
            See How It Works
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-card/10 backdrop-blur-sm rounded-lg p-6 border border-primary-foreground/10">
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Target className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-primary-foreground mb-2">
              AI School Finder
            </h3>
            <p className="text-primary-foreground/70 text-sm">
              Discover underserved schools based on location, infrastructure, and STEM needs
            </p>
          </div>

          <div className="bg-card/10 backdrop-blur-sm rounded-lg p-6 border border-primary-foreground/10">
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-primary-foreground mb-2">
              Smart Coordination
            </h3>
            <p className="text-primary-foreground/70 text-sm">
              Auto-generate schedules, routes, and professional communication templates
            </p>
          </div>

          <div className="bg-card/10 backdrop-blur-sm rounded-lg p-6 border border-primary-foreground/10">
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Rocket className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-primary-foreground mb-2">
              Impact Reports
            </h3>
            <p className="text-primary-foreground/70 text-sm">
              Automatically generate visual impact reports with photos and metrics
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
