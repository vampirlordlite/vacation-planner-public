import { TimePeriod, StarRating, Location } from '@/types'

// Данные периодов
const timePeriodsData: { periods: TimePeriod[] } = {
    "periods": [
        {"period":"Лето","id_time":0},
        {"period":"Июнь","id_time":1},
        {"period":"Июль","id_time":2},
        {"period":"Август","id_time":3},
        {"period":"1-7 июня","id_time":4},
        {"period":"8-14 июня","id_time":5},
        {"period":"15-21 июня","id_time":6},
        {"period":"22-28 июня","id_time":7},
        {"period":"29 июня - 5 июля","id_time":8},
        {"period":"6-12 июля","id_time":9},
        {"period":"13-19 июля","id_time":10},
        {"period":"20-26 июля","id_time":11},
        {"period":"27 июля - 2 августа","id_time":12},
        {"period":"3-9 августа","id_time":13},
        {"period":"10-16 августа","id_time":14},
        {"period":"17-23 августа","id_time":15},
        {"period":"24-30 августа","id_time":16}
    ]
}

// Данные звезд отелей
const starsData: { stars: StarRating[] } = {
    "stars": [
        {"star":"Без звезд","id_star":0},
        {"star":"Две звезды","id_star":1},
        {"star":"Три звезды","id_star":2},
        {"star":"Четыре звезды","id_star":3},
        {"star":"Пять звезд","id_star":4}
    ]
}

// Данные локаций
const locationsData: { locations: Location[] } = {
    "locations": [
        {"place":"Адлер","id":0},
        {"place":"Алупка","id":1},
        {"place":"Алушта","id":2},
        {"place":"Анапа","id":3},
        {"place":"Бердянск","id":4},
        {"place":"Геленджик","id":5},
        {"place":"Дагомыс","id":6},
        {"place":"Евпатория","id":7},
        {"place":"Керчь","id":8},
        {"place":"Лазоревское","id":9},
        {"place":"Мприуполь","id":10},
        {"place":"Минеральные воды","id":11},
        {"place":"Новороссийск","id":12},
        {"place":"Севастополь","id":13},
        {"place":"Сочи","id":14},
        {"place":"Туапсе","id":15},
        {"place":"Ялта","id":16}
    ]
}

// Интерфейсы для типизации данных цен
interface PriceInfo {
    price: number;
    load: number;
}

interface StarPriceData {
    [locationId: string]: PriceInfo;
}

interface PeriodPriceData {
    [starId: string]: StarPriceData;
}

interface PricesData {
    [periodId: string]: PeriodPriceData;
}

// Функция для генерации реалистичных данных цен для всех периодов
const generatePriceData = (): PricesData => {
    const data: PricesData = {};

    const locations = locationsData.locations;
    const basePrices = [1500, 3000, 4500, 7000, 12000]; // Базовые цены для 0-4 звезд

    // Генерируем данные для всех периодов (0-16)
    for (let periodId = 0; periodId <= 16; periodId++) {
        data[periodId.toString()] = {};

        // Для каждой категории отеля (0-4 звезды)
        for (let starId = 0; starId <= 4; starId++) {
            data[periodId.toString()][starId.toString()] = {};

            // Для каждой локации
            locations.forEach(location => {
                // Базовая цена зависит от категории отеля
                const basePrice = basePrices[starId];

                // Множитель периода: лето дороже, конкретные недели еще дороже
                let periodMultiplier = 1.0;
                if (periodId === 0) periodMultiplier = 1.2; // Лето
                else if (periodId >= 1 && periodId <= 3) periodMultiplier = 1.1; // Месяцы
                else if (periodId >= 4 && periodId <= 16) periodMultiplier = 1.3 + (periodId % 4) * 0.1; // Недели

                // Популярность локации влияет на цену
                const locationMultiplier = 0.8 + (location.id * 0.05); // Более популярные локации дороже

                // Сезонные колебания
                const seasonalFactor = 0.9 + Math.random() * 0.4;

                // Итоговая цена
                const price = Math.round(basePrice * periodMultiplier * locationMultiplier * seasonalFactor);

                // Загрузка отелей: зависит от периода и популярности
                const baseLoad = 30 + (periodId * 2); // Летом загрузка выше
                const locationLoadFactor = 0.7 + (location.id * 0.02); // Популярные локации загружены больше
                const load = Math.round(baseLoad * locationLoadFactor * (0.8 + Math.random() * 0.4));

                data[periodId.toString()][starId.toString()][location.id.toString()] = {
                    price: Math.max(1000, Math.min(20000, price)), // Ограничиваем разумные пределы
                    load: Math.max(10, Math.min(100, load)) // Загрузка от 10% до 100%
                };
            });
        }
    }

    return data;
}

const pricesData: PricesData = generatePriceData();

interface BestOptionResult {
    location: string;
    price: number;
    load: number;
}

export const dataService = {
    getTimePeriods(): TimePeriod[] {
        return timePeriodsData.periods;
    },

    getStars(): StarRating[] {
        return starsData.stars;
    },

    getLocations(): Location[] {
        return locationsData.locations;
    },

    getPrices(): PricesData {
        return pricesData;
    },

    findBestOption(periodId: number, starId: number): BestOptionResult | null {
        const periodKey = periodId.toString();
        const starKey = starId.toString();

        const periodData = pricesData[periodKey];
        if (!periodData) {
            console.warn(`Данные для периода ${periodId} не найдены`);
            return null;
        }

        const starData = periodData[starKey];
        if (!starData) {
            console.warn(`Данные для категории ${starId} не найдены`);
            return null;
        }

        let bestPrice = Infinity;
        let bestLocation: BestOptionResult | null = null;

        console.log(`Поиск лучшего варианта для периода ${periodId}, категории ${starId}`);

        for (const [locationId, data] of Object.entries(starData)) {
            const location = locationsData.locations.find(loc => loc.id === parseInt(locationId));
            if (location && data) {
                console.log(`Локация: ${location.place}, Цена: ${data.price}, Загрузка: ${data.load}%`);

                if (data.price < bestPrice) {
                    bestPrice = data.price;
                    bestLocation = {
                        location: location.place,
                        price: data.price,
                        load: data.load
                    };
                }
            }
        }

        if (bestLocation) {
            console.log(`Лучший вариант: ${bestLocation.location}, Цена: ${bestLocation.price}`);
        } else {
            console.warn('Подходящие варианты не найдены');
        }

        return bestLocation;
    }
};