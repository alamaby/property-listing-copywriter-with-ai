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

// Mock data - replace with actual data fetching
const mockUserData = {
  fullName: "John Doe",
  language: "en",
  timezone: "UTC",
  defaultSignature: "Best regards,\nJohn Doe",
  defaultWritingStyle: "formal",
  tier: "FREE",
  referralLink: "https://example.com/ref/12345",
  creditTransactions: [
    { date: "2026-04-18", type: "purchase", amount: 100 },
    { date: "2026-04-17", type: "claim", amount: 10 },
    { date: "2026-04-16", type: "purchase", amount: 50 },
    { date: "2026-04-15", type: "refund", amount: -20 },
    { date: "2026-04-14", type: "claim", amount: 10 },
    { date: "2026-04-13", type: "purchase", amount: 75 },
    { date: "2026-04-12", type: "claim", amount: 10 },
    { date: "2026-04-11", type: "purchase", amount: 30 },
    { date: "2026-04-10", type: "claim", amount: 10 },
    { date: "2026-04-09", type: "purchase", amount: 40 }
  ]
};

export default function SettingsPage() {
  // toast is imported directly from sonner
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    fullName: mockUserData.fullName,
    language: mockUserData.language,
    timezone: mockUserData.timezone,
    defaultSignature: mockUserData.defaultSignature,
    defaultWritingStyle: mockUserData.defaultWritingStyle
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDefaults = () => {
    toast("Defaults Saved", {
      description: "Your default signature and writing style have been saved.",
    });
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(mockUserData.referralLink);
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
                  <p className="text-lg font-medium">{mockUserData.tier}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Referral Link</h3>
                <div className="flex gap-2">
                  <Input value={mockUserData.referralLink} readOnly className="flex-1" />
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
                      {mockUserData.creditTransactions.map((transaction, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{transaction.date}</td>
                          <td className="p-2 capitalize">{transaction.type}</td>
                          <td className="p-2">{transaction.amount > 0 ? "+" : ""}{transaction.amount}</td>
                        </tr>
                      ))}
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