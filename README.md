# 💳 BillPro - Professional Billing Software

A modern, professional web-based billing and invoice management system built with HTML, CSS, and vanilla JavaScript. Perfect for small businesses, cafes, shops, and restaurants.

## ✨ Features

### 🧾 Billing & Invoicing
- **Create professional invoices** with automatic invoice number generation
- **Add multiple products dynamically** to bills
- **Editable pricing** - customize prices while billing
- **GST calculation** (18%) with toggle option
- **Multiple payment methods** - Cash, UPI, Card, Credit
- **Print-ready invoices** with professional formatting
- **Bill history** with search and filter capabilities

### 📦 Product Management
- **Product database** - Add and manage products
- **Auto-suggestions** while typing product names
- **Custom pricing** per transaction
- **Stock tracking**
- **Quick product search**

### 📊 Analytics & Reports
- **Daily dashboard stats** - Bills count, revenue, average bill amount
- **Monthly revenue tracking**
- **Charts & visualizations:**
  - Daily revenue trend (Last 7 days)
  - Payment method breakdown (Pie chart)
  - Top selling products (Bar chart)
  - Monthly revenue trend

### 👥 Customer Management
- **Customer database** - Store customer details
- **Purchase history** - Track total bills and spending per customer
- **Last visit tracking**
- **Search and filter** customers

### 💾 Data Management
- **Local Storage** - All data persists in browser (no server needed)
- **Export to CSV** - Download all bills as CSV file
- **Data backup** - Easy data export for backup

### 🎨 User Interface
- **Modern, professional design** - Clean POS system style
- **Responsive layout** - Works on desktop, tablet, and mobile
- **Sidebar navigation** - Easy access to all features
- **Real-time calculations** - Instant total updates
- **Dark-themed navigation** - Professional appearance

---

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge, etc.)
- No server or backend required for basic usage

### Installation

1. **Download/Clone the files:**
   - `index.html`
   - `style.css`
   - `script.js`

2. **Place all files in the same folder**

3. **Open `index.html` in your web browser**
   - Simply double-click the file, or
   - Right-click → Open with → Choose your browser

**That's it! The application is ready to use.**

---

## 📖 How to Use

### Creating a Bill

1. **Navigate to "Create Bill"** (Default view)
2. **Enter Customer Details:**
   - Customer Name (required)
   - Phone Number (optional)
3. **Add Items:**
   - Click "+ Add Item" button
   - Search for or type product name
   - Enter quantity
   - Edit price if needed
   - Click "Add Item"
4. **Set Payment Method:**
   - Select: Cash, UPI, Card, or Credit
5. **Apply GST (Optional):**
   - Check the GST checkbox to add 18% tax
6. **Actions:**
   - **Print Invoice** - Print professional bill format
   - **Reset** - Clear all and start new bill
   - **Save & Close** - Save and move to new bill

### Managing Products

1. Navigate to **"Products"** tab
2. **Add New Product:**
   - Click "+ Add Product"
   - Enter product name, price, and stock
3. **Delete Product:**
   - Click "Delete" button on the product row

### Viewing Bills History

1. Navigate to **"Bills History"** tab
2. **Search Bills:**
   - Use search box to find by invoice number or customer name
3. **Export Data:**
   - Click "📥 Export CSV" to download all bills
4. **Delete Bill:**
   - Click "Delete" to remove a bill

### Customer Management

1. Navigate to **"Customers"** tab
2. **View Customers:**
   - See all customer details and purchase history
   - Track total spent and last visit
3. **Search Customers:**
   - Type to search customers by name or phone

### Analytics & Reports

1. Navigate to **"Analytics"** tab
2. **View Statistics:**
   - Total bills today
   - Revenue today
   - Average bill amount
   - Monthly revenue
3. **Charts:**
   - Daily revenue trend
   - Payment method breakdown
   - Top selling products
   - Monthly revenue trend

---

## 💾 Data Storage

### How Data is Stored
- All data is stored in **browser's Local Storage**
- No internet connection required
- Data persists even after closing the browser
- Each browser/device has separate storage

### Backing Up Data
1. Go to **Bills History**
2. Click **"📥 Export CSV"**
3. Download automatically saves to your computer

### Clearing Data
1. Click the **"🗑️ Clear Data"** button (bottom of sidebar)
2. Confirm the action
3. All data will be permanently deleted

---

## 🖨️ Printing Invoices

1. **Create/Complete a bill**
2. Click **"🖨️ Print Invoice"**
3. A print preview will open
4. Click **"Print"** button in your browser
5. **Format options:**
   - Paper size: A4
   - Orientation: Portrait (recommended)
   - Margins: Normal

---

## 📊 Analytics Features

### Daily Dashboard
- **Bills Today** - Count of bills created today
- **Revenue Today** - Total amount received today
- **Avg Bill** - Average bill value
- **Monthly Revenue** - Total revenue for current month

### Charts
- **Daily Revenue Chart** - 7-day revenue trend
- **Payment Method** - Distribution across payment methods
- **Top Products** - Best-selling products
- **Monthly Trend** - Revenue over last 12 months

---

## 🎨 Customization

### Change Color Scheme
Edit `style.css`:
```css
:root {
    --primary-color: #6366f1;      /* Change brand color */
    --success-color: #10b981;      /* Change success color */
    --danger-color: #ef4444;       /* Change danger color */
}
```

### Add New Payment Methods
Edit `index.html` - Find payment buttons section and add:
```html
<button class="payment-btn" data-method="crypto">₿ Bitcoin</button>
```

### Modify GST Rate
Edit `script.js` - Find GST calculation and change:
```javascript
this.currentBill.gstAmount = this.currentBill.subtotal * 0.18; // Change 0.18 to desired rate
```

---

## 🔧 Advanced Setup (Optional)

### Using with Node.js Backend

If you want to use MongoDB instead of localStorage:

1. **Create a Node.js server** (server.js):
```javascript
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost/billing');

// API endpoints...
app.listen(3000, () => console.log('Server running on port 3000'));
```

2. **Update script.js** to use API calls instead of localStorage:
```javascript
// Replace localStorage calls with API calls
async saveBill() {
    const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.currentBill)
    });
    return await response.json();
}
```

---

## 🐛 Troubleshooting

### Data Not Saving?
- Check if Local Storage is enabled in browser
- Browser > Settings > Privacy > Clear cache/storage might delete data
- Try a different browser

### Charts Not Showing?
- Ensure Chart.js is loaded (check internet connection)
- Refresh the page
- Clear browser cache and reload

### Print Not Working?
- Check if pop-ups are allowed
- Try with a different browser
- Ensure bill has items before printing

### Suggestions Not Showing?
- Type at least 1 character
- Ensure products exist in database
- Check browser console for errors

---

## 📱 Mobile Compatibility

The application is fully responsive and works on:
- ✅ Desktop (1920x1080 and above)
- ✅ Tablet (iPad, Android tablets)
- ✅ Mobile (iPhone, Android phones)

**Note:** For best experience on mobile, use in portrait mode.

---

## 🔒 Security Notes

- All data stored locally (no cloud sending)
- No login/authentication needed for local use
- For production use with backend, implement proper:
  - User authentication
  - HTTPS encryption
  - Database validation
  - Input sanitization

---

## 📝 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| Opera | ✅ Full |
| IE 11 | ❌ Not Supported |

---

## 🚀 Performance Tips

1. **Keep product list manageable** - Too many products may slow down suggestions
2. **Archive old bills** - Export old bills to CSV and clear from storage to free up space
3. **Use modern browsers** - Chrome recommended for best performance
4. **Refresh if slow** - Periodic refresh clears temporary data

---

## 📄 File Structure

```
billing-software/
├── index.html          # Main HTML structure
├── style.css           # Styling and layout
├── script.js           # All functionality
└── README.md           # This file
```

---

## 🎓 Features Explained

### BillingSystem Class
- Manages all data operations
- Handles bills, products, and customers
- Calculates totals and analytics

### UIManager Class
- Handles all user interface interactions
- Manages views and modals
- Renders data to HTML

### Data Persistence
- Uses browser's Local Storage API
- Automatically saves on each transaction
- Data remains even after browser close

---

## 💡 Tips & Tricks

1. **Quick Product Add:**
   - Start typing in the product field to see suggestions
   - Click suggestion to auto-fill price

2. **Bulk Product Import:**
   - Manually add products in Products section
   - Or edit script.js getDefaultProducts() method

3. **Daily Reports:**
   - Check Analytics tab first thing in morning
   - Use CSV export for accounting records

4. **Customer Tracking:**
   - Phone number helps identify returning customers
   - View spending patterns in Customers tab

5. **Stock Management:**
   - Monitor stock levels in Products tab
   - Add new stock when quantity is low

---

## 📞 Support & Feedback

For features request or issues:
1. Check the troubleshooting section
2. Verify all files are in same directory
3. Test in different browser
4. Clear browser cache and retry

---

## 📜 License

This project is provided as-is for commercial and personal use.

---

## 🎉 Version History

### v1.0 (Current)
- ✅ Complete billing system
- ✅ Product management
- ✅ Customer tracking
- ✅ Analytics with charts
- ✅ CSV export
- ✅ Print functionality
- ✅ Responsive design
- ✅ Local storage persistence

---

## 🔮 Future Enhancements

Potential features for future versions:
- User authentication system
- MongoDB/Cloud storage support
- Email receipt sending
- Advanced reporting (taxes, GST filings)
- Inventory alerts
- Staff management
- Expense tracking
- Discount management
- Multi-language support

---

**Made with ❤️ for small business owners**

Enjoy using BillPro! 🎉
