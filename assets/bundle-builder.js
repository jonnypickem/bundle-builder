import { html, render, useState, useEffect, useMemo } from 'https://unpkg.com/htm/preact/standalone.module.js';

const BundleBuilder = () => {
  // Data from Liquid
  const { step1, step2, step3, settings } = window.BundleData;
  const availablePackSizes = settings?.packSizes || [4, 6, 12];

  const [currentStep, setCurrentStep] = useState(1);
  const [packSize, setPackSize] = useState(availablePackSizes[0] || 4); // Default to first available pack size
  const [selections, setSelections] = useState({}); // { variantId: quantity }
  const [loading, setLoading] = useState(false);

  // Helper to get product by ID (for price calc)
  const getProduct = (id) => {
    const allProducts = [...step1.products, ...step2.products, ...step3.products];
    return allProducts.find(p => p.variants.some(v => v.id === id));
  };

  const getVariant = (id) => {
    const allProducts = [...step1.products, ...step2.products, ...step3.products];
    for (const p of allProducts) {
      const v = p.variants.find(v => v.id === id);
      if (v) return { ...v, productTitle: p.title, image: p.image };
    }
    return null;
  };

  // Step 1 Logic
  const step1Count = useMemo(() => {
    let count = 0;
    step1.products.forEach(p => {
      p.variants.forEach(v => {
        if (selections[v.id]) count += selections[v.id];
      });
    });
    return count;
  }, [selections, step1]);

  const slotsLeft = packSize - step1Count;
  const isStep1Full = slotsLeft === 0;

  // Update Quantity
  const updateQuantity = (variantId, delta, isStep1) => {
    setSelections(prev => {
      const currentQty = prev[variantId] || 0;
      const newQty = Math.max(0, currentQty + delta);

      // Step 1 Limit Check
      if (isStep1 && delta > 0 && slotsLeft <= 0) return prev;

      if (newQty === 0) {
        const { [variantId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [variantId]: newQty };
    });
  };

  // Total Price
  const totalPrice = useMemo(() => {
    return Object.entries(selections).reduce((total, [vid, qty]) => {
      const variant = getVariant(parseInt(vid));
      return total + (variant ? variant.price * qty : 0);
    }, 0);
  }, [selections]);

  // Format Money (Simple version)
  const formatMoney = (cents) => {
    return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  // Handlers
  const handleNext = () => {
    if (currentStep === 1 && !isStep1Full) {
      alert(`Please select ${slotsLeft} more items to complete your pack.`);
      return;
    }
    setCurrentStep(prev => Math.min(3, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleAddToCart = async () => {
    setLoading(true);
    const items = Object.entries(selections).map(([id, quantity]) => ({
      id: parseInt(id),
      quantity,
      properties: {
        '_bundle_id': `bundle_${Date.now()}`,
        '_bundle_pack_size': packSize,
        '_bundle_step': 'custom_bundle'
      }
    }));

    try {
      const response = await fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      if (response.ok) {
        window.location.href = '/cart';
      } else {
        alert('Error adding to cart');
      }
    } catch (e) {
      console.error(e);
      alert('Error adding to cart');
    } finally {
      setLoading(false);
    }
  };

  // Render Helpers
  const renderProductCard = (product, isStep1) => {
    const variant = product.variants[0]; // Simple version: assume 1 variant or take first
    const qty = selections[variant.id] || 0;

    return html`
      <div class="bb-product-card ${qty > 0 ? 'selected' : ''}" key=${product.id}>
        <img src=${product.image} class="bb-product-image" alt=${product.title} />
        <div class="bb-product-info">20 Toothpicks (18ct per toothpick)</div>
        <div class="bb-product-title">${product.title}</div>
        <div class="bb-product-description">Flavor: ${product.title} Flavor</div>
        <div class="bb-quantity-controls">
          <button class="bb-btn-qty bb-btn-qty-minus ${qty > 0 ? 'active' : ''}" onClick=${() => updateQuantity(variant.id, -1, isStep1)} disabled=${qty === 0}>-</button>
          <span>${qty}</span>
          <button class="bb-btn-qty bb-btn-qty-plus" onClick=${() => updateQuantity(variant.id, 1, isStep1)} disabled=${isStep1 && slotsLeft === 0}>+</button>
        </div>
      </div>
    `;
  };

  const calculateSavings = () => {
    const discounts = {
      4: settings?.discount4 || 0,
      6: settings?.discount6 || 10,
      12: settings?.discount12 || 15
    };
    return discounts[packSize] || 0;
  };

  const savings = calculateSavings();
  const hasShipping = packSize >= 6;

  // Main Render
  return html`
    <div class="bundle-builder-section">
      <!-- Header -->
      <div class="bb-header">
        <h2>${currentStep === 1 ? step1.title : currentStep === 2 ? step2.title : step3.title}</h2>
      </div>

      <!-- Progress Bar -->
      <div class="bb-progress-bar">
        ${[1, 2, 3].map((step, index) => {
    const isLast = index === 2;
    const isActive = currentStep === step;
    const isCompleted = currentStep > step;

    // Icons from Figma design
    // Step 1: Shopping bag icon
    const iconStep1 = html`
            <svg viewBox="0 0 40 40" style="width: 20px; height: 20px;">
              <path fill="currentColor" d="M10 12.5 L10 28.5 L30 28.5 L30 12.5 Z M15 9.5 L15 12.5 L25 12.5 L25 9.5 C25 6.5 22.5 4 19.5 4 C16.5 4 15 6.5 15 9.5 Z" stroke="currentColor" stroke-width="2" fill="none"/>
              <path fill="currentColor" d="M15 14 C15 14 15 16 20 16 C25 16 25 14 25 14" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          `;
    // Step 2: Ice cream cone icon
    const iconStep2 = html`
            <svg viewBox="0 0 40 40" style="width: 20px; height: 20px;">
              <path fill="currentColor" d="M15 9.5 L15 18 L20 30 L25 18 L25 9.5 C25 6.5 22.5 4 20 4 C17.5 4 15 6.5 15 9.5 Z" stroke="currentColor" stroke-width="2"/>
              <circle cx="20" cy="8" r="4" fill="currentColor"/>
            </svg>
          `;
    // Step 3: Delivery truck icon  
    const iconStep3 = html`
            <svg viewBox="0 0 40 40" style="width: 20px; height: 20px;">
              <path fill="currentColor" d="M5 10 L5 25 L8 25 M32 25 L35 25 L35 18 L30 12 L25 12 L25 25 M12 25 L28 25 M5 10 L25 10 L25 25" stroke="currentColor" stroke-width="2" fill="none"/>
              <circle cx="10" cy="25" r="2.5" fill="currentColor"/>
              <circle cx="30" cy="25" r="2.5" fill="currentColor"/>
            </svg>
          `;

    return html`
            <div class="bb-step-wrapper">
              <div class="bb-step-indicator ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
                ${step === 1 ? iconStep1 : step === 2 ? iconStep2 : iconStep3}
              </div>
              ${!isLast && html`
                <div class="bb-progress-line ${currentStep > step ? 'completed' : ''}"></div>
              `}
            </div>
          `;
  })}
      </div>

      <!-- Step 1: Pack Size Selector -->
      ${currentStep === 1 && html`
        <div class="bb-pack-selector">
          ${availablePackSizes.map(size => {
    const sizeSavings = settings?.[`discount${size}`] || 0;
    return html`
              <div class="bb-pack-option ${packSize === size ? 'selected' : ''}" onClick=${() => setPackSize(size)}>
                ${size} Packs
                ${sizeSavings > 0 && html`
                  <div class="bb-badge">Free Shipping</div>
                `}
              </div>
            `;
  })}
        </div>
        
        <!-- Pack Pricing -->
        <div class="bb-pack-pricing">
          <span class="bb-pack-pricing-total">${formatMoney(totalPrice || 0)}</span>
          ${savings > 0 && html`
            <span class="bb-pack-pricing-savings"> (${savings}€ sparen)${hasShipping ? ' + Free Shipping' : ''}</span>
          `}
        </div>
      `}

      <!-- Product Grid -->
      <div class="bb-product-grid">
        ${currentStep === 1 && step1.products.map(p => renderProductCard(p, true))}
        ${currentStep === 2 && step2.products.map(p => renderProductCard(p, false))}
        ${currentStep === 3 && step3.products.map(p => renderProductCard(p, false))}
      </div>

      <!-- Footer -->
      <div class="bb-footer">
        <!-- Progress Section (Black Background) -->
        ${currentStep === 1 && html`
          <div class="bb-footer-progress-section">
            <div class="bb-footer-progress-wrapper">
              <div class="bb-footer-progress">
                ${Array(packSize).fill(0).map((_, i) => html`
                  <div class="bb-progress-pill ${i < step1Count ? 'filled' : ''}"></div>
                `)}
                <span class="bb-progress-text">${step1Count}/${packSize}</span>
              </div>
            </div>
          </div>
        `}
        
        <!-- Total Section (Grey Background) -->
        <div class="bb-footer-total-section">
          <div class="bb-footer-content">
            <div class="bb-total-price">
              <span class="bb-total-label">Total: ${formatMoney(totalPrice || 0)}</span>
              ${savings > 0 && html`
                <span class="bb-savings-text">(${savings}€ sparen)${hasShipping ? ' + Free Shipping' : ''}</span>
              `}
            </div>

            <div class="bb-footer-actions">
              ${currentStep > 1 && html`
                <button class="bb-btn-qty" style="margin-right: 10px; width: auto; padding: 0 15px;" onClick=${handleBack}>Back</button>
              `}
              ${currentStep < 3 ? html`
                <button class="bb-btn-primary" onClick=${handleNext} disabled=${currentStep === 1 && !isStep1Full}>
                  Next Step
                </button>
              ` : html`
                <button class="bb-btn-primary" onClick=${handleAddToCart} disabled=${loading}>
                  ${loading ? 'Adding...' : 'Add to Cart'}
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

render(html`<${BundleBuilder} />`, document.getElementById('bundle-builder-root'));
