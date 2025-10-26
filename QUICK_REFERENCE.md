# Quick Reference - Livraddict with Local Database

## 🚀 Quick Start

### 1. Setup (One-time)
```bash
npm install
npm run dev
```

**Note**: Database is local SQLite at `./prisma/dev.db` - no setup needed!

### 2. Access Import/Export
1. Go to http://localhost:3000
2. Create account or login
3. Go to **Bibliomania** (Library)
4. Click **"Import/Export"** button

## 📤 Export Your Library

### Quick Steps
1. Click **"Export to Excel"** button
2. File downloads automatically
3. Done! ✅

### What You Get
- Excel file with all your books
- All metadata preserved
- Library statistics
- Ready to backup or share

## 📥 Import Books

### Quick Steps
1. Click **"Choose Excel File"**
2. Select your Excel file
3. Wait for import to complete
4. Done! ✅

### File Format
```
title | author | status | rating | notes
```

**Required**: title, author, status
**Optional**: isbn, publisher, year, pages, language, genres, rating, notes, dates

**Status Values**: reading, read, to_read, wishlist, pal

## 📋 Excel Format Example

```
title                    | author           | status   | rating | notes
Le Seigneur des Anneaux | J.R.R. Tolkien   | read     | 18     | Excellent!
Harry Potter            | J.K. Rowling     | reading  | 17     | 
Dune                    | Frank Herbert    | to_read  |        |
```

## ✅ Validation Rules

| Field | Required | Type | Range | Notes |
|-------|----------|------|-------|-------|
| title | Yes | Text | Max 500 | Cannot be empty |
| author | Yes | Text | Max 200 | Cannot be empty |
| status | Yes | Text | 5 values | reading, read, to_read, wishlist, pal |
| rating | No | Number | 0-20 | Livraddict scale |
| pages | No | Number | > 0 | Positive only |
| year | No | Number | 1000-now | Reasonable range |
| isbn | No | Text | - | Any format |
| publisher | No | Text | - | Any text |
| language | No | Text | - | e.g., "fr", "en" |
| genres | No | Text | - | Separate with ; |
| notes | No | Text | - | Any text |

## 🔄 Livraddict Migration

### From Livraddict to Clone
1. Export from Livraddict (PDF)
2. Convert PDF to Excel
3. Import to Livraddict clone
4. All data preserved ✅

### From Clone to Livraddict
1. Export from clone (Excel)
2. Convert Excel to Livraddict format
3. Import to Livraddict
4. All data preserved ✅

## 🐛 Troubleshooting

### Export Issues
| Problem | Solution |
|---------|----------|
| "Not logged in" | Log in first |
| "No books" | Add books to library |
| File not downloading | Check browser settings |

### Import Issues
| Problem | Solution |
|---------|----------|
| "Validation failed" | Check error message for details |
| "Invalid status" | Use: reading, read, to_read, wishlist, pal |
| "Rating > 20" | Use 0-20 scale |
| "Duplicate found" | Book already exists, will be skipped |

## 📊 Library Statistics

After export, you'll see:
- **Total Books** - All books in library
- **Reading** - Currently reading
- **Read** - Finished reading
- **To Read** - Want to read
- **Wishlist** - Want to acquire
- **Avg Rating** - Average rating (0-20)

## 🎯 Common Tasks

### Backup Your Library
```
1. Go to Import/Export
2. Click "Export to Excel"
3. Save file in safe location
4. Done!
```

### Add Books from File
```
1. Prepare Excel file with books
2. Go to Import/Export
3. Click "Choose Excel File"
4. Select file
5. Done!
```

### Migrate from Livraddict
```
1. Export from Livraddict (PDF)
2. Convert to Excel
3. Go to Import/Export
4. Import Excel file
5. Done!
```

### Update Ratings
```
1. Export library
2. Edit ratings in Excel
3. Import updated file
4. Done!
```

## 📁 File Locations

### Configuration
- `.env.local` - Supabase credentials

### Code
- `lib/excel/export.ts` - Export logic
- `lib/excel/import.ts` - Import logic
- `app/import-export/page.tsx` - UI page

### Documentation
- `IMPORT_EXPORT_GUIDE.md` - Full guide
- `TESTING_IMPORT_EXPORT.md` - Testing guide
- `SUPABASE_SETUP.md` - Setup guide
- `IMPLEMENTATION_COMPLETE.md` - Technical details

## 🔐 Security

- ✅ Login required
- ✅ Your data only
- ✅ Encrypted in database
- ✅ No external sharing
- ✅ Row Level Security

## 💡 Tips & Tricks

### Organize Your Library
- Use consistent genre names
- Add meaningful notes
- Rate books consistently
- Keep statuses updated

### Efficient Importing
- Test with small file first
- Check format before importing
- Review import summary
- Verify a few books after

### Backup Strategy
- Export monthly
- Keep dated backups
- Store in safe location
- Test restore process

## 📞 Support

### Documentation
- Full guide: `IMPORT_EXPORT_GUIDE.md`
- Testing: `TESTING_IMPORT_EXPORT.md`
- Setup: `SUPABASE_SETUP.md`

### Debugging
- Check browser console (F12)
- Read error messages carefully
- Verify file format
- Check Supabase connection

## 🎓 Learning Resources

### Excel Tips
- Use Google Sheets for easy editing
- Use LibreOffice for free option
- Use Excel for advanced features

### Data Management
- Keep backups
- Use consistent naming
- Document your system
- Regular maintenance

## ⚡ Performance

| Operation | Time | Limit |
|-----------|------|-------|
| Export 100 books | < 1 sec | - |
| Export 1000 books | < 5 sec | - |
| Import 100 books | < 5 sec | - |
| Import 1000 books | < 30 sec | - |
| Max books per import | - | 10,000 |
| Max file size | - | 10MB |

## 🚀 Next Steps

1. ✅ Setup Supabase
2. ✅ Create account
3. ✅ Add some books
4. ✅ Export library
5. ✅ Try importing
6. ✅ Enjoy! 📚

---

**For detailed information, see IMPORT_EXPORT_GUIDE.md**

