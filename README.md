# Bundle Builder

A customizable, step-by-step bundle builder for Shopify that allows customers to create personalized product bundles with dynamic pricing and discounts.

![Bundle Builder Preview](https://img.shields.io/badge/Shopify-2.0-green?style=flat-square) ![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

## 🎯 Features

- **Dynamic Step System**: Add/remove steps and products via Shopify Theme Customizer
- **Flexible Pack Sizes**: Configure multiple pack sizes (4, 6, 12, etc.) with custom discounts
- **Real-time Pricing**: Live total calculation with savings display
- **Progress Tracking**: Visual progress bar showing bundle completion status
- **Mobile Responsive**: Fully optimized for mobile, tablet, and desktop
- **Free Shipping Badges**: Automatic badges for qualifying pack sizes
- **Shopify 2.0 Compatible**: Built with modern Shopify section blocks

## 📦 What's Included

```
bundle-builder/
├── sections/
│   └── bundle-builder.liquid    # Main Shopify section
├── assets/
│   ├── bundle-builder.css       # Styling
│   └── bundle-builder.js        # Interactive functionality
├── templates/
│   └── product/                 # Product template directory
├── preview.html                 # Local preview file
├── MANAGING_STEPS.md           # Guide for managing steps
└── DEPLOYMENT.md               # Deployment instructions
```

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Upload files** to your Shopify theme (see [DEPLOYMENT.md](DEPLOYMENT.md))
3. **Add the section** to a product page template
4. **Configure** pack sizes and discounts in Theme Customizer
5. **Add products** to each step using blocks

## 🎨 Design System

The bundle builder uses a clean, modern design with:

- **Primary Color**: `#000000` (Black)
- **Accent Color**: `#001EFF` (Discount Blue)
- **Border/Grey**: `#EAEAEA` (Passive Grey)
- **Typography**: Recoleta Alt (headings), Inter (body)

## ⚙️ Configuration

### Pack Sizes & Discounts

Configure in Theme Customizer under section settings:
- **Pack Sizes**: Comma-separated values (e.g., `4,6,12`)
- **Discounts**: Set discount amounts for each pack size in euros

### Adding Steps & Products

Use Shopify blocks in Theme Customizer:
1. Click "Add block" → Select "Step" or "Product"
2. Configure step titles and assign products to steps
3. Drag to reorder

See [MANAGING_STEPS.md](MANAGING_STEPS.md) for detailed instructions.

## 🛠️ Technical Details

- **Framework**: Vanilla JavaScript with Preact (via HTM)
- **Styling**: Vanilla CSS with CSS custom properties
- **Shopify Integration**: Uses Cart API (`/cart/add.js`)
- **No Dependencies**: Self-contained, no build process required

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 License

MIT License - feel free to use and modify for your projects.

## 🤝 Contributing

This is a custom Shopify section. Feel free to fork and adapt to your needs!

## 📧 Support

For issues or questions, please refer to the documentation files or create an issue in the repository.

---

**Made with ❤️ for Shopify merchants**
