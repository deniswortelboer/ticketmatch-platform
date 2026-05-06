-- 2026-05-06 — Musement pickup-activity support
--
-- Some Musement activities (e.g. transfers, hotel-pickup tours) belong to the
-- "tours-and-activities-with-pickup" booking flow. For those:
--   - GET /activities/{uuid}/dates returns HTTP 400 unless ?pickup={uuid} is passed
--   - POST /carts/{uuid}/items requires `pickup` in the body
--   - The customer must pick a pickup point at booking time
--
-- We persist the chosen pickup UUID on the booking so confirm-order can re-resolve
-- the product_id with it and pass it through to addToCart.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS musement_pickup_uuid TEXT;

COMMENT ON COLUMN bookings.musement_pickup_uuid IS
  'UUID of the chosen Musement pickup point. Set only for activities whose order_box_elements contains "tours-and-activities-with-pickup". NULL for regular activities.';
