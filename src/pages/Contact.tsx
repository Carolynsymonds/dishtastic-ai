import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useStaticContent } from "@/hooks/useStaticContent";
import { supabase } from "@/integrations/supabase/client";
import { siteContent } from "@/config/site-content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactMap from "@/components/ContactMap";

const Contact = () => {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();
  
  const { content: contactContent, loading } = useStaticContent("contact");

  console.log(siteContent)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Custom validation
    const errors: string[] = [];
    if (!email.trim()) errors.push("email");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.push("emailInvalid");
    if (!subject.trim()) errors.push("subject");
    
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const landingPageName = siteContent.brand.name; // Default to brand name

      // Send email notification and save to database via edge function
      const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          landing_page_name: landingPageName
        }
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        // Don't throw error here, still show success to user
      }
      
      toast({
        title: "Thank you!",
        description: "We will be contacting you soon.",
      });
      
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-24">
        <div className="text-center mb-8 mt-3">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            {loading ? "Loading..." : contactContent?.title || "Contact us"}
          </h1>
        </div>
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-stretch">
          <div className="w-full flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {contactContent?.sections?.[0]?.form_fields?.email?.label || "Email"}
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={contactContent?.sections?.[0]?.form_fields?.email?.placeholder || "john.smith@restaurant.com"}
                    className={validationErrors.includes("email") || validationErrors.includes("emailInvalid") ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {validationErrors.includes("email") && (
                    <p className="text-sm text-red-500">Email is required</p>
                  )}
                  {validationErrors.includes("emailInvalid") && (
                    <p className="text-sm text-red-500">Please enter a valid email address</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What's this about?"
                    className={validationErrors.includes("subject") ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {validationErrors.includes("subject") && (
                    <p className="text-sm text-red-500">Subject is required</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">
                    {contactContent?.sections?.[0]?.form_fields?.message?.label || "Message"}
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={contactContent?.sections?.[0]?.form_fields?.message?.placeholder || "I'd like to learn more about your product..."}
                    className="min-h-[160px] flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2 mt-6">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting 
                    ? (contactContent?.sections?.[0]?.submitting_text || "Submitting...") 
                    : (contactContent?.sections?.[0]?.submit_text || "Submit")
                  }
                </Button>
              </div>
            </form>
          </div>
          
          <div className="w-full">
            <ContactMap />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;