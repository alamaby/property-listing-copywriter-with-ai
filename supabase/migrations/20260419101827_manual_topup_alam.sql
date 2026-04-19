-- Tambah 3 credit untuk user 'Alam Aby Bashit'
INSERT INTO public.credit_transactions (
  user_id, 
  amount, 
  transaction_type, 
  reference_id
)
SELECT 
  id, 
  3, 
  'EARN'::public.transaction_type, 
  'manual_topup_admin'
FROM 
  public.profiles
WHERE 
  full_name = 'Alam Aby Bashit';