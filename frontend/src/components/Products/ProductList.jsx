import ProductItem from './ProductItem'
import './ProductList.css'

export default function ProductList({ products, isCurrentMonth, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div className="product-list-empty">
        <p>이 달의 구매 항목이 없습니다.</p>
        {isCurrentMonth && (
          <p className="empty-hint">위에서 항목을 추가해보세요!</p>
        )}
      </div>
    )
  }

  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductItem
          key={product.product_id}
          product={product}
          isCurrentMonth={isCurrentMonth}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
