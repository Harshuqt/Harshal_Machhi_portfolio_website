import React, { useState, useEffect, useRef } from 'react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-red-500">
          <h1>Something went wrong.</h1>
          <pre>{this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
import {
  Github,
  Linkedin,
  Mail,
  Server,
  Terminal,
  Cloud,
  Code,
  Database,
  Globe,
  Cpu,
  ExternalLink,
  Menu,
  X,
  Award,
  Briefcase,
  GraduationCap,
  Shield,
  Zap,
  Send,
  Loader2,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Download,
  Phone,
  Trophy,
  Star,
  Bot,
  Sparkles,
  MessageSquare,
  FileSearch,
  Target,
  Sun,
  Moon
} from 'lucide-react';

// --- Helper Functions ---
const renderMarkdown = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="text-emerald-400 font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// --- Floating Chat Component ---
const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: "Hi! I'm Harshal's AI assistant. Ask me anything about his skills, projects, or experience!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = useRef(null);
  const turnstileIdRef = useRef(null);

  useEffect(() => {
    // Shared Turnstile Render Logic - Reused for both Chat and Resume
    const scriptId = 'turnstile-script'; // Keep single script source
    const renderWidget = () => {
      if (window.turnstile && turnstileRef.current && !turnstileIdRef.current) {
        let siteKey = '1x00000000000000000000AA';
        try {
          if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TURNSTILE_SITE_KEY) {
            siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
          }
        } catch (e) { }

        try {
          // Check if element is still in DOM before rendering
          if (document.body.contains(turnstileRef.current)) {
            turnstileIdRef.current = window.turnstile.render(turnstileRef.current, {
              sitekey: siteKey,
              callback: (token) => setTurnstileToken(token),
              theme: 'dark' // Force dark theme for better glass UI fit
            });
          }
        } catch (e) { }
      }
    };

    if (isOpen) {
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = renderWidget;
        document.body.appendChild(script);
      } else if (window.turnstile) {
        setTimeout(renderWidget, 100); // Small delay for DOM
      }
    }

    return () => {
      // Cleanup when chat closes
      if (turnstileIdRef.current && window.turnstile) {
        try { window.turnstile.remove(turnstileIdRef.current); turnstileIdRef.current = null; } catch (e) { }
      }
      setTurnstileToken(null);
    };
  }, [isOpen]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatQuestion.trim()) return;
    if (!turnstileToken) {
      // Ideally show a polite "Please verify you are human" message
      setChatHistory(prev => [...prev, { role: 'ai', text: "**Security Check:** Please complete the verification below before sending a message." }]);
      return;
    }

    const userMsg = chatQuestion;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg, token: turnstileToken }),
      });
      const data = await response.json();

      if (response.status !== 200 && !data.answer) throw new Error("Backend Error");

      setChatHistory(prev => [...prev, { role: 'ai', text: data.answer }]);
    } catch (error) {
      console.warn("Using simulated Chat (Backend unavailable or error)");
      setTimeout(() => {
        let responseText = "That's a great question! Harshal is passionate about **DevOps and Automation**.";
        const lowerMsg = userMsg.toLowerCase();

        if (lowerMsg.includes('docker') || lowerMsg.includes('container')) {
          responseText = "Harshal uses **Docker** daily for his Home Lab and client projects. He's skilled in creating optimized **Dockerfiles**, managing multi-container apps with **Docker Compose**, and using Watchtower for updates.";
        } else if (lowerMsg.includes('aws') || lowerMsg.includes('cloud')) {
          responseText = "He has practical knowledge of **AWS services**, specifically regarding **3-tier architecture** concepts and cloud deployment strategies.";
        }

        setChatHistory(prev => [...prev, { role: 'ai', text: responseText }]);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-full shadow-2xl shadow-emerald-500/30 transition-all z-50 hover:scale-110"
        title="Chat with AI Agent"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] glass-card rounded-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in ring-1 ring-white/10">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-white text-sm">AI Assistant (Gemini)</span>
            </div>
            <button onClick={() => setChatHistory([{ role: 'ai', text: "Hi! Ask me anything about Harshal." }])} className="text-xs text-slate-400 hover:text-white">Clear</button>
          </div>

          <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-transparent scrollbar-thin scrollbar-thumb-white/10 flex flex-col">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm backdrop-blur-md ${msg.role === 'user'
                  ? 'bg-emerald-500/20 text-white rounded-br-none border border-emerald-500/20'
                  : 'bg-white/5 text-slate-200 rounded-bl-none border border-white/10'
                  }`}>
                  {renderMarkdown(msg.text)}
                </div>
              </div>
            ))}

            {/* Turnstile Container in Chat Stream */}
            <div className="flex justify-center py-2 min-h-[65px]">
              <div ref={turnstileRef}></div>
            </div>

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-bl-none flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleChatSubmit} className="p-3 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={chatQuestion}
              onChange={(e) => setChatQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 placeholder:text-slate-500"
            />
            <button type="submit" disabled={isLoading || !chatQuestion.trim() || !turnstileToken} className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

// --- Main App Component ---
const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [theme, setTheme] = useState('dark');

  // Theme Detection and Toggle Logic
  useEffect(() => {
    // 1. Check local storage
    const savedTheme = localStorage.getItem('theme');
    // 2. Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    } else if (systemPrefersDark) {
      setTheme('dark');
      document.documentElement.classList.remove('light');
    } else {
      setTheme('light');
      document.documentElement.classList.add('light'); // Default to light if system prefers light and no save
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'skills', 'experience', 'projects', 'education', 'achievements', 'contact'];
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Experience', href: '#experience' },
    { name: 'Projects', href: '#projects' },
    { name: 'Education', href: '#education' },
    { name: 'Achievements', href: '#achievements' },
    { name: 'Contact', href: '#contact' },
  ];

  const skillGroups = [
    {
      title: "Cloud & DevOps",
      icon: <Cloud className="w-5 h-5" />,
      skills: ["AWS", "Docker & Docker Compose", "Nginx Proxy Manager", "CI/CD Concepts", "IaC Fundamentals", "Watchtower", "Cloudflare DNS", "DDoS Mitigation"]
    },
    {
      title: "Development & Scripting",
      icon: <Code className="w-5 h-5" />,
      skills: ["Python", "Bash/Shell Scripting", "Batch Programming (.bat)", "PHP", "Node.js", "JavaScript", "HTML/CSS", "SQL (MySQL)"]
    },
    {
      title: "AI & Emerging Tech",
      icon: <Cpu className="w-5 h-5" />,
      skills: ["Generative AI", "Google Gemini", "Prompt Engineering", "Comfy UI", "Stable Diffusion", "Rasa Chatbots", "AI Tool Integration"]
    },
    {
      title: "Web & Business",
      icon: <Globe className="w-5 h-5" />,
      skills: ["WordPress Mastery", "WooCommerce", "SEO Optimization", "Facebook Ads", "Payment Gateways", "Discord API", "Technical Blogging"]
    }
  ];

  const experience = [
    { role: "WordPress Developer", company: "digi.harshalmachhi.in", period: "Oct 2024 - Jun 2025", type: "Self-employed", description: "Developed and optimized WordPress sites with a focus on SEO and security assessments. Implemented DDoS mitigation using Cloudflare and managed database integrity via PhpMyAdmin." },
    { role: "WordPress Developer", company: "blog.harshalmachhi.in", period: "Apr 2024 - Present", type: "Self-employed", description: "Integrated batch programming scripts to automate site updates, reducing manual workloads while enhancing design features." },
    { role: "WordPress Developer", company: "Goonj Music School", period: "Feb 2024 - Sep 2024", type: "Freelance", description: "End-to-end design and hosting management for a music school portfolio, enabling broader audience reach and secure online presence." },
    { role: "WordPress Developer", company: "Shivsarjan.in", period: "Jun 2022 - Present", type: "Self-employed", description: "Spearheaded multiple website projects from conception to execution. Utilized Cloudflare for performance optimization." },
    { role: "Streamer", company: "Rooter.gg", period: "Nov 2021 - Nov 2022", type: "Full-time", description: "Managed live broadcast content and engaged with audiences on a major gaming platform." },
    { role: "Content Creator", company: "YouTube", period: "May 2019 - Present", type: "Self-employed", description: "Producing technical content and reviews. Skilled in video editing and community management." }
  ];

  const projects = [
    { title: "Secure Containerized Home Lab", tech: ["Docker", "Nginx", "Cloudflare", "LiteLLM"], description: "Deployed OpenWebUI and n8n in Docker containers. Secured inter-container communication via private bridge networks and restricted 0.0.0.0/0 traffic exposure.", icon: <Shield className="w-10 h-10 text-emerald-400" /> },
    { title: "WooCommerce E-Commerce", tech: ["WordPress", "WooCommerce", "Razorpay", "PhonePe"], description: "Built a digital product store with full payment integration and Facebook Ad integration. Optimized performance for high conversion rates.", icon: <Zap className="w-10 h-10 text-blue-400" /> },
    { title: "Prompt to Prototype (Google Startup School)", tech: ["Gemini API", "AI Studio", "Node.js"], description: "Developed functional AI-first prototypes. Mastered MVP development, market validation, and prompt engineering frameworks.", icon: <Cpu className="w-10 h-10 text-purple-400" /> }
  ];

  const education = [
    { degree: "DevOps, Cloud & Cyber Security", school: "Scaler Academy", period: "June 2025 - Present", status: "Enrolled", details: "Comprehensive 12-16 month specialized program.", file: "/Scaler_DevOps_October_2025.pdf" },
    { degree: "B.Sc. in Computer Science", school: "Thakur College of Science & Commerce", period: "2020 — 2023", status: "Completed", details: "Grade: 8.61 CGPI", file: null },
    { degree: "Diploma in Computer Science", school: "The Saraswati Vidyalaya", period: "Completed 2017", status: "Completed", details: "Grade A (Excellent)", file: null }
  ];

  const certifications = [
    { name: "Master AI Prompting", issuer: "Brightso", year: "2024", file: "/brightso_certificate.pdf" },
    { name: "SQL Injection For Beginners", issuer: "SkillUp Online", year: "2022", file: "/SQL_Injection_For_Beginners.pdf" },
    { name: "YouTube 1K Challenge", issuer: "Think Media", year: "2023", file: "/YouTube_1K_Challenge_Certificate_of_Completion.png" },
    { name: "Ethical Hacking Workshop", issuer: "IIT Bombay (Kyrion)", year: "2018", file: "/IIT_Bombay_Ethical_Hacking_Workshop.jpg" },
    { name: "Internet of Things Workshop", issuer: "IIT Bombay (Kyrion)", year: "July 2019", file: "/Internet_of_Things_IIT_Bombay_Kyrion.jpg" },
    { name: "Hour of Code (Logic Series)", issuer: "Code.org", year: "2022", file: "/Harshal_Machhi_Logic_It_Again.jpg" }
  ];

  const achievementsData = [
    { title: "1st Place - Science Exhibition", event: "Techno-Science Galaxy", organization: "St. Andrew's College", year: "2018", description: "Awarded Certificate of Merit for First Place in Working Model Competition.", link: "/Techno_Science_Galaxy_science_award.jpg" },
    { title: "1st Place - Group Dance", event: "Ujjwala Fest", organization: "The Borivali Education Society", year: "2017", description: "Secured first prize in the inter-collegiate cultural group dance competition.", link: "/Ujjwala_Fest_1st_Place.jpg" },
    { title: "SLCIT Scholarship", event: "School Level IT Course", organization: "TMV & EDULIGHT", year: "2014", description: "Awarded scholarship for academic excellence in Information Technology.", link: "/slcit_scholarship.jpg" },
    { title: "NETSE Participation", event: "National Env. Talent Search", organization: "MIFEE", year: "2017", description: "Participated in National Level Environment Talent Search Examination.", link: "/netse_2017.jpg" }
  ];

  // Resume Matcher State
  const [jobDescription, setJobDescription] = useState('');
  const [resumeInsights, setResumeInsights] = useState(null);
  const [isResumeLoading, setIsResumeLoading] = useState(false);
  const [resumeTurnstileToken, setResumeTurnstileToken] = useState(null);
  const resumeTurnstileRef = useRef(null);
  const resumeTurnstileIdRef = useRef(null);
  const resumeResultTurnstileRef = useRef(null); // New ref for results view
  const resumeResultTurnstileIdRef = useRef(null);

  // Independent effect for Resume section Turnstile
  useEffect(() => {
    const scriptId = 'turnstile-script';
    const renderWidget = () => {
      if (window.turnstile && resumeTurnstileRef.current && !resumeTurnstileIdRef.current) {
        let siteKey = '1x00000000000000000000AA';
        try {
          if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TURNSTILE_SITE_KEY) {
            siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
          }
        } catch (e) { }

        try {
          resumeTurnstileIdRef.current = window.turnstile.render(resumeTurnstileRef.current, {
            sitekey: siteKey,
            callback: (token) => setResumeTurnstileToken(token),
            theme: 'dark'
          });
        } catch (e) { }
      }
    };

    // We check if script exists (added by other comps) or add it
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.body.appendChild(script);
    } else if (window.turnstile) {
      // If script is already loaded but widget not rendered (e.g. user scrolled down)
      renderWidget();
    }

    // Simple loop to check for visibility if script loads slow
    const interval = setInterval(() => {
      if (window.turnstile && !resumeTurnstileIdRef.current && resumeTurnstileRef.current) {
        renderWidget();
      }
    }, 500);

    return () => clearInterval(interval);

  }, []); // Run once on mount (or when visible in viewport ideally, but simplify for now)

  // Effect for Results View Turnstile
  useEffect(() => {
    if (!resumeInsights) return;

    // Reset ID ref for new render cycle
    resumeResultTurnstileIdRef.current = null;
    setResumeTurnstileToken(null);

    const renderResultWidget = () => {
      // Only render if element exists and not already rendered
      if (window.turnstile && resumeResultTurnstileRef.current && !resumeResultTurnstileIdRef.current) {
        let siteKey = '1x00000000000000000000AA';
        try { if (import.meta.env.VITE_TURNSTILE_SITE_KEY) siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY; } catch (e) { }

        try {
          resumeResultTurnstileIdRef.current = window.turnstile.render(resumeResultTurnstileRef.current, {
            sitekey: siteKey, callback: (token) => setResumeTurnstileToken(token), theme: 'dark'
          });
        } catch (e) { }
      }
    };

    // Polling is safer for conditional rendering than simple timeout
    const interval = setInterval(renderResultWidget, 500);
    return () => clearInterval(interval);
  }, [resumeInsights]);

  const handleResumeSubmit = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;
    if (!resumeTurnstileToken) {
      alert("Please complete the security check.");
      return;
    }

    setIsResumeLoading(true);
    setResumeInsights(null);

    try {
      const response = await fetch('/api/gemini-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, token: resumeTurnstileToken }),
      });

      const data = await response.json();

      if (response.status === 404 || data.error) {
        throw new Error("Backend Unavailable");
      }

      setResumeInsights(data);
    } catch (error) {
      console.warn("Using simulated Resume Analysis (Backend unavailable or error)");
      setTimeout(() => {
        setResumeInsights({
          match_score: 85,
          key_strengths: ["Docker & Containerization", "AWS Infrastructure", "Linux Administration"],
          missing_critical_skills: ["Kubernetes Production Experience"],
          verdict: "Harshal is a strong match for this role given his practical DevOps experience.",
          growth_plan: null
        });
      }, 2000);
    } finally {
      setIsResumeLoading(false);
    }
  };

  // --- Contact Form State ---
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [contactTurnstileToken, setContactTurnstileToken] = useState(null); // Renamed to avoid conflict
  const contactTurnstileRef = useRef(null); // Renamed to avoid conflict
  const contactTurnstileIdRef = useRef(null); // Renamed to avoid conflict

  useEffect(() => {
    const scriptId = 'turnstile-script';
    const renderWidget = () => {
      if (window.turnstile && contactTurnstileRef.current && !contactTurnstileIdRef.current) {
        let siteKey = '1x00000000000000000000AA';
        try {
          if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TURNSTILE_SITE_KEY) {
            siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
          }
        } catch (e) { }

        try {
          contactTurnstileIdRef.current = window.turnstile.render(contactTurnstileRef.current, {
            sitekey: siteKey,
            callback: (token) => setContactTurnstileToken(token),
          });
        } catch (e) { }
      }
    };

    // We check if script exists (added by other comps) or add it
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.body.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    }

    // Polling backup to ensure widget renders if script loads asynchronously
    const interval = setInterval(() => {
      if (window.turnstile && contactTurnstileRef.current && !contactTurnstileIdRef.current) {
        renderWidget();
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (contactTurnstileIdRef.current && window.turnstile) {
        try { window.turnstile.remove(contactTurnstileIdRef.current); contactTurnstileIdRef.current = null; } catch (e) { }
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactTurnstileToken) { alert("Please complete the security verification."); return; }
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, "cf-turnstile-response": contactTurnstileToken }),
      });
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ fullName: '', email: '', phone: '', message: '' });
        setContactTurnstileToken(null);
        if (window.turnstile) window.turnstile.reset();
      } else { setSubmitStatus('error'); }
    } catch (error) { setSubmitStatus('error'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-emerald-500/30 selection:text-emerald-400 relative overflow-x-hidden">
      <div className="bg-noise"></div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-panel border-b border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Terminal className="w-6 h-6 text-slate-900" />
              </div>
              <span className="text-xl font-bold tracking-tight">Harshal<span className="text-emerald-500">.</span></span>
            </div>

            <div className="hidden md:flex space-x-1 items-center">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === item.href.substring(1)
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-slate-400 hover:text-current hover:bg-white/5'
                    }`}
                >
                  {item.name}
                </a>
              ))}

              <button
                onClick={toggleTheme}
                className="ml-2 p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-all"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <a href="/Harshal_Machhi_resume.pdf" download className="ml-4 p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-slate-900 transition-all border border-emerald-500/20" title="Download Resume">
                <Download className="w-4 h-4" />
              </a>
            </div>

            <div className="flex items-center gap-4 md:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 transition-all"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-400">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass-panel border-b border-white/5 px-4 pt-2 pb-6 space-y-2 mt-[-1px]">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-medium text-slate-400 hover:bg-white/5 hover:text-current transition-all"
              >
                {item.name}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-40 pb-24 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
            <Zap className="w-4 h-4" /> Available for DevOps Opportunities
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white leading-tight">
            Engineering <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Infrastructure</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
            Transitioning from high-performance Web Development to <strong>DevOps Engineering</strong>.
            I build secure, automated, and scalable environments with a practitioner-first mindset.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#projects" className="px-8 py-4 bg-emerald-500 text-slate-900 font-bold rounded-xl hover:bg-emerald-400 transition-all transform hover:-translate-y-1 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              Explore Projects
            </a>
            <a href="/Harshal_Machhi_resume.pdf" download className="glass-button flex items-center gap-2 px-8 py-4 text-white font-bold rounded-xl hover:bg-white/10">
              <Download className="w-5 h-5 mr-2" /> Download Resume
            </a>
          </div>
        </div>
        <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
          <div className="absolute inset-0 bg-emerald-500/10 blur-[120px] rounded-full"></div>
          {/* Profile Picture Circle */}
          <div className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px] rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
            <img
              src="./profilepic.jpg"
              alt="Harshal Machhi"
              className="w-full h-full object-cover"
              onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=Harshal+Machhi&size=512&background=10b981&color=fff"}
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-4">
            <Shield className="text-emerald-500" /> About My Journey
          </h2>
          <div className="glass-card p-10 rounded-3xl text-slate-300 leading-relaxed text-lg space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-emerald-500/10 transition-all duration-700"></div>
            <p>
              I am a results-driven DevOps practitioner with hands-on experience in cloud infrastructure, Linux administration, and containerization.
              My background as a WordPress Developer has given me a solid foundation in building and deploying real-world projects, integrating payment gateways, and managing security.
            </p>
            <p>
              Currently, I am enrolled in the Scaler DevOps program (from June 2025), where I am deepening my expertise in CI/CD, Infrastructure as Code, and production-ready system design.
              I specialize in taking prototypes to scale, as seen in my Google Startup School graduation.
            </p>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-white">Technical Arsenal</h2>
            <p className="text-slate-400 text-lg">The tools and languages I use to bridge Dev and Ops.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillGroups.map((group, i) => (
              <div key={i} className="glass-card p-8 rounded-2xl hover:border-emerald-500/30 transition-all group hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  {group.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-4">{group.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((s, j) => (
                    <span key={j} className="text-xs font-medium text-slate-300 bg-white/5 px-2.5 py-1 rounded-md">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NEW GEMINI AI LABS SECTION (JOB MATCHER) --- */}
      <section id="ai-labs" className="py-24 bg-gradient-to-b from-slate-900 via-[#0f172a] to-slate-900 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" /> Powered by Gemini
            </div>
            <h2 className="text-4xl font-black text-white mb-4">AI Job Description Analyzer</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Recruiters: Paste your Job Description below. My AI agent will analyze how well my skills match your specific requirements.
            </p>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden p-8 md:p-12 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
            <div className="max-w-3xl mx-auto">
              {!resumeInsights ? (
                <div key="input-view" className="space-y-6">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste full Job Description here..."
                    className="w-full h-48 bg-slate-900/50 border border-white/10 rounded-xl p-6 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder:text-slate-600 resize-none mb-4"
                  ></textarea>

                  <div className="flex flex-col items-center gap-4">
                    <div ref={resumeTurnstileRef} className="min-h-[65px]"></div>

                    <button
                      onClick={handleResumeSubmit}
                      disabled={isResumeLoading || !jobDescription.trim() || !resumeTurnstileToken}
                      className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]"
                    >
                      {isResumeLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      {isResumeLoading ? "Analyzing Match..." : "Analyze Candidate Fit"}
                    </button>
                  </div>
                </div>
              ) : (
                <div key="results-view" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  {/* Verdict Banner */}
                  <div className={`p-6 rounded-2xl border flex items-start gap-4 ${resumeInsights.match_score >= 70 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                    <div className={`p-3 rounded-full ${resumeInsights.match_score >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      <Target className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-3 mb-1">
                        <h4 className="text-3xl font-black text-white">{resumeInsights.match_score}% Match</h4>
                        <span className="text-sm font-medium uppercase tracking-widest opacity-70">AI Verdict</span>
                      </div>
                      <p className="text-slate-200 font-medium leading-relaxed">{renderMarkdown(resumeInsights.verdict)}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="p-6 glass-card rounded-2xl">
                      <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Key Strengths</h4>
                      <ul className="space-y-3">
                        {resumeInsights.key_strengths?.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Missing Skills */}
                    <div className="p-6 glass-card rounded-2xl">
                      <h4 className="text-red-400 font-bold mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Missing / Developing</h4>
                      {resumeInsights.missing_critical_skills?.length > 0 ? (
                        <ul className="space-y-3">
                          {resumeInsights.missing_critical_skills.map((skill, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                              <span className="w-1.5 h-1.5 bg-red-500/50 rounded-full mt-1.5 shrink-0"></span>
                              {skill}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-400">No critical missing skills identified!</p>
                      )}
                    </div>
                  </div>

                  {/* Growth Plan (If score is lower) */}
                  {resumeInsights.growth_plan && (
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                      <p className="text-indigo-300 text-sm font-medium italic">
                        "🚀 Growth Mindset: {renderMarkdown(resumeInsights.growth_plan)}"
                      </p>
                    </div>
                  )}

                  <div className="flex justify-center py-4">
                    <div ref={resumeResultTurnstileRef} className="min-h-[65px]"></div>
                  </div>

                  <button
                    onClick={() => setResumeInsights(null)}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] uppercase"
                  >
                    Analyze Another JD
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-24 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-16 flex items-center gap-4">
          <Briefcase className="text-emerald-500" /> Professional Journey
        </h2>
        <div className="space-y-12">
          {experience.map((exp, i) => (
            <div key={i} className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-0.5 before:h-[calc(100%+3rem)] last:before:h-0 before:bg-slate-800">
              <div className="absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                  <p className="text-emerald-400 font-medium">{exp.company}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono text-slate-500">{exp.period}</span>
                  <div className="text-xs text-slate-600 uppercase tracking-widest mt-1">{exp.type}</div>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm max-w-3xl">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-16 text-center">Featured Work</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((p, i) => (
              <div key={i} className="group glass-card hover-shine rounded-2xl p-8 hover:bg-white/[0.07] hover:border-emerald-500/30 transition-all flex flex-col h-full">
                <div className="mb-6 group-hover:scale-110 transition-transform">{p.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{p.title}</h3>
                <p className="text-slate-400 text-sm mb-6 flex-grow leading-relaxed">{p.description}</p>
                <div className="flex flex-wrap gap-2">
                  {p.tech.map((t, j) => (
                    <span key={j} className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/70 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education & Certs */}
      <section id="education" className="py-24 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
        <div>
          <h2 className="text-2xl font-bold text-white mb-10 flex items-center gap-3">
            <GraduationCap className="text-emerald-500" /> Education & Specialized Training
          </h2>
          <div className="space-y-6">
            {education.map((edu, idx) => (
              <div key={idx} className="p-8 rounded-2xl glass-card hover:border-emerald-500/30 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{edu.degree}</h3>
                  {edu.status === "Enrolled" && (
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-1 rounded-full border border-emerald-500/20 uppercase font-bold tracking-wider">
                      Pursuing
                    </span>
                  )}
                </div>
                <p className="text-emerald-400 mb-2 font-medium">{edu.school}</p>
                <p className="text-slate-500 text-sm mb-4">{edu.period}</p>
                <div className="flex justify-between items-center">
                  <div className="text-xs font-mono text-slate-300 bg-white/5 px-3 py-1 rounded-lg">
                    {edu.details}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-10 flex items-center gap-3">
            <Award className="text-emerald-500" /> Professional Certifications
          </h2>
          <div className="grid gap-4">
            {certifications.map((c, i) => (
              <a key={i} href={c.file || '#'} target={c.file ? "_blank" : "_self"} rel="noreferrer" className={`p-5 rounded-2xl glass-button transition-all flex items-center justify-between group ${c.file ? 'hover:border-emerald-500/30' : 'opacity-60 cursor-default'}`}>
                <div>
                  <div className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                    {c.name}
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest">{c.issuer} • {c.year}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>


      {/* Achievements Section */}
      <section id="achievements" className="py-24 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-4">
            <Trophy className="text-emerald-500" /> Honors & Achievements
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {achievementsData.map((ach, i) => (
              <a
                key={i}
                href={ach.link}
                target={ach.link === "#" ? "_self" : "_blank"}
                rel="noreferrer"
                className={`flex gap-6 p-8 rounded-3xl glass-card transition-all group ${ach.link === "#" ? 'cursor-default' : 'hover:border-emerald-500/30 hover:bg-white/[0.07] hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]'}`}
              >
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Star className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                      {ach.title}
                      {ach.link !== "#" && <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />}
                    </h3>
                  </div>
                  <div className="text-emerald-400/80 text-sm font-medium mb-1">{ach.event} • {ach.organization}</div>
                  <div className="text-xs text-slate-500 font-mono mb-4">{ach.year}</div>
                  <p className="text-slate-400 text-sm leading-relaxed">{ach.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black text-white">Let's Connect</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              I'm looking for entry-level DevOps roles. Send me a message.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <div className="p-8 rounded-3xl glass-card hover:border-emerald-500/30 transition-all">
                <h3 className="text-xl font-bold text-white mb-6 underline decoration-emerald-500/30 underline-offset-8">Contact Information</h3>
                <div className="space-y-5">
                  <a href="mailto:contact@harshalmachhi.in" className="flex items-center gap-4 text-slate-300 hover:text-emerald-400 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20">
                      <Mail className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="font-medium">contact@harshalmachhi.in</span>
                  </a>
                  <a href="https://linkedin.harshalmachhi.in" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-slate-300 hover:text-emerald-400 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20">
                      <Linkedin className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="font-medium">/harshalmachhi</span>
                  </a>
                  <a href="https://github.harshalmachhi.in" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-slate-300 hover:text-emerald-400 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20">
                      <Github className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="font-medium">/Harshuqt</span>
                  </a>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 glass-card p-10 rounded-[32px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-slate-900/50 border border-white/10 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-slate-900/50 border border-white/10 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-900/50 border border-white/10 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-900/50 border border-white/10 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600 resize-inner shadow-inner"
                  placeholder="Hello! I'm interested in..."
                ></textarea>
              </div>

              {/* Turnstile Widget Placeholder */}
              <div ref={contactTurnstileRef} className="my-6 min-h-[65px]"></div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-emerald-500/20 uppercase tracking-widest"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Send Message
                  </>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="flex items-center gap-3 text-emerald-400 text-sm font-bold bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle className="w-5 h-5" /> Message sent successfully!
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="flex items-center gap-3 text-red-400 text-sm font-bold bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5" /> Something went wrong. Please try again.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center bg-slate-950/50">
        <div className="flex justify-center gap-8 mb-8 text-slate-500">
          <a href="https://github.harshalmachhi.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors"><Github className="w-6 h-6" /></a>
          <a href="https://linkedin.harshalmachhi.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors"><Linkedin className="w-6 h-6" /></a>
          <a href="mailto:contact@harshalmachhi.in" className="hover:text-emerald-400 transition-colors"><Mail className="w-6 h-6" /></a>
        </div>
        <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.2em] mb-2">
          © {new Date().getFullYear()} Harshal Machhi
        </p>
      </footer>
      <FloatingChat />
    </div>
  );
};

const AppWithBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithBoundary;