import { notFound, redirect } from 'next/navigation';
import pool from '@/lib/db';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function RedirectPage({ params }: PageProps) {
  const { id } = params;
  const result = await pool.query(
    'SELECT original_url FROM urls WHERE short_id = $1',
    [id]
  );
  if (result.rows.length > 0) {
    const { original_url } = result.rows[0];
    return redirect(original_url); // Use return here
  } else {
    return notFound(); // Use return here
  }
  // No need for try-catch or console.error here
}
