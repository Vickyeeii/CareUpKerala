#!/bin/bash

# CareUp Auth Module Setup Script

echo "🚀 Setting up CareUp Auth Module..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual configuration!"
    echo "   Generate SECRET_KEY with: openssl rand -hex 32"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Check if database is configured
echo ""
echo "🗄️  Database Setup:"
echo "   Make sure PostgreSQL is running and database exists"
echo "   Update DATABASE_URL in .env file"
echo ""

# Run migrations (optional)
read -p "Run database migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Running migrations..."
    alembic upgrade head
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Update .env with your SECRET_KEY and DATABASE_URL"
echo "   2. Run: uvicorn main:app --reload"
echo "   3. Visit: http://localhost:8000/docs for API documentation"
echo ""
echo "📚 Read AUTH_MODULE_README.md for detailed documentation"
