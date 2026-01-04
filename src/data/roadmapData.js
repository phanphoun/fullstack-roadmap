export const roadmapData = {
  title: "Full-Stack Developer Roadmap 2026",
  description: "A comprehensive 12-month journey to become a job-ready full-stack developer",
  totalDuration: "12 months",
  
  phases: [
    {
      id: "phase1",
      title: "Foundation Building",
      duration: "Months 1-3",
      description: "Master the fundamentals of web development",
      color: "blue",
      sections: [
        {
          id: "month1",
          title: "Month 1: Web Fundamentals",
          duration: "4 weeks",
          items: [
            {
              id: "html-css",
              title: "HTML & CSS Mastery",
              description: "Semantic HTML5, modern CSS, responsive design, accessibility",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "MDN Web Docs", url: "https://developer.mozilla.org/" },
                { name: "CSS Grid Garden", url: "https://cssgridgarden.com/" }
              ],
              projects: ["Personal portfolio", "Responsive landing page", "Interactive quiz"]
            },
            {
              id: "javascript",
              title: "JavaScript Essentials",
              description: "ES6+, DOM manipulation, events, async programming",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "JavaScript.info", url: "https://javascript.info/" },
                { name: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" }
              ],
              projects: ["Interactive calculator", "Image gallery", "To-do list app"]
            }
          ]
        },
        {
          id: "month2",
          title: "Month 2: Frontend Frameworks",
          duration: "4 weeks",
          items: [
            {
              id: "react-basics",
              title: "React.js Deep Dive",
              description: "Components, JSX, props, state, hooks",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "React Documentation", url: "https://react.dev/" },
                { name: "freeCodeCamp React", url: "https://www.freecodecamp.org/learn/" }
              ],
              projects: ["Todo app", "Weather app", "Product catalog"]
            },
            {
              id: "react-advanced",
              title: "Advanced React",
              description: "Custom hooks, Context API, routing, performance",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "React Testing Library", url: "https://testing-library.com/docs/react-testing-library/intro/" },
                { name: "React Router", url: "https://reactrouter.com/" }
              ],
              projects: ["Multi-page app", "State management app", "Performance optimized app"]
            }
          ]
        },
        {
          id: "month3",
          title: "Month 3: Backend Basics & Database",
          duration: "4 weeks",
          items: [
            {
              id: "nodejs",
              title: "Node.js Fundamentals",
              description: "Node.js runtime, Express.js, REST APIs, middleware",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "Node.js Documentation", url: "https://nodejs.org/docs/" },
                { name: "Express.js Guide", url: "https://expressjs.com/" }
              ],
              projects: ["REST API", "Authentication system", "File upload API"]
            },
            {
              id: "database",
              title: "Database Management",
              description: "SQL, NoSQL, database design, CRUD operations",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "PostgreSQL Tutorial", url: "https://www.postgresql.org/docs/" },
                { name: "MongoDB University", url: "https://university.mongodb.com/" }
              ],
              projects: ["Database design", "CRUD application", "Data migration"]
            }
          ]
        }
      ]
    },
    {
      id: "phase2",
      title: "Full-Stack Integration",
      duration: "Months 4-6",
      description: "Build complete applications with frontend and backend",
      color: "green",
      sections: [
        {
          id: "month4",
          title: "Month 4: Advanced Frontend",
          duration: "4 weeks",
          items: [
            {
              id: "state-management",
              title: "State Management",
              description: "Redux Toolkit, Zustand, Context patterns",
              type: "skill",
              duration: "1 week",
              resources: [
                { name: "Redux Toolkit", url: "https://redux-toolkit.js.org/" },
                { name: "Zustand", url: "https://docs.pmnd.rs/zustand/" }
              ],
              projects: ["Shopping cart", "Blog with state management"]
            },
            {
              id: "ui-libraries",
              title: "UI Libraries & Styling",
              description: "Material-UI, Tailwind CSS, component libraries",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "Material-UI", url: "https://mui.com/" },
                { name: "Tailwind CSS", url: "https://tailwindcss.com/" }
              ],
              projects: ["Dashboard UI", "Mobile app UI", "Admin panel"]
            },
            {
              id: "testing",
              title: "Testing & Debugging",
              description: "Jest, React Testing Library, Cypress",
              type: "skill",
              duration: "1 week",
              resources: [
                { name: "Jest", url: "https://jestjs.io/" },
                { name: "Cypress", url: "https://www.cypress.io/" }
              ],
              projects: ["Test suite", "E2E tests", "Component tests"]
            }
          ]
        },
        {
          id: "month5",
          title: "Month 5: Backend Mastery",
          duration: "4 weeks",
          items: [
            {
              id: "authentication",
              title: "Authentication & Security",
              description: "JWT, OAuth, API security, validation",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "JWT.io", url: "https://jwt.io/" },
                { name: "OWASP", url: "https://owasp.org/" }
              ],
              projects: ["Login system", "Social auth", "API security"]
            },
            {
              id: "integrations",
              title: "API Integrations",
              description: "Payment processing, email services, third-party APIs",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "Stripe", url: "https://stripe.com/docs" },
                { name: "SendGrid", url: "https://docs.sendgrid.com/" }
              ],
              projects: ["E-commerce payment", "Email service", "Third-party API integration"]
            }
          ]
        },
        {
          id: "month6",
          title: "Month 6: DevOps & Deployment",
          duration: "4 weeks",
          items: [
            {
              id: "version-control",
              title: "Version Control & CI/CD",
              description: "Git workflows, GitHub Actions, automated deployment",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "Git Documentation", url: "https://git-scm.com/doc" },
                { name: "GitHub Actions", url: "https://docs.github.com/en/actions" }
              ],
              projects: ["CI/CD pipeline", "Automated testing", "Deployment setup"]
            },
            {
              id: "deployment",
              title: "Cloud Deployment",
              description: "AWS, Vercel, Docker, monitoring",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "AWS", url: "https://aws.amazon.com/" },
                { name: "Vercel", url: "https://vercel.com/docs" }
              ],
              projects: ["Deploy app", "Docker container", "Monitoring setup"]
            }
          ]
        }
      ]
    },
    {
      id: "phase3",
      title: "Advanced Technologies",
      duration: "Months 7-9",
      description: "Master advanced concepts and modern development practices",
      color: "purple",
      sections: [
        {
          id: "month7",
          title: "Month 7: Modern Practices",
          duration: "4 weeks",
          items: [
            {
              id: "typescript",
              title: "TypeScript Integration",
              description: "Type safety, advanced types, React with TypeScript",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" },
                { name: "React TypeScript", url: "https://react-typescript-cheatsheet.netlify.app/" }
              ],
              projects: ["TypeScript conversion", "Type-safe components", "API types"]
            },
            {
              id: "performance",
              title: "Performance Optimization",
              description: "Code splitting, lazy loading, optimization techniques",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "React Performance", url: "https://react.dev/learn/render-and-commit" },
                { name: "Web Vitals", url: "https://web.dev/vitals/" }
              ],
              projects: ["Performance audit", "Optimization implementation", "Bundle analysis"]
            }
          ]
        },
        {
          id: "month8",
          title: "Month 8: Specialized Backend",
          duration: "4 weeks",
          items: [
            {
              id: "graphql",
              title: "GraphQL & Advanced APIs",
              description: "GraphQL schemas, Apollo, alternative API patterns",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "GraphQL", url: "https://graphql.org/" },
                { name: "Apollo", url: "https://www.apollographql.com/" }
              ],
              projects: ["GraphQL API", "Apollo client", "Schema design"]
            },
            {
              id: "realtime",
              title: "Real-time Features",
              description: "WebSockets, Server-Sent Events, real-time databases",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "Socket.io", url: "https://socket.io/" },
                { name: "Firebase Realtime", url: "https://firebase.google.com/docs/database" }
              ],
              projects: ["Chat application", "Live updates", "Real-time collaboration"]
            }
          ]
        },
        {
          id: "month9",
          title: "Month 9: Cloud & Scalability",
          duration: "4 weeks",
          items: [
            {
              id: "cloud-services",
              title: "Advanced Cloud Services",
              description: "AWS Lambda, serverless, microservices",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "AWS Lambda", url: "https://docs.aws.amazon.com/lambda/" },
                { name: "Serverless", url: "https://www.serverless.com/" }
              ],
              projects: ["Serverless function", "Microservice", "Cloud architecture"]
            },
            {
              id: "monitoring",
              title: "Monitoring & Analytics",
              description: "Application monitoring, performance tracking, user analytics",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "Sentry", url: "https://sentry.io/" },
                { name: "Google Analytics", url: "https://analytics.google.com/" }
              ],
              projects: ["Error tracking", "Performance monitoring", "User analytics"]
            }
          ]
        }
      ]
    },
    {
      id: "phase4",
      title: "Career Preparation",
      duration: "Months 10-12",
      description: "Build portfolio, prepare for interviews, and start job search",
      color: "orange",
      sections: [
        {
          id: "month10",
          title: "Month 10: Portfolio & Projects",
          duration: "4 weeks",
          items: [
            {
              id: "major-project",
              title: "Major Portfolio Project",
              description: "Full-stack SaaS application with all learned technologies",
              type: "project",
              duration: "3 weeks",
              resources: [
                { name: "Project Ideas", url: "https://github.com/karan/Projects" }
              ],
              projects: ["SaaS application", "Open source contribution", "Technical blog"]
            },
            {
              id: "portfolio",
              title: "Portfolio Website",
              description: "Professional portfolio showcasing your skills and projects",
              type: "project",
              duration: "1 week",
              resources: [
                { name: "Portfolio Examples", url: "https://github.com/emmabostian/developer-portfolios" }
              ],
              projects: ["Portfolio website", "Project showcase", "Resume optimization"]
            }
          ]
        },
        {
          id: "month11",
          title: "Month 11: Interview Preparation",
          duration: "4 weeks",
          items: [
            {
              id: "coding-challenges",
              title: "Coding Practice",
              description: "LeetCode, HackerRank, algorithm practice",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "LeetCode", url: "https://leetcode.com/" },
                { name: "HackerRank", url: "https://www.hackerrank.com/" }
              ],
              projects: ["100+ coding problems", "Algorithm implementations", "Data structure practice"]
            },
            {
              id: "system-design",
              title: "System Design",
              description: "Architecture patterns, scalability, design interviews",
              type: "skill",
              duration: "2 weeks",
              resources: [
                { name: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" }
              ],
              projects: ["System design diagrams", "Architecture documentation", "Scalability analysis"]
            }
          ]
        },
        {
          id: "month12",
          title: "Month 12: Job Search & Networking",
          duration: "4 weeks",
          items: [
            {
              id: "job-search",
              title: "Professional Development",
              description: "LinkedIn optimization, networking, job applications",
              type: "professional",
              duration: "4 weeks",
              resources: [
                { name: "LinkedIn", url: "https://www.linkedin.com/" },
                { name: "AngelList", url: "https://angel.co/" }
              ],
              projects: ["50+ job applications", "Professional networking", "Interview practice"]
            }
          ]
        }
      ]
    }
  ],
  
  skills: {
    frontend: [
      "HTML5 & CSS3", "JavaScript (ES6+)", "React.js", "TypeScript", 
      "State Management", "Testing", "Performance Optimization"
    ],
    backend: [
      "Node.js", "Express.js", "Databases", "API Design", "Authentication", 
      "Security", "Microservices"
    ],
    tools: [
      "Git & GitHub", "Docker", "CI/CD", "Cloud Services", 
      "Monitoring", "Testing Tools"
    ],
    soft: [
      "Problem Solving", "Communication", "Project Management", 
      "Team Collaboration", "Continuous Learning"
    ]
  },
  
  resources: {
    courses: [
      { name: "freeCodeCamp", url: "https://www.freecodecamp.org/", type: "free" },
      { name: "Frontend Masters", url: "https://frontendmasters.com/", type: "paid" },
      { name: "Udemy", url: "https://www.udemy.com/", type: "paid" },
      { name: "Pluralsight", url: "https://www.pluralsight.com/", type: "paid" }
    ],
    practice: [
      { name: "LeetCode", url: "https://leetcode.com/", type: "free" },
      { name: "HackerRank", url: "https://www.hackerrank.com/", type: "free" },
      { name: "Codewars", url: "https://www.codewars.com/", type: "free" },
      { name: "Exercism", url: "https://exercism.org/", type: "free" }
    ],
    documentation: [
      { name: "MDN Web Docs", url: "https://developer.mozilla.org/", type: "free" },
      { name: "React Documentation", url: "https://react.dev/", type: "free" },
      { name: "Node.js Docs", url: "https://nodejs.org/docs/", type: "free" },
      { name: "AWS Documentation", url: "https://docs.aws.amazon.com/", type: "free" }
    ]
  }
};

export default roadmapData;
