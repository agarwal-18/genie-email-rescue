
from supabase import create_client, Client
from .config import SUPABASE_URL, SUPABASE_KEY

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Verify the connection and log it
try:
    # Test a simple query to check connection
    response = supabase.auth.get_user("dummy_token_for_test")
    print("✅ Supabase connection initialized successfully")
except Exception as e:
    print(f"❌ Error initializing Supabase connection: {str(e)}")
    print(f"SUPABASE_URL: {SUPABASE_URL[:10]}...")  # Print partial URL for debugging
    # Don't print the complete key for security reasons

