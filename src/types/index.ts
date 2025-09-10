export interface TimePeriod {
    period: string;
    id_time: number;
}

export interface StarRating {
    star: string;
    id_star: number;
}

export interface Location {
    place: string;
    id: number;
}

export interface PriceData {
    price: number;
    load: number;
}

export interface SearchResult {
    location: string;
    price: number;
    load: number;
    rating: number;
}

export interface PriceDataStructure {
    [periodId: number]: {
        [starId: number]: {
            [locationId: number]: PriceData;
        };
    };
}