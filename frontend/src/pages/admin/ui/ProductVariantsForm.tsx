import React, { useState } from 'react';
import { ProductVariant, ProductImage, ProductSize } from '../../../shared/types';
import { uploadApi } from '../../../shared/api/uploadApi';
import './ProductVariantsForm.css';

interface ProductVariantsFormProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

export const ProductVariantsForm: React.FC<ProductVariantsFormProps> = ({ variants, onChange }) => {
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `variant-${Date.now()}`,
      color: '',
      colorHex: '#000000',
      images: [],
      sizes: []
    };
    onChange([...variants, newVariant]);
    setExpandedVariant(newVariant.id);
  };

  const removeVariant = (variantId: string) => {
    onChange(variants.filter(v => v.id !== variantId));
  };

  const updateVariant = (variantId: string, updates: Partial<ProductVariant>) => {
    onChange(variants.map(v => v.id === variantId ? { ...v, ...updates } : v));
  };

  const addImage = async (variantId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const variant = variants.find(v => v.id === variantId);
        if (!variant) return;

        try {
          const url = await uploadApi.uploadVariantImage(file);

          const newImage: ProductImage = {
            id: `img-${Date.now()}`,
            url,
            order: variant.images.length
          };

          updateVariant(variantId, {
            images: [...variant.images, newImage]
          });
        } catch (error) {
          console.error('Failed to upload image:', error);
          alert('Не удалось загрузить изображение');
        }
      }
    };
    input.click();
  };

  const updateImage = (variantId: string, imageId: string, url: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    updateVariant(variantId, {
      images: variant.images.map(img => img.id === imageId ? { ...img, url } : img)
    });
  };

  const removeImage = (variantId: string, imageId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    updateVariant(variantId, {
      images: variant.images.filter(img => img.id !== imageId)
    });
  };

  const handleImageUpload = async (variantId: string, imageId: string, file: File) => {
    try {
      const url = await uploadApi.uploadVariantImage(file);
      updateImage(variantId, imageId, url);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Не удалось загрузить изображение');
    }
  };

  const addSize = (variantId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    const newSize: ProductSize = {
      size: 'M',
      stock: 10
    };

    updateVariant(variantId, {
      sizes: [...variant.sizes, newSize]
    });
  };

  const updateSize = (variantId: string, index: number, updates: Partial<ProductSize>) => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    updateVariant(variantId, {
      sizes: variant.sizes.map((s, i) => i === index ? { ...s, ...updates } : s)
    });
  };

  const removeSize = (variantId: string, index: number) => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    updateVariant(variantId, {
      sizes: variant.sizes.filter((_, i) => i !== index)
    });
  };

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  return (
    <div className="product-variants-form">
      <div className="variants-header">
        <h3>Варианты товара (цвета и размеры)</h3>
        <button type="button" className="add-variant-btn" onClick={addVariant}>
          + Добавить цвет
        </button>
      </div>

      {variants.length === 0 && (
        <div className="no-variants">
          <p>Нет вариантов. Добавьте хотя бы один цвет с размерами и фотографиями.</p>
        </div>
      )}

      <div className="variants-list">
        {variants.map((variant) => (
          <div key={variant.id} className="variant-card">
            <div className="variant-header" onClick={() => setExpandedVariant(expandedVariant === variant.id ? null : variant.id)}>
              <div className="variant-preview">
                <div className="color-preview" style={{ backgroundColor: variant.colorHex || '#ccc' }}></div>
                <span className="variant-title">{variant.color || 'Без названия'}</span>
                <span className="variant-stats">
                  {variant.images.length} фото, {variant.sizes.length} размеров
                </span>
              </div>
              <div className="variant-actions">
                <button type="button" className="expand-btn">
                  {expandedVariant === variant.id ? '▲' : '▼'}
                </button>
                <button type="button" className="remove-variant-btn" onClick={(e) => { e.stopPropagation(); removeVariant(variant.id); }}>
                  ×
                </button>
              </div>
            </div>

            {expandedVariant === variant.id && (
              <div className="variant-content">
                <div className="form-row">
                  <div className="form-group">
                    <label>Название цвета *</label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) => updateVariant(variant.id, { color: e.target.value })}
                      placeholder="Например: Черный, Белый"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Код цвета (HEX)</label>
                    <div className="color-input-group">
                      <input
                        type="color"
                        value={variant.colorHex || '#000000'}
                        onChange={(e) => updateVariant(variant.id, { colorHex: e.target.value })}
                      />
                      <input
                        type="text"
                        value={variant.colorHex || '#000000'}
                        onChange={(e) => updateVariant(variant.id, { colorHex: e.target.value })}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>

                <div className="variant-section">
                  <div className="section-header">
                    <h4>Фотографии</h4>
                    <button type="button" className="add-btn-small" onClick={() => addImage(variant.id)}>
                      + Добавить фото
                    </button>
                  </div>

                  <div className="images-grid">
                    {variant.images.map((image) => (
                      <div key={image.id} className="image-item">
                        <div className="image-preview">
                          {image.url ? (
                            <img src={image.url} alt="Preview" />
                          ) : (
                            <div className="image-placeholder">Нет фото</div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(variant.id, image.id, file);
                          }}
                          className="image-upload-input"
                        />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImage(variant.id, image.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="variant-section">
                  <div className="section-header">
                    <h4>Размеры и наличие</h4>
                    <button type="button" className="add-btn-small" onClick={() => addSize(variant.id)}>
                      + Добавить размер
                    </button>
                  </div>

                  <div className="sizes-list">
                    {variant.sizes.map((sizeObj, index) => (
                      <div key={index} className="size-item">
                        <select
                          value={sizeObj.size}
                          onChange={(e) => updateSize(variant.id, index, { size: e.target.value })}
                        >
                          {availableSizes.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={sizeObj.stock}
                          onChange={(e) => updateSize(variant.id, index, { stock: parseInt(e.target.value) || 0 })}
                          placeholder="Количество"
                          min="0"
                        />
                        <button
                          type="button"
                          className="remove-size-btn"
                          onClick={() => removeSize(variant.id, index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
