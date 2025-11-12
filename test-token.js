require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const token = "eyJhbGciOiJIUzI1NiIsImtpZCI6ImxzamZFRjdUN2Y3NnlBK1AiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL21oamZneXd0cGF1dW1sZXhueGZwLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0ZjQ2OTRiOS1kZDRjLTQzNWUtYTkzMS0yZWE1YjA1YWRkOGUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYyOTM3ODgwLCJpYXQiOjE3NjI5MzQyODAsImVtYWlsIjoibmd1eWVuaGFwaHVjLjYxMDIwMDRAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6Im5ndXllbmhhcGh1Yy42MTAyMDA0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjRmNDY5NGI5LWRkNGMtNDM1ZS1hOTMxLTJlYTViMDVhZGQ4ZSJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzYyOTM0MjgwfV0sInNlc3Npb25faWQiOiJhMjY1YzUzOS0wNGY3LTQxY2MtOTg4NS1jNTI0ZjVjYTRlZjEiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.TJBeKaFMP5DDJCKD76tg562MH7vrm5Sw0HCLxl0exa0";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Test token
supabase.auth.getUser(token).then(({ data, error }) => {
  if (error) {
    console.log('❌ Token validation error:', error.message);
  } else {
    console.log('✅ Token is valid!');
    console.log('User:', data.user.email);
  }
});
