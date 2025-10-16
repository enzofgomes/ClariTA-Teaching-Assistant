import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bug, Send, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeedbackDialogProps {
  children: React.ReactNode;
}

export function FeedbackDialog({ children }: FeedbackDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [report, setReport] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !report.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both email and report fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Using Formspree for simple email sending without authentication
      // Replace 'YOUR_FORM_ID' with your actual Formspree form ID
      const formData = new FormData();
      formData.append('email', email.trim());
      formData.append('message', `ClariTA Feedback Report\n\nUser Email: ${email.trim()}\n\nReport:\n${report.trim()}\n\n---\nThis feedback was submitted through ClariTA's feedback form.\nTimestamp: ${new Date().toISOString()}`);
      formData.append('_subject', 'ClariTA Feedback Report');
      formData.append('_replyto', email.trim());

      const response = await fetch('https://formspree.io/f/mpwykolk', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setShowSuccess(false);
          setEmail("");
          setReport("");
        }, 2000);

        toast({
          title: "Feedback Sent!",
          description: "Thank you for your feedback. We'll review it and get back to you if needed.",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send feedback');
      }

    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error sending your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowSuccess(false);
    setEmail("");
    setReport("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#61C2A2' }}>
              <Bug className="h-4 w-4 text-white" />
            </div>
            Found an Issue?
          </DialogTitle>
          <DialogDescription className="text-left">
            <div className="space-y-3">
              <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                Hi! Thank you for using ClariTA and helping us improve it. Your opinion is important for us to make ClariTA the best it can be. Please feel free to report any bugs or suggest features you would like to see coming next.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#B6E2D3' }}>
              <Mail className="h-8 w-8" style={{ color: '#61C2A2' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#09224E' }}>
              Feedback Sent Successfully!
            </h3>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Your feedback has been sent to our team. Thank you for helping improve ClariTA!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Report or Suggestion
              </Label>
              <Textarea
                id="report"
                placeholder="Describe the issue you encountered or the feature you'd like to see..."
                value={report}
                onChange={(e) => setReport(e.target.value)}
                className="min-h-[120px] resize-none"
                required
              />
            </div>

            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Note:</strong> Your feedback will be sent directly to our team. We'll review it and get back to you if needed.
              </AlertDescription>
            </Alert>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-white font-medium"
                style={{ backgroundColor: '#61C2A2' }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Sending Feedback...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Feedback
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
