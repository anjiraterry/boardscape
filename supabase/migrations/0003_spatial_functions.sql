-- PostGIS Spatial Functions for Boardscape Atlas & Duplicate Detection

-- 1. Search published faces within a bounding box (public-safe projection)
CREATE OR REPLACE FUNCTION search_published_faces_bbox(
  min_lng double precision,
  min_lat double precision,
  max_lng double precision,
  max_lat double precision,
  filter_district text DEFAULT NULL,
  filter_format face_format DEFAULT NULL,
  filter_keyword text DEFAULT NULL,
  page_limit integer DEFAULT 50,
  page_offset integer DEFAULT 0
)
RETURNS TABLE (
  face_id uuid,
  slug text,
  label text,
  format face_format,
  width_meters numeric,
  height_meters numeric,
  azimuth_deg integer,
  illumination text,
  road_direction text,
  public_summary text,
  public_image_path text,
  last_confirmed_at timestamptz,
  site_id uuid,
  site_public_id text,
  latitude double precision,
  longitude double precision,
  address text,
  road_name text,
  district text,
  corridor text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    f.id AS face_id,
    f.slug,
    f.label,
    f.format,
    f.width_meters,
    f.height_meters,
    f.azimuth_deg,
    f.illumination,
    f.road_direction,
    f.public_summary,
    f.public_image_path,
    f.last_confirmed_at,
    s.id AS site_id,
    s.public_id AS site_public_id,
    s.latitude,
    s.longitude,
    s.address,
    s.road_name,
    s.district,
    s.corridor
  FROM faces f
  JOIN sites s ON s.id = f.site_id
  WHERE f.state = 'published'
    AND ST_Intersects(
      s.location,
      ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)::geography
    )
    AND (filter_district IS NULL OR s.district ILIKE filter_district)
    AND (filter_format IS NULL OR f.format = filter_format)
    AND (
      filter_keyword IS NULL
      OR f.label ILIKE '%' || filter_keyword || '%'
      OR s.road_name ILIKE '%' || filter_keyword || '%'
      OR s.district ILIKE '%' || filter_keyword || '%'
      OR s.address ILIKE '%' || filter_keyword || '%'
    )
  ORDER BY f.published_at DESC NULLS LAST, f.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
$$;

-- 2. Find nearby sites within radius_meters for duplicate survey warnings
CREATE OR REPLACE FUNCTION find_nearby_sites(
  target_lat double precision,
  target_lng double precision,
  radius_meters double precision DEFAULT 50
)
RETURNS TABLE (
  site_id uuid,
  public_id text,
  address text,
  road_name text,
  district text,
  distance_meters double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    s.id AS site_id,
    s.public_id,
    s.address,
    s.road_name,
    s.district,
    ST_Distance(
      s.location,
      ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography
    ) AS distance_meters
  FROM sites s
  WHERE ST_DWithin(
    s.location,
    ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_meters ASC;
$$;

-- 3. Check exclusive booking date overlap for a face
CREATE OR REPLACE FUNCTION check_booking_overlap(
  target_face_id uuid,
  requested_start date,
  requested_end date,
  exclude_booking_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.face_id = target_face_id
      AND b.is_exclusive = true
      AND b.status = 'confirmed'
      AND (exclude_booking_id IS NULL OR b.id <> exclude_booking_id)
      AND daterange(b.start_date, b.end_date, '[]') && daterange(requested_start, requested_end, '[]')
  );
$$;
