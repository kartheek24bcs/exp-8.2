import React, { useState } from 'react';
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, Provider } from 'react-redux';
import { ShoppingCart, Trash2, Plus, Minus, Package } from 'lucide-react';

// Redux Slice for Cart
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalPrice: 0,
  },
  reducers: {
    addItem: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      
      state.totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    
    updateQuantity: (state, action) => {
      const item = state.items.find(item => item.id === action.payload.id);
      
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i.id !== action.payload.id);
        }
      }
      
      state.totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },
  },
});

// Export actions
export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;

// Configure Store
const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
  },
});

// Mock Products Data
const PRODUCTS = [
  { id: 1, name: 'Wireless Headphones', price: 79.99 },
  { id: 2, name: 'USB-C Hub', price: 49.99 },
  { id: 3, name: 'Mechanical Keyboard', price: 129.99 },
  { id: 4, name: '4K Webcam', price: 89.99 },
  { id: 5, name: 'Laptop Stand', price: 39.99 },
  { id: 6, name: 'Portable SSD 1TB', price: 149.99 },
];

// Product List Component
function ProductList() {
  const dispatch = useDispatch();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Package className="w-6 h-6 text-blue-600" />
        Available Products
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRODUCTS.map(product => (
          <div
            key={product.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded h-24 flex items-center justify-center mb-3">
              <Package className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
            
            <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
            <p className="text-lg font-bold text-blue-600 mb-3">${product.price}</p>
            
            <button
              onClick={() => dispatch(addItem(product))}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-medium"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cart Item Component
function CartItem({ item }) {
  const dispatch = useDispatch();

  return (
    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800">{item.name}</h4>
        <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 p-1 rounded transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        
        <button
          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 p-1 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="w-24 text-right">
        <p className="font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
      </div>

      <button
        onClick={() => dispatch(removeItem(item.id))}
        className="ml-4 text-red-600 hover:text-red-800 transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}

// Shopping Cart Component
function ShoppingCartView() {
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector(state => state.cart);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-green-600" />
        Shopping Cart
        {items.length > 0 && (
          <span className="ml-2 bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
            {items.length}
          </span>
        )}
      </h2>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <p className="text-gray-400">Add some products to get started</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {items.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          <div className="border-t-2 border-gray-200 pt-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-800">Total Items:</span>
              <span className="text-lg font-bold text-gray-800">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold text-gray-800">Total Price:</span>
              <span className="text-2xl font-bold text-green-600">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => dispatch(clearCart())}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors font-semibold"
            >
              Clear Cart
            </button>
            
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors font-semibold"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Main App Component
function ShoppingApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Redux Shopping Cart</h1>
          <p className="text-gray-600 mt-2">Manage your shopping cart with Redux Toolkit state management</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ProductList />
          </div>
          
          <div>
            <ShoppingCartView />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Export with Provider
export default function App() {
  return (
    <Provider store={store}>
      <ShoppingApp />
    </Provider>
  );
}
