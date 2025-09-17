import heroBg from "@/assets/hero-legal-tech-light.jpg";
import appMock from "@/assets/mobile-app-mock.jpg";
import lawOfficeBackground from "@/assets/law-office-background.jpg";
import financialTechBackground from "@/assets/financial-tech-background.jpg";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

import { generateMetaTags, generateStructuredData } from "@/lib/seo";

const canonical = typeof window !== 'undefined' ? window.location.origin + "/" : "/";

const Index = () => {
  const { user } = useAuth();

  const seoConfig = {
    title: 'Legal Tech SaaS Demo | AI-Powered Will Generator & Legal Tools',
    description: 'Experience our AI-powered legal document generation platform featuring will creator, Alexa skill, and mobile app integrations. Professional demo for law firms.',
    keywords: ['legal tech', 'will generator', 'legal AI', 'document automation', 'law firm software'],
    type: 'website' as const,
    url: '/',
  };

  const metaTags = generateMetaTags(seoConfig);
  const structuredData = generateStructuredData(seoConfig);

  return (
    <main>
      <Helmet>
        <title>{metaTags.title}</title>
        <meta name="description" content={metaTags.description} />
        <meta name="keywords" content={metaTags.keywords} />
        
        <meta property="og:title" content={metaTags['og:title']} />
        <meta property="og:description" content={metaTags['og:description']} />
        <meta property="og:image" content={metaTags['og:image']} />
        <meta property="og:url" content={metaTags['og:url']} />
        <meta property="og:type" content={metaTags['og:type']} />
        <meta property="og:site_name" content={metaTags['og:site_name']} />
        
        <meta name="twitter:card" content={metaTags['twitter:card']} />
        <meta name="twitter:title" content={metaTags['twitter:title']} />
        <meta name="twitter:description" content={metaTags['twitter:description']} />
        <meta name="twitter:image" content={metaTags['twitter:image']} />
        <meta name="twitter:site" content={metaTags['twitter:site']} />
        
        <link rel="canonical" href={metaTags.canonical} />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroBg} alt="Light legal tech background with code and documents" className="h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/25 via-background/10 to-transparent" />
        </div>
        <div className="container pt-8 md:pt-12 pb-8 md:pb-12 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl mb-4">Modern Legal Tools, Traditional Trust</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Modernize Your Law Firm with AI-Powered Legal Solutions
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {user ? (
                <a href="/will-creator"><Button variant="hero" size="lg">Create My Will</Button></a>
              ) : (
                <a href="/auth"><Button variant="hero" size="lg">Get Started</Button></a>
              )}
              <a href="/alexa"><Button variant="outline" size="lg">Try Alexa Demo</Button></a>
              <a href="/mobile-app"><Button variant="secondary" size="lg">Download Our App</Button></a>
            </div>
          </div>
          <div>
            <div className="relative aspect-[16/10] rounded-xl border bg-card shadow overflow-hidden animate-fade-in hover-scale">
              <iframe
                src="https://app.heygen.com/embeds/3a1e052ccc804697a2ea0a7fb12ef8ea"
                title="HeyGen video player"
                className="absolute inset-0 w-full h-full transition-all duration-300"
                allow="encrypted-media; fullscreen;"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl mb-6">The Future of Legal Practice is Here</h2>
          <div className="prose prose-lg text-muted-foreground">
            <p className="mb-4">
              AmicusEdge is a comprehensive legal technology platform designed to empower modern law firms with the tools they need to thrive in an increasingly digital landscape. We provide a suite of AI-powered solutions that automate repetitive tasks, streamline workflows, and enhance client engagement. Our mission is to combine cutting-edge technology with the traditional values of trust and reliability that have always been at the heart of the legal profession.
            </p>
            <p className="mb-4">
              Whether you're looking to automate document drafting, optimize your online presence, or offer innovative client services like voice-activated legal assistance, AmicusEdge has you covered. Our platform is built for performance, with a focus on security, scalability, and ease of use. We're committed to helping you save time, reduce costs, and deliver exceptional legal services to your clients.
            </p>
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url(${financialTechBackground})` }}
        ></div>
        <div className="container relative z-10">
          <h2 className="text-3xl mb-8">Featured Tools</h2>
          <p className="text-lg text-foreground mb-8 max-w-4xl">
            Streamline your practice, automate document drafting, and enhance client services with our all-in-one legal technology platform. From AI-powered will and trust generation to advanced SEO and voice search optimization, AmicusEdge provides the tools you need to stay ahead in a digital world.
          </p>
          <div className="rounded-2xl backdrop-blur-sm bg-gradient-to-br from-background/80 to-background/60 border p-4">
          <div className="flex flex-col gap-4 max-w-4xl mx-auto">
            <article className="glass-card-featured rounded-xl p-5 flex flex-col h-full">
              <h3 className="text-xl font-serifBrand mb-2">QR Code Generator</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-grow">Make offline marketing trackable and interactive. Our QR Code Builder creates branded, scannable codes that link directly to your website, intake forms, or chatbot. Perfect for business cards, print ads, billboards, and community events.</p>
              <div className="mt-auto flex justify-center">
                <Button asChild variant="outline" size="sm">
                  <Link to="/qr-codes">Learn More</Link>
                </Button>
              </div>
            </article>
            <article className="glass-card-featured rounded-xl p-5 flex flex-col h-full">
              <h3 className="text-xl font-serifBrand mb-2">AIO SEO Analyzer</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-grow">Get a comprehensive analysis of your website's SEO performance, including voice search and AI overview optimization. Our AIO SEO Analyzer identifies opportunities for improvement and provides actionable recommendations to help you rank higher in search results. Attract more qualified leads and grow your firm with a powerful, data-driven SEO strategy.</p>
              <div className="mt-auto flex justify-center">
                <Button asChild variant="outline" size="sm">
                  <Link to="/aio-analyzer">Learn More</Link>
                </Button>
              </div>
            </article>
            <article className="glass-card-featured rounded-xl p-5 flex flex-col h-full">
              <h3 className="text-xl font-serifBrand mb-2">Video Chatbots</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-grow">Transform your client experience with our customizable video chatbots. Provide instant answers to frequently asked questions, schedule appointments, or offer chat support to gather case details. Enhance client satisfaction and free up your staff to handle more complex inquiries.</p>
              <div className="mt-auto flex justify-center">
                <Button asChild variant="outline" size="sm">
                  <Link to="/video-chatbots">Learn More</Link>
                </Button>
              </div>
            </article>
            <article className="glass-card-featured rounded-xl p-5 flex flex-col h-full">
              <h3 className="text-xl font-serifBrand mb-2">Voice Search Simulator</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-grow">Test how your firm shows up when people ask Google, Siri, Alexa, or Bing for legal help. The Voice Search Simulator reveals exactly what answers clients hear—and gives you tailored optimization suggestions to ensure your firm is the one they call.</p>
              <div className="mt-auto flex justify-center">
                <Button asChild variant="outline" size="sm">
                  <Link to="/voice-search-simulator">Learn More</Link>
                </Button>
              </div>
            </article>
            <article className="glass-card-featured rounded-xl p-5 flex flex-col h-full">
              <h3 className="text-xl font-serifBrand mb-2">AI-Powered Will & Trust Creator</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-grow">Our intelligent will and trust generator guides you through the drafting process with step-by-step instructions and real-time feedback. Create customized, firm-ready estate plans in a fraction of the time, with white-label options available to match your brand. Reduce errors, ensure compliance, and free up your team to focus on high-value client interactions.</p>
              <div className="mt-auto flex justify-center">
                <Button asChild variant="outline" size="sm">
                  <Link to="/will-creator">Learn More</Link>
                </Button>
              </div>
            </article>
            <article className="glass-card-featured rounded-xl p-5 flex flex-col h-full">
              <h3 className="text-xl font-serifBrand mb-2">Alexa Skill</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-grow">Bring your firm into clients' living rooms with a branded Alexa skill. Prospects can ask legal questions, access firm resources, or connect with your office—all hands-free. Build authority and stay top-of-mind in the fastest-growing search channel: voice.</p>
              <div className="mt-auto flex justify-center">
                <Button asChild variant="outline" size="sm">
                  <Link to="/alexa">Learn More</Link>
                </Button>
              </div>
            </article>
            <article className="glass-card-featured rounded-xl p-5 flex flex-col h-full">
              <h3 className="text-xl font-serifBrand mb-2">Mobile App</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-grow">Our native iOS and Android mobile app provides secure, on-the-go access to your case files, documents, and client information. With offline capabilities and a user-friendly interface, you can manage your practice from anywhere, at any time. Make this pre built app your firm's own, we'll customize it with your brand kit and firm details, then submit it to the app stores.</p>
              <div className="mt-auto flex justify-center">
                <Button asChild variant="outline" size="sm">
                  <Link to="/mobile-app">Learn More</Link>
                </Button>
              </div>
            </article>
          </div>
        </div>
        </div>
      </section>

      <section className="container pt-16 pb-20 grid gap-10 md:grid-cols-2 items-center">
        <div>
          <img src={appMock} alt="Mobile app mockup" className="rounded-xl shadow" loading="lazy" />
        </div>
        <div>
          <h2 className="text-3xl mb-3">Built for Performance</h2>
          <p className="text-muted-foreground mb-6">At Amicus Edge, every tool is engineered with one goal in mind: helping your law firm perform at its best. From lightning-fast websites and voice-ready search optimization to lead-converting chatbots and mobile apps, our platform is built to drive measurable results.</p>
          <ul className="list-disc pl-5 space-y-3 text-sm text-muted-foreground mb-6">
            <li><strong>Speed & Reliability</strong> – Seamless integrations and modern cloud architecture keep everything running smoothly.</li>
            <li><strong>Conversion Focused</strong> – Every feature is designed to capture leads, book consultations, and grow your caseload.</li>
            <li><strong>Secure & Compliant</strong> – Protect your firm and your clients with technology that meets strict privacy and security standards.</li>
            <li><strong>Scalable for Growth</strong> – Whether you're a boutique practice or a multi-location firm, Amicus Edge adapts as you expand.</li>
          </ul>
          <p className="text-muted-foreground text-sm">Your clients expect efficiency and professionalism—your marketing platform should deliver the same. With Amicus Edge, you'll have the power, performance, and precision to outpace the competition.</p>
        </div>
      </section>

      <section className="container pb-24">
        <h2 className="text-3xl mb-6">Testimonials</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[1,2,3].map(i => (
            <blockquote key={i} className="rounded-lg border p-5 bg-card text-sm text-muted-foreground">
              “This platform made our intake and drafting so much faster.”
              <div className="mt-3 text-foreground font-medium">Attorney {i}</div>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="relative pb-24">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url(${lawOfficeBackground})` }}
        ></div>
        <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl mb-4">Choose Your Plan</h2>
          <p className="text-lg text-black">We offer flexible pricing plans designed to fit the needs of any law firm, from solo practitioners to large enterprises. Choose the package that's right for you and start modernizing your practice today.</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {/* Basic Package */}
          <div className="glass-card rounded-2xl p-8 relative">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-serifBrand mb-2">Basic</h3>
              <p className="text-muted-foreground mb-4">Essential tools for modern law firms</p>
              <div className="text-4xl font-bold mb-1">$1,500</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <div className="font-medium">AIO SEO Analyzer</div>
                  <div className="text-sm text-muted-foreground">Comprehensive website analysis and optimization</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <div className="font-medium">Video Chatbots</div>
                  <div className="text-sm text-muted-foreground">AI-powered video assistants for your website</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <div className="font-medium">QR Code Generator</div>
                  <div className="text-sm text-muted-foreground">Trackable QR codes with analytics</div>
                </div>
              </li>
            </ul>
            
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link to="/contact">Get Started</Link>
            </Button>
          </div>

          {/* Standard Package */}
          <div className="glass-card rounded-2xl p-8 relative">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-serifBrand mb-2">Standard</h3>
              <p className="text-muted-foreground mb-4">Enhanced tools with document creation</p>
              <div className="text-4xl font-bold mb-1">$2,500</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <div className="font-medium">Everything in Basic</div>
                  <div className="text-sm text-muted-foreground">All Basic features included</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <div className="font-medium">Will & Trust Creator</div>
                  <div className="text-sm text-muted-foreground">AI-powered legal document generation</div>
                </div>
              </li>
            </ul>
            
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link to="/contact">Get Started</Link>
            </Button>
          </div>

          {/* Pro PI Package */}
          <div className="glass-card rounded-2xl p-8 relative">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-serifBrand mb-2">Pro PI</h3>
              <p className="text-muted-foreground mb-4">Advanced tools with voice and mobile</p>
              <div className="text-4xl font-bold mb-1">$3,500</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <div className="font-medium">Everything in Basic</div>
                  <div className="text-sm text-muted-foreground">All Basic features included</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <div className="font-medium">Alexa Skill</div>
                  <div className="text-sm text-muted-foreground">Voice-powered legal assistance</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <div className="font-medium">Mobile App</div>
                  <div className="text-sm text-muted-foreground">Native iOS and Android applications</div>
                </div>
              </li>
            </ul>
            
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link to="/contact">Get Started</Link>
            </Button>
          </div>

          {/* Pro Estate Package */}
          <div className="glass-card rounded-2xl p-8 relative border-primary">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-serifBrand mb-2">Pro Estate</h3>
              <p className="text-muted-foreground mb-4">Complete legal technology suite</p>
              <div className="text-4xl font-bold mb-1">$4,500</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <div className="font-medium">Everything in Standard</div>
                  <div className="text-sm text-muted-foreground">All Standard features included</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <div className="font-medium">Alexa Skill</div>
                  <div className="text-sm text-muted-foreground">Voice-powered legal assistance</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div>
                  <div className="font-medium">Mobile App</div>
                  <div className="text-sm text-muted-foreground">Native iOS and Android applications</div>
                </div>
               </li>
            </ul>
            
            <Button asChild variant="hero" size="lg" className="w-full">
              <Link to="/contact">Get Started</Link>
            </Button>
          </div>
        </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl mb-6">Custom Website Development</h2>
          <div className="prose prose-lg text-muted-foreground">
            <p className="mb-4">
              Your website is more than an online brochure—it's the foundation of your firm's digital strategy. At Amicus Edge, we build custom law firm websites that are fast, secure, and designed to convert visitors into clients.
            </p>
            <p className="mb-4">
              Our team blends modern design with legal-industry expertise to deliver sites that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6 text-left max-w-2xl mx-auto">
              <li>Showcase your brand with a clean, professional look.</li>
              <li>Drive results with optimized intake forms, chatbots, and lead funnels.</li>
              <li>Perform everywhere with responsive layouts for desktop, tablet, and mobile.</li>
              <li>Rank higher through SEO, AEO, and Voice Search optimization.</li>
              <li>Integrate seamlessly with the full Amicus Edge toolset.</li>
            </ul>
            <p>
              Whether you're rebranding, expanding, or building from the ground up, we'll create a website that doesn't just look good—it works hard for your firm 24/7.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
