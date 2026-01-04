-- Add data integrity constraints for input validation

-- Ensure cost_per_unit is positive or null
ALTER TABLE inventory 
  ADD CONSTRAINT inventory_cost_positive 
    CHECK (cost_per_unit IS NULL OR cost_per_unit >= 0);

-- Ensure quantity is non-negative
ALTER TABLE inventory 
  ADD CONSTRAINT inventory_quantity_non_negative 
    CHECK (quantity >= 0);

-- Ensure low_stock_threshold is non-negative
ALTER TABLE inventory 
  ADD CONSTRAINT inventory_low_stock_non_negative 
    CHECK (low_stock_threshold >= 0);

-- Validate phone format (allow digits, parentheses, dashes, plus, spaces, dots)
ALTER TABLE customers
  ADD CONSTRAINT customers_phone_format
    CHECK (phone IS NULL OR phone ~ '^[0-9\(\)\-\+\s\.]+$');

-- Ensure order item quantities are positive
ALTER TABLE order_items
  ADD CONSTRAINT order_items_quantity_positive
    CHECK (quantity > 0);

-- Ensure order item prices are non-negative
ALTER TABLE order_items
  ADD CONSTRAINT order_items_prices_non_negative
    CHECK (unit_price >= 0 AND total_price >= 0);

-- Ensure order total_amount is non-negative
ALTER TABLE orders
  ADD CONSTRAINT orders_total_amount_non_negative
    CHECK (total_amount >= 0);

-- Ensure product prices are non-negative
ALTER TABLE products
  ADD CONSTRAINT products_prices_non_negative
    CHECK (retail_price >= 0 AND wholesale_price >= 0);

-- Ensure doughs_required is positive
ALTER TABLE products
  ADD CONSTRAINT products_doughs_positive
    CHECK (doughs_required > 0);