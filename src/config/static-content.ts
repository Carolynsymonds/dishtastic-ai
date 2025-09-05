export const staticContent = {
  contact: {
    page: {
      title: "Let's connect",
      description: "Wanna see me in action? Drop your info in the form."
    },
    form: {
      labels: {
        firstName: "First Name",
        lastName: "Last Name", 
        businessName: "Business Name",
        email: "Email",
        message: "Anything you want to tell us?"
      },
      placeholders: {
        firstName: "John",
        lastName: "Smith",
        businessName: "Smith's Restaurant",
        email: "john.smith@gmail.com",
        message: (brandName: string) => `I'm interested in learning how ${brandName} can help me...`
      },
      buttons: {
        submit: "Submit",
        submitting: "Submitting..."
      },
      messages: {
        success: {
          title: "Opening email client",
          description: "Your default email client should open with the message pre-filled."
        },
        error: {
          title: "Error",
          description: "Something went wrong. Please try again."
        }
      }
    }
  },
  termsConditions: {
    title: "Terms & Conditions",
    lastUpdated: "Last updated: January 2024",
    sections: {
      acceptance: {
        title: "Acceptance of Terms",
        content: (brandName: string) => `By accessing and using ${brandName}, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
      },
      serviceDescription: {
        title: "Service Description",
        content: (brandName: string) => `${brandName} is a kitchen scheduling platform that helps businesses manage, schedule, and optimize their staff scheduling. We provide software tools and analytics to improve inventory efficiency.`
      },
      userResponsibilities: {
        title: "User Responsibilities",
        content: "You are responsible for:",
        list: [
          "Providing accurate and complete information",
          "Maintaining the security of your account credentials",
          "Using the service in compliance with applicable laws",
          "Not interfering with or disrupting the service",
          "Not attempting to gain unauthorized access to our systems"
        ]
      },
      limitationOfLiability: {
        title: "Limitation of Liability",
        content: (brandName: string) => `${brandName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.`
      },
      termination: {
        title: "Termination",
        content: "We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever including without limitation if you breach the Terms."
      },
      changesToTerms: {
        title: "Changes to Terms",
        content: "We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect."
      },
      contactInformation: {
        title: "Contact Information",
        content: (brandName: string) => `If you have any questions about these Terms & Conditions, please contact us at legal@${brandName.toLowerCase()}.com`
      }
    }
  },
  privacyPolicy: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: January 2024",
    sections: {
      informationWeCollect: {
        title: "Information We Collect",
        content: "We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support. This may include your name, email address, and any other information you choose to provide."
      },
      howWeUseInformation: {
        title: "How We Use Your Information",
        content: "We use the information we collect to:",
        list: [
          "Provide, maintain, and improve our services",
          "Send you technical notices and support messages",
          "Communicate with you about products, services, and events",
          "Monitor and analyze trends and usage",
          "Protect against fraudulent or illegal activity"
        ]
      },
      informationSharing: {
        title: "Information Sharing",
        content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with trusted service providers who assist us in operating our website and conducting our business."
      },
      dataSecurity: {
        title: "Data Security",
        content: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure."
      },
      contactUs: {
        title: "Contact Us",
        content: (brandName: string) => `If you have any questions about this Privacy Policy, please contact us at privacy@${brandName.toLowerCase()}.com`
      }
    }
  }
};