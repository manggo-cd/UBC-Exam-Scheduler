import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Search, Download, BookOpen, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Filter exams by campus, subject, course, and section with our intuitive search interface."
    },
    {
      icon: Calendar,
      title: "Calendar Export",
      description: "Download your exam schedule as a .ics file that works with any calendar application."
    },
    {
      icon: Download,
      title: "Bulk Download",
      description: "Select multiple exams or download all filtered results at once for convenience."
    }
  ];

  const stats = [
    { label: "Active Students", value: "2,500+", icon: Users },
    { label: "Exams Scheduled", value: "15,000+", icon: BookOpen },
    { label: "Hours Saved", value: "5,000+", icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              UBC Exam
              <span className="text-transparent bg-clip-text bg-gradient-primary"> Scheduler</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The easiest way to find, organize, and export your UBC exam schedule. 
              Search courses, select your exams, and download a calendar file in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero" size="lg">
                <Link to="/search">
                  <Search className="w-5 h-5 mr-2" />
                  Search Exams
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/history">
                  <Calendar className="w-5 h-5 mr-2" />
                  View History
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-ubc-gold" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need to manage your exams
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for UBC students with features that make exam planning effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <span>{feature.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to organize your exam schedule?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of UBC students who use our scheduler to stay organized.
          </p>
          <Button asChild variant="accent" size="lg">
            <Link to="/search">
              Get Started Now
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ubc-navy text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-ubc-gold rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-ubc-navy" />
              </div>
              <span className="text-xl font-bold">UBC Exam Scheduler</span>
            </div>
            <p className="text-white/80 mb-4">
              Built by students, for students at the University of British Columbia.
            </p>
            <div className="text-sm text-white/60">
              © 2024 UBC Exam Scheduler. Not officially affiliated with UBC.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
