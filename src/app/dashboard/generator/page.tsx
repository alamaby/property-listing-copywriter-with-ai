import { redirect } from 'next/navigation';

// This page will redirect to the main dashboard since the generator is the default page
export default function GeneratorPage() {
  redirect('/dashboard');
}