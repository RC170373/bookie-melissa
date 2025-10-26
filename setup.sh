#!/bin/bash

# Bookie - One-Click Setup Script
# This script will set up the entire Bookie application on your local machine

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Print colored output
print_step() {
    echo -e "${PURPLE}==>${NC} ${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Banner
echo -e "${PURPLE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ██████╗  ██████╗  ██████╗ ██╗  ██╗██╗███████╗        ║
║   ██╔══██╗██╔═══██╗██╔═══██╗██║ ██╔╝██║██╔════╝        ║
║   ██████╔╝██║   ██║██║   ██║█████╔╝ ██║█████╗          ║
║   ██╔══██╗██║   ██║██║   ██║██╔═██╗ ██║██╔══╝          ║
║   ██████╔╝╚██████╔╝╚██████╔╝██║  ██╗██║███████╗        ║
║   ╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝        ║
║                                                          ║
║        Your Personal Library Companion                  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
print_step "Starting Bookie setup..."
echo ""

# Check if Node.js is installed
print_step "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Recommended version: 18.x or higher"
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION is installed"

# Check if npm is installed
print_step "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm $NPM_VERSION is installed"

# Install dependencies
print_step "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Check if .env file exists
print_step "Checking environment configuration..."
if [ ! -f ".env" ]; then
    print_warning ".env file not found, creating..."
    cat > .env << 'EOL'
DATABASE_URL="file:./prisma/dev.db"
EOL
    print_success ".env file created"
else
    print_success ".env file exists"
fi

# Check if .env.local file exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local file not found, creating..."
    
    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    
    cat > .env.local << EOL
JWT_SECRET="$JWT_SECRET"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOL
    print_success ".env.local file created with secure JWT secret"
else
    print_success ".env.local file exists"
fi

# Run database migrations
print_step "Setting up database..."
npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init
print_success "Database setup complete"

# Generate Prisma Client
print_step "Generating Prisma Client..."
npx prisma generate
print_success "Prisma Client generated"

# Seed database with sample data (optional)
print_step "Would you like to add sample data? (y/n)"
read -r ADD_SAMPLE_DATA

if [ "$ADD_SAMPLE_DATA" = "y" ] || [ "$ADD_SAMPLE_DATA" = "Y" ]; then
    print_step "Adding sample data..."
    
    # Create a simple seed script
    cat > prisma/seed.ts << 'EOL'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample authors
  const author1 = await prisma.author.create({
    data: {
      name: 'Jane Austen',
      bio: 'English novelist known for her six major novels.',
      nationality: 'British',
      birthDate: new Date('1775-12-16'),
    },
  })

  const author2 = await prisma.author.create({
    data: {
      name: 'J.K. Rowling',
      bio: 'British author, best known for the Harry Potter series.',
      nationality: 'British',
      birthDate: new Date('1965-07-31'),
    },
  })

  // Create sample saga
  const harryPotterSaga = await prisma.saga.create({
    data: {
      name: 'Harry Potter',
      description: 'A series of seven fantasy novels.',
      totalBooks: 7,
    },
  })

  // Create sample books
  await prisma.book.create({
    data: {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      authorId: author1.id,
      publicationYear: 1813,
      pages: 432,
      language: 'English',
      genres: 'Romance, Classic',
      description: 'A romantic novel of manners.',
    },
  })

  await prisma.book.create({
    data: {
      title: "Harry Potter and the Philosopher's Stone",
      author: 'J.K. Rowling',
      authorId: author2.id,
      sagaId: harryPotterSaga.id,
      sagaOrder: 1,
      publicationYear: 1997,
      pages: 223,
      language: 'English',
      genres: 'Fantasy, Young Adult',
      description: 'The first novel in the Harry Potter series.',
    },
  })

  // Create sample challenge
  const now = new Date()
  const endOfYear = new Date(now.getFullYear(), 11, 31)
  
  await prisma.challenge.create({
    data: {
      name: '2025 Reading Challenge',
      description: 'Read 12 books this year!',
      type: 'books_count',
      target: 12,
      startDate: new Date(now.getFullYear(), 0, 1),
      endDate: endOfYear,
      isActive: true,
    },
  })

  console.log('Sample data added successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
EOL

    npx tsx prisma/seed.ts 2>/dev/null || print_warning "Could not add sample data (tsx not installed)"
    print_success "Sample data added"
fi

# Build the application
print_step "Building the application..."
npm run build
print_success "Application built successfully"

# Success message
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                          ║${NC}"
echo -e "${GREEN}║  ✓ Bookie setup completed successfully!                 ║${NC}"
echo -e "${GREEN}║                                                          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}To start the application:${NC}"
echo -e "  ${YELLOW}npm run dev${NC}"
echo ""
echo -e "${BLUE}Then open your browser to:${NC}"
echo -e "  ${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}Additional commands:${NC}"
echo -e "  ${YELLOW}npm run build${NC}     - Build for production"
echo -e "  ${YELLOW}npm start${NC}         - Start production server"
echo -e "  ${YELLOW}npx prisma studio${NC} - Open database viewer"
echo ""
echo -e "${PURPLE}Happy reading! 📚${NC}"
echo ""

