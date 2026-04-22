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
import { Check } from "lucide-react";

const COLOR_THEMES = [
  {
    id: "terracotta",
    name: "Terracotta",
    description: "Warm & Classic",
    swatches: ["#E36A6A", "#FFFBF1", "#FFF2D0", "#FFB2B2"],
  },
  {
    id: "slate-indigo",
    name: "Slate & Indigo",
    description: "Modern SaaS",
    swatches: ["#6366F1", "#FAFAFA", "#F1F5F9", "#E0E7FF"],
  },
  {
    id: "forest-gold",
    name: "Forest & Gold",
    description: "Premium Luxury",
    swatches: ["#1C4532", "#FFFEF7", "#F0F4F0", "#D4A017"],
  },
  {
    id: "ocean-amber",
    name: "Ocean & Amber",
    description: "Fresh & Energetic",
    swatches: ["#0EA5E9", "#F8FAFC", "#F0F9FF", "#F59E0B"],
  },
] as const;
import { getProfileData, getCreditTransactions } from "./actions";
import { updateProfile } from "@/app/actions/profile";

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
  const [tier, setTier] = useState("FREE");
  const [userId, setUserId] = useState("");
  const [creditTransactions, setCreditTransactions] = useState<any[]>([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [colorTheme, setColorTheme] = useState("terracotta");
  
  useEffect(() => {
    const saved = localStorage.getItem("color-theme");
    if (saved) setColorTheme(saved);
  }, []);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const profileData = await getProfileData();
        if (profileData) {
          setFormData(profileData);
          setTier(profileData.tier);
          setUserId(profileData.id);
        } else {
          throw new Error("Failed to load profile data");
        }
      } catch (error) {
        toast("Error", {
          description: error instanceof Error ? error.message : "Failed to load profile data",
          className: "bg-destructive text-destructive-foreground",
        });
      }
    };
    
    loadProfileData();
  }, []);

  useEffect(() => {
    if (activeTab === "billing" && creditTransactions.length === 0) {
      setBillingLoading(true);
      getCreditTransactions()
        .then(data => setCreditTransactions(data))
        .finally(() => setBillingLoading(false));
    }
  }, [activeTab]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectTheme = (themeId: string) => {
    setColorTheme(themeId);
    localStorage.setItem("color-theme", themeId);
    if (themeId === "terracotta") {
      document.documentElement.removeAttribute("data-color-theme");
    } else {
      document.documentElement.setAttribute("data-color-theme", themeId);
    }
  };

  const handleSaveDefaults = async () => {
    try {
      const result = await updateProfile({
        defaultSignature: formData.defaultSignature,
        defaultWritingStyle: formData.defaultWritingStyle,
      });
      if (result.error) throw new Error(result.error);
      toast("Defaults Saved", {
        description: "Your default signature and writing style have been saved.",
      });
    } catch (error) {
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to save defaults",
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  const handleCopyReferral = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    navigator.clipboard.writeText(`${baseUrl}/register?ref=${userId}`);
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
              <div className="space-y-3 pt-2">
                <Label>Color Theme</Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`relative flex flex-col gap-2 rounded-lg border-2 p-3 text-left transition-all hover:border-primary ${
                        colorTheme === theme.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card"
                      }`}
                    >
                      {colorTheme === theme.id && (
                        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                          <Check className="h-2.5 w-2.5 text-primary-foreground" />
                        </span>
                      )}
                      <div className="flex gap-1.5">
                        {theme.swatches.map((color, i) => (
                          <span
                            key={i}
                            className="h-5 w-5 rounded-full border border-black/10"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-semibold leading-none">{theme.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{theme.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveDefaults} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Save Defaults
                </Button>
              </div>
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
                  <p className="text-lg font-medium">{tier}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Referral Link</h3>
                <div className="flex gap-2">
                  <Input
                    value={userId ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/register?ref=${userId}` : ''}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={handleCopyReferral}>Copy</Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Credit Transactions</h3>
                {billingLoading ? (
                  <div className="text-center py-6 text-muted-foreground">Memuat transaksi...</div>
                ) : creditTransactions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">Belum ada transaksi kredit.</div>
                ) : (
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
                        {creditTransactions.map((tx) => {
                          const typeLabels: Record<string, string> = {
                            WELCOME_BONUS: "Welcome Bonus",
                            DAILY_CLAIM: "Daily Bonus",
                            REFERRAL_BONUS: "Referral Bonus",
                            USAGE: "Penggunaan AI",
                            EARN: "Kredit Ditambah",
                            REFUND: "Refund",
                            EXPIRED: "Kadaluarsa",
                          };
                          return (
                            <tr key={tx.id} className="border-b">
                              <td className="p-2">
                                {new Date(tx.created_at).toLocaleDateString('id-ID', {
                                  year: 'numeric', month: 'short', day: 'numeric'
                                })}
                              </td>
                              <td className="p-2">{typeLabels[tx.transaction_type] ?? tx.transaction_type}</td>
                              <td className={`p-2 font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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