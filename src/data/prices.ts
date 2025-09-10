import { PriceDataStructure, PriceData } from '../types';
import { locations } from './locations';

export const generatePriceData = (): PriceDataStructure => {
    const data: PriceDataStructure = {};

    // Для каждого периода времени
    for (let periodId = 0; periodId <= 16; periodId++) {
        data[periodId] = {};

        // Для каждой категории отеля
        for (let starId = 0; starId <= 4; starId++) {
            data[periodId][starId] = {};

            // Для каждой локации
            locations.forEach((location) => {
                // Генерация случайной цены (зависит от звезд и периода)
                const basePrice = [2000, 3500, 5000, 8000, 15000][starId];
                const periodMultiplier = periodId < 4 ? 1.0 : 1.2 + (periodId % 4) * 0.2;
                const price = Math.round(basePrice * periodMultiplier * (0.9 + Math.random() * 0.2));

                // Генерация случайной загрузки (в %)
                const load = Math.round(30 + Math.random() * 60);

                const priceData: PriceData = {
                    price,
                    load
                };

                data[periodId][starId][location.id] = priceData;
            });
        }
    }

    return data;
};

export const priceData: PriceDataStructure = generatePriceData();