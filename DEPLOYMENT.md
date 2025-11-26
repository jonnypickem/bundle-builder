# Deployment Guide

This guide will walk you through deploying the Bundle Builder section to your Shopify store.

## 📋 Prerequisites

- Access to your Shopify admin panel
- Theme Editor access (or ability to edit theme code)
- Basic familiarity with Shopify theme structure

---

## 🚀 Deployment Methods

### Method 1: Theme Customizer (Recommended)

This is the easiest method for non-technical users.

#### Step 1: Upload Files

1. **Go to**: Shopify Admin → Online Store → Themes
2. **Click**: Actions → Edit code (on your active theme)
3. **Upload the files**:

   **Sections folder:**
   - Click "Add a new section"
   - Copy content from `sections/bundle-builder.liquid`
   - Name it `bundle-builder`
   - Save

   **Assets folder:**
   - Click "Add a new asset"
   - Upload `assets/bundle-builder.css`
   - Upload `assets/bundle-builder.js`

#### Step 2: Create Product Template

1. **In the theme editor**, go to Templates
2. **Click**: Add a new template → Product
3. **Name it**: `bundle` (this creates `product.bundle.json`)
4. **Add the section**: Click "Add section" → Select "Bundle Builder"
5. **Save** the template

#### Step 3: Assign Template to Product

1. **Go to**: Products → Select your bundle product
2. **Scroll down** to "Theme templates"
3. **Select**: `product.bundle`
4. **Save**

#### Step 4: Configure Settings

1. **In Theme Customizer**, navigate to your bundle product page
2. **Click** on the Bundle Builder section
3. **Configure**:
   - Pack sizes (e.g., `4,6,12`)
   - Discount amounts for each pack size
4. **Add blocks**:
   - Add "Step" blocks for each step
   - Add "Product" blocks and assign them to steps
5. **Save** and **Publish**

---

### Method 2: Manual Code Upload (Advanced)

For developers comfortable with theme development.

#### Using Shopify CLI

```bash
# Install Shopify CLI if not already installed
npm install -g @shopify/cli @shopify/theme

# Navigate to your theme directory
cd path/to/your/theme

# Copy files to appropriate directories
cp sections/bundle-builder.liquid sections/
cp assets/bundle-builder.css assets/
cp assets/bundle-builder.js assets/

# Push to Shopify
shopify theme push
```

#### Using Git/Version Control

If your theme is in version control:

```bash
# Copy files to your theme repository
cp -r sections/ /path/to/theme/sections/
cp -r assets/ /path/to/theme/assets/

# Commit and deploy
git add .
git commit -m "Add bundle builder section"
git push
```

---

## ⚙️ Configuration Guide

### Pack Sizes

Set available pack sizes in section settings:
- Format: Comma-separated numbers (e.g., `4,6,12`)
- Each size will appear as a selectable option

### Discounts

Configure discount amounts (in euros) for each pack size:
- **discount_4**: Discount for 4-pack
- **discount_6**: Discount for 6-pack  
- **discount_12**: Discount for 12-pack

**Example:**
- 4-pack: €0 (no discount)
- 6-pack: €10 discount
- 12-pack: €15 discount

### Adding Steps

1. Click "Add block" → Select "Step"
2. Set the step title (e.g., "Select Your Pack")
3. Drag to reorder steps

### Adding Products

1. Click "Add block" → Select "Product"
2. Choose the step number (1, 2, 3, etc.)
3. Select the product from your store
4. Repeat for all products

---

## 🧪 Testing

### Before Going Live

1. **Test on a development/staging theme** first
2. **Verify**:
   - [ ] All products display correctly
   - [ ] Quantity controls work
   - [ ] Progress bar updates
   - [ ] Total price calculates correctly
   - [ ] "Add to Cart" functionality works
   - [ ] Mobile responsiveness
3. **Test cart behavior**: Ensure bundle items appear correctly in cart

### Common Issues

**Products not showing:**
- Ensure products are published and available
- Check that step numbers match between steps and products

**Styling issues:**
- Verify both CSS and JS files are uploaded
- Clear browser cache
- Check for theme conflicts

**Add to cart not working:**
- Ensure products have available inventory
- Check browser console for JavaScript errors
- Verify Shopify routes are configured correctly

---

## 🔄 Updates & Maintenance

### Updating the Section

1. Edit the files in Theme Editor → Edit code
2. Make changes to `bundle-builder.liquid`, `.css`, or `.js`
3. Save changes
4. Test on a preview theme first

### Version Control

Keep track of changes:
- Tag versions in git
- Document changes in commit messages
- Keep a changelog for major updates

---

## 📱 Mobile Optimization

The bundle builder is fully responsive. Test on:
- iPhone (Safari)
- Android (Chrome)
- Tablet devices
- Different screen orientations

---

## 🆘 Troubleshooting

### Section doesn't appear
- Check that files are uploaded to correct folders
- Verify section is added to product template
- Ensure template is assigned to product

### JavaScript not working
- Check browser console for errors
- Verify `bundle-builder.js` is uploaded
- Ensure no theme conflicts with JavaScript

### Styling looks broken
- Verify `bundle-builder.css` is uploaded
- Check for CSS conflicts with theme
- Clear browser and Shopify cache

---

## 🔐 Security Notes

- All cart operations use Shopify's official Cart API
- No sensitive data is stored in browser
- Product prices are validated server-side by Shopify

---

## 📞 Support

For issues:
1. Check this documentation
2. Review [MANAGING_STEPS.md](MANAGING_STEPS.md)
3. Check browser console for errors
4. Verify all files are uploaded correctly

---

**Ready to deploy?** Start with Method 1 and test thoroughly before going live! 🚀
