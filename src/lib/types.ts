/**
 * Formato do que o painel Carbud devolve nas rotas públicas.
 *
 * Cópia enxuta dos tipos de `@carbud/site-kit/contract`: este projeto é
 * separado do monorepo do painel e não enxerga o pacote. Só entram os campos
 * que o portal usa.
 */

export type Dealer = {
  slug: string;
  name: string;
  city: string | null;
  state: string | null;
};

export type DealerSummary = Dealer & { logoUrl: string | null; vehicles: number };

export type VehiclePhoto = { id: string; thumb: string; card: string; full: string };

export type Vehicle = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  version: string | null;
  yearManufacture: number;
  yearModel: number;
  yearLabel: string;
  mileageKm: number;
  priceCents: number;
  priceOnRequest: boolean;
  status: "available" | "reserved" | "sold" | "draft";
  featured: boolean;
  transmissionLabel: string | null;
  fuelLabel: string | null;
  bodyTypeLabel: string | null;
  color: string | null;
  doors: number | null;
  licensePlateEnd: string | null;
  options: { key: string; label: string; group: string }[];
  description: string | null;
  coverUrl: string | null;
  photos: VehiclePhoto[];
};

/** `belowFipe`: preço menor que a FIPE salva no painel; só a busca `portal/vehicles` manda. */
export type PortalVehicle = Vehicle & { dealer: Dealer; belowFipe?: boolean };

export type Facets = {
  brands: { brand: string; models: string[] }[];
  transmissions: string[];
  fuels: string[];
  bodyTypes: string[];
  cities: string[];
  counts: { bodyTypes: Record<string, number>; fuels: Record<string, number> };
  priceRange: { min: number; max: number };
  yearRange: { min: number; max: number };
};

export type SearchResult = {
  vehicles: PortalVehicle[];
  facets: Facets;
  total: number;
  page: number;
  pageSize: number;
};

export type DealerSite = {
  site: {
    name: string;
    slug: string;
    logoUrl: string | null;
    aboutText: string | null;
    contact: {
      phone: string | null;
      whatsappDigits: string | null;
      email: string | null;
      address: { city: string | null; state: string | null; full: string | null };
      mapsUrl: string | null;
    };
  };
  available: boolean;
};

export type VehicleDetail = { vehicle: Vehicle; related: Vehicle[] };
