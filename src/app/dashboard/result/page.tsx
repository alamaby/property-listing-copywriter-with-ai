'use client';

import { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ArrowLeft, Download, Share2 } from 'lucide-react';
import Link from 'next/link';

function ResultContent() {
  const [data, setData] = useState({
    headline: '',
    description: '',
    features: [] as string[]
  });

  useEffect(() => {
    const storedData = sessionStorage.getItem('generatedListing');
    if (storedData) {
      try {
        setData(JSON.parse(storedData));
      } catch (e) {
        console.error('Failed to parse result data', e);
      }
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast here
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Generator
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Your Generated Listing</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Headline</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => copyToClipboard(data.headline)}
              title="Copy headline"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-primary">{data.headline || 'Generating...'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Description</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => copyToClipboard(data.description)}
              title="Copy description"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {data.description || 'Generating...'}
            </div>
          </CardContent>
        </Card>

        {data.features && data.features.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <Button asChild variant="outline">
          <Link href="/dashboard">Generate Another One</Link>
        </Button>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div>Loading result...</div>}>
      <ResultContent />
    </Suspense>
  );
}
