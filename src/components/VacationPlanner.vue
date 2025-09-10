<template>
  <div class="vacation-planner">
    <h1>Планировщик отпуска на юге России</h1>

    <div class="search-form">
      <div class="form-group">
        <label for="period">Период:</label>
        <select id="period" v-model="selectedPeriod">
          <option
              v-for="period in timePeriods"
              :key="period.id_time"
              :value="period.id_time"
          >
            {{ period.period }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="stars">Категория отеля:</label>
        <select id="stars" v-model="selectedStars">
          <option
              v-for="star in stars"
              :key="star.id_star"
              :value="star.id_star"
          >
            {{ star.star }}
          </option>
        </select>
      </div>

      <button @click="findOptimalOptions">Найти оптимальные варианты</button>
    </div>

    <div v-if="loading" class="loading">Загрузка данных...</div>

    <div v-if="results.length > 0" class="results">
      <h2>Результаты поиска</h2>

      <div class="result-cards">
        <div
            v-for="(result, index) in results"
            :key="index"
            class="result-card"
            :class="{'best-result': index === 0}"
        >
          <h3>{{ result.location }}</h3>
          <div class="result-details">
            <p><strong>Средняя цена:</strong> {{ result.price }} руб./ночь</p>
            <p><strong>Загрузка отелей:</strong> {{ result.load }}%</p>
            <p><strong>Рейтинг:</strong>
              <span class="rating">{{ result.rating.toFixed(1) }}/5</span>
            </p>
          </div>
          <div v-if="index === 0" class="best-badge">Лучший вариант</div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { timePeriods } from '../data/timeperiods'
import { stars } from '../data/stars'
import { locations } from '../data/locations'
import { priceData } from '../data/prices'
import type { SearchResult } from '../types'

const selectedPeriod = ref<number>(0)
const selectedStars = ref<number>(2)
const results = ref<SearchResult[]>([])
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

const findOptimalOptions = (): void => {
  loading.value = true
  error.value = null

  // Имитация загрузки данных
  setTimeout(() => {
    try {
      const periodData = priceData[selectedPeriod.value]
      if (!periodData) {
        throw new Error('Данные для выбранного периода не найдены')
      }

      const starData = periodData[selectedStars.value]
      if (!starData) {
        throw new Error('Данные для выбранной категории не найдены')
      }

      // Преобразуем данные в массив и добавляем информацию о локации
      const allResults: SearchResult[] = []

      for (const [locationId, data] of Object.entries(starData)) {
        const location = locations.find(loc => loc.id === parseInt(locationId))
        if (location && data) {
          allResults.push({
            location: location.place,
            price: data.price,
            load: data.load,
            rating: calculateRating(data.price, data.load)
          })
        }
      }

      // Сортируем по рейтингу (чем выше рейтинг, тем лучше)
      results.value = allResults.sort((a, b) => b.rating - a.rating).slice(0, 5)

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Произошла неизвестная ошибка'
      results.value = []
    } finally {
      loading.value = false
    }
  }, 500)
}

const calculateRating = (price: number, load: number): number => {
  // Чем ниже цена и загрузка, тем выше рейтинг
  const priceScore = Math.max(0, 5 - (price / 5000))
  const loadScore = Math.max(0, 5 - (load / 20))

  // Среднее арифметическое с небольшим смещением в сторону цены
  return (priceScore * 0.6 + loadScore * 0.4)
}

onMounted(() => {
  // Автоматический поиск при загрузке страницы
  findOptimalOptions()
})
</script>

<style scoped>
.vacation-planner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2.5em;
}

.search-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 20px;
  margin-bottom: 40px;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
  text-align: left;
}

select {
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background: white;
}

button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.loading, .error {
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  font-size: 18px;
}

.loading {
  background-color: #f8f9fa;
  color: #667eea;
}

.error {
  background-color: #ffe6e6;
  color: #d63031;
}

.results {
  margin-top: 30px;
}

h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 2em;
}

.result-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.result-card {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  border-left: 5px solid #667eea;
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.result-card.best-result {
  border-left: 5px solid #27ae60;
  background: linear-gradient(135deg, #ffffff 0%, #f8fff9 100%);
}

.best-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #27ae60;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 10px rgba(39, 174, 96, 0.3);
}

.result-card h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.5em;
}

.result-details p {
  margin: 10px 0;
  font-size: 16px;
}

.rating {
  color: #e67e22;
  font-weight: bold;
}

@media (max-width: 768px) {
  .search-form {
    grid-template-columns: 1fr;
  }

  .result-cards {
    grid-template-columns: 1fr;
  }
}
</style>