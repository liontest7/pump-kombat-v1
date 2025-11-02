# Room Features - Coming Soon

## Custom Room Names & Map Selection

These features are temporarily disabled while we prepare the database for launch.

### To Enable These Features:

1. Run the SQL migration script in `scripts/add-room-features.sql` in your Supabase dashboard
2. This will add the `room_name` and `map` columns to the `game_rooms` table
3. Once the migration is complete, uncomment the code in:
   - `components/create-room-dialog.tsx` (room name input and map selection UI)
   - `app/api/rooms/create/route.ts` (room_name and map parameters)
   - `lib/supabase-game-service.ts` (createRoom function parameters)

### Available Maps (Once Enabled):

1. **Boxi Arena** - Underground fight club atmosphere
2. **Intimes District** - Urban street fighting zone
3. **Nordkiez Streets** - Gritty neighborhood battleground
4. **RAW Temple** - Industrial warehouse arena
5. **RAW Courtyard** - Open-air combat zone
6. **Rigaer Straße** - Legendary street location

All maps are already in the system and ready to use once the database columns are added!
