-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for users table
drop trigger if exists update_users_updated_at on public.users;

create trigger update_users_updated_at
  before update on public.users
  for each row
  execute function public.update_updated_at_column();
