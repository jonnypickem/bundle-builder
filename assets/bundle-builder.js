import { html, render, useState, useEffect, useMemo } from 'https://unpkg.com/htm/preact/standalone.module.js';

const BundleBuilder = () => {
  // Data from Liquid (includes market-aware pricing from Shopify Markets/Catalogs)
  const { step1, step2, step3, settings, market } = window.BundleData;
  const availablePackSizes = settings?.packSizes || [4, 6, 12];
  
  // Market/Currency settings from Shopify Markets
  const currencyCode = market?.currencyCode || 'EUR';
  const locale = market?.locale || 'de-DE';

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

  // Format Money - Uses market currency from Shopify Markets/Catalogs
  const formatMoney = (cents) => {
    return (cents / 100).toLocaleString(locale, { 
      style: 'currency', 
      currency: currencyCode 
    });
  };
  
  // Format discount amount in market currency
  const formatDiscount = (amount) => {
    return amount.toLocaleString(locale, { 
      style: 'currency', 
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
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
        ${qty === 0 ? html`
          <button class="bb-btn-add" onClick=${() => updateQuantity(variant.id, 1, isStep1)} disabled=${isStep1 && slotsLeft === 0}>
            + Add
          </button>
        ` : html`
          <div class="bb-quantity-controls">
            <button class="bb-btn-qty bb-btn-qty-minus active" onClick=${() => updateQuantity(variant.id, -1, isStep1)}>-</button>
            <span>${qty}</span>
            <button class="bb-btn-qty bb-btn-qty-plus" onClick=${() => updateQuantity(variant.id, 1, isStep1)} disabled=${isStep1 && slotsLeft === 0}>+</button>
          </div>
        `}
      </div>
    `;
  };

  // Free shipping threshold from Shopify market settings (in cents)
  const freeShippingThreshold = settings?.freeShippingThreshold || 0;

  const calculateSavings = () => {
    const discounts = {
      4: settings?.discount4 || 0,
      6: settings?.discount6 || 10,
      12: settings?.discount12 || 15
    };
    return discounts[packSize] || 0;
  };

  const savings = calculateSavings();
  
  // Check if bundle qualifies for free shipping based on total value
  // Uses Shopify market-specific free shipping threshold from settings
  const bundleTotalAfterDiscount = totalPrice - (savings * 100); // Convert savings to cents
  const hasFreeShipping = freeShippingThreshold > 0 && bundleTotalAfterDiscount >= freeShippingThreshold;

  // Main Render
  return html`
    <div class="bundle-builder-section">
      <!-- Progress Bar -->
      <div class="bb-progress-bar">
        ${[1, 2, 3].map((step, index) => {
    const isLast = index === 2;
    const isActive = currentStep === step;
    const isCompleted = currentStep > step;

    // Icons from Figma design
    // Step 1: Shopping bag icon
    const iconStep1 = html`
            <svg viewBox="0 0 128 110" style="width: 20px; height: 20px;" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25.9958 8.63587C8.69403 15.1721 1.77332 18.8247 0.427627 21.9006C-1.11031 25.1687 1.1966 33.2428 12.3466 63.2326C19.8441 83.8025 27.3415 102.45 28.8794 104.949C32.3398 110.14 38.6838 110.332 50.795 105.718C59.0614 102.45 60.4071 102.45 79.6313 105.718C103.662 109.755 109.237 109.947 111.928 106.679C112.889 105.526 117.119 85.1482 121.156 61.5024C127.884 22.0928 128.269 18.4402 125.385 15.5566C121.925 12.2885 72.9028 3.06085 66.5589 4.59879C64.6364 5.17552 61.9451 4.21431 60.5994 2.67637C56.7545 -1.93744 52.1407 -0.976228 25.9958 8.63587ZM56.5623 17.6712C58.2925 23.054 57.5235 30.3592 52.7174 59.3877C49.4493 78.8042 46.1812 95.337 45.4122 96.106C44.6433 96.6827 42.3364 97.6439 40.2217 98.0284C36.9536 98.6051 34.8389 93.9913 23.4967 64.0016C16.3837 44.9696 10.6165 28.4368 10.6165 27.4756C10.4242 25.5532 45.0278 11.7117 51.1795 11.3273C53.1019 11.135 55.2166 13.4419 56.5623 17.6712ZM95.5874 18.248C113.466 21.1316 116.157 21.9006 116.157 25.1687C116.157 28.8213 104.815 98.2206 104.046 98.7974C103.469 99.3741 59.6382 91.6844 58.8692 90.9154C57.139 89.3775 70.7882 14.9799 72.7106 14.9799C73.8641 14.9799 84.0529 16.3255 95.5874 18.248Z" fill="currentColor"/>
            </svg>
          `;
    // Step 2: Ice cream cone icon
    const iconStep2 = html`
            <svg viewBox="0 0 46 95" style="width: 20px; height: 20px;" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.0626 93.7218C18.415 94.8491 17.5052 95.2307 16.3331 94.8668C15.1578 94.5061 14.5701 93.7218 14.5701 92.5141V57.9723H4.85671C3.48064 57.9723 2.32637 57.5085 1.39388 56.5809C0.464626 55.6566 0 54.51 0 53.1412V4.83102C0 3.46223 0.464626 2.31406 1.39388 1.3865C2.32637 0.462167 3.48064 0 4.85671 0H41.0392C42.82 0 44.1961 0.724653 45.1674 2.17396C46.1388 3.62327 46.2602 5.15309 45.5317 6.76343L29.1403 43.4792H40.0679C41.9296 43.4792 43.3462 44.2844 44.3175 45.8947C45.2888 47.505 45.2888 49.1154 44.3175 50.7257L19.0626 93.7218Z" fill="currentColor"/>
            </svg>
          `;
    // Step 3: Delivery truck icon  
    const iconStep3 = html`
            <svg viewBox="0 0 91 73" style="width: 20px; height: 20px;" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M70.3182 56.7778V44.6111H57.9091V36.5H70.3182V24.3333H78.5909V36.5H91V44.6111H78.5909V56.7778H70.3182ZM41.3636 73L28.2307 61.4417C23.267 57.0481 19.0107 53.1278 15.4617 49.6806C11.91 46.2333 8.98004 42.9889 6.67195 39.9472C4.36111 36.9056 2.67209 33.9653 1.60491 31.1264C0.53497 28.2875 0 25.3134 0 22.2042C0 15.8505 2.17159 10.5607 6.51477 6.33478C10.858 2.11159 16.2697 0 22.75 0C26.3348 0 29.7473 0.725944 32.9875 2.17783C36.2277 3.63243 39.0197 5.71157 41.3636 8.41528C43.7076 5.71157 46.4996 3.63243 49.7398 2.17783C52.9799 0.725944 56.3924 0 59.9773 0C65.8371 0 70.7484 1.73983 74.711 5.2195C78.6764 8.70187 81.1417 12.775 82.1068 17.4389C80.8659 16.9657 79.625 16.6102 78.3841 16.3723C77.1432 16.1371 75.9367 16.0194 74.7648 16.0194C67.8019 16.0194 61.8731 18.4014 56.9784 23.1653C52.0837 27.932 49.6364 33.7287 49.6364 40.5556C49.6364 44.0704 50.3602 47.3986 51.808 50.5403C53.2557 53.6847 55.2894 56.3722 57.9091 58.6028C56.5992 59.7519 54.8923 61.2227 52.7883 63.0152C50.687 64.8051 48.878 66.3759 47.3614 67.7278L41.3636 73Z" fill="currentColor"/>
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
                ${(() => {
                  // Show free shipping badge if current bundle total meets threshold
                  // This updates dynamically as user selects products
                  const sizeDiscount = settings?.[`discount${size}`] || 0;
                  const estimatedTotalAfterDiscount = totalPrice - (sizeDiscount * 100);
                  const qualifies = freeShippingThreshold > 0 && estimatedTotalAfterDiscount >= freeShippingThreshold;
                  return qualifies ? html`<div class="bb-badge">Free Shipping</div>` : null;
                })()}
              </div>
            `;
  })}
        </div>
        
        <!-- Pack Pricing -->
        <div class="bb-pack-pricing">
          <span class="bb-pack-pricing-total">${formatMoney(totalPrice || 0)}</span>
          ${savings > 0 && html`
            <span class="bb-pack-pricing-savings"> (${formatDiscount(savings)} sparen)${hasFreeShipping ? ' + Free Shipping' : ''}</span>
          `}
          ${!savings && hasFreeShipping && html`
            <span class="bb-pack-pricing-savings"> + Free Shipping</span>
          `}
        </div>
        
        <!-- Header -->
        <div class="bb-header">
          <h2>${currentStep === 1 ? step1.title : currentStep === 2 ? step2.title : step3.title}</h2>
        </div>
        
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
      `}

      <!-- Product Grid -->
      <div class="bb-product-grid">
        ${currentStep === 1 && step1.products.map(p => renderProductCard(p, true))}
        ${currentStep === 2 && step2.products.map(p => renderProductCard(p, false))}
        ${currentStep === 3 && step3.products.map(p => renderProductCard(p, false))}
      </div>

      <!-- Footer -->
      <div class="bb-footer">
        <!-- Total Section (Grey Background) -->
        <div class="bb-footer-total-section">
          <div class="bb-footer-content">
            <div class="bb-total-price">
              <span class="bb-total-label">Total: ${formatMoney(totalPrice || 0)}</span>
              ${savings > 0 && html`
                <span class="bb-savings-text">(${formatDiscount(savings)} sparen)${hasFreeShipping ? ' + Free Shipping' : ''}</span>
              `}
              ${!savings && hasFreeShipping && html`
                <span class="bb-savings-text">+ Free Shipping</span>
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
