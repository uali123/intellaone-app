import { useState } from 'react';
import { Link } from 'wouter';
import { Brain, Sparkles, BarChart3, FileText, Layers, ArrowRight, Bot, Globe, MessageSquare, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';

export default function LandingPage() {
  const [email, setEmail] = useState('');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">IntellaOne</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#agents" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">
              AI Agents
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">
              How It Works
            </a>
            <a href="#use-cases" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">
              Use Cases
            </a>
          </nav>
          <div className="flex items-center space-x-6">
            <a 
              href="#" 
              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
              onClick={(e) => {
                e.preventDefault();
                localStorage.setItem('free-trial-mode', 'true');
                window.location.href = '/agents';
              }}
            >
              <Sparkles className="h-4 w-4 mr-1 text-blue-500" />
              Try Free
            </a>
            <Link href="/auth" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-primary/5 to-primary/10 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-24 md:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                  <span className="block">AI-powered marketing</span>
                  <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">for Product Marketers</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-md">
                  Transform your marketing workflow with our intelligent agents that create, optimize, and analyze your content.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl relative overflow-hidden group animate-pulse-slow"
                    onClick={() => {
                      localStorage.setItem('free-trial-mode', 'true');
                      window.location.href = '/agents';
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 transform translate-x-[-100%] skew-x-[-15deg] group-hover:translate-x-[200%] transition-all duration-1000"></div>
                    <Sparkles className="mr-2 h-5 w-5" /> 
                    <span className="font-bold">Try It Now</span> <span className="hidden sm:inline">— No Sign Up Required</span>
                  </Button>
                  <Link href="/auth">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300">
                      Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 flex gap-3 items-center">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="text-green-600 mr-1">✓</span> No credit card required
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="text-green-600 mr-1">✓</span> No registration required
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="text-green-600 mr-1">✓</span> Instant access to all AI agents
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="text-green-600 mr-1">✓</span> Try with your own content
                    </p>
                  </div>
                </div>
                <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                  Trusted by marketing teams at innovative companies
                </div>
              </div>
              <div className="hidden lg:block relative">
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 dark:border dark:border-gray-700">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-3">
                      <BrainCircuit className="h-5 w-5 text-primary mr-2" />
                      <span className="font-medium">IntellaOne AI</span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 p-3 rounded-lg">
                        Generate a compelling product message for our new enterprise SaaS platform targeting IT managers
                      </p>
                      <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                          "Introducing CloudFlexPro: Reclaim control of your IT infrastructure with our scalable, secure SaaS platform. Designed specifically for IT managers, CloudFlexPro reduces operational overhead by 40% while providing unmatched visibility across your tech stack. Don't just manage IT—transform it into your company's strategic advantage."
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="text-xs">
                      <Layers className="h-3 w-3 mr-1" /> Refine
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" /> Variations
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Showcase */}
        <section id="agents" className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Meet Your AI Marketing Team
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Our specialized AI agents work together to streamline your marketing workflow
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Maven Agent */}
              <Card className="border-primary/20 hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Maven</CardTitle>
                  <CardDescription>Research Specialist</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Conducts real-time web scraping and research to gather competitive intel and market trends for your campaigns.
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">Web Scraping</span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">RAG</span>
                  </div>
                </CardFooter>
              </Card>

              {/* Matrix Agent */}
              <Card className="border-primary/20 hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Matrix</CardTitle>
                  <CardDescription>Messaging Architect</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Creates compelling messaging and positioning with persona-based tone control for different target audiences.
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded">Personas</span>
                    <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 rounded">Positioning</span>
                  </div>
                </CardFooter>
              </Card>

              {/* Max Agent */}
              <Card className="border-primary/20 hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Max</CardTitle>
                  <CardDescription>Campaign Planner</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Plans and organizes campaign workflows with a step-by-step guided interface for marketing campaign execution.
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">Workflows</span>
                    <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded">Planning</span>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                How IntellaOne Works
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Three specialized AI agents work together to streamline your marketing workflow
              </p>
              <div className="flex flex-wrap justify-center mt-4 gap-2">
                <div className="flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">1</span>
                  </div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Research with Maven</span>
                </div>
                <div className="flex items-center px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-2">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300">2</span>
                  </div>
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Create with Matrix</span>
                </div>
                <div className="flex items-center px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-2">
                    <span className="text-xs font-bold text-green-700 dark:text-green-300">3</span>
                  </div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Plan with Max</span>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline Line */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                {/* Steps */}
                <div className="space-y-12 md:space-y-24">
                  {/* Step 1 */}
                  <div className="relative flex flex-col md:flex-row md:items-center">
                    <div className="flex-1 md:text-right md:pr-8">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Define Your Project</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Specify your target audience, content type, and campaign objectives
                      </p>
                    </div>
                    <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-700 border-4 border-primary text-primary my-4 md:my-0 z-10">
                      <span className="font-bold">1</span>
                    </div>
                    <div className="flex-1 md:pl-8">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm dark:border dark:border-gray-600">
                        <div className="flex items-center mb-2">
                          <span className="bg-primary/10 dark:bg-primary/20 p-1 rounded text-primary mr-2">
                            <Bot className="h-4 w-4" />
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">AI Agent Briefing Form</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Content Type:</span>
                            <span className="font-medium text-gray-900 dark:text-white">Product One-Pager</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Target Audience:</span>
                            <span className="font-medium text-gray-900 dark:text-white">IT Decision Makers</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Brand Voice:</span>
                            <span className="font-medium text-gray-900 dark:text-white">Professional, Innovative</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex flex-col md:flex-row md:items-center">
                    <div className="flex-1 md:text-right md:pr-8 md:order-1">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm dark:border dark:border-gray-600">
                        <div className="flex items-center mb-2">
                          <span className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded text-blue-600 dark:text-blue-400 mr-2">
                            <Globe className="h-4 w-4" />
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Maven Research Results</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                          Analysis of 28 competitor one-pagers reveals these key trends:
                        </p>
                        <ul className="text-xs text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                          <li>Focus on ROI metrics (86% mention)</li>
                          <li>Security features highlighted prominently</li>
                          <li>Implementation time emphasized</li>
                        </ul>
                      </div>
                    </div>
                    <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-700 border-4 border-blue-500 text-blue-500 my-4 md:my-0 z-10">
                      <span className="font-bold">2</span>
                    </div>
                    <div className="flex-1 md:pl-8 md:order-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Maven Research Phase</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Maven analyzes the market, competitors, and latest trends to inform your content
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex flex-col md:flex-row md:items-center">
                    <div className="flex-1 md:text-right md:pr-8">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Matrix Messaging Creation</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Matrix develops your core messaging, value props, and persona-based language
                      </p>
                    </div>
                    <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-700 border-4 border-purple-500 text-purple-500 my-4 md:my-0 z-10">
                      <span className="font-bold">3</span>
                    </div>
                    <div className="flex-1 md:pl-8">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm dark:border dark:border-gray-600">
                        <div className="flex items-center mb-2">
                          <span className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded text-purple-600 dark:text-purple-400 mr-2">
                            <MessageSquare className="h-4 w-4" />
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Matrix Messaging Output</span>
                        </div>
                        <div className="space-y-3 text-xs">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white mb-1">Primary Headline:</p>
                            <p className="text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                              "Enterprise-Grade Security with Start-up Speed"
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white mb-1">Value Proposition:</p>
                            <p className="text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                              "Reduce implementation time by 60% while maintaining industry-leading security standards and compliance"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative flex flex-col md:flex-row md:items-center">
                    <div className="flex-1 md:text-right md:pr-8 md:order-1">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm dark:border dark:border-gray-600">
                        <div className="flex items-center mb-2">
                          <span className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded text-purple-600 dark:text-purple-400 mr-2">
                            <FileText className="h-4 w-4" />
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Matrix Document Preview</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border dark:border-gray-600 rounded">
                          <div className="h-24 bg-primary/10 dark:bg-primary/20 flex items-center justify-center p-2">
                            <div className="text-center">
                              <div className="text-xs font-bold text-gray-900 dark:text-white">CloudSecure Pro</div>
                              <div className="text-[10px] text-gray-500 dark:text-gray-400">Enterprise-Grade Security with Start-up Speed</div>
                            </div>
                          </div>
                          <div className="p-2">
                            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-3/4"></div>
                            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2"></div>
                            <div className="grid grid-cols-2 gap-1">
                              <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded"></div>
                              <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-700 border-4 border-amber-500 text-amber-500 my-4 md:my-0 z-10">
                      <span className="font-bold">4</span>
                    </div>
                    <div className="flex-1 md:pl-8 md:order-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Matrix Document Creation</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Matrix generates the final marketing documents using brand-approved templates
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="relative flex flex-col md:flex-row md:items-center">
                    <div className="flex-1 md:text-right md:pr-8">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Review & Optimize</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Edit, refine, and collaborate with your team to perfect your marketing assets
                      </p>
                    </div>
                    <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-700 border-4 border-green-500 text-green-500 my-4 md:my-0 z-10">
                      <span className="font-bold">5</span>
                    </div>
                    <div className="flex-1 md:pl-8">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm dark:border dark:border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-2">
                              JS
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-900 dark:text-white">Jane Smith</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">Product Marketing</p>
                            </div>
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">
                            Just now
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs text-gray-700 dark:text-gray-300 mb-2">
                          Can we add a section about compliance certifications to highlight our advantage?
                        </div>
                        <div className="flex justify-end">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                              Apply Edit
                            </Button>
                            <Button size="sm" className="h-6 text-xs px-2">
                              Regenerate
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section id="use-cases" className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Common PMM Use Cases
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Discover how IntellaOne helps product marketers across various scenarios
              </p>
            </div>

            <Tabs defaultValue="messaging" className="max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="messaging">Messaging</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="research">Research</TabsTrigger>
                <TabsTrigger value="campaign">Campaign</TabsTrigger>
              </TabsList>
              
              <TabsContent value="messaging" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Positioning & Messaging</CardTitle>
                    <CardDescription>
                      Create compelling product narratives and value propositions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          What IntellaOne Enables:
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Generate persona-specific messaging that resonates with different audience segments
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Develop competitive positioning that highlights your unique advantages
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Create compelling value propositions supported by real-world data
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Test and optimize messaging with built-in feedback collection
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          Example Outputs:
                        </h4>
                        <ul className="space-y-3">
                          <li className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Strategic Positioning</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Full positioning frameworks with detailed competitive analysis and market positioning</p>
                          </li>
                          <li className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Feature Messaging</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Benefit-focused feature descriptions tailored to different buyer personas</p>
                          </li>
                          <li className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Elevator Pitches</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Concise, compelling pitches of various lengths (5, 15, and 30 seconds)</p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/agents?agent=Matrix">
                      <Button>
                        See Messaging Examples
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="content" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Creation</CardTitle>
                    <CardDescription>
                      Generate high-quality marketing assets in minutes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          What IntellaOne Enables:
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Create one-pagers, battlecards, and sales enablement materials
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Generate launch emails, landing page copy, and ad content
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Build product brochures, comparison sheets, and fact sheets
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Maintain brand consistency across all generated assets
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          Example Outputs:
                        </h4>
                        <ul className="space-y-3">
                          <li className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">One-Pagers</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Concise, visually-structured product summaries with key benefits and specifications</p>
                          </li>
                          <li className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Competitor Battlecards</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Detailed comparison materials with objection handling and competitive advantages</p>
                          </li>
                          <li className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Email Campaigns</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Multi-touch email sequences with subject lines, body copy, and calls to action</p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/agents?agent=Max">
                      <Button>
                        Browse Content Templates
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="research" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Market Research</CardTitle>
                    <CardDescription>
                      Gain competitive insights and understand market trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          What IntellaOne Enables:
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Analyze competitor messaging, positioning, and GTM strategies
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Identify market trends and emerging opportunities
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Gather customer sentiment data and pain points
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Monitor industry news and regulatory changes
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          Example Outputs:
                        </h4>
                        <ul className="space-y-3">
                          <li className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Competitive Analysis</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Detailed breakdown of competitor strengths, weaknesses, and positioning strategy</p>
                          </li>
                          <li className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Market Trend Reports</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Quarterly summaries of emerging trends with supporting data and sources</p>
                          </li>
                          <li className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Voice of Customer Analysis</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Synthesis of customer feedback from reviews, forums, and social channels</p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/agents?agent=Maven">
                      <Button>
                        View Research Capabilities
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="campaign" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Planning</CardTitle>
                    <CardDescription>
                      Design and execute comprehensive marketing campaigns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          What IntellaOne Enables:
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Build comprehensive campaign plans with timelines and deliverables
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Generate consistent messaging across all campaign touchpoints
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Create multi-channel content (email, social, blog, ads)
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2 mt-1 text-green-500">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Track campaign performance and optimize in real-time
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          Example Outputs:
                        </h4>
                        <ul className="space-y-3">
                          <li className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Campaign Briefs</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Comprehensive campaign strategy documents with goals, messaging, and tactics</p>
                          </li>
                          <li className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Channel Plans</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Detailed, channel-specific content plans with messaging consistency</p>
                          </li>
                          <li className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Success Metrics Framework</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">KPI tracking sheets with benchmarks and reporting templates</p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/agents?agent=Motion">
                      <Button>
                        Explore Campaign Tools
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to transform your product marketing?
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-primary-50">
              Join innovative marketing teams using IntellaOne to create compelling, consistent, and conversion-driven marketing.
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 placeholder:text-white/50 text-white"
                />
                <Button size="lg" variant="secondary">
                  Get Early Access
                </Button>
              </div>
              <p className="text-xs text-primary-100 mt-3">
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-medium text-sm uppercase text-gray-500 dark:text-gray-400 mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">Features</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">AI Agents</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">Use Cases</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-sm uppercase text-gray-500 dark:text-gray-400 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">Documentation</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">Community</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">Templates</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-sm uppercase text-gray-500 dark:text-gray-400 mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">About Us</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">Careers</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">Contact</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">Partners</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-sm uppercase text-gray-500 dark:text-gray-400 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">Privacy</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">Terms</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">Security</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-primary mr-2" />
              <span className="font-medium">IntellaOne</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} IntellaOne. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}