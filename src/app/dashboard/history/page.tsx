'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History as HistoryIcon, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface CreditTransaction {
  id: string;
  created_at: string;
  amount: number;
  transaction_type: string;
  reference_id?: string;
}

interface ListingHistory {
  id: string;
  created_at: string;
  headline: string;
}

export default function HistoryPage() {
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [listingHistory, setListingHistory] = useState<ListingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const supabase = createClient();
      
      // Fetch credit transactions
      const { data: credits, error: creditError } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (creditError) throw creditError;
      setCreditTransactions(credits || []);

      // Fetch listing history from llm_logs
      const { data: listings, error: listingError } = await supabase
        .from('llm_logs')
        .select('id, created_at, response_payload')
        .eq('status', 'success')
        .order('created_at', { ascending: false });

      if (listingError) throw listingError;
      
      const formattedListings = listings?.map(log => ({
        id: log.id,
        created_at: log.created_at,
        headline: log.response_payload?.headline || 'Listing generated'
      })) || [];
      
      setListingHistory(formattedListings);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data histori');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount >= 0 ? `+${amount}` : `${amount}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Riwayat & Kredit</h1>
        <p className="text-muted-foreground">
          Lihat riwayat penggunaan kredit dan listing properti yang telah dihasilkan.
        </p>
      </div>

      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Memuat data...</div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-red-500 text-center">{error}</div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* Credit Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Riwayat Kredit
              </CardTitle>
              <CardDescription>
                Daftar semua transaksi kredit Anda (pembelian dan penggunaan).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {creditTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada transaksi kredit.
                </div>
              ) : (
                <div className="space-y-4">
                  {creditTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {transaction.transaction_type === 'PURCHASE' ? 'Pembelian Kredit' : 'Penggunaan AI'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.amount)} Kredit
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Listing History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HistoryIcon className="h-5 w-5" />
                Riwayat Listing
              </CardTitle>
              <CardDescription>
                Listing properti yang telah dihasilkan menggunakan AI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {listingHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada listing yang dihasilkan. Buat listing pertama Anda!
                </div>
              ) : (
                <div className="space-y-4">
                  {listingHistory.map((listing) => (
                    <div
                      key={listing.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="font-medium">{listing.headline}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(listing.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button asChild>
              <Link href="/dashboard">Buat Listing Baru</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}