export default {
    name: "Jobsforce - AI Job Application Assistant for Agents",
    description:
      "AI-powered browser extension that helps you apply to jobs faster with resume matching, keyword analysis, and auto-fill capabilities.",
    version: "0.1.0",
    permissions: ["tabs", "activeTab", "scripting", "downloads", "storage"],
    host_permissions: ["https://*/*", "https://drive.google.com/*"],
    background: {
      service_worker: "background.ts"
    },
    content_scripts: [
      {
        matches: ["*://*.workable.com/*"],
        js: ["workable.ts"]
      }
    ]
  }
  