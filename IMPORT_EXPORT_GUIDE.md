# Import/Export Guide - Livraddict Clone

## Overview

The Livraddict clone now includes full import/export functionality for your book library. You can:
- **Export** your entire library to an Excel file
- **Import** books from an Excel file (compatible with Livraddict exports)
- **Backup** your library data
- **Migrate** from Livraddict to this clone

## Accessing Import/Export

1. Go to your **Bibliomania** (Library) page
2. Click the **"Import/Export"** button (green button with download/upload icons)
3. You'll see the Import/Export page with options for both operations

## Exporting Your Library

### How to Export

1. Click the **"Export to Excel"** button
2. Your browser will download a file named: `Livraddict_[username]_[date].xlsx`
3. The file contains all your books with their metadata

### What Gets Exported

The Excel file includes the following information for each book:

| Column | Description | Example |
|--------|-------------|---------|
| **title** | Book title | "Le Seigneur des Anneaux" |
| **author** | Author name | "J.R.R. Tolkien" |
| **isbn** | ISBN number | "978-2-253-04940-8" |
| **publisher** | Publisher name | "Le Livre de Poche" |
| **publication_year** | Year published | 1954 |
| **pages** | Number of pages | 576 |
| **language** | Language code | "fr" |
| **genres** | Book genres | "Fantasy; Adventure" |
| **status** | Reading status | "read" |
| **rating** | Your rating (0-20) | 18 |
| **notes** | Your personal notes | "Excellent book!" |
| **date_added** | When you added it | "25/10/2025" |
| **date_read** | When you finished it | "20/10/2025" |

### Export Statuses

Books can have one of these statuses:
- **reading** - Currently reading
- **read** - Finished reading
- **to_read** - Want to read
- **wishlist** - Want to acquire
- **pal** - Pile À Lire (own but not read)

### Export Statistics

After exporting, you'll see statistics about your library:
- Total number of books
- Books by status (reading, read, to_read, wishlist, pal)
- Average rating

## Importing Your Library

### How to Import

1. Click the **"Choose Excel File"** button
2. Select an Excel file (.xlsx or .xls format)
3. The system will validate and import your books
4. You'll see a summary of imported and skipped books

### File Format Requirements

Your Excel file must have these columns:

**Required Columns:**
- `title` - Book title (cannot be empty)
- `author` - Author name (cannot be empty)
- `status` - One of: reading, read, to_read, wishlist, pal

**Optional Columns:**
- `isbn` - ISBN number
- `publisher` - Publisher name
- `publication_year` - Year of publication (1000-current year)
- `pages` - Number of pages (positive number)
- `language` - Language code (e.g., "fr", "en")
- `genres` - Genres separated by semicolons (e.g., "Fantasy; Adventure")
- `rating` - Rating from 0 to 20
- `notes` - Personal notes
- `date_added` - Date added (any format)
- `date_read` - Date read (any format)

### Example Excel Format

```
title                    | author           | status   | rating | notes
Le Seigneur des Anneaux | J.R.R. Tolkien   | read     | 18     | Excellent!
Harry Potter            | J.K. Rowling     | reading  | 17     | 
Dune                    | Frank Herbert    | to_read  |        |
```

### Import Validation

The system validates:
- ✅ Required fields are present
- ✅ Status values are valid
- ✅ Ratings are between 0-20
- ✅ Pages are positive numbers
- ✅ Publication years are reasonable
- ✅ No duplicate books

### Import Process

1. **Parse** - Reads the Excel file
2. **Validate** - Checks all data is correct
3. **Process** - For each book:
   - Checks if book exists in database
   - Creates new book entry if needed
   - Adds book to your library
4. **Report** - Shows how many books were imported/skipped

### Handling Duplicates

If a book already exists in your library:
- The import will skip it (counted as "skipped")
- Your existing entry is preserved
- No data is overwritten

## Migrating from Livraddict

### Step 1: Export from Livraddict

1. Go to https://www.livraddict.com
2. Log in to your account
3. Go to your Bibliomania (Library)
4. Click the **"Export PDF"** button
5. Save the PDF file

### Step 2: Convert PDF to Excel

Since Livraddict exports to PDF, you'll need to convert it:

**Option A: Manual Entry**
- Create an Excel file with the format shown above
- Enter your books manually

**Option B: Use Online Tools**
- Use a PDF to Excel converter
- Ensure the format matches our requirements

**Option C: Copy from Livraddict Website**
- Visit each book on Livraddict
- Copy the information to Excel

### Step 3: Import to Livraddict Clone

1. Go to your Bibliomania page
2. Click **"Import/Export"**
3. Click **"Choose Excel File"**
4. Select your Excel file
5. Review the import summary
6. Your books are now imported!

## Troubleshooting

### Export Issues

**Problem: "You must be logged in to export"**
- Solution: Log in to your account first

**Problem: "No books to export"**
- Solution: Add some books to your library first

**Problem: File not downloading**
- Solution: Check your browser's download settings
- Try a different browser
- Disable ad blockers

### Import Issues

**Problem: "Import validation failed"**
- Solution: Check the error message for which row/field has issues
- Ensure required fields (title, author, status) are present
- Verify status values are correct

**Problem: "Invalid status"**
- Solution: Use only: reading, read, to_read, wishlist, pal
- Check for extra spaces or typos

**Problem: "Rating must be between 0 and 20"**
- Solution: Ensure ratings are numbers between 0-20
- Leave empty if no rating

**Problem: "Too many books to import"**
- Solution: Maximum is 10,000 books per import
- Split into multiple files if needed

**Problem: "Duplicate book found"**
- Solution: This is a warning, not an error
- The book will be skipped to avoid duplicates

## Best Practices

### Exporting

1. **Regular Backups** - Export your library monthly
2. **Keep Versions** - Save exports with dates
3. **Verify Data** - Check the exported file before deleting originals

### Importing

1. **Test First** - Import a small file first to test
2. **Check Format** - Ensure Excel format matches requirements
3. **Review Results** - Check the import summary
4. **Verify Data** - Check a few books after import

### Data Management

1. **Consistent Genres** - Use consistent genre names
2. **Standard Language Codes** - Use ISO 639-1 codes (fr, en, es, etc.)
3. **Clear Notes** - Use descriptive notes for personal reminders
4. **Regular Updates** - Keep your library current

## Excel File Tips

### Creating Excel Files

**Using Microsoft Excel:**
1. Create a new spreadsheet
2. Add column headers
3. Enter your book data
4. Save as .xlsx format

**Using Google Sheets:**
1. Create a new spreadsheet
2. Add column headers
3. Enter your book data
4. Download as .xlsx format

**Using LibreOffice Calc:**
1. Create a new spreadsheet
2. Add column headers
3. Enter your book data
4. Save as .xlsx format

### Editing Exported Files

1. Open the exported .xlsx file
2. Edit any information
3. Add new books (follow the format)
4. Save the file
5. Import it back

## Data Privacy

- Your data is stored securely in Supabase
- Import/export happens on your device
- No data is sent to external services
- You control all your data

## Support

For issues or questions:
1. Check this guide
2. Review error messages carefully
3. Try the troubleshooting section
4. Check the browser console (F12) for details

## Technical Details

### Export Format
- Format: XLSX (Excel 2007+)
- Encoding: UTF-8
- Sheets: 2 (Bibliomania + Metadata)
- Compatibility: Excel, Google Sheets, LibreOffice

### Import Format
- Accepts: .xlsx, .xls
- Encoding: UTF-8
- Maximum rows: 10,000
- Maximum file size: 10MB

### Validation Rules
- Title: Required, max 500 characters
- Author: Required, max 200 characters
- Status: Required, must be valid
- Rating: Optional, 0-20 range
- Pages: Optional, positive number
- Year: Optional, 1000-current year

---

**Happy importing and exporting! 📚**

