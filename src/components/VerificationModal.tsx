import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    dishesData: any[];
    purpose?: 'unlock-analysis' | 'download-report';
}

export const VerificationModal = ({ isOpen, onClose, dishesData, purpose = 'unlock-analysis' }: VerificationModalProps) => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    
    // Determine content type from dishesData
    const contentType = dishesData?.[0]?.type || 'video';
    const mediaType = contentType === 'video' ? 'video' : 'image';

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendVerification = async () => {
        if (!email.trim()) {
            toast.error("Please enter your email address");
            return;
        }

        if (!validateEmail(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        try {
            // Save email subscription
            const { error: subscriptionError } = await supabase
                .from('email_subscriptions')
                .insert({
                    email: email.trim(),
                    source: 'verification_modal',
                    user_id: null // Will be linked if user signs up later
                });

            if (subscriptionError && subscriptionError.code !== '23505') { // Ignore unique constraint violations
                console.error('Error saving email subscription:', subscriptionError);
            }

            // Save report request
            const { data, error } = await supabase
                .from('report_requests')
                .insert({
                    email: email.trim(),
                    dishes_data: dishesData,
                    purpose
                });

            if (error) throw error;

            toast.success("Your report request has been successfully submitted.");

            // Close modal immediately after success
            handleClose();
        } catch (error: any) {
            console.error('Error saving report request:', error);
            toast.error(error.message || "Please try again later");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setEmail("");
        setEmailSent(false);
        setIsLoading(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-black border-gray-800">
                <DialogHeader className="text-center">
                    <div className="mx-auto w-32 h-32 flex items-center justify-center">
                        {emailSent ? (
                            <img
                                src="/lovable-uploads/5b64c1c1-e8c8-46a3-9e33-4e45b6bdd701.png"
                                alt="Success Checkmark"
                                className="w-32 h-32"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <Lock className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </div>
                    <DialogTitle className="text-xl font-semibold mx-auto text-white">
                        {emailSent
                            ? "Access Link Sent!"
                            : (purpose === "download-report" ? "Download All Media" : "Unlock Media")}
                    </DialogTitle>

                    <DialogDescription className="text-center text-gray-300">
                        {emailSent
                            ? "We've emailed you a secure link to view and download all your generated photos and videos."
                            : (purpose === "download-report"
                                ? `Get a consolidated download of every ${mediaType}.`
                                : `View, manage, and download every ${mediaType} you've created.`
                            )}
                    </DialogDescription>

                </DialogHeader>

                {!emailSent ? (
                    <div className="space-y-4 mt-6">
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendVerification()}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                variant="ghost"
                                onClick={handleClose}
                                className="flex-1 text-white hover:bg-gray-800 border-0"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSendVerification}
                                disabled={isLoading}
                                className="flex-1 bg-white text-black hover:bg-gray-200"
                            >
                                {isLoading
                                    ? "Submitting..."
                                    : (purpose === 'download-report' ? "Get Report" : "Unlock")
                                }
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 mt-6">
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
