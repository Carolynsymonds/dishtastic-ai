export const siteContent = {
  // Analytics Configuration
  analytics: {
    googleAnalyticsId: "G-WS625DG4GT"
  },

  // Theme Configuration
  theme: {
    primaryColor: "#fe6743", // Orange HSL values for MenuProfitMax
  },

   // Top Banner
  topBanner: {
    text: "First 100 Restaurants Get MenuProfitMax Free for 12 Months (worth $1,188)",
    buttonText: "Join Free"
  },

  // Brand and Logo
  brand: {
    name: "MenuProfitMax",
    logoUrl: "https://brahykobgryxdjihihrk.supabase.co/storage/v1/object/public/site-images/1756215588100-mwy3h116xhk.png",
    primaryColor: "12 99% 65%",
    footerLogoUrl: "https://brahykobgryxdjihihrk.supabase.co/storage/v1/object/public/site-images/1756215590798-pbgytrkqoqm.png"
  },

  // Headline Section
  headline: {
    title: "Maximize Your Restaurant Profits with Smarter Menu Costing — ",
    titleHighlight: "For Free",
    get subtitle() { return `Be among the first to maximize restaurant profits with smarter menu costing. Early adopters get MenuProfitMax free for 12 months ($1,188 value).`; },
    buttonText: "Try for free",
    buttonTextLight: " for 12 months",
    disclaimer: "No credit card required"
  },

  // Home Page Section
  homePage: {
    title: "Smarter Menu Costing. Bigger Profits.",
    subtitle: "Track ingredient costs, compare suppliers, and maximize profit margins with real-time insights.",
    buttonText: "Try for free",
    buttonTextLight: ""
  },

  // Features Section
  features: {
    title: "Menu Costing Made Simple",
    subtitle: "Revolutionize your kitchen operations with these powerful capabilities.",
    items: [
      {
        icon: "/lovable-uploads/cd909169-fdc5-4959-8640-b478cc3c5198.png",
        title: "Ingredient Costing",
        description: "Breaks down cost per dish in real-time."
      },
      {
        icon: "/lovable-uploads/0abb7956-aef2-4ac6-a711-5faf5d1350a9.png",
        title: "Profit Margins",
        description: "Instantly shows profitability of each menu item."
      },
      {
        icon: "/lovable-uploads/2c3acdb8-e7ea-4e9f-bbe3-f76f3126f9f4.png",
        title: "Supplier Comparison",
        description: "Compare costs across vendors."
      }
    ]
  },

  // Team Roles Section
  teamRoles: {
    title: "Tools for Every Role in Your Restaurant",
    subtitle: "Empower your team with specialized tools and insights.",
    roles: [
      {
        icon: "https://brahykobgryxdjihihrk.supabase.co/storage/v1/object/public/site-images/team-role-icons/7f131ee6-3b09-40a2-b133-4b201a430239/kitchen-manager-1756215053691.svg+xml",
        title: "Kitchen Manager",
        description: "Oversee kitchen operations, manage inventory, and ensure food quality."
      },
      {
        icon: "https://brahykobgryxdjihihrk.supabase.co/storage/v1/object/public/site-images/team-role-icons/7f131ee6-3b09-40a2-b133-4b201a430239/financial-supervisor-1756215054712.svg+xml",
        title: "Financial Supervisor",
        description: "Monitor financial performance, manage budgets, and analyze profit margins."
      },
      {
        icon: "https://brahykobgryxdjihihrk.supabase.co/storage/v1/object/public/site-images/team-role-icons/7f131ee6-3b09-40a2-b133-4b201a430239/staff-member-1756215064570.svg+xml",
        title: "Staff Member",
        description: "Utilize tools for daily tasks, manage orders, and submit invoices."
      }
    ]
  },

  // Feature Intro Section
  featureIntro: {
    title: "Unlock the Full Potential of Your Menu",
    description: "MenuProfitMax equips foodservice businesses with powerful tools to manage costs, track profits, and ensure optimal pricing."
  },

  // Split Screen Section
  splitScreen: {
    sections: [
      {
        id: "ingredientCosting",
        image: "https://brahykobgryxdjihihrk.supabase.co/storage/v1/object/public/site-images/split-screen-0-1756215077055.webp",
        title: "Ingredient Costing",
        features: [
          "Breaks down cost per dish in real-time",
          "Enables informed pricing decisions",
          "Improves menu profitability"
        ],
        imageAlt: "Recraft generated image for Ingredient Costing",
        description: "Get real-time insights into your ingredient costs to make informed pricing decisions."
      },
      {
        id: "profitMargins",
        image: "https://brahykobgryxdjihihrk.supabase.co/storage/v1/object/public/site-images/split-screen-1-1756215079380.webp",
        title: "Profit Margins",
        features: [
          "Instant profitability overview",
          "Quickly assess menu item success",
          "Optimize pricing strategies"
        ],
        imageAlt: "Recraft generated image for Profit Margins",
        description: "Stay informed about the profitability of each menu item to maximize your profits."
      },
      {
        id: "supplierComparison",
        image: "https://brahykobgryxdjihihrk.supabase.co/storage/v1/object/public/site-images/split-screen-2-1756215080825.webp",
        title: "Supplier Comparison",
        features: [
          "Compare vendor prices",
          "Reduce ingredient costs",
          "Streamline ordering process"
        ],
        imageAlt: "Recraft generated image for Supplier Comparison",
        description: "Easily compare supplier costs to ensure you're getting the best prices for your ingredients."
      }
    ]
  },

  // All Features Section
  allFeatures: {
    title: "From Invoices to Inventory — All in One Place",
    ctaText: "Explore our features",
    subtitle: "Everything you need to succeed.",
    financialTools: {
      title: "Financial Tools",
      features: [
        {
          icon: "Settings",
          isNew: false,
          title: "POS & Accounting Integrations",
          description: "Integrate with existing POS and accounting systems."
        },
        {
          icon: "Wifi",
          isNew: false,
          title: "Mobile App for Invoice Upload",
          description: "Use our mobile app to upload invoices on the go."
        }
      ]
    },
    operationalManagement: {
      title: "Complete Cost & Operations Control",
      features: [
        {
          icon: "FileText",
          isNew: false,
          title: "Automated Invoice Processing",
          description: "Simplify invoice management with automated processing."
        },
        {
          icon: "Receipt",
          isNew: false,
          title: "Bill Payment & AP Automation",
          description: "Automate accounts payable and streamline bill payments."
        },
        {
          icon: "Utensils",
          isNew: false,
          title: "Real-time Food & Labor Cost Tracking",
          description: "Track food and labor costs in real-time to manage expenses."
        },
        {
          icon: "Settings",
          isNew: false,
          title: "Daily Controllable P&L Reports",
          description: "Receive daily reports for better financial control."
        },
        {
          icon: "Box",
          isNew: false,
          title: "Inventory Management & Usage Tracking",
          description: "Manage inventory and track usage efficiently."
        },
        {
          icon: "Calculator",
          isNew: false,
          title: "Recipe/Menu Cost Analysis",
          description: "Analyze recipes and menus to optimize costs."
        },
        {
          icon: "ShoppingCart",
          isNew: false,
          title: "Order Management & Vendor Ordering",
          description: "Manage orders and vendor relationships seamlessly."
        },
        {
          icon: "DollarSign",
          isNew: false,
          title: "Price Alerts for Cost Changes",
          description: "Get alerts for ingredient price changes to adjust pricing."
        }
      ]
    }
  },

  // Features Page
  featuresPage: {
    title: "Everything MenuProfitMax Offers",
    benefits: [
      {
        icon: "TrendingUp",
        title: "Boost Profitability"
      },
      {
        icon: "DollarSign",
        title: "Reduce Costs"
      },
      {
        icon: "BarChart3",
        title: "Data-Driven Decisions"
      },
      {
        icon: "Shield",
        title: "Streamlined Operations"
      }
    ],
    features: [
      {
        items: [
          {
            icon: "https://brahykobgryxdjihihrk.supabase.co/storage/v1/object/public/site-images/feature-icon-0-1756215065573.svg+xml",
            name: "Ingredient Costing",
            description: "Breaks down cost per dish in real-time."
          },
          {
            icon: "https://brahykobgryxdjihihrk.supabase.co/storage/v1/object/public/site-images/feature-icon-1-1756215082435.svg+xml",
            name: "Profit Margins",
            description: "Instantly shows profitability of each menu item."
          },
          {
            icon: "https://brahykobgryxdjihihrk.supabase.co/storage/v1/object/public/site-images/feature-icon-2-1756215066377.svg+xml",
            name: "Supplier Comparison",
            description: "Compare costs across vendors."
          }
        ],
        title: "Cost Management Insights"
      },
      {
        items: [
          {
            icon: "Zap",
            name: "Dynamic Pricing Optimization",
            description: "Automatically adjust your menu prices based on ingredient cost changes and market trends to maximize profitability."
          },
          {
            icon: "BarChart3",
            name: "Comprehensive Analytics Dashboard",
            description: "Access a real-time analytics dashboard that provides insights into menu performance, customer preferences, and financial metrics."
          },
          {
            icon: "Box",
            name: "Automated Inventory Replenishment",
            description: "Set thresholds for inventory levels and automate reorder processes, ensuring you never run out of key ingredients."
          },
          {
            icon: "Users",
            name: "Supplier Performance Tracking",
            description: "Evaluate supplier reliability and pricing trends to make informed decisions on vendor selection and negotiation."
          },
          {
            icon: "Utensils",
            name: "Custom Recipe Scaling",
            description: "Easily scale recipes for any volume while maintaining cost efficiency, ensuring consistency across all dishes."
          },
          {
            icon: "Wifi",
            name: "Mobile Cost Tracking",
            description: "Track costs and expenses on-the-go via our mobile app, enabling real-time updates and decision-making."
          },
          {
            icon: "Settings",
            name: "Enhanced POS Integration",
            description: "Seamlessly integrate with your existing POS systems for real-time data synchronization, improving accuracy and efficiency."
          },
          {
            icon: "Shield",
            name: "Accountability & Audit Trail",
            description: "Keep a detailed audit trail of all financial transactions and adjustments for compliance and accountability."
          }
        ],
        title: "Smart Operations Management"
      }
    ],
    subtitle: "Comprehensive tools and features designed specifically for menuprofitmax users"
  },

  // Pricing Page
  pricing: {
    title: "Choose Your Plan",
    subtitle: "Flexible pricing tailored for every restaurant size.",
    plans: [
      {
        cta: "Try for free - for 12 months",
        name: "Free",
        price: 0,
        period: "/month",
        popular: false,
        features: [
          "Ingredient Costing: Breaks down cost per dish in real-time.",
          "Profit Margins: Instantly shows profitability of each menu item.",
          "Supplier Comparison: Compare costs across vendors.",
          "Basic inventory management & usage tracking."
        ],
        description: "Get started with Menu Profit Max for free for one year, providing essential menu costing tools."
      },
      {
        cta: "Get Started",
        name: "Standard",
        price: "99",
        period: "/month",
        popular: true,
        features: [
          "All Free plan features",
          "Real-time food & labor cost tracking.",
          "Daily controllable P&L reports.",
          "Order management & vendor ordering.",
          "Priority support included."
        ],
        description: "Unlock advanced features to optimize your menu and maximize profits."
      }
    ]
  },

  // Hero Banner
  heroBanner: {
    title: "Step into the future of kitchen operations",
    get description() { return `Join hundreds of restaurants and teams using ${siteContent.brand.name} to streamline menu management, cut costs, and enhance profits—faster.`; },
    buttonText: "Try for free",
    buttonTextLight: " for 12 months"
  }
};