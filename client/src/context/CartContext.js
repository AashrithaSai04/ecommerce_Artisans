import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
};

// Action types
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const existingItemIndex = state.items.findIndex(
        item => item.product._id === action.payload.product._id
      );

      let newItems;
      if (existingItemIndex > -1) {
        // Update quantity if item exists
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, action.payload];
      }

      const newTotal = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      const newState = {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };

      localStorage.setItem('cart', JSON.stringify(newState));
      return newState;
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const newItems = state.items.filter(
        item => item.product._id !== action.payload
      );
      const newTotal = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      const newState = {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };

      localStorage.setItem('cart', JSON.stringify(newState));
      return newState;
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const newItems = state.items.map(item =>
        item.product._id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      const newTotal = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      const newState = {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };

      localStorage.setItem('cart', JSON.stringify(newState));
      return newState;
    }

    case CART_ACTIONS.CLEAR_CART:
      localStorage.removeItem('cart');
      return initialState;

    case CART_ACTIONS.LOAD_CART:
      return action.payload;

    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  React.useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: parsedCart });
      } catch (error) {
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Actions
  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, quantity },
    });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({
        type: CART_ACTIONS.UPDATE_QUANTITY,
        payload: { productId, quantity },
      });
    }
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;