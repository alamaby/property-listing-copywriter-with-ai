"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  // toast is imported directly from sonner
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    fullName: "",
    language: "",
    timezone: "",
    defaultSignature: "",
    defaultWritingStyle: ""
  });
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Get current user using the browser Supabase client
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("Authentication required");
        }
        
        // Fetch profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw new Error("Failed to fetch profile data");
        }
        
        // Update form data with actual profile data
        setFormData({
          fullName: data.full_name || "",
          language: data.language || "en",
          timezone: data.timezone || "UTC",
          defaultSignature: data.default_signature || "",
          defaultWritingStyle: data.default_writing_style || "formal"
        });
      } catch (error) {
        toast("Error", {
          description: error instanceof Error ? error.message : "Failed to load profile data",
          className: "bg-destructive text-destructive-foreground",
        });
      }
    };
    
    fetchProfileData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDefaults = () => {
    toast("Defaults Saved", {
      description: "Your default signature and writing style have been saved.",
    });
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText("https://example.com/ref/12345");
    toast("Copied!", {
      description: "Referral link copied to clipboard.",
    });
  };

  const handleChangePassword = () => {
    toast("Password Change Initiated", {
      description: "Check your email for password reset instructions.",
    });
  };

  const handleDeleteAccount = () => {
    toast("Account Deletion", {
      description: "Please contact support to delete your account.",
      className: "bg-destructive text-destructive-foreground",
    });
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          timezone: formData.timezone,
          language: formData.language
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast("Profile Updated", {
          description: "Your profile information has been saved.",
        });
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        throw new Error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to update profile",
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap gap-2 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="billing">Billing & Credits</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => handleInputChange("language", value)}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="id">Indonesian</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => handleInputChange("timezone", value)}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="GMT+7">GMT+7 (Jakarta)</SelectItem>
                    <SelectItem value="EST">EST (New York)</SelectItem>
                    <SelectItem value="PST">PST (Los Angeles)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveProfile} className="bg-[#E36A6A] hover:bg-[#C05A5A]">
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspace">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Workspace Defaults</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultSignature">Default Signature</Label>
                <Textarea
                  id="defaultSignature"
                  value={formData.defaultSignature}
                  onChange={(e) => handleInputChange("defaultSignature", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultWritingStyle">Default Writing Style</Label>
                <Select
                  value={formData.defaultWritingStyle}
                  onValueChange={(value) => handleInputChange("defaultWritingStyle", value)}
                >
                  <SelectTrigger id="defaultWritingStyle">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveDefaults} className="bg-[#E36A6A] hover:bg-[#C05A5A]">
                Save Defaults
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Billing & Credits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Current Tier</h3>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-lg font-medium">FREE</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Referral Link</h3>
                <div className="flex gap-2">
                  <Input value="https://example.com/ref/12345" readOnly className="flex-1" />
                  <Button onClick={handleCopyReferral}>Copy</Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Credit Transactions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">2026-04-18</td>
                        <td className="p-2 capitalize">purchase</td>
                        <td className="p-2">+100</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">2026-04-17</td>
                        <td className="p-2 capitalize">claim</td>
                        <td className="p-2">+10</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">2026-04-16</td>
                        <td className="p-2 capitalize">purchase</td>
                        <td className="p-2">+50</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">2026-04-15</td>
                        <td className="p-2 capitalize">refund</td>
                        <td className="p-2">-20</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">2026-04-14</td>
                        <td className="p-2 capitalize">claim</td>
                        <td className="p-2">+10</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">2026-04-13</td>
                        <td className="p-2 capitalize">purchase</td>
                        <td className="p-2">+75</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">2026-04-12</td>
                        <td className="p-2 capitalize">claim</td>
                        <td className="p-2">+10</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">2026-04-11</td>
                        <td className="p-2 capitalize">purchase</td>
                        <td className="p-2">+30</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">2026-04-10</td>
                        <td className="p-2 capitalize">claim</td>
                        <td className="p-2">+10</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">2026-04-09</td>
                        <td className="p-2 capitalize">purchase</td>
                        <td className="p-2">+40</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={handleChangePassword} className="w-full max-w-xs">
                Change Password
              </Button>
              
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  className="w-full max-w-xs"
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}