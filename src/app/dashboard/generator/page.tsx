'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GeneratorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    propertyType: 'House',
    transactionType: 'Sell',
    landArea: '',
    buildingArea: '',
    bedrooms: '',
    bathrooms: '',
    location: '',
    additionalPoints: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Sanitize input by removing potentially dangerous characters
    let sanitizedValue = value;
    
    if (name === 'additionalPoints') {
      // For selling points, limit to 200 characters and sanitize
      sanitizedValue = value.replace(/[<>"'&]/g, '').substring(0, 200);
    } else {
      // For other inputs, just sanitize
      sanitizedValue = value.replace(/[<>"'&]/g, '');
    }
    
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const prompt = `Property details:
- Type: ${formData.propertyType}
- Transaction: ${formData.transactionType}
- Land Area: ${formData.landArea} sqm
- Building Area: ${formData.buildingArea} sqm
- Bedrooms: ${formData.bedrooms}
- Bathrooms: ${formData.bathrooms}
- Location: ${formData.location}
- Additional Points: ${formData.additionalPoints}`;

      const response = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          propertyContext: formData,
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error('Credit tidak cukup. Silakan beli lebih banyak kredit untuk melanjutkan.');
        }
        const errorText = await response.text();
        throw new Error(errorText || 'Gagal menghasilkan listing');
      }

      const data = await response.json();
      sessionStorage.setItem('generatedListing', JSON.stringify(data));
      router.push('/dashboard/result');
    } catch (err) {
      console.error('Error generating listing:', err);
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-background p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">AI Listing Generator</h1>
        <p className="text-muted-foreground leading-relaxed">
          Fill in the details below to generate a professional property listing.
        </p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription className="text-muted-foreground">Provide the core characteristics of the property.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select
                    defaultValue={formData.propertyType}
                    onValueChange={(value) => handleSelectChange('propertyType', value)}
                  >
                    <SelectTrigger id="propertyType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionType">Transaction Type</Label>
                  <Select
                    defaultValue={formData.transactionType}
                    onValueChange={(value) => handleSelectChange('transactionType', value)}
                  >
                    <SelectTrigger id="transactionType">
                      <SelectValue placeholder="Select transaction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sell">Sell</SelectItem>
                      <SelectItem value="Rent">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landArea">Land Area (sqm)</Label>
                  <Input
                    id="landArea"
                    name="landArea"
                    type="number"
                    placeholder="e.g. 200"
                    value={formData.landArea}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buildingArea">Building Area (sqm)</Label>
                  <Input
                    id="buildingArea"
                    name="buildingArea"
                    type="number"
                    placeholder="e.g. 150"
                    value={formData.buildingArea}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    placeholder="e.g. 3"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    placeholder="e.g. 2"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g. Beverly Hills, CA"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalPoints">Additional Selling Points</Label>
                <Textarea
                  id="additionalPoints"
                  name="additionalPoints"
                  placeholder="e.g. Modern kitchen, spacious backyard, close to school..."
                  className="min-h-[120px]"
                  value={formData.additionalPoints}
                  onChange={handleInputChange}
                  maxLength={200}
                />
                {formData.additionalPoints.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {formData.additionalPoints.length}/200 characters
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Listing
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
            {error.message || 'An error occurred while generating the listing. Please check your credits.'}
          </div>
        )}

        {isLoading && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Generating Your Listing...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap leading-relaxed">
                  Thinking...
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}